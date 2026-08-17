# ⏱️ WikiTimer

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Hosted on Wikimedia Toolforge](https://img.shields.io/badge/Hosted%20on-Wikimedia%20Toolforge-brightgreen.svg)](https://wikitimer.toolforge.org)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![Vue 3](https://img.shields.io/badge/Vue.js-3.x-emerald.svg)](https://vuejs.org)

**WikiTimer** is an event coordination hub and countdown tracker designed for the global Wikimedia movement. It aggregates upcoming conferences, campaigns, and deadlines across Wikimedia projects with real-time countdowns, timezone conversion, interactive maps, calendar sync, and embed widgets.

🔗 **Live Tool:** [https://wikitimer.toolforge.org](https://wikitimer.toolforge.org)

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- **Node.js** 20+ and **npm**
- **MariaDB** or **MySQL** (optional in dev; falls back to in-memory store if `DATABASE_URL` is unset)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/gyan111/wikitimer.git
cd wikitimer
npm install
```

### 2. Configure Environment Variables
Copy the example `.env` file:
```bash
cp .env.example .env
```

### 3. Database Setup (Optional for local dev)
If you have a local MariaDB/MySQL database running:
```bash
npx prisma db push
```

### 4. Start Development Servers
Run the backend and frontend:
```bash
# Terminal 1: Backend API
npm run start:server

# Terminal 2: Frontend Vite dev server
npm run dev
```

Visit **`http://localhost:5173`** in your browser. The Vite dev server automatically proxies API requests to the backend.

---

## 📜 Available Scripts

- `npm run dev` — Starts the Vite frontend dev server with hot reload
- `npm run start:server` — Starts the Express backend server
- `npm run build` — Builds the production bundle to `dist/`
- `npm start` — Runs migrations and starts the production server
- `npm test` — Runs the test suite with Vitest

---

## 🔐 Wikimedia OAuth2 Setup (Optional for Login)

To test Wikimedia login locally:
1. Register a consumer at [Meta-Wiki OAuth Consumer Registration](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration).
2. Set the OAuth Callback URL to: `http://localhost:8000/callback` (or your local backend callback URL).
3. Add your `WIKI_CLIENT_ID` and `WIKI_CLIENT_SECRET` in `.env`.

---

## 📄 License

Apache License 2.0. See [LICENSE](LICENSE) for details.
