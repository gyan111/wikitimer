# 📖 WikiTimer Documentation & Community Guide

**WikiTimer** is a dedicated countdown, deadline tracker, and event coordination hub built specifically for the global Wikimedia movement. It automatically aggregates events across Wikimedia projects, provides real-time countdowns, timezone conversions, cross-platform calendar synchronization, and embeddable wikitext markdown snippets for Wikipedia and Meta-Wiki project pages.

---

## 🌟 Key Features

### 1. ⏱️ Real-Time Countdowns & Multi-Day Tracking
- **Live Precision Countdown:** Displays real-time Days, Hours, Minutes, and Seconds remaining until an event begins or a deadline closes.
- **Deadlines vs. Multi-Day Events:** 
  - **Deadlines (⏰ Crimson/Rose):** Emphasizes application cutoffs, scholarship submissions, call for proposals, and grant cycles (e.g. AoE / UTC-12:00 deadlines).
  - **Events (🎉 Ocean Blue):** Accurately tracks both the start and conclusion of multi-day conferences (e.g. Wikimania, Hackathons, Regional Summits), displaying `🎉 Ongoing: Ends in Xd Yh`.
- **Concluded Events Badge:** Clearly displays `✓ Ended` with the completion date once an event concludes.

### 2. 🌍 Universal Timezone Converter (UTC ↔ Local)
- Solves the #1 coordination challenge in the international Wikimedia community: **timezone confusion**.
- In the event details modal, users can seamlessly toggle between **Local Time** (matching the viewer's device) and **UTC** (official Wikimedia standard).

### 3. 📅 1-Click Cross-Platform Calendar Sync
- **Google Calendar:** 1-click URL generator that pre-fills event title, start/end dates, location, and wiki links.
- **Universal Apple / Outlook / iCalendar (`.ics`):** Instant `.ics` file generation formatted according to RFC 5545, compatible with Apple Calendar, Outlook, Mozilla Thunderbird, and mobile device calendars.

### 4. 📝 MediaWiki Wikitext Embed Generator
- Allows organizers to generate standard MediaWiki wikitext with 1 click to embed on Meta-Wiki, Wikipedia, or outreach project pages:
  ```wikitext
  [https://wikitimer.toolforge.org ⏱️ View Live Countdown on WikiTimer]
  ```

### 5. ⭐ Star / Favorite Events & Push Alerts
- **Star / Bookmark:** Save events of interest locally with a live toggle in the filter bar to isolate your bookmarked watchlist.
- **Browser Reminders:** Set a browser notification to receive an alert 15 minutes before an event kicks off.

### 6. 🗄️ Permanent Historical Archive
- MediaWiki's `CampaignEvents` extension removes events from `Special:AllEvents` as soon as they conclude.
- WikiTimer automatically **archives completed events into MariaDB ToolsDB**, ensuring that past editathons, conferences, and campaigns remain searchable forever under the **"Past Events"** filter.

### 7. 🌐 Multi-Lingual Interface (i18n)
- Localized into multiple languages including English, Deutsch, Français, ଓଡ଼ିଆ (Odia), മലയാളം (Malayalam), and తెలుగు (Telugu).

---

## 🏗️ Architecture & Technology Stack

```
   ┌─────────────────────────────────────────────────────────┐
   │                  WikiTimer Architecture                 │
   └─────────────────────────────────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   ┌─────────────────┐                   ┌─────────────────┐
   │ Vue 3 Frontend  │                   │ Express Backend │
   │ (Vite, Tailwind)│ ◄──[Same-Origin]─► │  (Port 8000)    │
   └─────────────────┘                   └────────┬────────┘
                                                  │
            ┌─────────────────────────────────────┼────────────────────┐
            ▼                                     ▼                    ▼
   ┌───────────────────┐               ┌───────────────────┐  ┌───────────────────┐
   │ Wikimedia OAuth 2 │               │ MariaDB (ToolsDB) │  │  Meta-Wiki Action │
   │  Authentication   │               │ (Prisma + MySQL)  │  │ API Scraper & Syn │
   └───────────────────┘               └───────────────────┘  └───────────────────┘
```

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Vue 3 (Composition & Options API) + Vite | High-performance reactive UI |
| **Styling** | Tailwind CSS + Vanilla CSS tokens | Responsive glassmorphism interface |
| **Localization** | `vue-i18n` | Multi-language translation support |
| **Backend** | Express.js (Node.js 20+) | REST API and static SPA fallback |
| **Database** | MariaDB (ToolsDB) via Prisma ORM | Persistent timers, user sessions, and event archives |
| **Auth** | Passport.js + `passport-oauth2` | Wikimedia OAuth 2.0 single sign-on |
| **CI/CD** | GitHub Actions + Toolforge Buildpack | Automated testing, container build, and deploy |

---

## 📡 REST API Reference

### 1. `GET /meta-events`
Returns all active, upcoming, and archived Wikimedia events.
- **Response Format:**
  ```json
  [
    {
      "id": "meta:meta.wikimedia.org/wiki/Event:Wikimania_2026",
      "slug": "wikimania-2026-a1b2",
      "name": "Wikimania 2026",
      "link": "https://meta.wikimedia.org/wiki/Event:Wikimania_2026",
      "time": "2026-08-05T09:00:00.000Z",
      "endTime": "2026-08-09T18:00:00.000Z",
      "region": "Europe",
      "country": "France",
      "type": "event",
      "isMeta": true
    }
  ]
  ```

### 2. `GET /timers`
Returns community-created timers merged with global events.

### 3. `POST /timers` *(Authenticated)*
Creates a new custom community timer or deadline.
- **Request Body:**
  ```json
  {
    "type": "event | deadline",
    "name": "My Community Editathon",
    "link": "https://meta.wikimedia.org/wiki/...",
    "time": "2026-10-01T10:00:00Z",
    "endTime": "2026-10-01T18:00:00Z",
    "region": "Asia",
    "country": "India",
    "timeZone": "UTC+05:30"
  }
  ```

### 4. `DELETE /timers/:id` *(Authenticated Creator/Admin)*
Deletes a community-created timer.

---

## 💻 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gyan111/wikitimer.git
   cd wiki-timer
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Provide `DATABASE_URL`, `SESSION_COOKIE_SECRET`, `WIKI_CLIENT_ID`, and `WIKI_CLIENT_SECRET`.

3. **Start development servers:**
   ```bash
   npm run start:server   # Backend API on port 3000
   npm run dev            # Vite frontend on port 5173 (proxies /api to backend)
   ```

4. **Run automated test suite:**
   ```bash
   npm test               # Runs Vitest unit & API integration tests
   ```

---

## 🚀 Toolforge Deployment & CI/CD

WikiTimer is deployed on **Wikimedia Toolforge** using the Build Service.

When changes are pushed to `main` on GitHub:
1. GitHub Actions automatically executes the test suite (`vitest`).
2. Connects to `login.toolforge.org` over SSH.
3. Triggers a Toolforge buildpack compilation: `toolforge build start https://github.com/gyan111/wikitimer`.
4. Polls the build until completion and performs a clean restart of the Kubernetes webservice.

---

## 🤝 Contributing & Community Feedback

- **Tool URL:** [https://wikitimer.toolforge.org](https://wikitimer.toolforge.org)
- **Source Code:** [GitHub Repository](https://github.com/gyan111/wikitimer)
- **Issues & Suggestions:** [GitHub Issues](https://github.com/gyan111/wikitimer/issues)
- **Author:** [User:Jnanaranjan_sahu](https://meta.wikimedia.org/wiki/User:Jnanaranjan_sahu) on Meta-Wiki

*Licensed under the Apache License 2.0.*
