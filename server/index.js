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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

console.log('Starting server:', { port, clientUrl, nodeEnv: process.env.NODE_ENV });

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

// Session store: persist sessions in MariaDB (ToolsDB) so they survive restarts
// and work across replicas. Falls back to the in-memory store if no database
// URL is configured (local development only).
function buildSessionStore() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set; using in-memory session store (dev only).');
    return undefined;
  }
  const dbUrl = new URL(process.env.DATABASE_URL);
  const MySQLStore = MySQLStoreFactory(session);
  return new MySQLStore({
    host: dbUrl.hostname,
    port: Number(dbUrl.port) || 3306,
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\//, ''),
    createDatabaseTable: true
  });
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

// In-memory timers store when DATABASE_URL is not set (local dev)
let devTimerCounter = 1;
const devTimers = [];

// Timers created by users.
app.get('/timers', async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.json(devTimers);
  }
  try {
    const timers = await prisma.timer.findMany({
      where: { time: { gt: new Date() } },
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
    region: str(body.region),
    country: str(body.country),
    timeZone: str(body.timeZone),
    logo: body.logo != null ? str(body.logo) : null
  };

  if (!['event', 'deadline'].includes(data.type)) errors.push('type must be "event" or "deadline"');
  if (!data.name || data.name.length > 255) errors.push('name is required (max 255 chars)');
  if (!data.link || data.link.length > 255) errors.push('link is required (max 255 chars)');
  if (data.region.length > 100) errors.push('region too long (max 100 chars)');
  if (data.country.length > 100) errors.push('country too long (max 100 chars)');
  if (data.timeZone.length > 50) errors.push('timeZone too long (max 50 chars)');
  if (data.logo && data.logo.length > 255) errors.push('logo too long (max 255 chars)');

  const parsedTime = new Date(data.time);
  if (isNaN(parsedTime.getTime())) errors.push('time is not a valid date');
  else data.time = parsedTime;

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
app.use(express.static(distPath));
app.get('*', (req, res) => {
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
