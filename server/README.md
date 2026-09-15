# Expensify API

A small Node/Express backend that adds accounts to Expensify: signup/login, per-user
data storage, and an admin endpoint for monitoring account activity.

It stores data in a single JSON file on disk (`data.json` by default) instead of a
real database — no native modules to compile, so `npm install` works the same on
Windows, Linux, and whatever host you deploy to. This is fine for a personal or
small-team app; if you outgrow it, swap `src/db.js` for a real database without
touching the routes (they only call `getState()` / `persist()`).

## Running locally

```bash
cd server
npm install
cp .env.example .env   # then edit .env — see below
npm run dev
```

The API listens on `http://localhost:3001` by default.

## Environment variables (`.env`)

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | no (default 3001) | Port the server listens on |
| `JWT_SECRET` | **yes**, before deploying | Signs login sessions. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CORS_ORIGIN` | yes | Comma-separated list of origins allowed to call the API (your local dev URL and your deployed frontend URL) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | yes, to reach the admin dashboard | Created (or promoted, if the email already signed up normally) to an admin account every time the server starts |
| `DB_PATH` | no (default `./data.json`) | Where the data file lives — see the persistence note below |

## Deploying

This is a plain Node app — any host that runs `npm install && npm start` works
(Render, Railway, Fly.io, a VPS, etc.). Two things matter wherever you deploy:

1. **Persistent disk.** `data.json` must live on storage that survives restarts
   and redeploys. Several free tiers (e.g. Render's free web service) use an
   *ephemeral* filesystem that resets on every deploy — you'd lose all accounts
   and data. Look for a "disk" / "volume" add-on, or point `DB_PATH` at a
   directory the host guarantees persists.
2. **Set the real env vars** from the table above on the host (not just in a
   local `.env`, which isn't deployed).

Once it's running, note the public URL — the frontend needs it as
`VITE_API_URL` (see the root `README.md`).

## API shape

All endpoints are under `/api`. Data endpoints (`/expenses`, `/trips`, `/debts`,
`/settings`) require `Authorization: Bearer <token>` and are scoped to the
signed-in user automatically.

- `POST /api/auth/signup`, `POST /api/auth/login` → `{ token, user }`
- `GET /api/auth/me` → `{ user }`
- `GET|POST /api/expenses`, `PUT|DELETE /api/expenses/:id`, `DELETE /api/expenses` (clear all) — same shape for `/api/trips` and `/api/debts`
- `GET|PUT /api/settings`
- `POST /api/import` — bulk-attach `{ expenses, trips, debts }` to the current account, skipping ids already present
- `GET /api/admin/users` — admin-only; returns account activity (email, created/last-login dates, record counts) — never the actual financial records
