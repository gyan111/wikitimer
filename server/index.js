import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import passport from 'passport';
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

console.log('Starting server:', { port, clientUrl, nodeEnv: process.env.NODE_ENV });

// Auto-seed historical Wikimedia events in background on startup if database is connected
if (process.env.DATABASE_URL) {
  seedHistoricalEvents().catch(e => console.error('Historical events seed error:', e.message));
}

// Behind the Toolforge nginx proxy, trust the first hop so secure cookies work.
app.set('trust proxy', 1);

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
    return res.json(devTimers);
  }
  try {
    const timers = await prisma.timer.findMany({
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

// Validates and normalizes the body of an add-timer request.
function validateTimerInput(body) {
  const errors = [];
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const data = {
    type: str(body.type),
    name: str(body.name),
    link: str(body.link),
    time: body.time,
    endTime: body.endTime ? new Date(body.endTime) : null,
    region: str(body.region),
    country: str(body.country),
    timeZone: str(body.timeZone),
    organizers: body.organizers != null ? str(body.organizers) : null,
    logo: body.logo != null ? str(body.logo) : null,
    topics: body.topics != null ? str(body.topics) : null,
    participation: body.participation != null ? str(body.participation) : null
  };

  if (!['event', 'deadline'].includes(data.type)) errors.push('type must be "event" or "deadline"');
  if (!data.name || data.name.length > 255) errors.push('name is required (max 255 chars)');
  if (!data.link || data.link.length > 255) errors.push('link is required (max 255 chars)');
  if (data.region.length > 100) errors.push('region too long (max 100 chars)');
  if (data.country.length > 100) errors.push('country too long (max 100 chars)');
  if (data.timeZone.length > 50) errors.push('timeZone too long (max 50 chars)');
  if (data.organizers && data.organizers.length > 255) errors.push('organizers too long (max 255 chars)');
  if (data.logo && data.logo.length > 255) errors.push('logo too long (max 255 chars)');
  if (data.participation && data.participation.length > 100) errors.push('participation too long (max 100 chars)');

  const parsedTime = new Date(data.time);
  if (isNaN(parsedTime.getTime())) errors.push('time is not a valid date');
  else data.time = parsedTime;

  if (data.endTime && isNaN(data.endTime.getTime())) {
    data.endTime = null;
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
      creator: { id: req.user.id, username: req.user.username }
    };
    devTimers.push(newTimer);
    return res.status(201).json({ message: 'Timer added successfully', timerId: newTimer.id.toString() });
  }

  try {
    const timer = await prisma.timer.create({
      data: { ...data, creatorId: req.user.id }
    });
    res.status(201).json({ message: 'Timer added successfully', timerId: timer.id.toString() });
  } catch (err) {
    console.error('Error adding timer:', err);
    res.status(500).json({ message: 'Error adding timer' });
  }
});

// Delete timer endpoint (protected).
app.delete('/timers/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const timerId = parseInt(req.params.id, 10);
  if (isNaN(timerId)) {
    return res.status(400).json({ message: 'Invalid timer id' });
  }

  if (!process.env.DATABASE_URL) {
    const index = devTimers.findIndex(t => t.id === timerId);
    if (index === -1) return res.status(404).json({ message: 'Timer not found' });
    if (devTimers[index].creatorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this timer' });
    }
    devTimers.splice(index, 1);
    return res.json({ message: 'Timer deleted successfully' });
  }

  try {
    const timer = await prisma.timer.findUnique({ where: { id: timerId } });
    if (!timer) {
      return res.status(404).json({ message: 'Timer not found' });
    }
    if (timer.creatorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this timer' });
    }
    await prisma.timer.delete({ where: { id: timerId } });
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

app.get('*', (req, res) => {
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
