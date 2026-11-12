# SH Digital Studio — API server
ADMIN_EMAIL=sayed@gamil.com
ADMIN_PASSWORD=sayedul@743544

REST API and content backend for the SH Digital Studio website and its admin
CMS (`/admin` in the Next.js client). It stores projects, industry categories,
services, the About profile, site settings, media references and contact
inquiries in MongoDB.

**Stack:** Node.js 20+, Express 4, TypeScript, Mongoose 8, Zod, JWT sessions
in HttpOnly cookies, bcrypt, Helmet, Nodemailer (optional), AWS S3 (optional).

> The original Easy Bangla Patente code was removed; a copy is archived in
> `../_legacy/original-patente-setup-2026-10-22.zip`.

---

## Quick start

```bash
cd Server
npm install
cp .env.example .env        # skip if you already have a .env - see below
npm run dev                 # http://localhost:8080  (health: /api/health)
npm run seed                # first time only: demo content (idempotent)
ADMIN_EMAIL=you@your-domain.com ADMIN_NAME="Your Name" \
ADMIN_PASSWORD='a-long-passphrase-2024' npm run seed:admin
```

Then start the client (`cd ../Client && pnpm dev`) and sign in at
<http://localhost:3000/admin/login>.

On Windows PowerShell, set the admin variables first:

```powershell
$env:ADMIN_EMAIL="you@your-domain.com"; $env:ADMIN_NAME="Your Name"; $env:ADMIN_PASSWORD="a-long-passphrase-2024"
npm run seed:admin
Remove-Item Env:ADMIN_PASSWORD
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server with reload (`ts-node-dev`) |
| `npm run build` / `npm start` | Compile to `dist/` / run the compiled server |
| `npm run typecheck` | TypeScript check without emitting |
| `npm run lint` | ESLint |
| `npm run seed` | Inserts missing demo content. Matches by slug, uses `$setOnInsert`, never overwrites your edits and never deletes anything — safe to re-run |
| `npm run seed:admin` | Creates the first admin from `ADMIN_*` variables (see below) |
| `npm run test:api` | Builds, then runs the API integration tests against a separate `agency_portfolio_test` database |

## Environment variables

Copy `.env.example` → `.env`. **`.env` is git-ignored; never commit it.**

| Variable | Required | Purpose |
| --- | --- | --- |
| `mongoDbUrl` | yes | MongoDB connection string. The database name is the path segment — `…mongodb.net/agency_portfolio?…` |
| `JWT_ACCESS_SECRET` | yes | Signs admin sessions. 64+ random characters. (The legacy spelling `JWT_ACCESS_SECRCT` is still read.) |
| `CLIENT_ORIGINS` | production | Comma-separated website origins allowed to call the API (CORS + CSRF origin check). Default `http://localhost:3000` |
| `INTERNAL_API_KEY` | production | Shared secret with the Next.js server (same value as the client's `INTERNAL_API_KEY`). Lets server renders skip per-IP rate limits and forwards real visitor IPs |
| `PORT` | no | Default `8080` |
| `NODE_ENV` | no | `production` enables secure cookies and trusts one proxy hop |
| `ADMIN_SESSION_EXPIRES_IN` | no | Session length, default `8h` |
| `TRUST_PROXY` | no | Proxy hops in front of the API (Vercel: `1`) |
| `COOKIE_SECURE` | no | Force secure cookies on/off (default: on in production) |
| `DATA_ENCRYPTION_KEY` | for Clients → Env | Encrypts stored client env values (AES-256-GCM). Back it up — values can't be read without it |
| `MONGODB_DB_NAME` | no | Overrides the database name in the URI (used by the tests) |
| `AWS_S3_BUCKET_NAME`, `AWS_S3_BUCKET_REGION`, `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `MEDIA_PUBLIC_BASE_URL`, `MEDIA_UPLOAD_PREFIX` | no | Media uploads. Uploads switch on only when the first five are all set |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `INQUIRY_NOTIFY_EMAIL` | no | E-mail notifications for new inquiries |
| `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD`, `ADMIN_RESET_PASSWORD` | once | Only read by `npm run seed:admin` |

Generate secrets with
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

## Database

The application database is **`agency_portfolio`**. Only the database name in
`mongoDbUrl` changed during the rebuild; the user, password, host and options
were kept as they were.

The previous database (`patenteDB`) was **not modified, migrated or dropped**.
It is still on the cluster with all its data. Nothing in this codebase reads it
any more. If you ever want to move old data across, do it as a separate,
deliberate step (for example `mongodump --db patenteDB` →
`mongorestore --nsFrom 'patenteDB.*' --nsTo 'agency_portfolio_legacy.*'`) after
taking a backup — never by pointing this app at the old database.

Collections: `adminusers`, `projects`, `categories`, `services`, `profiles`
(singleton), `sitesettings` (singleton), `mediaassets`, `inquiries`,
`ratelimits` (TTL-expired counters), `clientprojects` (private client tracker, admin only).

## Admin accounts

- There is **no registration endpoint**. Accounts are created only with
  `npm run seed:admin`, which reads `ADMIN_EMAIL`, `ADMIN_NAME` and
  `ADMIN_PASSWORD` from the environment, hashes the password with bcrypt
  (12 rounds) and never prints it. Remove `ADMIN_PASSWORD` afterwards.
- Passwords: 12+ characters with letters and numbers.
- **Forgot your password?** Run `seed:admin` again with the same
  `ADMIN_EMAIL`, a new `ADMIN_PASSWORD` and `ADMIN_RESET_PASSWORD=true`. This
  also signs out every existing session.
- 5 wrong passwords lock the account for 15 minutes; sign-in attempts are also
  limited to 10 per IP per 15 minutes.
- Signed-in admins can change their name and password and "sign out
  everywhere" under **Account & security**.

## API overview

All responses use `{ success, message, data }` (errors add `errorSources`).

**Public (no auth, read-only, published content only)** — `/api/public/…`

| Endpoint | |
| --- | --- |
| `GET /settings`, `GET /home`, `GET /profile` | Site settings, homepage data, About profile (public fields only) |
| `GET /projects?type=&category=&featured=&searchTerm=&sort=&page=&limit=` | Listed, published projects |
| `GET /projects/:slug` | Project detail (also unlisted ones); renamed slugs return `{ redirectSlug }` |
| `GET /categories`, `GET /categories/:slug` | Industry pages |
| `GET /services`, `GET /services/:slug` | Services |
| `GET /legal/privacy`, `GET /legal/terms` | Legal pages |
| `GET /sitemap` | Slugs and dates for the sitemap |
| `POST /inquiries` | Contact form (rate limited, honeypot, time trap, daily cap per e-mail) |

**Admin (session cookie required)** — `/api/admin/…`: `auth` (login, logout,
logout-all, me, password), `dashboard`, `projects`, `categories`, `services`,
`profile`, `settings`, `media`, `inquiries`, `clients` (private client tracker). Every router applies `auth()`
itself; only `POST /admin/auth/login` is open.

## Security model

- **Sessions:** JWT in an `HttpOnly`, `SameSite=Strict` cookie (`Secure` in
  production) that the browser only sends to the website's own `/api` proxy.
  Tokens carry a token version, so password changes and "sign out everywhere"
  revoke all existing sessions immediately.
- **CSRF:** state-changing requests with a foreign `Origin`/`Referer` are
  rejected, on top of `SameSite=Strict`.
- **Validation:** every route validates `body`, `query` and `params` with Zod
  and replaces them with the parsed result, so unknown fields (`_id`,
  `previousSlugs`, timestamps…) can't be mass-assigned. Express uses the
  `simple` query parser, so `?a[$ne]=x` can't inject operators.
- **Public responses** are built by whitelisting mappers
  (`modules/Public/public.mappers.ts`): drafts, archived items, internal
  notes, admin data and disabled demo credentials never leave the server.
  Demo credentials are shown only while a published project's demo panel is
  switched on — use throwaway demo accounts only, never real ones.
- **Errors** never include stack traces or raw error objects.
- **Rate limits** are stored in MongoDB, so they hold across serverless
  instances. Server-side renders authenticated with `INTERNAL_API_KEY` are
  exempt; browser traffic is limited per real visitor IP.
- **Inquiries** store a salted hash of the IP, never the raw IP. The API never
  claims an e-mail was sent — delivery status is recorded privately for the
  admin.
- Secrets live only in environment variables. Integration status endpoints
  return booleans, never values.

## Media

The media library stores references (`url`, `alt`, size, dimensions). Images
can be added three ways:

1. **By URL** — any `https://` image.
2. **From the website itself** — put files in `Client/public/media/…` and use
   the path (`/media/…`). The seeded demo screenshots live there.
3. **Upload** — when S3 is configured (see the variables above).

## E-mail notifications

New inquiries are always saved and visible in the dashboard. When SMTP is
configured, a notification is also sent to the address set in **Site
settings → Inquiries** (or `INQUIRY_NOTIFY_EMAIL`). Delivery failures are
recorded on the inquiry, never shown to the visitor.

## Tests

```bash
npm run test:api
```

The suite starts the app in-process and talks to it over HTTP. It uses the
database `agency_portfolio_test` on the same cluster, **refuses to run against
any database whose name doesn't end in `_test`**, and clears only that test
database at the start of each run. It covers authentication and lockout,
session revocation, CSRF origin checks, operator-injection attempts,
mass-assignment, draft/unlisted/archived visibility, slug redirects, private
fields (internal notes, demo credentials), settings (including the legal
pages' "last updated" date), inquiries and their spam controls and rate
limits.

The admin UI itself was checked in a real browser: every screen and tab, plus
"save without changes" on each editor (the stored document must stay
identical), draft → preview → delete, and a contact-form inquiry end to end.

## Deployment (Vercel)

`vercel.json` serves `dist/server.js`, so the build step must run
`npm run build`. Set the environment variables above in the Vercel project
(at least `mongoDbUrl`, `JWT_ACCESS_SECRET`, `CLIENT_ORIGINS`,
`INTERNAL_API_KEY`, `NODE_ENV=production`). In MongoDB Atlas, allow
connections from your hosting provider. Check `/api/health` after deploying.

## Project structure

```
src/
  app.ts, server.ts            Express app and process entry
  app/config/                  env config, database connection
  app/routes/index.ts          route table (public + admin)
  app/modules/<Module>/        model · interface · validation · service · controller · routes
    Admin, Project, Category, Service, Profile, SiteSettings,
    Media, Inquiry, Public (read-only API + DTO mappers), Dashboard,
    RateLimiter, shared (common validation and utilities)
  middlewares/                 auth, validateRequest, verifyOrigin, requireDb,
                               rate limiter, request logger, error handler
  scripts/                     seed.ts, createAdmin.ts, seedData/
tests/api.test.mjs             API integration tests
```

