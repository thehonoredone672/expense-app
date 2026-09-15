# Expensify API

A small Node/Express backend that adds accounts to Expensify: signup/login, per-user
data storage, and an admin endpoint for monitoring account activity.

Data lives in MongoDB. The free **M0** tier on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
is enough for this — no credit card required, and it doesn't expire or auto-pause.

## Running locally

```bash
cd server
npm install
cp .env.example .env   # then edit .env — see below
npm run dev
```

The API listens on `http://localhost:3001` by default.

## Getting a free MongoDB Atlas connection string

1. Create a free account at [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register).
2. Create a new project, then **Build a Database** → pick the **M0 Free** tier → choose any region.
3. Under **Security → Database Access**, add a database user with a username/password (not your Atlas login — a separate DB user).
4. Under **Security → Network Access**, add `0.0.0.0/0` (allow access from anywhere) — needed since Render's outbound IPs aren't fixed on the free plan.
5. Go to **Database → Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Add a database name before the `?`, e.g. `.../expensify?retryWrites=true&w=majority`, and put the result in `MONGODB_URI`.

## Environment variables (`.env`)

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | no (default 3001) | Port the server listens on |
| `JWT_SECRET` | **yes**, before deploying | Signs login sessions. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CORS_ORIGIN` | yes | Comma-separated list of origins allowed to call the API (your local dev URL and your deployed frontend URL) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | yes, to reach the admin dashboard | Created (or promoted, if the email already signed up normally) to an admin account every time the server starts |
| `MONGODB_URI` | **yes** | Your Atlas connection string, including a database name (see above) |

## Deploying (e.g. Render)

This is a plain Node app — any host that runs `npm install && npm start` works
(Render's free Web Service tier, Railway, Fly.io, a VPS, etc.). Since data now
lives in MongoDB Atlas rather than on local disk, you do **not** need a paid
tier or a persistent disk — Render's free tier is fine, it'll just cold-start
after periods of inactivity.

Set the real env vars from the table above on the host (not just in a local
`.env`, which isn't deployed), then note the service's public URL — the
frontend needs it as `VITE_API_URL` (see the root `README.md`).

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
