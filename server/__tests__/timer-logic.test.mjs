import { describe, it, expect } from 'vitest';

// Test timer deduplication logic matching WikiTimer.vue
function deduplicateEvents(userTimers = [], metaEvents = []) {
  const combined = [
    ...(Array.isArray(userTimers) ? userTimers : []),
    ...(Array.isArray(metaEvents) ? metaEvents : [])
  ];
  
  const seen = new Set();
  return combined.filter(event => {
    if (!event || typeof event !== 'object' || !event.name || !event.time) return false;
    
    let key;
    if (event.metaId) {
      key = `meta:${event.metaId}`;
    } else if (event.id && !event.isMeta) {
      key = `user:${event.id}`;
    } else if (event.slug) {
      key = `slug:${event.slug}`;
    } else {
      key = `event:${event.name.trim().toLowerCase()}_${new Date(event.time).getTime()}`;
    }
    
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Test date parsing with timezones
function parseDateTimeWithTz(dateTimeVal, timeZoneStr) {
  if (!dateTimeVal) return null;
  if (dateTimeVal instanceof Date) {
    return isNaN(dateTimeVal.getTime()) ? null : dateTimeVal;
  }
  if (typeof dateTimeVal !== 'string') return null;

  const trimmed = dateTimeVal.trim();
  if (!trimmed) return null;

  if (/Z$|[+-]\d{2}:?\d{2}$/i.test(trimmed)) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }

  let offset = '+00:00';
  if (timeZoneStr && typeof timeZoneStr === 'string') {
    const match = timeZoneStr.match(/([+-]\d{2}):?(\d{2})?/);
    if (match) {
      const signAndHours = match[1];
      const minutes = match[2] || '00';
      offset = `${signAndHours}:${minutes}`;
    }
  }

  const normalized = trimmed.replace(' ', 'T');
  const dateWithSeconds = normalized.length === 16 ? `${normalized}:00` : normalized;
  const isoWithOffset = `${dateWithSeconds}${offset}`;
  const d = new Date(isoWithOffset);
  return isNaN(d.getTime()) ? null : d;
}

describe('Timer Deduplication and Management', () => {
  it('does NOT drop distinct user events and deadlines that share the same URL', () => {
    const userTimers = [
      {
        id: 1,
        type: 'deadline',
        name: 'Call for Proposals Deadline',
        link: 'https://meta.wikimedia.org/wiki/Wikimania_2026',
        time: '2026-09-01T23:59:00.000Z'
      },
      {
        id: 2,
        type: 'deadline',
        name: 'Scholarships Deadline',
        link: 'https://meta.wikimedia.org/wiki/Wikimania_2026',
        time: '2026-09-15T23:59:00.000Z'
      },
      {
        id: 3,
        type: 'event',
        name: 'Wikimania 2026 Conference',
        link: 'https://meta.wikimedia.org/wiki/Wikimania_2026',
        time: '2026-10-01T09:00:00.000Z'
      }
    ];

    const metaEvents = [
      {
        metaId: '12345',
        isMeta: true,
        type: 'event',
        name: 'Wikimania 2026 Meta Entry',
        link: 'https://meta.wikimedia.org/wiki/Wikimania_2026',
        time: '2026-10-01T09:00:00.000Z'
      }
    ];

    const result = deduplicateEvents(userTimers, metaEvents);
    expect(result.length).toBe(4);
    expect(result.map(e => e.name)).toEqual([
      'Call for Proposals Deadline',
      'Scholarships Deadline',
      'Wikimania 2026 Conference',
      'Wikimania 2026 Meta Entry'
    ]);
  });

  it('correctly drops true duplicate meta events or duplicate IDs', () => {
    const userTimers = [
      { id: 1, name: 'Event A', time: '2026-09-01T00:00:00Z', link: 'https://example.com' },
      { id: 1, name: 'Event A duplicate', time: '2026-09-01T00:00:00Z', link: 'https://example.com' }
    ];
    const result = deduplicateEvents(userTimers, []);
    expect(result.length).toBe(1);
  });
});

describe('Timezone Offset Parsing', () => {
  it('correctly calculates UTC time for positive offsets (IST +05:30)', () => {
    const d = parseDateTimeWithTz('2026-09-01T15:30', 'UTC+05:30');
    expect(d).not.toBeNull();
    expect(d.toISOString()).toBe('2026-09-01T10:00:00.000Z');
  });

  it('correctly calculates UTC time for negative offsets (EST -05:00)', () => {
    const d = parseDateTimeWithTz('2026-09-01T15:00', 'UTC-05:00');
    expect(d).not.toBeNull();
    expect(d.toISOString()).toBe('2026-09-01T20:00:00.000Z');
  });

  it('correctly parses already-offset ISO strings without double-shifting', () => {
    const d = parseDateTimeWithTz('2026-09-01T10:00:00.000Z', 'UTC+05:30');
    expect(d.toISOString()).toBe('2026-09-01T10:00:00.000Z');
  });
});
