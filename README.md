# Expensify

A minimal, glass-styled expense tracker built as an installable web app (PWA). Track everyday spending, set a monthly budget, track fixed-budget trips separately, and get a category breakdown — all stored locally on your device.

## Features

- Quick expense entry with a full-screen keypad and category picker
- Swipe-to-delete, search, and monthly budget tracking
- **Trips** — a fixed budget (e.g. a vacation) tracked independently from your monthly spending
- Recurring bills with a one-tap "add this month's amount" reminder
- Category breakdown, daily average, and month-over-month trend in Stats
- Share a spending summary via the native share sheet
- JSON/CSV backup and restore
- Installable to your phone's home screen (Android Chrome and iOS Safari)

All data is stored in the browser's local storage — nothing is sent to a server.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

Pushing to `main` builds and deploys automatically to GitHub Pages via `.github/workflows/deploy.yml`. Enable it once under **Settings → Pages → Source → GitHub Actions** in this repository.

---

Made by [Dexys IT Solutions](https://dexys.in).
