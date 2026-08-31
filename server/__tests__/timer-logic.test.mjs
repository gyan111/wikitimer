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

// Test validateTimerInput logic matching server/index.js
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

describe('Timer Input Validation', () => {
  it('accepts valid timer input with http or https link', () => {
    const valid = {
      type: 'event',
      name: 'Valid Conference',
      link: 'https://meta.wikimedia.org/wiki/Event:Valid',
      time: '2026-10-01T09:00',
      timeZone: 'UTC+02:00',
      region: 'Europe',
      country: 'France'
    };
    const { errors } = validateTimerInput(valid);
    expect(errors).toHaveLength(0);
  });

  it('rejects javascript: and non-http URI schemes', () => {
    const malicious = {
      type: 'event',
      name: 'Malicious Event',
      link: 'javascript:alert(1)',
      time: '2026-10-01T09:00',
      timeZone: 'UTC',
      region: 'Global',
      country: 'Online'
    };
    const { errors } = validateTimerInput(malicious);
    expect(errors).toContain('link must be a valid http or https URL');
  });

  it('rejects country exceeding 100 characters to prevent database truncation', () => {
    const invalid = {
      type: 'event',
      name: 'Event with long country',
      link: 'https://example.com',
      time: '2026-10-01T09:00',
      timeZone: 'UTC',
      region: 'Global',
      country: 'A'.repeat(101)
    };
    const { errors } = validateTimerInput(invalid);
    expect(errors).toContain('country too long (max 100 chars)');
  });

  it('allows links up to 2000 characters for long wiki URLs', () => {
    const valid = {
      type: 'event',
      name: 'Event with long URL',
      link: 'https://meta.wikimedia.org/wiki/' + 'a'.repeat(500),
      time: '2026-10-01T09:00',
      timeZone: 'UTC',
      region: 'Global',
      country: 'Online'
    };
    const { errors } = validateTimerInput(valid);
    expect(errors).toHaveLength(0);
  });
});

describe('Wiki Template and Deadline Countdown Logic', () => {
  function getWikiTemplateCode(event) {
    if (!event) return '';
    const targetIso = (event.type === 'deadline' && event.endTime) ? event.endTime : event.time;
    if (!targetIso) return '';
    const d = new Date(targetIso);
    const dateStr = d.toISOString().slice(0, 10);
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const mins = String(d.getUTCMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${mins}`;
    const targetId = event.slug || event.id;

    return `{{WikiTimer\n | id   = ${targetId}\n | name = ${event.name || ''}\n | link = ${event.link || ''}\n | date = ${dateStr}\n | time = ${timeStr}\n}}`;
  }

  it('uses endTime for deadline timers in wiki template generation', () => {
    const deadlineEvent = {
      id: 271,
      type: 'deadline',
      name: 'Scholarship Application Open Knowledge Conference 2027',
      link: 'https://meta.wikimedia.org/wiki/Open_Knowledge_Conference_2027',
      time: '2026-07-31T18:31:00.000Z',
      endTime: '2026-09-10T18:29:00.000Z'
    };

    const templateCode = getWikiTemplateCode(deadlineEvent);
    expect(templateCode).toContain('| date = 2026-09-10');
    expect(templateCode).toContain('| time = 18:29');
  });

  it('uses start time for regular event timers in wiki template generation', () => {
    const conferenceEvent = {
      id: 272,
      type: 'event',
      name: 'Open Knowledge Conference 2027',
      link: 'https://meta.wikimedia.org/wiki/Open_Knowledge_Conference_2027',
      time: '2026-07-31T18:31:00.000Z',
      endTime: '2026-09-10T18:29:00.000Z'
    };

    const templateCode = getWikiTemplateCode(conferenceEvent);
    expect(templateCode).toContain('| date = 2026-07-31');
    expect(templateCode).toContain('| time = 18:31');
  });
});

