// Fetches the global Wikimedia event list (Special:AllEvents / CampaignEvents
// "Collaboration List") from Meta-Wiki and normalizes it into the same shape the
// frontend uses for user-created timers. Events are read-only and cached.
//
// Why scraping: CampaignEvents has no public "list all events" API (its REST
// API only lists events per-organizer/per-participant), and its data lives in
// the `virtual-campaignevents` domain, which is NOT exposed via the Toolforge
// wiki replicas (verified: `campaign_events`/`ce_*` tables are absent from
// metawiki_p and commonswiki_p). The `{{Special:AllEvents}}` transclusion is
// the officially supported way to embed this list (T385347), so rendering it
// via the Action API and parsing the result is the least-bad option available
// today. If CampaignEvents ever ships a public list endpoint, or the tables
// become available on the replicas, switch to that instead.

const META_API = 'https://meta.wikimedia.org/w/api.php';
// WMF's User-Agent policy requires a descriptive UA with real contact info.
// Set META_USER_AGENT in production to something like:
//   "WikiTimer/1.0 (https://<toolname>.toolforge.org; <your-contact-info>)"
const USER_AGENT = process.env.META_USER_AGENT ||
  'WikiTimer/1.0 (https://wiki-timer.toolforge.org; contact: set META_USER_AGENT)';
const CACHE_TTL_MS = Number(process.env.META_EVENTS_TTL_MS) || 60 * 60 * 1000; // 1 hour
// Avoid hammering Meta if it's failing/lagged: don't retry more often than this.
const MIN_RETRY_INTERVAL_MS = 5 * 60 * 1000;

const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
};

let cache = { events: [], fetchedAt: 0, lastAttemptAt: 0 };
let inFlight = null;

// Minimal HTML entity decoder for the few entities MediaWiki emits in text.
function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();
}

// Parses a "11 July 2026" style date into a UTC ISO string.
// If isEndOfDay is true, sets the time to 23:59:59.999 UTC so the event remains active throughout the final day.
function parseDate(text, isEndOfDay = false) {
  const m = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!m) return null;
  const month = MONTHS[m[2].toLowerCase()];
  if (month === undefined) return null;
  if (isEndOfDay) {
    return new Date(Date.UTC(Number(m[3]), month, Number(m[1]), 23, 59, 59, 999)).toISOString();
  }
  return new Date(Date.UTC(Number(m[3]), month, Number(m[1]), 0, 0, 0, 0)).toISOString();
}

// Builds a label -> content map from the "text with icon" widgets in a row.
function parseWidgets(rowHtml) {
  const widgets = {};
  const re = /widget-label">([^<]*)<\/span><span class="[^"]*widget-content">([\s\S]*?)<\/span>/g;
  let match;
  while ((match = re.exec(rowHtml)) !== null) {
    widgets[decodeEntities(match[1])] = decodeEntities(match[2].replace(/<[^>]+>/g, ''));
  }
  return widgets;
}

// Creates a clean, human-readable slug with short deterministic hash for clean URLs.
function slugify(name, href = '') {
  let base = (name || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
  if (!base) base = 'event';
  let hash = 0;
  for (let i = 0; i < href.length; i++) {
    hash = ((hash << 5) - hash) + href.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(36).slice(0, 4);
  return `${base}-${hex}`;
}

// Normalizes CampaignEvents topic into standardized main regions
function normalizeRegion(rawTopic) {
  if (!rawTopic) return 'Global';
  const t = rawTopic.toLowerCase();
  if (t.includes('africa')) return 'Africa';
  if (t.includes('asia') || t.includes('indonesia') || t.includes('india') || t.includes('malayalam') || t.includes('japan') || t.includes('china')) return 'Asia';
  if (t.includes('europe') || t.includes('cee') || t.includes('france') || t.includes('germany') || t.includes('italy')) return 'Europe';
  if (t.includes('latin') || t.includes('caribbean') || t.includes('south america') || t.includes('central america') || t.includes('brazil')) return 'Latin America';
  if (t.includes('north america') || t.includes('united states') || t.includes('canada') || t.includes('usa')) return 'North America';
  if (t.includes('oceania') || t.includes('pacific') || t.includes('australia') || t.includes('new zealand')) return 'Oceania';
  if (t.includes('middle east') || t.includes('mena') || t.includes('arab')) return 'MENA';
  return 'Global';
}

function parseRow(rowHtml) {
  // Match the event title link by its stable CSS class rather than the
  // namespace in the URL. Non-English wikis use localized namespaces
  // (Evento:, فعالية:, Acara:, Tədbir:, Veranstaltung:, …) so matching on
  // "Event:" alone would silently drop those events.
  const linkMatch = rowHtml.match(/<a href="(\/\/[^"]+)" class="ext-campaignevents-events-list-link">([\s\S]*?)<\/a>/);
  if (!linkMatch) return null;

  const href = linkMatch[1];
  const link = 'https:' + href;
  const name = decodeEntities(linkMatch[2].replace(/<[^>]+>/g, ''));

  // Filter out test pages, sandbox scratchpads, and QA testing artifacts
  const isSandboxOrTest = /sandbox\b|event test|\btest\s+\d+|t\d{6}/i.test(name) ||
    /\/sandbox\//i.test(href) ||
    /\/test\//i.test(href);
  if (isSandboxOrTest) return null;

  const dateMatch = rowHtml.match(/<strong>([\s\S]*?)<\/strong>/);
  const dateText = dateMatch ? decodeEntities(dateMatch[1]) : '';
  const [startText, endText] = dateText.split(/\s+[\u2013\u2014-]\s+/);
  const time = parseDate(startText || '', false);
  if (!time) return null;

  const widgets = parseWidgets(rowHtml);
  const participation = widgets['Participation options'] || '';
  const country = widgets['Country'] || (participation.toLowerCase().includes('online') ? 'Online' : '');
  const eventTypes = widgets['Event types'] || '';
  const topics = widgets['Topics'] || '';
  const wikiProject = widgets['Wikis'] || '';
  const organizers = widgets['Organizers'] || '';

  // The wiki host that owns the event page (e.g. meta.wikimedia.org, fr.wikipedia.org).
  const wiki = href.replace(/^\/\//, '').split('/')[0];
  const region = normalizeRegion(topics || widgets['Region']);

  return {
    id: 'meta:' + href.replace(/^\/\//, ''),
    slug: slugify(name, href),
    isMeta: true,
    source: 'meta-allevents',
    type: 'event',
    name,
    link,
    time,
    endTime: endText ? parseDate(endText, true) : parseDate(startText, true),
    region,
    country,
    participation,
    eventTypes,
    topics,
    wikiProject: wikiProject || wiki,
    organizers,
    timeZone: 'UTC',
    logo: null,
    wiki
  };
}

// Fetches and parses events from Meta-Wiki. Deduplicates by event page URL.
async function fetchMetaEvents() {
  const params = new URLSearchParams({
    action: 'parse',
    text: '{{Special:AllEvents}}',
    contentmodel: 'wikitext',
    prop: 'text',
    formatversion: '2',
    disablelimitreport: '1',
    // Ask the server to back off (503 + Retry-After) instead of serving under
    // replication lag, per WMF etiquette for non-interactive API consumers.
    maxlag: '5',
    format: 'json'
  });

  const res = await fetch(`${META_API}?${params.toString()}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' }
  });
  if (res.status === 503) {
    const retryAfter = res.headers.get('Retry-After');
    throw new Error(`Meta API is lagged (503); Retry-After=${retryAfter ?? 'unknown'}s`);
  }
  if (!res.ok) throw new Error(`Meta API returned ${res.status}`);

  const data = await res.json();
  const html = data?.parse?.text;
  if (typeof html !== 'string') throw new Error('Unexpected Meta API response shape');

  const rows = html.split('<li class="ext-campaignevents-events-list-row">').slice(1);
  const byKey = new Map();
  for (const row of rows) {
    const event = parseRow(row);
    if (event && !byKey.has(event.id)) byKey.set(event.id, event);
  }
  return [...byKey.values()];
}

import prisma from './db.js';
import { createHash } from 'crypto';

function getEventHash(rawIdOrLink) {
  return createHash('sha256').update(String(rawIdOrLink)).digest('hex');
}

// Syncs live scraped events to MariaDB so historical/past events are permanently archived.
async function syncEventsToDatabase(events) {
  if (!prisma || !events || events.length === 0) return;
  try {
    const scrapedMetaHashes = new Set(events.map(e => getEventHash(e.id)));
    
    // 1. Upsert each scraped live event
    for (const e of events) {
      const metaHash = getEventHash(e.id);
      await prisma.timer.upsert({
        where: { metaId: metaHash },
        update: {
          name: e.name,
          link: e.link,
          time: new Date(e.time),
          endTime: e.endTime ? new Date(e.endTime) : null,
          region: e.region || 'Global',
          country: e.country || 'Online',
          timeZone: 'UTC',
          participation: e.participation || null,
          eventTypes: e.eventTypes || null,
          topics: e.topics || null,
          wikiProject: e.wikiProject || null,
          organizers: e.organizers || null,
          slug: e.slug,
          isCancelled: false
        },
        create: {
          type: 'event',
          name: e.name,
          link: e.link,
          time: new Date(e.time),
          endTime: e.endTime ? new Date(e.endTime) : null,
          region: e.region || 'Global',
          country: e.country || 'Online',
          timeZone: 'UTC',
          participation: e.participation || null,
          eventTypes: e.eventTypes || null,
          topics: e.topics || null,
          wikiProject: e.wikiProject || null,
          organizers: e.organizers || null,
          slug: e.slug,
          isMeta: true,
          metaId: metaHash,
          isCancelled: false
        }
      });
    }

    // 2. If a future event disappears before starting, mark as cancelled
    const now = new Date();
    await prisma.timer.updateMany({
      where: {
        isMeta: true,
        isCancelled: false,
        time: { gt: now },
        metaId: { notIn: [...scrapedMetaHashes] }
      },
      data: { isCancelled: true }
    });
  } catch (err) {
    console.error('Error syncing meta events to database:', err.message);
  }
}

// Returns cached and archived events, refreshing in the background once stale.
export async function getMetaEvents() {
  const now = Date.now();
  const isStale = now - cache.fetchedAt > CACHE_TTL_MS;
  const canRetry = now - cache.lastAttemptAt > MIN_RETRY_INTERVAL_MS;

  if (cache.fetchedAt === 0) {
    if (!inFlight) {
      cache.lastAttemptAt = now;
      inFlight = fetchMetaEvents()
        .then(async (events) => {
          await syncEventsToDatabase(events);
          return events;
        });
    }
    try {
      const events = await inFlight;
      cache = { events, fetchedAt: Date.now(), lastAttemptAt: cache.lastAttemptAt };
    } catch (err) {
      console.error('Initial meta events fetch failed:', err.message);
    } finally {
      inFlight = null;
    }
  } else if (isStale && canRetry && !inFlight) {
    cache.lastAttemptAt = now;
    inFlight = fetchMetaEvents()
      .then(async (events) => {
        await syncEventsToDatabase(events);
        cache = { events, fetchedAt: Date.now(), lastAttemptAt: cache.lastAttemptAt };
      })
      .catch((err) => { console.error('Meta events refresh failed:', err.message); })
      .finally(() => { inFlight = null; });
  }

  // If database is available, return all active AND archived past events
  if (prisma) {
    try {
      const dbMetaTimers = await prisma.timer.findMany({
        where: { isMeta: true, isCancelled: false },
        orderBy: { time: 'desc' }
      });
      if (dbMetaTimers && dbMetaTimers.length > 0) {
        return dbMetaTimers.map(t => ({
          id: t.link ? 'meta:' + t.link.replace(/^https?:\/\//, '') : (t.metaId || `meta:${t.id}`),
          slug: t.slug || slugify(t.name, t.link),
          isMeta: true,
          source: 'meta-allevents',
          type: t.type || 'event',
          name: t.name,
          link: t.link,
          time: t.time.toISOString(),
          endTime: t.endTime ? t.endTime.toISOString() : null,
          region: t.region,
          country: t.country,
          timeZone: t.timeZone || 'UTC',
          organizers: t.organizers,
          participation: t.participation,
          eventTypes: t.eventTypes,
          topics: t.topics,
          wikiProject: t.wikiProject,
          logo: t.logo
        }));
      }
    } catch (e) {
      console.error('Failed to query meta events from database:', e.message);
    }
  }

  return cache.events;
}

// Expose internal helpers for unit tests. Not part of the public API.
export const _testing = { decodeEntities, parseDate, parseWidgets, parseRow, slugify, syncEventsToDatabase };

