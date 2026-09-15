# Expensify

A minimal expense tracker built as an installable web app (PWA), with account login and
a small admin dashboard. Track everyday spending, set a monthly budget, track fixed-budget
trips separately, keep tabs on money owed to or by you, and get a category breakdown.

## Features

- Quick expense entry with a full-screen keypad and category picker
- Swipe-to-delete, search, and monthly budget tracking
- **Trips** — a fixed budget (e.g. a vacation) tracked independently from your monthly spending
- **Debts** — track money you've lent or borrowed, with due dates and settle-up tracking
- Recurring bills with a one-tap "add this month's amount" reminder
- Local notifications for budget thresholds, bills due, and debts due (while the app is open)
- Category breakdown, daily average, and month-over-month trend in Stats
- Share a spending summary via the native share sheet
- JSON/CSV backup and restore
- Installable to your phone's home screen (Android Chrome and iOS Safari)
- Account login — data is tied to your account and synced through the API in `server/`
- An admin dashboard (Settings → Admin, for admin accounts) showing account activity —
  join dates, last login, record counts — never anyone's actual financial data

## Architecture

This is a two-part project:

- **This directory** — the React/Vite frontend, deployed as a static site to GitHub Pages.
- **`server/`** — a small Node/Express API (accounts, per-user data, admin endpoint) backed
  by MongoDB Atlas's free tier. It needs to be deployed separately (see `server/README.md`).

The frontend talks to the API via `VITE_API_URL` (see `.env.example`).

## Development

You need both halves running locally:

```bash
# Terminal 1 — API
cd server
npm install
cp .env.example .env   # fill in JWT_SECRET, MONGODB_URI, etc. — see server/README.md
npm run dev

# Terminal 2 — frontend
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:3001 (the default)
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

- **Frontend**: pushing to `main` builds and deploys automatically to GitHub Pages via
  `.github/workflows/deploy.yml` (enable it once under **Settings → Pages → Source → GitHub
  Actions**). The workflow needs `VITE_API_URL` pointed at your deployed API — see the
  `env:` block in the workflow file.
- **Backend**: deploy `server/` to any Node host (Render's free tier works — see
  `server/README.md` for the full walkthrough, including the free MongoDB Atlas setup).

---

Made by [Dexys IT Solutions](https://dexys.in).
