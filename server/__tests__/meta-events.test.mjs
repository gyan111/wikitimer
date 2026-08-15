// Unit tests for server/meta-events.js parser functions.
// These test the pure parsing logic against fixture HTML without network calls.

import { describe, it, expect } from 'vitest';
import { _testing } from '../meta-events.js';

const { decodeEntities, parseDate, parseWidgets, parseRow } = _testing;

// ---------------------------------------------------------------------------
// decodeEntities
// ---------------------------------------------------------------------------
describe('decodeEntities', () => {
  it('decodes &amp;', () => {
    expect(decodeEntities('A &amp; B')).toBe('A & B');
  });

  it('decodes &lt; and &gt;', () => {
    expect(decodeEntities('&lt;div&gt;')).toBe('<div>');
  });

  it('decodes &quot;', () => {
    expect(decodeEntities('&quot;hello&quot;')).toBe('"hello"');
  });

  it('decodes &#39; and &#039;', () => {
    expect(decodeEntities("it&#39;s")).toBe("it's");
    expect(decodeEntities("it&#039;s")).toBe("it's");
  });

  it('decodes numeric entities like &#233;', () => {
    expect(decodeEntities('caf&#233;')).toBe('café');
  });

  it('trims whitespace', () => {
    expect(decodeEntities('  hello  ')).toBe('hello');
  });

  it('handles strings with no entities', () => {
    expect(decodeEntities('plain text')).toBe('plain text');
  });

  it('handles multiple entities in one string', () => {
    expect(decodeEntities('&lt;a href=&quot;url&quot;&gt;'))
      .toBe('<a href="url">');
  });
});

// ---------------------------------------------------------------------------
// parseDate
// ---------------------------------------------------------------------------
describe('parseDate', () => {
  it('parses "11 July 2026"', () => {
    expect(parseDate('11 July 2026')).toBe('2026-07-11T00:00:00.000Z');
  });

  it('parses "1 January 2025" (single-digit day)', () => {
    expect(parseDate('1 January 2025')).toBe('2025-01-01T00:00:00.000Z');
  });

  it('parses "31 December 2024"', () => {
    expect(parseDate('31 December 2024')).toBe('2024-12-31T00:00:00.000Z');
  });

  it('is case-insensitive for month names', () => {
    expect(parseDate('5 AUGUST 2026')).toBe('2026-08-05T00:00:00.000Z');
    expect(parseDate('5 august 2026')).toBe('2026-08-05T00:00:00.000Z');
  });

  it('returns null for empty string', () => {
    expect(parseDate('')).toBeNull();
  });

  it('returns null for invalid month', () => {
    expect(parseDate('11 Smarch 2026')).toBeNull();
  });

  it('returns null for missing year', () => {
    expect(parseDate('11 July')).toBeNull();
  });

  it('extracts date from surrounding text', () => {
    expect(parseDate('starts 5 March 2026 and ends'))
      .toBe('2026-03-05T00:00:00.000Z');
  });
});

// ---------------------------------------------------------------------------
// parseWidgets
// ---------------------------------------------------------------------------
describe('parseWidgets', () => {
  it('extracts a single widget', () => {
    // The regex expects label and content spans to be adjacent (as MediaWiki emits them).
    const html = '<span class="ext-campaignevents-textwithicon-widget-label">Country</span><span class="ext-campaignevents-textwithicon-widget-content">Nigeria</span>';
    expect(parseWidgets(html)).toEqual({ Country: 'Nigeria' });
  });

  it('extracts multiple widgets', () => {
    const html =
      '<span class="ext-campaignevents-textwithicon-widget-label">Country</span><span class="ext-campaignevents-textwithicon-widget-content">Germany</span>' +
      '<span class="ext-campaignevents-textwithicon-widget-label">Participation options</span><span class="ext-campaignevents-textwithicon-widget-content">Online</span>';
    const w = parseWidgets(html);
    expect(w.Country).toBe('Germany');
    expect(w['Participation options']).toBe('Online');
  });

  it('strips HTML tags from content', () => {
    const html = '<span class="ext-campaignevents-textwithicon-widget-label">Organizers</span><span class="ext-campaignevents-textwithicon-widget-content"><a href="/wiki/User:Foo">Foo</a></span>';
    expect(parseWidgets(html)).toEqual({ Organizers: 'Foo' });
  });

  it('returns empty object when no widgets present', () => {
    expect(parseWidgets('<p>no widgets here</p>')).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// parseRow — English Event: namespace (meta.wikimedia.org)
// ---------------------------------------------------------------------------
describe('parseRow', () => {
  const makeRow = (overrides = {}) => {
    const {
      href = '//meta.wikimedia.org/wiki/Event:Test_Event',
      name = 'Test Event',
      startDate = '11 July 2026',
      endDate = '15 July 2026',
      country = 'Nigeria',
      participation = '',
    } = overrides;

    // Build widget HTML with adjacent spans (matching real MediaWiki output)
    let widgets = '';
    if (country) {
      widgets += `<span class="ext-campaignevents-textwithicon-widget-label">Country</span><span class="ext-campaignevents-textwithicon-widget-content">${country}</span>`;
    }
    if (participation) {
      widgets += `<span class="ext-campaignevents-textwithicon-widget-label">Participation options</span><span class="ext-campaignevents-textwithicon-widget-content">${participation}</span>`;
    }

    return `<a href="${href}" class="ext-campaignevents-events-list-link">${name}</a>` +
      `<strong>${startDate}${endDate ? ` \u2013 ${endDate}` : ''}</strong>` +
      widgets;
  };

  it('parses a standard English Event: row', () => {
    const event = parseRow(makeRow());
    expect(event).not.toBeNull();
    expect(event.id).toBe('meta:meta.wikimedia.org/wiki/Event:Test_Event');
    expect(event.name).toBe('Test Event');
    expect(event.link).toBe('https://meta.wikimedia.org/wiki/Event:Test_Event');
    expect(event.time).toBe('2026-07-11T00:00:00.000Z');
    expect(event.endTime).toBe('2026-07-15T23:59:59.999Z');
    expect(event.country).toBe('Nigeria');
    expect(event.wiki).toBe('meta.wikimedia.org');
    expect(event.isMeta).toBe(true);
    expect(event.type).toBe('event');
    expect(event.source).toBe('meta-allevents');
    expect(event.region).toBe('Global');
    expect(event.timeZone).toBe('UTC');
    expect(event.logo).toBeNull();
  });

  // --- Non-English namespaces (the bug we fixed) ---

  it('parses Spanish Evento: namespace', () => {
    const event = parseRow(makeRow({
      href: '//es.wikipedia.org/wiki/Evento:JuevesWiki_13_de_agosto',
      name: 'JuevesWiki 13 de agosto',
    }));
    expect(event).not.toBeNull();
    expect(event.wiki).toBe('es.wikipedia.org');
    expect(event.link).toBe('https://es.wikipedia.org/wiki/Evento:JuevesWiki_13_de_agosto');
  });

  it('parses Arabic فعالية: namespace (URL-encoded)', () => {
    const event = parseRow(makeRow({
      href: '//ar.wikipedia.org/wiki/%D9%81%D8%B9%D8%A7%D9%84%D9%8A%D8%A9:%D8%B7%D9%88%D8%A7%D8%A8%D8%B9',
      name: 'طوابع بريد مصر الجوي',
    }));
    expect(event).not.toBeNull();
    expect(event.wiki).toBe('ar.wikipedia.org');
  });

  it('parses Azerbaijani Tədbir: namespace (URL-encoded)', () => {
    const event = parseRow(makeRow({
      href: '//az.wikipedia.org/wiki/T%C9%99dbir:Viki_Ming%C9%99%C3%A7eviri',
      name: 'Viki Mingəçeviri Sevir',
    }));
    expect(event).not.toBeNull();
    expect(event.wiki).toBe('az.wikipedia.org');
  });

  it('parses Indonesian Acara: namespace', () => {
    const event = parseRow(makeRow({
      href: '//id.wikisource.org/wiki/Acara:Tantangan_WikiPandu',
      name: 'Tantangan WikiPandu',
    }));
    expect(event).not.toBeNull();
    expect(event.wiki).toBe('id.wikisource.org');
  });

  it('parses German Veranstaltung: namespace', () => {
    const event = parseRow(makeRow({
      href: '//de.wikipedia.org/wiki/Veranstaltung:Wiki_Loves_Monuments',
      name: 'Wiki Loves Monuments',
    }));
    expect(event).not.toBeNull();
    expect(event.wiki).toBe('de.wikipedia.org');
  });

  // --- Edge cases ---

  it('handles event with no end date', () => {
    const event = parseRow(makeRow({ endDate: '' }));
    expect(event).not.toBeNull();
    expect(event.endTime).toBe('2026-07-11T23:59:59.999Z');
  });

  it('infers Online country from participation widget', () => {
    const event = parseRow(makeRow({
      country: '',
      participation: 'Online',
    }));
    expect(event).not.toBeNull();
    expect(event.country).toBe('Online');
  });

  it('returns empty country when no country and not online', () => {
    const event = parseRow(makeRow({
      country: '',
      participation: 'In person',
    }));
    expect(event).not.toBeNull();
    expect(event.country).toBe('');
  });

  it('strips HTML from event name', () => {
    const event = parseRow(makeRow({ name: '<b>Bold</b> Name' }));
    expect(event).not.toBeNull();
    expect(event.name).toBe('Bold Name');
  });

  it('returns null for row with no matching link', () => {
    const event = parseRow('<p>No event link here</p>');
    expect(event).toBeNull();
  });

  it('returns null for row with no parseable date', () => {
    const html = `
      <a href="//meta.wikimedia.org/wiki/Event:Test" class="ext-campaignevents-events-list-link">Test</a>
      <strong>TBD</strong>
    `;
    expect(parseRow(html)).toBeNull();
  });

  it('uses en-dash (–) to split date range', () => {
    const event = parseRow(makeRow({
      startDate: '1 August 2026',
      endDate: '31 August 2026',
    }));
    expect(event.time).toBe('2026-08-01T00:00:00.000Z');
    expect(event.endTime).toBe('2026-08-31T23:59:59.999Z');
  });
});

// ---------------------------------------------------------------------------
// Deduplication (integration-level: simulates what fetchMetaEvents does)
// ---------------------------------------------------------------------------
describe('deduplication', () => {
  const makeRow = (id, date) => `
    <a href="//meta.wikimedia.org/wiki/Event:${id}" class="ext-campaignevents-events-list-link">${id}</a>
    <strong>${date}</strong>
  `;

  it('deduplicates rows with the same event page URL', () => {
    const rows = [
      makeRow('Dupe_Event', '1 July 2026'),
      makeRow('Dupe_Event', '1 July 2026'),
      makeRow('Other_Event', '2 July 2026'),
    ];

    const byKey = new Map();
    for (const row of rows) {
      const event = parseRow(row);
      if (event && !byKey.has(event.id)) byKey.set(event.id, event);
    }

    expect(byKey.size).toBe(2);
  });
});
