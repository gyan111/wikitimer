# Wiki Timer

A Vue.js application for tracking Wikimedia events and deadlines.

The app also imports the global Wikimedia event list (Meta-Wiki
`Special:AllEvents` / CampaignEvents "Collaboration List") as a read-only,
merged view alongside user-created timers.

## Prerequisites

Before installation, ensure you have the following installed:
- Node.js (v18 or higher)
- MariaDB / MySQL

## Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone [repository-url]
   cd wiki-timer
   npm install
   ```

2. Create a `.env` file from the template and fill in the values:
   ```bash
   cp .env.example .env
   ```
   At minimum set `DATABASE_URL`, `SESSION_COOKIE_SECRET`, `WIKI_CLIENT_ID`,
   and `WIKI_CLIENT_SECRET`.

3. Set up the database schema (Prisma manages the tables):
   ```bash
   npx prisma migrate deploy   # apply migrations to the database
   npx prisma generate         # generate the Prisma client (also runs on install)
   ```

## Running the Application

Development (two processes):
```bash
npm run start:server   # backend API on http://localhost:3000
npm run dev            # Vite dev server on http://localhost:5173
```
The Vite dev server proxies API/auth routes to the backend, so the frontend
uses same-origin relative paths (no CORS needed).

Production (single process — Express serves the built frontend and the API):
```bash
npm run build
npm start              # runs `prisma migrate deploy` then starts the server
```

## Scripts

- `npm run dev` - Vite dev server (frontend only)
- `npm run build` - Build frontend into `dist/`
- `npm run start:server` - Start the backend without running migrations
- `npm start` - Apply DB migrations then start the server (serves `dist/` + API)

## Authentication Setup

1. Register an OAuth2 consumer on Wikimedia:
   - Go to https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration
   - Set the callback URL to `<your-base-url>/auth/mediawiki/callback`
     (dev: `http://localhost:3000/auth/mediawiki/callback`)
   - Copy the Client ID and Secret into your `.env` file
2. Set `SESSION_COOKIE_SECRET`, `WIKI_CLIENT_ID`, `WIKI_CLIENT_SECRET`, and
   `CLIENT_URL` in `.env`.

## Deploying to Wikimedia Toolforge (Build Service)

This repo is configured for the Toolforge Build Service (`Procfile`,
`service.template`, `npm start`, and Prisma migrations).

1. Push this repo to your tool's GitLab mirror
   (`https://gitlab.wikimedia.org/toolforge-repos/<toolname>`).
2. SSH in and build the image:
   ```bash
   ssh login.toolforge.org
   become <toolname>
   toolforge build start https://gitlab.wikimedia.org/toolforge-repos/<toolname>.git
   toolforge build show   # wait until the build succeeds
   ```
3. Create a ToolsDB database (once) and set environment variables:
   ```bash
   # In `sql tools` create a database like s#####__wikitimer, then:
   toolforge envvars create DATABASE_URL
   #   mysql://$TOOL_TOOLSDB_USER:$TOOL_TOOLSDB_PASSWORD@tools.db.svc.wikimedia.cloud:3306/<db>
   toolforge envvars create SESSION_COOKIE_SECRET
   toolforge envvars create WIKI_CLIENT_ID
   toolforge envvars create WIKI_CLIENT_SECRET
   toolforge envvars create WIKI_CALLBACK_URL   # https://<toolname>.toolforge.org/auth/mediawiki/callback
   toolforge envvars create CLIENT_URL          # https://<toolname>.toolforge.org
   toolforge envvars create NODE_ENV            # production
   ```
   Register the OAuth consumer's callback URL to match `WIKI_CALLBACK_URL`.
4. Start the web service (uses `service.template`):
   ```bash
   toolforge webservice buildservice start
   ```
   `npm start` runs `prisma migrate deploy` on boot, creating the schema on
   first run. The app will be available at `https://<toolname>.toolforge.org`.

## Troubleshooting

### Common Issues

1. Database Connection Errors:
   - Verify MariaDB is running
   - Check database credentials in `.env`
   - Ensure database and tables are created

2. Port Conflicts:
   - Ensure ports 3000 and 5173 are available
   - Change ports in `.env` if needed

3. Authentication Issues:
   - Verify OAuth2 credentials
   - Check callback URL configuration
   - Clear browser cookies
   - Check server logs for specific errors

### Debug Logs

To enable detailed logging:
1. Set `DEBUG=true` in `.env`
2. Check browser console for frontend logs
3. Check terminal for backend logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
