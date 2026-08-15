import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import fetch from 'node-fetch';
import prisma from './db.js';

// OAuth2 configuration
const WIKI_CLIENT_ID = process.env.WIKI_CLIENT_ID;
const WIKI_CLIENT_SECRET = process.env.WIKI_CLIENT_SECRET;
const CALLBACK_URL = process.env.WIKI_CALLBACK_URL || 'http://localhost:3000/auth/mediawiki/callback';

const isProd = process.env.NODE_ENV === 'production';

// Debug logging function (never logs secrets, and is silenced in production).
const debugLog = (message, data = null) => {
  if (isProd) return;
  console.log('\n=== DEBUG ===');
  console.log(message);
  if (data) {
    console.log('Data:', JSON.stringify(data, null, 2));
  }
  console.log('============\n');
};

// Validate environment variables
function validateEnvVariables() {
  debugLog('Checking OAuth environment variables', {
    clientIdSet: !!WIKI_CLIENT_ID,
    clientSecretSet: !!WIKI_CLIENT_SECRET,
    callbackUrl: CALLBACK_URL
  });

  if (!WIKI_CLIENT_ID || !WIKI_CLIENT_SECRET) {
    console.warn('⚠️  WIKI_CLIENT_ID and/or WIKI_CLIENT_SECRET not set; OAuth login will be disabled.');
    return false;
  }
  return true;
}

export default function(app) {
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  const hasOAuth = validateEnvVariables();
  if (!hasOAuth) {
    app.get('/auth/mediawiki', (req, res) => {
      res.status(503).json({ error: 'OAuth login is not configured on this server.' });
    });
    return;
  }

  // Custom OAuth2 Strategy for MediaWiki
  const strategy = new OAuth2Strategy({
    authorizationURL: 'https://meta.wikimedia.org/w/rest.php/oauth2/authorize',
    tokenURL: 'https://meta.wikimedia.org/w/rest.php/oauth2/access_token',
    clientID: WIKI_CLIENT_ID,
    clientSecret: WIKI_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: ['basic']
  }, async function(accessToken, refreshToken, params, profile, done) {
    try {
      debugLog('OAuth callback received', { accessToken: !!accessToken, refreshToken: !!refreshToken });
      
      const response = await fetch('https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'Wiki Timer Application/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      const userData = await response.json();
      
      // Upsert user in the database
      const dbUser = await prisma.user.upsert({
        where: { wikiId: userData.sub },
        update: { username: userData.username },
        create: {
          wikiId: userData.sub,
          username: userData.username,
          isAdmin: false
        }
      });

      const user = {
        id: dbUser.id, // Use database ID
        wikiId: dbUser.wikiId,
        username: dbUser.username,
        isAdmin: dbUser.isAdmin
      };

      return done(null, user);
    } catch (error) {
      debugLog('Error in OAuth callback', { error: error.message });
      return done(error);
    }
  });

  passport.use(strategy);

  // Store only the database id in the session; OAuth tokens are never persisted.
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Reload the user from the database on each request.
  passport.deserializeUser(async (id, done) => {
    try {
      const dbUser = await prisma.user.findUnique({ where: { id } });
      if (!dbUser) return done(null, false);
      done(null, {
        id: dbUser.id,
        wikiId: dbUser.wikiId,
        username: dbUser.username,
        isAdmin: dbUser.isAdmin
      });
    } catch (error) {
      done(error);
    }
  });

  // Auth routes
  app.get('/auth/mediawiki',
    passport.authenticate('oauth2')
  );

  app.get('/auth/mediawiki/callback',
    passport.authenticate('oauth2', {
      failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/?error=auth_failed`
    }),
    (req, res) => {
      // Successful authentication, redirect to client
      debugLog('Authentication successful, redirecting to client');
      res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
    }
  );

  // Logout route
  app.get('/auth/logout', (req, res) => {
    debugLog('Logout requested');
    req.logout((err) => {
      if (err) {
        debugLog('Error during logout', { error: err.message });
        return res.status(500).json({ error: 'Failed to logout' });
      }
      
      // Destroy the session
      req.session.destroy((err) => {
        if (err) {
          debugLog('Error destroying session', { error: err.message });
          return res.status(500).json({ error: 'Failed to clear session' });
        }
        res.clearCookie('connect.sid'); // Assuming default express-session cookie name
        debugLog('Logout successful');
        res.status(200).json({ message: 'Logged out successfully' });
      });
    });
  });

  // Middleware to check if user is authenticated
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
  };

  return {
    isAuthenticated
  };
}
