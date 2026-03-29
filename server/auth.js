import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import fetch from 'node-fetch';
import prisma from './db.js';

// OAuth2 configuration
const WIKI_CLIENT_ID = process.env.WIKI_CLIENT_ID;
const WIKI_CLIENT_SECRET = process.env.WIKI_CLIENT_SECRET;
const CALLBACK_URL = process.env.WIKI_CALLBACK_URL || 'http://localhost:3000/auth/mediawiki/callback';

// Debug logging function
const debugLog = (message, data = null) => {
  console.log('\n=== DEBUG ===');
  console.log(message);
  if (data) {
    console.log('Data:', JSON.stringify(data, null, 2));
  }
  console.log('============\n');
};

// Validate environment variables
function validateEnvVariables() {
  debugLog('Checking environment variables');
  debugLog('Client ID', WIKI_CLIENT_ID);
  debugLog('Client Secret', WIKI_CLIENT_SECRET);
  debugLog('Callback URL', CALLBACK_URL);

  if (!WIKI_CLIENT_ID || !WIKI_CLIENT_SECRET) {
    throw new Error('Missing required environment variables: WIKI_CLIENT_ID and/or WIKI_CLIENT_SECRET');
  }
}

export default function(app) {
  // Validate environment variables before proceeding
  validateEnvVariables();

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

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
        isAdmin: dbUser.isAdmin,
        accessToken,
        refreshToken
      };

      return done(null, user);
    } catch (error) {
      debugLog('Error in OAuth callback', { error: error.message });
      return done(error);
    }
  });

  passport.use(strategy);

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize user from the session
  passport.deserializeUser((user, done) => {
    done(null, user);
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
