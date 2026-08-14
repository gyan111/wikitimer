# Project notes

Wiki Timer: Vue 3 (Vite) frontend + Express/Passport backend, Prisma + MariaDB,
Wikimedia OAuth2 login. Deployed on Wikimedia Toolforge via the Build Service.

## Architecture
- Frontend: `src/` (Vue 3, Vue Router history mode, vue-i18n, Tailwind). Uses
  same-origin **relative** API paths (`/timers`, `/meta-events`, `/auth/...`).
- Backend: `server/index.js` serves the API and, in production, the built
  `dist/` with an SPA fallback so deep links work.
- `server/meta-events.js`: fetches the global event list from Meta-Wiki
  `{{Special:AllEvents}}` via the Action API, parses the HTML, dedups by event
  page URL, and caches (default 1h TTL, 5min retry backoff on failure).
  Exposed read-only at `GET /meta-events`.
  - **Why scraping and not the wiki replicas:** verified on
    tools-bastion-15 that `campaign_events`/`ce_*` tables are absent from
    `metawiki_p` and `commonswiki_p` (CampaignEvents' `virtual-campaignevents`
    domain isn't exposed to Toolforge). CampaignEvents also has no public
    "list all events" REST endpoint (only per-organizer/per-participant). The
    `{{Special:AllEvents}}` transclusion is the officially supported way to
    embed this list (T385347), so parsing its rendered output is the
    least-bad option available today. Revisit if CampaignEvents ships a
    public list endpoint or the tables become replica-available.
  - Set `META_USER_AGENT` in production (WMF UA policy requires real contact
    info) and optionally `META_EVENTS_TTL_MS`.
- DB schema in `prisma/schema.prisma`; migrations in `prisma/migrations/`.

## Commands (verified)
- Install: `npm install` (runs `prisma generate` via postinstall)
- Build frontend: `npm run build`
- Dev: `npm run start:server` (API :3000) + `npm run dev` (Vite :5173, proxies API)
- Prod start: `npm start` (runs `prisma migrate deploy` then `node server/index.js`)
- New migration after schema change: `npx prisma migrate dev --name <name>`

## Required env vars
`DATABASE_URL`, `SESSION_COOKIE_SECRET`, `WIKI_CLIENT_ID`, `WIKI_CLIENT_SECRET`,
`WIKI_CALLBACK_URL`, `CLIENT_URL`. `PORT` is injected on Toolforge (8000).
See `.env.example`. Sessions are stored in MariaDB (falls back to in-memory only
when `DATABASE_URL` is unset, dev only).

## Notes
- Meta events are read-only (`isMeta: true`, no `creatorId`); the UI hides
  delete for them and merges them with user timers ("show both").
- Frontend and API are same-origin in production, so there is no CORS handling
  in production; a CORS shim runs only in development.
- Remaining `npm audit` items are dev-only (esbuild/vite dev server); fixing
  requires a major Vite upgrade and does not affect the production runtime.
