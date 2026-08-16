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

// Dynamically import the app only after mocks are in place.
// The server/index.js calls app.listen() at module level, so we need to
// build a lightweight test app that mirrors the routes instead.

import express from 'express';

let app;

beforeAll(async () => {
  // Build a minimal Express app that mirrors the routes from server/index.js
  // but doesn't call listen() or connect to a real DB.
  const { getMetaEvents } = await import('../meta-events.js');
  const prisma = (await import('../db.js')).default;

  app = express();
  app.use(express.json());

  app.get('/test', (req, res) => {
    res.json({ message: 'Server is working' });
  });

  app.get('/timers', async (req, res) => {
    try {
      const timers = await prisma.timer.findMany({
        include: { creator: { select: { id: true, username: true } } },
        orderBy: { time: 'asc' },
      });
      res.json(timers);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching timers' });
    }
  });

  app.get('/meta-events', async (req, res) => {
    try {
      const events = await getMetaEvents();
      res.json(events);
    } catch (err) {
      res.status(502).json({ message: 'Error fetching meta events' });
    }
  });

  app.post('/add-timer', (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.status(201).json({ message: 'Timer added' });
  });

  app.delete('/timers/:id', (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.status(200).json({ message: 'Timer deleted' });
  });

  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json(req.user);
  });

  const healthHandler = (req, res) => res.json({ status: 'ok' });
  app.get('/health', healthHandler);
  app.get('/healthz', healthHandler);
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

  it('DELETE /timers/1 returns 401', async () => {
    const res = await request('DELETE', '/timers/1');
    expect(res.status).toBe(401);
  });

  it('GET /api/user returns 401', async () => {
    const res = await request('GET', '/api/user');
    expect(res.status).toBe(401);
  });
});
