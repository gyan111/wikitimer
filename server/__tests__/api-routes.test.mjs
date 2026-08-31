// Integration tests for Express API routes.
// Tests the HTTP layer (status codes, auth guards, validation) using the
// actual Express app but with mocked database and meta-events.

import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock Prisma before importing the server so it doesn't need a real DB.
vi.mock('../db.js', () => {
  return {
    default: {
      timer: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 1 }),
        delete: vi.fn().mockResolvedValue({}),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({ id: 1, wikiId: '1', username: 'test', isAdmin: false }),
      },
      $disconnect: vi.fn(),
    },
  };
});

// Mock meta-events so tests don't hit the network.
vi.mock('../meta-events.js', () => {
  return {
    getMetaEvents: vi.fn().mockResolvedValue([
      {
        id: 'meta:meta.wikimedia.org/wiki/Event:Test',
        isMeta: true,
        source: 'meta-allevents',
        type: 'event',
        name: 'Test Event',
        link: 'https://meta.wikimedia.org/wiki/Event:Test',
        time: '2026-07-11T00:00:00.000Z',
        endTime: '2026-07-15T00:00:00.000Z',
        region: 'Global',
        country: 'Online',
        timeZone: 'UTC',
        logo: null,
        wiki: 'meta.wikimedia.org',
      },
    ]),
    _testing: {},
  };
});

// Stub environment variables required by the server.
process.env.SESSION_COOKIE_SECRET = 'test-secret-for-ci';
process.env.WIKI_CLIENT_ID = 'test-client-id';
process.env.WIKI_CLIENT_SECRET = 'test-client-secret';
// Don't set DATABASE_URL — uses in-memory session store.

let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  const serverModule = await import('../index.js');
  app = serverModule.default;
});

// Simple helper to make requests without needing supertest
async function request(method, path, body) {
  const { createServer } = await import('http');

  return new Promise((resolve, reject) => {
    const server = createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      const url = `http://127.0.0.1:${port}${path}`;
      const options = { method };

      const headers = {};
      let bodyStr;
      if (body) {
        bodyStr = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
      }

      fetch(url, { method, headers, body: bodyStr })
        .then(async (res) => {
          const json = await res.json().catch(() => null);
          server.close();
          resolve({ status: res.status, body: json });
        })
        .catch((err) => {
          server.close();
          reject(err);
        });
    });
  });
}

// ---------------------------------------------------------------------------
// Health endpoints
// ---------------------------------------------------------------------------
describe('Health endpoints', () => {
  it('GET /health returns 200 with ok status', async () => {
    const res = await request('GET', '/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /healthz returns 200 with ok status', async () => {
    const res = await request('GET', '/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

// ---------------------------------------------------------------------------
// Test endpoint
// ---------------------------------------------------------------------------
describe('GET /test', () => {
  it('returns 200 with message', async () => {
    const res = await request('GET', '/test');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Server is working');
  });
});

// ---------------------------------------------------------------------------
// Timers
// ---------------------------------------------------------------------------
describe('GET /timers', () => {
  it('returns 200 with an array', async () => {
    const res = await request('GET', '/timers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Meta events
// ---------------------------------------------------------------------------
describe('GET /meta-events', () => {
  it('returns 200 with an array of events', async () => {
    const res = await request('GET', '/meta-events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].isMeta).toBe(true);
    expect(res.body[0].name).toBe('Test Event');
  });
});

// ---------------------------------------------------------------------------
// Auth-protected routes (unauthenticated)
// ---------------------------------------------------------------------------
describe('Auth-protected routes (unauthenticated)', () => {
  it('POST /add-timer returns 401', async () => {
    const res = await request('POST', '/add-timer', {
      type: 'event',
      name: 'Test',
      link: 'https://example.com',
      time: '2026-12-01T00:00:00Z',
      region: 'Global',
      country: 'Online',
      timeZone: 'UTC',
    });
    expect(res.status).toBe(401);
  });

  it('PUT /timers/1 returns 401', async () => {
    const res = await request('PUT', '/timers/1', {
      type: 'event',
      name: 'Updated Test',
      link: 'https://example.com',
      time: '2026-12-01T00:00:00Z',
      region: 'Global',
      country: 'Online',
      timeZone: 'UTC',
    });
    expect(res.status).toBe(401);
  });

  it('DELETE /timers/1 returns 401', async () => {
    const res = await request('DELETE', '/timers/1');
    expect(res.status).toBe(401);
  });

  it('GET /api/user returns 401', async () => {
    const res = await request('GET', '/api/user');
    expect(res.status).toBe(401);
  });

  it('GET /api/favorites returns empty array when unauthenticated', async () => {
    const res = await request('GET', '/api/favorites');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/favorites/toggle returns 401 when unauthenticated', async () => {
    const res = await request('POST', '/api/favorites/toggle', { eventKey: 'test-event' });
    expect(res.status).toBe(401);
  });

  it('POST /api/favorites/sync returns 401 when unauthenticated', async () => {
    const res = await request('POST', '/api/favorites/sync', { eventKeys: ['test-event'] });
    expect(res.status).toBe(401);
  });
});
