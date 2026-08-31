import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import passport from 'passport';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import auth from './auth.js';
import prisma from './db.js';
import { getMetaEvents } from './meta-events.js';
import { seedHistoricalEvents, HISTORICAL_EVENTS } from './seed-historical.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

if (process.env.NODE_ENV !== 'test') {
  console.log('Starting server:', { port, clientUrl, nodeEnv: process.env.NODE_ENV });
}

// Auto-seed historical Wikimedia events in background on startup if database is connected
if (process.env.DATABASE_URL && process.env.NODE_ENV !== 'test') {
  seedHistoricalEvents().catch(e => console.error('Historical events seed error:', e.message));
}

// Behind the Toolforge nginx proxy, trust the first hop so secure cookies work.
app.set('trust proxy', 1);

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  frameguard: false
}));

// Apply X-Frame-Options to non-embed routes while keeping /embed/* iframe-embeddable
app.use((req, res, next) => {
  if (!req.path.startsWith('/embed')) {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
  next();
});

// Rate limiting (disabled during test runs)
if (process.env.NODE_ENV !== 'test') {
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  });

  const mutateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  });

  app.use(['/timers', '/meta-events', '/api/'], apiLimiter);
  app.use(['/add-timer', '/timers/:id'], mutateLimiter);
}

// In production the frontend is served from the same origin as the API, so no
// CORS handling is needed. In development the Vite dev server runs on a
// different port, so allow the configured client origin(s).
if (!isProd) {
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      // Allow any localhost or 127.0.0.1 port or configured CLIENT_URL in development
      if (
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        origin === process.env.CLIENT_URL
      ) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '3600');
    if (req.method === 'OPTIONS') return res.status(204).end();
    next();
  });
}

// Session store configuration:
// - In production (or when DATABASE_URL is set), persist sessions to MariaDB.
// - In development without DATABASE_URL, fall back to the default in-memory store.
function buildSessionStore() {
  if (!process.env.DATABASE_URL) {
    console.log('Using in-memory session store (dev only)');
    return undefined;
  }
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    const MySQLStore = MySQLStoreFactory(session);
    return new MySQLStore({
      host: dbUrl.hostname,
      port: Number(dbUrl.port) || 3306,
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.replace(/^\//, ''),
      clearExpired: true,
      checkExpirationInterval: 900000,
      expiration: 86400000,
      createDatabaseTable: true,
      schema: {
        tableName: 'sessions',
        columnNames: {
          session_id: 'session_id',
          expires: 'expires',
          data: 'data'
        }
      }
    });
  } catch (err) {
    console.error('Failed to initialize MariaDB session store:', err);
    return undefined;
  }
}

if (!process.env.SESSION_COOKIE_SECRET) {
  throw new Error('Missing required environment variable: SESSION_COOKIE_SECRET');
}

app.use(session({
  secret: process.env.SESSION_COOKIE_SECRET,
  store: buildSessionStore(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Verbose request/response logging is useful in development but leaks headers
// (and cookies) in production, so keep it dev-only.
if (!isProd) {
  app.use((req, res, next) => {
    console.log(`\n=== ${req.method} ${req.url} ===`);
    console.log('Headers:', req.headers);
    res.on('finish', () => console.log('Response:', res.statusCode));
    next();
  });
}

// Initialize auth
auth(app);

// --- API routes ---

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working', origin: req.headers.origin });
});

// In-memory timers store with historical events when DATABASE_URL is not set (local dev)
const devTimers = HISTORICAL_EVENTS.map((e, idx) => ({
  id: idx + 1,
  type: e.type || 'event',
  name: e.name,
  link: e.link,
  time: new Date(e.time),
  endTime: e.endTime ? new Date(e.endTime) : null,
  region: e.region || 'Global',
  country: e.country || 'Online',
  timeZone: e.timeZone || 'UTC',
  organizers: e.organizers || null,
  topics: e.topics || null,
  isMeta: true,
  creatorId: null
}));
let devTimerCounter = devTimers.length + 1;

// Timers created by users and seeded archive.
app.get('/timers', async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.json(devTimers.filter(t => !t.deletedAt));
  }
  try {
    const timers = await prisma.timer.findMany({
      where: { deletedAt: null },
      include: { creator: { select: { id: true, username: true } } },
      orderBy: { time: 'asc' }
    });
    res.json(timers);
  } catch (err) {
    console.warn('Could not fetch user timers (database query failed):', err.message);
    res.json([]); // Return empty list gracefully so the frontend continues functioning
  }
});

// Read-only global events imported from Meta-Wiki (Special:AllEvents).
app.get('/meta-events', async (req, res) => {
  try {
    const events = await getMetaEvents();
    res.json(events);
  } catch (err) {
    console.error('Error fetching meta events:', err.message);
    res.status(502).json({ message: 'Error fetching meta events' });
  }
});

/**
 * Combines a datetime string (e.g. YYYY-MM-DDTHH:mm) with a timezone offset string
 * (e.g. "UTC+02:00", "+02:00", "UTC", etc.) to produce a correct UTC Date object.
 */
function parseDateTimeWithTz(dateTimeVal, timeZoneStr) {
  if (!dateTimeVal) return null;
  if (dateTimeVal instanceof Date) {
    return isNaN(dateTimeVal.getTime()) ? null : dateTimeVal;
  }
  if (typeof dateTimeVal !== 'string') return null;

  const trimmed = dateTimeVal.trim();
  if (!trimmed) return null;

  // If already full ISO with Z or offset (e.g. 2026-10-24T10:00:00.000Z or +02:00)
  if (/Z$|[+-]\d{2}:?\d{2}$/i.test(trimmed)) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }

  // Extract offset from timeZoneStr (e.g. "UTC+02:00" -> "+02:00", "UTC-05:00" -> "-05:00")
  let offset = '+00:00';
  if (timeZoneStr && typeof timeZoneStr === 'string') {
    const match = timeZoneStr.match(/([+-]\d{2}):?(\d{2})?/);
    if (match) {
      const signAndHours = match[1];
      const minutes = match[2] || '00';
      offset = `${signAndHours}:${minutes}`;
    }
  }

  // Format base datetime with seconds if not present: YYYY-MM-DDTHH:mm:00
  const normalized = trimmed.replace(' ', 'T');
  const dateWithSeconds = normalized.length === 16 ? `${normalized}:00` : normalized;
  const isoWithOffset = `${dateWithSeconds}${offset}`;
  const d = new Date(isoWithOffset);
  return isNaN(d.getTime()) ? null : d;
}

// Validates and normalizes the body of an add/edit-timer request.
function validateTimerInput(body) {
  const errors = [];
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const tz = str(body.timeZone) || 'UTC';
  
  const parsedTime = parseDateTimeWithTz(body.time, tz);
  const parsedEndTime = body.endTime ? parseDateTimeWithTz(body.endTime, tz) : null;

  const data = {
    type: str(body.type),
    name: str(body.name),
    link: str(body.link),
    time: parsedTime,
    endTime: parsedEndTime,
    region: str(body.region),
    country: str(body.country),
    timeZone: tz,
    organizers: body.organizers != null ? str(body.organizers) : null,
    logo: body.logo != null ? str(body.logo) : null,
    topics: body.topics != null ? str(body.topics) : null,
    participation: body.participation != null ? str(body.participation) : null,
    participants: body.participants != null && body.participants !== '' && !isNaN(Number(body.participants)) ? Math.max(0, parseInt(body.participants, 10)) : null
  };

  if (!['event', 'deadline'].includes(data.type)) errors.push('type must be "event" or "deadline"');
  if (!data.name || data.name.length > 255) errors.push('name is required (max 255 chars)');
  if (!data.link || data.link.length > 2000) errors.push('link is required (max 2000 chars)');
  if (data.link && !/^https?:\/\//i.test(data.link)) errors.push('link must be a valid http or https URL');
  if (data.region.length > 100) errors.push('region too long (max 100 chars)');
  if (data.country.length > 100) errors.push('country too long (max 100 chars)');
  if (data.timeZone.length > 50) errors.push('timeZone too long (max 50 chars)');
  if (data.organizers && data.organizers.length > 2000) errors.push('organizers too long (max 2000 chars)');
  if (data.logo && data.logo.length > 500) errors.push('logo too long (max 500 chars)');
  if (data.participation && data.participation.length > 100) errors.push('participation too long (max 100 chars)');
  if (data.participants !== null && (isNaN(data.participants) || data.participants < 0)) errors.push('participants must be a positive number');

  if (!data.time) {
    errors.push('time is not a valid date');
  }

  return { data, errors };
}

// Add timer endpoint (protected).
app.post('/add-timer', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { data, errors } = validateTimerInput(req.body);
  if (errors.length) {
    return res.status(400).json({ message: 'Invalid timer data', errors });
  }

  if (!process.env.DATABASE_URL) {
    const newTimer = {
      id: devTimerCounter++,
      ...data,
      creatorId: req.user.id,
      creator: { id: req.user.id, username: req.user.username },
      deletedAt: null
    };
    devTimers.push(newTimer);
    return res.status(201).json({ message: 'Timer added successfully', timerId: newTimer.id.toString(), timer: newTimer });
  }

  try {
    const timer = await prisma.timer.create({
      data: { ...data, creatorId: req.user.id }
    });
    res.status(201).json({ message: 'Timer added successfully', timerId: timer.id.toString(), timer });
  } catch (err) {
    console.error('Error adding timer:', err);
    res.status(500).json({ message: 'Error adding timer' });
  }
});

// Edit/update timer endpoint (protected).
app.put('/timers/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const timerId = parseInt(req.params.id, 10);
  if (isNaN(timerId)) {
    return res.status(400).json({ message: 'Invalid timer id' });
  }

  const { data, errors } = validateTimerInput(req.body);
  if (errors.length) {
    return res.status(400).json({ message: 'Invalid timer data', errors });
  }

  if (!process.env.DATABASE_URL) {
    const index = devTimers.findIndex(t => t.id === timerId && !t.deletedAt);
    if (index === -1) return res.status(404).json({ message: 'Timer not found' });
    if (devTimers[index].creatorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this timer' });
    }
    devTimers[index] = {
      ...devTimers[index],
      ...data,
      updatedAt: new Date()
    };
    return res.json({ message: 'Timer updated successfully', timer: devTimers[index] });
  }

  try {
    const existing = await prisma.timer.findUnique({ where: { id: timerId } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ message: 'Timer not found' });
    }
    if (existing.creatorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this timer' });
    }
    const updatedTimer = await prisma.timer.update({
      where: { id: timerId },
      data,
      include: { creator: { select: { id: true, username: true } } }
    });
    res.json({ message: 'Timer updated successfully', timer: updatedTimer });
  } catch (err) {
    console.error('Error updating timer:', err);
    res.status(500).json({ message: 'Error updating timer' });
  }
});

// Delete timer endpoint (protected, soft delete).
app.delete('/timers/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const timerId = parseInt(req.params.id, 10);
  if (isNaN(timerId)) {
    return res.status(400).json({ message: 'Invalid timer id' });
  }

  if (!process.env.DATABASE_URL) {
    const index = devTimers.findIndex(t => t.id === timerId && !t.deletedAt);
    if (index === -1) return res.status(404).json({ message: 'Timer not found' });
    if (devTimers[index].creatorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this timer' });
    }
    devTimers[index].deletedAt = new Date();
    return res.json({ message: 'Timer deleted successfully' });
  }

  try {
    const timer = await prisma.timer.findUnique({ where: { id: timerId } });
    if (!timer || timer.deletedAt) {
      return res.status(404).json({ message: 'Timer not found' });
    }
    if (timer.creatorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this timer' });
    }
    await prisma.timer.update({
      where: { id: timerId },
      data: { deletedAt: new Date() }
    });
    res.json({ message: 'Timer deleted successfully' });
  } catch (err) {
    console.error('Error deleting timer:', err);
    res.status(500).json({ message: 'Error deleting timer' });
  }
});

// Current authenticated user.
app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

// --- Favorites Endpoints ---
const devFavorites = new Map(); // userId -> Set of eventKey (for dev when no DATABASE_URL)

// Get all favorites for current authenticated user
app.get('/api/favorites', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json([]);
  }
  if (!process.env.DATABASE_URL) {
    const userFavs = devFavorites.get(req.user.id) || new Set();
    return res.json([...userFavs]);
  }
  try {
    const favs = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      select: { eventKey: true }
    });
    res.json(favs.map(f => f.eventKey));
  } catch (err) {
    console.error('Error fetching favorites:', err.message);
    res.json([]);
  }
});

// Toggle a favorite item
app.post('/api/favorites/toggle', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const eventKey = typeof req.body.eventKey === 'string' ? req.body.eventKey.trim() : '';
  if (!eventKey || eventKey.length > 255) {
    return res.status(400).json({ error: 'Invalid eventKey' });
  }

  if (!process.env.DATABASE_URL) {
    if (!devFavorites.has(req.user.id)) {
      devFavorites.set(req.user.id, new Set());
    }
    const userFavs = devFavorites.get(req.user.id);
    let isStarred = false;
    if (userFavs.has(eventKey)) {
      userFavs.delete(eventKey);
      isStarred = false;
    } else {
      userFavs.add(eventKey);
      isStarred = true;
    }
    return res.json({ success: true, isStarred, eventKey });
  }

  try {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_eventKey: {
          userId: req.user.id,
          eventKey
        }
      }
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id }
      });
      return res.json({ success: true, isStarred: false, eventKey });
    } else {
      await prisma.favorite.create({
        data: {
          userId: req.user.id,
          eventKey
        }
      });
      return res.json({ success: true, isStarred: true, eventKey });
    }
  } catch (err) {
    console.error('Error toggling favorite:', err.message);
    res.status(500).json({ error: 'Failed to update favorite' });
  }
});

// Sync local localStorage favorites to account upon login
app.post('/api/favorites/sync', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const eventKeys = Array.isArray(req.body.eventKeys) ? req.body.eventKeys.filter(k => typeof k === 'string' && k.length <= 255) : [];

  if (!process.env.DATABASE_URL) {
    if (!devFavorites.has(req.user.id)) {
      devFavorites.set(req.user.id, new Set());
    }
    const userFavs = devFavorites.get(req.user.id);
    eventKeys.forEach(k => userFavs.add(k));
    return res.json({ success: true, favorites: [...userFavs] });
  }

  try {
    for (const key of eventKeys) {
      await prisma.favorite.upsert({
        where: {
          userId_eventKey: {
            userId: req.user.id,
            eventKey: key
          }
        },
        update: {},
        create: {
          userId: req.user.id,
          eventKey: key
        }
      }).catch(() => {});
    }

    const allFavs = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      select: { eventKey: true }
    });
    res.json({ success: true, favorites: allFavs.map(f => f.eventKey) });
  } catch (err) {
    console.error('Error syncing favorites:', err.message);
    res.status(500).json({ error: 'Failed to sync favorites' });
  }
});

// Health check endpoints (Toolforge uses one via service.template).
const healthHandler = (req, res) => res.json({ status: 'ok' });
app.get('/health', healthHandler);
app.get('/healthz', healthHandler);

// --- Static frontend + SPA fallback ---
// Serve the built Vue app and fall back to index.html for client-side routes
// (e.g. /add) so deep links work with history mode.
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      // Never cache index.html so users always receive the newest asset hashes after deployment
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.includes('/assets/')) {
      // Hashed assets (JS/CSS) can be cached long-term
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// --- Open Graph & Social Preview Injection for Event Links (/timer/:idOrSlug) ---
const DEFAULT_OG_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikimedia-logo_community.svg/1200px-Wikimedia-logo_community.svg.png';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getEventOgImage(event) {
  if (event.logo && event.logo.startsWith('http')) {
    return event.logo;
  }
  const text = `${event.name || ''} ${event.wikiProject || ''} ${event.topics || ''}`.toLowerCase();
  if (text.includes('wikimania')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Wikimania_logo_with_text.svg/1200px-Wikimania_logo_with_text.svg.png';
  if (text.includes('hackathon')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Wikimedia_Hackathon_Logo.svg/1200px-Wikimedia_Hackathon_Logo.svg.png';
  if (text.includes('wiki loves monuments') || text.includes('wlm')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Wiki_Loves_Monuments_logo.svg/1200px-Wiki_Loves_Monuments_logo.svg.png';
  if (text.includes('wiki loves earth') || text.includes('wle')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/WLE_Austria_Logo.svg/1200px-WLE_Austria_Logo.svg.png';
  if (text.includes('glam')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/GLAM_logo.svg/1200px-GLAM_logo.svg.png';
  if (text.includes('wikidata')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Wikidata-logo.svg/1200px-Wikidata-logo.svg.png';
  if (text.includes('wikipedia')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png';
  return DEFAULT_OG_IMAGE;
}

function injectEventMetaTags(html, event, req) {
  const title = `${escapeHtml(event.name)} – WikiTimer`;
  const dateStr = event.time ? new Date(event.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '';
  const locStr = event.country || event.region || 'Online / Virtual';
  const participation = event.participation ? ` (${event.participation})` : '';
  const desc = `⏱️ Live countdown and schedule for ${escapeHtml(event.name)} on ${dateStr} in ${escapeHtml(locStr)}${participation}. Track Wikimedia community events on WikiTimer.`;
  const image = escapeHtml(getEventOgImage(event));
  const rawHost = req.get('host') || '';
  const isSafeHost = /^[a-zA-Z0-9.:-]+$/.test(rawHost);
  const host = isSafeHost ? rawHost : 'wikitimer.toolforge.org';
  const protocol = req.protocol || 'https';
  const canonicalUrl = `${protocol}://${host}/timer/${encodeURIComponent(event.slug || event.id)}`;

  return html
    .replace(/<title>.*?<\/title>/i, `<title>${title}</title>`)
    .replace(/<meta name="title" content=".*?" \/>/i, `<meta name="title" content="${title}" />`)
    .replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${desc}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${desc}" />`)
    .replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${image}" />\n    <meta property="og:url" content="${canonicalUrl}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${desc}" />`)
    .replace(/<meta name="twitter:image" content=".*?" \/>/i, `<meta name="twitter:image" content="${image}" />`);
}

async function findEventByIdOrSlug(idOrSlug) {
  if (!idOrSlug) return null;
  const numId = Number(idOrSlug);

  // 1. Search in local Prisma DB
  try {
    if (process.env.DATABASE_URL) {
      if (!isNaN(numId) && numId > 0) {
        const byId = await prisma.timer.findFirst({
          where: { id: numId, deletedAt: null }
        });
        if (byId) return byId;
      }
      const bySlug = await prisma.timer.findFirst({
        where: { slug: idOrSlug, deletedAt: null }
      });
      if (bySlug) return bySlug;
    }
  } catch (err) {
    console.warn('DB lookup error for OG tags:', err.message);
  }

  // 2. Search in Meta-Wiki events cache
  try {
    const metaEvents = await getMetaEvents();
    if (Array.isArray(metaEvents)) {
      const match = metaEvents.find(e => 
        String(e.id) === String(idOrSlug) ||
        String(e.metaId) === String(idOrSlug) ||
        (e.slug && e.slug.toLowerCase() === String(idOrSlug).toLowerCase())
      );
      if (match) return match;
    }
  } catch (err) {
    console.warn('Meta events lookup error for OG tags:', err.message);
  }

  return null;
}

// Deep link route for events with rich social media preview tags
app.get(['/timer/:idOrSlug(*)', '/embed/:idOrSlug(*)'], async (req, res, next) => {
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return next();
  }

  try {
    const event = await findEventByIdOrSlug(req.params.idOrSlug);
    let html = fs.readFileSync(indexPath, 'utf8');

    if (event) {
      html = injectEventMetaTags(html, event, req);
    }

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.send(html);
  } catch (err) {
    console.error('Error injecting OG tags:', err.message);
    return res.sendFile(indexPath);
  }
});

app.get('*', (req, res) => {
  // If requesting a missing asset or static file (e.g. /assets/old-chunk.js, /favicon.ico), return 404
  if (req.path.startsWith('/assets/') || req.path.match(/\.(js|css|json|png|jpg|jpeg|svg|ico|woff|woff2|ttf|wasm)$/i)) {
    return res.status(404).type('text/plain').send('Asset not found');
  }
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);

    // Warm up Meta-Wiki events cache on startup and keep synced periodically
    getMetaEvents().catch(err => console.warn('Initial Meta-Wiki warmup sync:', err.message));
    
    const SYNC_INTERVAL_MS = Number(process.env.META_EVENTS_TTL_MS) || 60 * 60 * 1000; // 1 hour
    setInterval(() => {
      getMetaEvents().catch(err => console.warn('Periodic Meta-Wiki sync error:', err.message));
    }, SYNC_INTERVAL_MS);
  });
}
