import express from 'express';
import auth from './auth.js';
import session from 'express-session';
import passport from 'passport';
import prisma from './db.js';

const app = express();
const port = process.env.PORT || 3000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

console.log('Starting server with configuration:', {
  port,
  clientUrl,
  nodeEnv: process.env.NODE_ENV
});

// Custom CORS middleware
app.use((req, res, next) => {
  // Log incoming request
  console.log('\n=== CORS Request ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('===================\n');

  const allowedOrigins = [
    'http://localhost:5173',  // Default Vite port
    'http://localhost:5174',  // Alternative port
    'http://localhost:5175',  // Current port
    process.env.CLIENT_URL    // From environment
  ].filter(Boolean);  // Remove any undefined values

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '3600');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return res.status(204).end();
  }

  next();
});

// Add session middleware
app.use(session({
  secret: process.env.SESSION_COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log('\n=== Request ===');
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('=============\n');

  // Log response headers after they're sent
  res.on('finish', () => {
    console.log('\n=== Response ===');
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.getHeaders());
    console.log('==============\n');
  });

  next();
});

// Initialize auth
const { isAuthenticated } = auth(app);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Server is working',
    origin: req.headers.origin,
    allowedOrigin: clientUrl
  });
});

// Timers endpoint
app.get('/timers', async (req, res) => {
  try {
    const timers = await prisma.timer.findMany({
      where: {
        time: {
          gt: new Date()
        }
      },
      orderBy: {
        time: 'asc'
      }
    });
    res.json(timers);
  } catch (err) {
    console.error('Error fetching timers:', err);
    res.status(500).json({ message: 'Error fetching timers', error: err.message });
  }
});

// Add timer endpoint (protected)
app.post('/add-timer', async (req, res) => {
  const { type, name, link, time, region, country, timeZone, logo } = req.body;

  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const timer = await prisma.timer.create({
      data: {
        type,
        name,
        link,
        time: new Date(time),
        region,
        country,
        timeZone,
        logo
      }
    });
    res.status(201).json({ message: 'Timer added successfully', timerId: timer.id.toString() });
  } catch (err) {
    console.error('Error adding timer:', err);
    res.status(500).json({ message: 'Error adding timer', error: err.message });
  }
});

// User endpoint
app.get('/api/user', (req, res) => {
  console.log('Auth check:', {
    session: req.session,
    user: req.user,
    isAuthenticated: req.isAuthenticated()
  });

  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: 'Not authenticated',
      message: 'Please log in to access this resource'
    });
  }
  res.json(req.user);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    cors: {
      enabled: true,
      allowedOrigin: clientUrl,
      credentials: true
    },
    env: {
      nodeEnv: process.env.NODE_ENV,
      port: port
    },
    request: {
      origin: req.headers.origin,
      headers: req.headers
    },
    response: {
      headers: res.getHeaders()
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('\n=== Error ===');
  console.error(err);
  console.error('============\n');

  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS enabled for origin: ${clientUrl}`);
});
