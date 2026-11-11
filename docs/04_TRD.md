# 04 — Technical Requirements (TRD)

> The stack is **locked**. Do not add, remove or major-upgrade a dependency
> without updating this file first. Versions below are the installed versions
> (2026-10-29); `package.json` ranges may allow patch/minor updates.

## 1. Locked stack

### Client — `Client/` (package manager: **pnpm 10**)
| Concern | Library | Version |
| --- | --- | --- |
| Framework | Next.js (App Router, Turbopack) | **16.0.10** (pinned) |
| UI runtime | React / React DOM | **19.2.1** (pinned) |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS (v4, `@theme`) + `@tailwindcss/postcss` | 4.3.0 |
| Class utils | clsx 2 · tailwind-merge 3 | ^2.1.1 · ^3.4.0 |
| Admin UI kit | Ant Design (admin only) + `@ant-design/nextjs-registry` | 6.4.3 · ^1.3.0 |
| Server state | TanStack Query (v4 API) | 4.44.0 |
| HTTP (browser) | axios | 1.16.1 |
| Forms (public) | react-hook-form + `@hookform/resolvers` + zod | 7.76.0 · ^3.3.4 · 3.25.76 |
| Toasts | sonner | 2.0.7 |
| Markdown | react-markdown + remark-gfm | 10.1.0 · ^4.0.1 |
| Icons | react-icons (`lu` set; admin account logos also use `si` brand icons + `FaAws`, map in `lib/serviceIcons.tsx`) | ^5.5.0 |
| OG images | `next/og` + sharp | sharp 0.34.5 (pinned) |
| Monitoring | @sentry/nextjs (**disabled** unless DSN set) | ^10.32.1 |
| Lint | ESLint 9 + eslint-config-next 16.0.10 | |

### Server — `Server/` (package manager: **npm**)
| Concern | Library | Version |
| --- | --- | --- |
| Runtime | Node.js | 22.x pinned (`engines`) — Node 25+ removed `SlowBuffer`, which crashes `jsonwebtoken` → `buffer-equal-constant-time` |
| HTTP | Express | 4.18.2 |
| Language | TypeScript (CommonJS output to `dist/`) | 5.3.3 |
| Database | MongoDB Atlas via Mongoose | 8.0.3 |
| Validation | zod | 3.22.4 |
| Auth | jsonwebtoken · bcryptjs (12 rounds) · cookie-parser | 9.0.2 · 3.0.3 · ^1.4.7 |
| Security headers | helmet | 8.3.0 |
| CORS | cors | ^2.8.5 |
| Mail (optional) | nodemailer | 7.0.13 |
| Storage (optional) | @aws-sdk/client-s3 + s3-request-presigner | ^3.810.0 |
| Dev server | ts-node-dev (`tsnd --respawn`) | ^2.0.0 |
| Tests | Node built-in test runner (`node --test`) | — |

**Forbidden additions** (already removed or out of scope): framer-motion or any JS animation lib, zustand/redux, lodash, moment, swiper, sweetalert2, react-hot-toast, any second UI kit, any ORM other than Mongoose, any auth SaaS.

## 2. Architecture

```
Browser ──► Next.js (Client, :3000)
              ├─ Server Components ──fetch (tag "content", 300 s ISR)──► Express API (:3001) ──► MongoDB Atlas
              ├─ /api/[...path]  same-origin proxy (allow-list: public/*, admin/*) ──► Express API
              ├─ /preview, /preview/exit (Draft Mode)   /revalidate (revalidateTag)
              └─ /og/* image routes (next/og + sharp)
```

- **Rendering**: public pages are Server Components using `lib/server/api.ts` (`apiGet`, cached, tag `content`, `revalidate: 300`). 404 from API → `notFound()`; `{ redirectSlug }` → `permanentRedirect()`; API down → `ApiUnavailableError` → error boundary.
- **Cache invalidation**: every admin save calls `POST /revalidate` → `revalidateTag("content", { expire: 0 })`.
- **Admin**: client components + TanStack Query hooks (`features/Admin/hooks/admin.hooks.ts`) over axios (`lib/api.ts`, `baseURL: "/api"`).
- **No public `loading.tsx`** (it turns `notFound()`/308 into soft 200s and hides streamed content from no-JS visitors). Navigation skeletons are client-only: `onRouterTransitionStart` (`instrumentation-client.ts`) → `lib/navigationEvents.ts` → `NavigationSkeleton` (in `SiteShell`) / `WorkResults`.
- Server-only internal key (`INTERNAL_API_KEY`) is sent by Next to the API for SSR and proxied requests (with `x-client-ip`).

## 3. Folder structure

```
My_Agency/
├─ CLAUDE.md · .cursorrules · LAUNCH_CHECKLIST.md
├─ docs/                       ← these 6 documents
├─ .vscode/settings.json       ← disables Console Ninja (it corrupts dev bundles)
├─ _legacy/                    ← zip of the previous project (read-only, never imported)
├─ Client/
│  ├─ app/
│  │  ├─ layout.tsx, page.tsx (home), not-found.tsx, error.tsx, global-error.tsx
│  │  ├─ sitemap.ts, robots.ts, manifest.ts, icon.svg, favicon.ico, apple-icon.png
│  │  ├─ (site)/               ← public routes (work, demos, industries, projects, services, about, contact, privacy, terms)
│  │  ├─ admin/                ← login/ + (panel)/ (dashboard, projects, categories, services, inquiries, clients, media, profile, settings, account)
│  │  ├─ api/[...path]/route.ts ← proxy
│  │  ├─ og/ , preview/ , revalidate/
│  ├─ components/
│  │  ├─ brand/ (Logo)  ui/ (Button, ButtonLink, buttonStyles, Container, Section, Badge, PageHero)
│  │  ├─ layouts/Site/ (SiteShell, SiteHeader, SiteFooter)
│  │  ├─ shared/ (RevealObserver, ShareActions, CopyButton, Lightbox, FaqList, Breadcrumbs, JsonLd, Markdown, SmartImage, Icon, SocialIcon, DeviceFrames, …)
│  │  └─ features/ (Homepage, Projects, Blocks, About, Contact, Errors, Legal, Skeletons, Admin/…)
│  ├─ features/<Domain>/ { apis/, hooks/, interface/ }   ← Public, Inquiry, Admin
│  ├─ lib/ (api.ts, renewals.ts, seo.ts, site.ts, color.ts, format.ts, image.ts, whatsapp.ts, revalidate.ts, hooks/, server/{api,adminSession,og})
│  ├─ providers/ (Providers, TanstackProvider)   utils/toast.ts
│  ├─ styles/globals.css     assets/fonts/     public/{brand,media/demos/<slug>/}
│  └─ next.config.ts (headers, CSP, redirects)
└─ Server/
   ├─ src/
   │  ├─ app.ts, server.ts
   │  ├─ app/config/ (index.ts env, db.ts)   app/routes/index.ts
   │  ├─ app/modules/<Module>/ { model, interface, validation, constant, service, controller, routes }
   │  │     Admin, Project, Category, Service, Profile, SiteSettings, Media, Inquiry, ClientProject, Public, Dashboard, RateLimiter, shared
   │  ├─ app/{error,utils,builder,interface}/   middlewares/ (auth, validateRequest, verifyOrigin, requireDb, requestLogger, globalErrorHandler, notFoundHandler, RateLimiter/)
   │  └─ scripts/ (seed.ts, createAdmin.ts, seedData/)
   ├─ tests/api.test.mjs
   └─ vercel.json (serves dist/server.js; deploy with `npm run deploy` = build + `vercel --prod`, since Vercel uploads the local `dist/`)
```

Module pattern (mandatory for new server features): `*.model.ts` → `*.interface.ts` → `*.validation.ts` (Zod `{ body, query, params }`) → `*.service.ts` (DB logic) → `*.controller.ts` (`catchAsync` + `sendResponse`) → `*.routes.ts` (register in `app/routes/index.ts`).

## 4. API contract

- Base: `/api` (Express). Envelope: `{ success, message, data }`; errors `{ success:false, message, errorSources:[{path,message}] }`; never a stack trace.
- Public (`/api/public/*`, no auth, published data only via whitelisting mappers in `modules/Public/public.mappers.ts`):
  `GET settings · home · profile · legal/:doc · projects · projects/:slug · categories · categories/:slug · services · services/:slug · sitemap`; `POST inquiries`.
- Admin (`/api/admin/*`, cookie session, `auth()` on every router except login):
  - `auth`: `POST login · POST logout · POST logout-all · GET me · PATCH me · PATCH password`
  - `projects`: `GET / · GET options · GET preview/:slug · PATCH reorder · POST / · GET /:id · PATCH /:id · POST /:id/duplicate · DELETE /:id`
  - `categories`: `GET / · GET options · PATCH reorder · POST / · GET /:id · GET /:id/delete-impact · PATCH /:id · DELETE /:id`
  - `services`: `GET / · GET options · PATCH reorder · POST / · GET /:id · PATCH /:id · DELETE /:id`
  - `profile`, `settings`: `GET / · PATCH /` (+ `settings/integrations` booleans only)
  - `media`: `GET config · GET / · POST / · POST upload-url · GET /:id/usage · PATCH /:id · DELETE /:id`
  - `inquiries`: `GET / · GET /:id · PATCH /:id · DELETE /:id`
  - `clients`: `GET / · POST / · GET /:id · PATCH /:id · DELETE /:id · POST /:id/renewals/:renewalId/payments` (private; mutations do not revalidate the site)
  - `dashboard`: `GET /` (includes `renewals: { overdue, dueSoon, items }`)
- Health: `GET /api/health` (no DB details).

## 5. Third-party services

| Service | Use | Required |
| --- | --- | --- |
| MongoDB Atlas | Database `agency_portfolio` (tests: `agency_portfolio_test`) | Yes |
| Vercel | Hosting for both apps (`Server/vercel.json` → `dist/server.js`) | Yes (production) |
| Google Fonts via `next/font` | Downloaded at build, self-hosted | Build time |
| AWS S3 | Media uploads (all of `AWS_S3_BUCKET_NAME`, `AWS_S3_BUCKET_REGION`, `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `MEDIA_PUBLIC_BASE_URL`) | Optional |
| SMTP (any provider) | Inquiry notification e-mail | Optional |
| WhatsApp (`wa.me` links) | Contact deep links, no API | Optional |
| Sentry | Error monitoring when DSN set | Optional |

## 6. Environment variables

Client (`.env.local`): `NEXT_PUBLIC_SITE_URL`, `API_ORIGIN` (server-only), `INTERNAL_API_KEY` (server-only), `NEXT_PUBLIC_IMAGE_HOSTS`, `NEXT_PUBLIC_SENTRY_DSN`. `pnpm build` prerenders from the API, so `API_ORIGIN` must reach a running API at build time (local `.env.production` and `.env.development` → deployed API, so `pnpm dev` needs no local Express and edits the LIVE data; set it in the Vercel client project too).
Server (`.env`): `mongoDbUrl`, `JWT_ACCESS_SECRET` (legacy `JWT_ACCESS_SECRCT` accepted), `CLIENT_ORIGINS`, `INTERNAL_API_KEY`, `PORT`, `NODE_ENV`, `ADMIN_SESSION_EXPIRES_IN`, `TRUST_PROXY`, `COOKIE_SECURE`, `MONGODB_DB_NAME`, `DATA_ENCRYPTION_KEY` (encrypts client env values; back it up), S3 vars, SMTP vars, `ADMIN_*` (seed only).
Templates: `Client/.env.example`, `Server/.env.example` (placeholders only).

## 7. Security constraints (non-negotiable)

1. **Secrets** only in env vars. Never in source, `NEXT_PUBLIC_*`, logs, responses, docs or commits. `.env*` is git-ignored except `.env.example`.
2. **Sessions**: JWT `{ sub, role, tv }` in cookie `shds_session` — `HttpOnly`, `SameSite=Strict`, `Secure` in production, 8 h. Auth middleware reloads the admin on every request (`isActive`, `tokenVersion`).
3. **No registration endpoint.** Admins are created/reset only by `npm run seed:admin` (bcrypt 12 rounds, password ≥ 12 chars with letters + digits).
4. **Brute force**: 5 failed logins → account locked 15 min; 10 login attempts / IP / 15 min; global 1000 req / 15 min; inquiries 5 / IP / hour + 3 / e-mail / day. Counters in MongoDB (serverless-safe).
5. **CSRF**: `verifyOrigin` rejects state-changing requests whose Origin/Referer is not in `CLIENT_ORIGINS`; plus `SameSite=Strict`.
6. **Input**: every route validates `body/query/params` with Zod and **replaces** them with the parsed value (unknown keys stripped → no mass assignment). Express `query parser: "simple"` (no `$operator` injection).
7. **Output**: public data only through whitelisting mappers. The `clientprojects` collection is never read by any public route. Never expose: drafts, archived items, `internalNotes`, admin data, `ipHash`, `notificationEmail`, disabled demo credentials.
8. **Headers**: helmet on API; Next sets CSP (production), HSTS, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, `nosniff`.
9. **Proxy** forwards only allow-listed paths and headers; `/revalidate` and `/preview` verify the admin session server-side; preview rejects off-site paths.
10. **Content embeds**: https only, sandboxed iframe, click-to-load. Markdown rendered without raw HTML.
11. **Inquiries**: honeypot + browser-measured `fillMs` (< 2.5 s = silently dropped) + rate limits; IP stored only as salted hash; response never claims an e-mail was sent.
12. **Client env values** (`clientprojects.envSets`) are encrypted at rest with AES-256-GCM (`utils/secretBox.ts`, key `DATA_ENCRYPTION_KEY`), excluded from the list endpoint, decrypted only for single-project admin responses. Without a working key the values are reported locked and saves keep the stored ciphertext.
13. **Database safety**: tests refuse any DB not ending in `_test`. Never drop/migrate `patenteDB`. Seeds use `$setOnInsert` (never overwrite edits).

## 8. Quality gates (must pass before a task is "done")

| Gate | Command |
| --- | --- |
| Client types | `cd Client && pnpm exec tsc --noEmit` |
| Client lint | `cd Client && pnpm exec eslint .` (0 errors, 0 warnings) |
| Server types | `cd Server && npm run typecheck` |
| Server lint | `cd Server && npm run lint` (0 errors) |
| API tests | `cd Server && npm run test:api` (all pass) |
| Production build | `cd Client && pnpm build` |
| Browser check | Affected pages load with no console/page errors at 1440px and 390px |
