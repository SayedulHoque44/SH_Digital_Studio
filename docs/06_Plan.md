# 06 — Implementation Plan

> **Rules for the coding agent**
> 1. Work top to bottom. A step may start only when every step it depends on is `[x]`.
> 2. One step at a time. When a step is done **and its quality gates pass** (`04_TRD.md` §8), change `[ ]` → `[x]`, then add a dated line to the Changelog at the bottom.
> 3. If a step reveals new work, add it as a new unchecked step in the right phase — never silently expand scope (check `01_PRD.md` Non-Goals).
> 4. Steps marked 👤 need the human owner; do not attempt them.

Legend: `[x]` done · `[ ]` to do · 👤 owner action

---

## Phase 1 — Database & Auth  ✅

- [x] 1.1 Point `mongoDbUrl` at database `agency_portfolio` (credentials unchanged; `patenteDB` untouched)
- [x] 1.2 Shared sub-schemas: MediaRef, VideoRef, Seo, Cta, Faq, FeatureItem, ContentBlock (`shared/shared.model.ts`)
- [x] 1.3 Models + indexes: AdminUser, Project, Category, Service, Profile, SiteSettings, MediaAsset, Inquiry, RateLimit (see `05_Schema.md`)
- [x] 1.4 Config & DB connection with shared promise + `requireDb` (503 when DB down)
- [x] 1.5 Admin auth: login (bcrypt, dummy-hash timing, lockout 5×/15 min), JWT cookie `shds_session`, `auth()` middleware with `tokenVersion`, logout, logout-all, me, update name, change password
- [x] 1.6 `npm run seed:admin` bootstrap (env-only password, reset mode); no registration endpoint
- [x] 1.7 Mongo-backed rate limiters (global, auth, inquiry) + internal key / `x-client-ip` trust model
- [x] 1.8 Idempotent content seed (`$setOnInsert`): 17 categories, 10 services, 9 restaurant demo projects with real screenshots, settings, profile, media

## Phase 2 — Core API  ✅

- [x] 2.1 Middleware stack: helmet, CORS allow-list, `query parser: simple`, request logger (no PII), `verifyOrigin`, global error handler (no stacks), 404
- [x] 2.2 `validateRequest` (Zod parse-and-replace) + shared validators (slugs, URLs, media refs, content blocks per type)
- [x] 2.3 Admin CRUD: projects (duplicate, reorder, preview, slug history), categories (2 levels, delete impact), services, profile, settings (section-by-section `$set`), media (usage check, S3 presign when configured), inquiries
- [x] 2.4 Dashboard aggregate (single parallel batch) + launch checklist from real data
- [x] 2.5 Public API with whitelisting mappers; published-only; unlisted by slug; `{ redirectSlug }` for renamed slugs; sitemap feed
- [x] 2.6 Inquiry intake: honeypot, browser `fillMs` < 2.5 s, 3/e-mail/day, 5/IP/hour, ipHash, optional SMTP notification (never claimed to visitor)
- [x] 2.7 `legal.updatedAt` bumps only when legal text changes
- [x] 2.8 API integration tests `Server/tests/api.test.mjs` (33 passing) against `agency_portfolio_test`

## Phase 3 — UI Integration  ✅

- [x] 3.1 Design system tokens, fonts, fluid type, Section/Container/Button system (`03_UI_Spec.md`)
- [x] 3.2 Brand: SVG logo (light/dark), icon, favicon, apple icon
- [x] 3.3 Same-origin API proxy `/api/[...path]`, server API helper with cache tag `content`, `/revalidate`, Draft Mode `/preview`
- [x] 3.4 Public pages: home (all sections), work (filters), demos (+share), industries, project, services, about, contact, privacy, terms, 404/error
- [x] 3.5 SEO: per-page metadata, canonical, OG/Twitter, JSON-LD, sitemap, robots, manifest, generated OG images
- [x] 3.6 Contact form (react-hook-form + Zod, server field errors, accessible states)
- [x] 3.7 Admin shell, login, dashboard, projects, categories, services, inquiries, media, profile, settings (9 tabs), account
- [x] 3.8 Unsaved-changes guard; full-store saves preserve list `_id`s; publish time preserved; settings form not overwritten by Contact & social save
- [x] 3.9 Scroll-reveal with 6 s failsafe; reduced-motion support
- [x] 3.10 Legacy project removed (code, images, 24 packages); archive kept in `_legacy/`
- [x] 3.11 Console Ninja disabled via `.vscode/settings.json` (it corrupted dev bundles)

## Phase 4 — Edge cases, tests & launch

### 4A. Verified
- [x] 4.1 Production build passes; real 404 for unknown slugs; 308 for renamed slugs and `/industries/*`; legacy redirects
- [x] 4.2 Security headers incl. CSP/HSTS in production; no private fields in any public HTML
- [x] 4.3 Draft privacy: anonymous and signed-in-without-preview → 404; preview shows draft with `noindex`; off-site preview path → 400; `/revalidate` without session → 401
- [x] 4.4 Admin no-op saves change nothing (projects, services, categories, settings, profile, contact)
- [x] 4.5 Admin flows: draft → preview → delete; account rename; contact form → inquiry → delete
- [x] 4.6 Lint clean (client 0/0; server 0 errors), type-checks clean
- [x] 4.7 Public pages load in Chrome with no console errors after legacy removal (9 pages)

### 4B. Next steps (in order)
- [x] 4.7a Private client tracker (`/admin/clients`, module `ClientProject`): renewals with reminder windows, in-admin alerts (sidebar badge, dashboard banner/card), record payment, accounts, links, checklist; E-Services Al-Riyadh record inserted; API tests 37/37
- [x] 4.7c Monthly budget ledger per client project + money statistics (Clients page and per project); October 2026 budget inserted; demo renewals project for alerts
- [x] 4.7e Client project Settings tab (status, pin, mute alerts, tags) + type-to-confirm delete
- [ ] 4.7f Decide: keep or remove the unused `ledger.debits` field in the server (UI not built — owner stopped it)
- [x] 4.7g Accounts tab collapsible (service header + dashboard link icon); Env tab (encrypted env sets, one .env text box each, Show/Copy all); every delete asks Yes/No
- [ ] 4.7h 👤 Add `DATA_ENCRYPTION_KEY` to Server/.env (and Vercel), back it up in a password manager, restart the API
- [ ] 4.7d 👤 Rename "Monthly budget client (rename me)"; enter 2025–2026 months; delete "DEMO — notification test (delete me)" after checking the alerts
- [ ] 4.7b 👤 Check the E-Services record: GitHub repo URLs (inferred from the handle), $120/$60 prepaid totals, domain price, client phone/e-mail
- [ ] 4.8 Re-run the admin browser check (all 11 screens + editors + mobile drawer) after the legacy removal — depends on: 3.10
- [ ] 4.9 Add "Website Maintenance & Optimization" to the stored homepage services list (`sitesettings.home.services.items`; seed already updated; grid fills incomplete last row) — Admin → Site settings → Homepage, or `PATCH /api/admin/settings`
- [ ] 4.10 Accessibility audit with axe-core on production build (desktop + 390 px) — target 0 serious/critical; fix findings
- [ ] 4.11 Lighthouse (mobile + desktop) on `/`, `/demos/restaurants`, `/projects/aurum-menu` — targets in `01_PRD.md` §5; fix findings
- [ ] 4.12 Investigate duplicate identical `Location` header on page-level `permanentRedirect` (Next 16 behavior); confirm browsers follow it; fix or document
- [ ] 4.13 Delete the temporary test admin `qa-admin@example.com` (no API endpoint by design — targeted DB delete by exact email)
- [ ] 4.14 Rename client package `ebp_next_client` → `sh-digital-studio-client` (cosmetic)
- [ ] 4.15 Optional: Tailwind v4 canonical class cleanup (`!mb-5` → `mb-5!` etc.) — no behavior change
- [x] 4.15a Fix Vercel API crash (500 FUNCTION_INVOCATION_FAILED): pin Node 22.x, `server.ts` exports app and skips `listen` on Vercel, `npm run deploy` script
- [x] 4.15b API redeployed and serving data; `/api/health` now connects before reporting (cold start showed false 503)
- [x] 4.15c Client build fixed: `API_ORIGIN` was unset (fell back to localhost:3001); added `Client/.env.production` → deployed API
- [ ] 4.15d 👤 Set `API_ORIGIN`, `NEXT_PUBLIC_SITE_URL`, `INTERNAL_API_KEY` (same as Server) in Vercel client project; redeploy Server (`npm run deploy`) for the health fix
- [x] 4.15e Dev proxy loop fixed: `next dev` pinned to port 3000 (it moved to 3001 = API port, so `/api/*` proxied to itself); proxy returns 508 on a self-call
- [x] 4.15f `Client/.env.development` → deployed API (owner runs no local Express)
- [x] 4.15l Dev port pin removed: `pnpm dev` = plain `next dev` (default 3000; if busy Next picks 3001 = API port and the proxy answers 508 — free port 3000). Client env now lives in `Client/.env` (no `.env.development`/`.env.production` in the repo)
- [x] 4.15g Skeleton loaders everywhere: public navigation skeletons (all 11 page types, slug routes included, no `loading.tsx`), `/work` results skeleton, admin shell/dashboard/tables/media/clients/editors/login; removed `work/loading.tsx` (it hid `/work` content without JS); Save disabled while Profile/Category data loads (saving an empty form could clear data); page scroll locked while the navigation skeleton is shown
- [x] 4.15i Animated `/work` search placeholder: "Search by" + cycling name / feature / technology (CSS only, static sentence for reduced motion, hidden once typing)
- [x] 4.15j Responsive audit (headless Chrome, 320/360/390/430/768/1024 px, all public pages + admin login): only break was the project Screens device tabs overflowing at ≤360 px — fixed (compact tabs, icons hidden below `sm`)
- [x] 4.15n Admin Clients mobile fixes (owner screenshot): "Needs attention" rows — pill + due date left, Record payment right, no squeezed date column (also on dashboard); client cards — long renewal titles wrap to 2 lines, tighter padding on phones
- [x] 4.15o Copyable client statements: plain-text "Payment details (to send)" under each renewal's payment history and "Month details (to send)" in each budget month, with Copy (`lib/statements.ts`, `StatementBox`); foreign amounts show the taka math (`$40 × 126 = ৳5,040`)
- [ ] 4.15k Admin panel responsive check at 390 px (needs a signed-in session) — part of 4.8 (Clients list fixed in 4.15n; rest unchecked)
- [x] 4.15m API dev port 3001 → 8080 (owner): server `PORT` default, client `API_ORIGIN` default, example envs, READMEs, CLAUDE.md, TRD. Removes the 3000-busy → 3001 clash with the API
- [ ] 4.15h 👤 Decide: `cn()` (tailwind-merge) drops `text-eyebrow`/`text-lead` when combined with a colour class — every `Eyebrow` and `PageHero` intro renders as plain 16px text instead of the spec. Fix = `extendTailwindMerge` font-size group in `lib/utils.ts` (visible change sitewide)

### 4C. Launch (owner)
- [ ] 4.16 👤 Rotate MongoDB password, JWT secret and both AWS key pairs (old `.gitignore` did not exclude `.env`)
- [ ] 4.17 👤 Create own admin with `npm run seed:admin`
- [ ] 4.18 👤 Real content: contact e-mail, WhatsApp, photo, bio, availability, social links; publish or delete the draft "Mobile Application Development" service; review legal templates
- [ ] 4.19 👤 Deploy API + Client to Vercel with env vars (`LAUNCH_CHECKLIST.md` §3); set `CLIENT_ORIGINS`, `NEXT_PUBLIC_SITE_URL`, `API_ORIGIN`, `INTERNAL_API_KEY`
- [ ] 4.20 Post-deploy verification: health, revalidation, test inquiry, sitemap domain, OG previews, Search Console — depends on: 4.19

---

## Changelog
- 2026-10-22 — Phases 1–3 implemented; API tests 32/32.
- 2026-10-23 — Admin profile/settings/account; no-op save fixes; legal date fix; inquiry `fillMs`; production 404/308 fixes; API tests 33/33.
- 2026-10-24 — Console Ninja corruption diagnosed and disabled; reveal failsafe.
- 2026-10-25 — Legacy code, images and packages removed.
- 2026-10-29 — `docs/` context architecture (01–06), `CLAUDE.md`, `.cursorrules` created.
- 2026-10-30 — Client tracker (Clients) added; PRD A10 + Non-Goals 3/9 clarified; admin-only alerts (no e-mail, per owner). Monthly budget ledger + money stats; API tests 37/37.
- 2026-10-31 — Client project Settings tab, mute alerts, type-to-confirm delete. Collapsible accounts, encrypted Env tab, Yes/No on every delete; API tests 38/38.
- 2026-11-11 — Vercel API crash fixed (Node 22.x pin; serverless-safe `server.ts`; `npm run deploy`).
- 2026-11-11 — Client build fixed (`API_ORIGIN` via `.env.production`); health check connects on cold start.
- 2026-11-11 — `/api/*` proxy self-loop guard (508) + `pnpm dev` pinned to port 3000.
- 2026-11-11 — Dev mode uses the deployed API via `Client/.env.development`.
- 2026-11-12 — Skeleton loaders across public site + admin; `/work` no-JS fix; Profile/Category save-while-loading fix.
- 2026-11-12 — `/work` search bar animated placeholder (CSS keyframes `search-hint`).
- 2026-11-12 — Responsive audit; project Screens tabs no longer overflow at 320–360 px.
- 2026-11-12 — `pnpm dev` port pin removed (owner); CLAUDE.md, TRD and plan updated.
- 2026-11-12 — API dev port moved to 8080; defaults and docs updated.
- 2026-11-12 — Admin Clients page mobile layout fixes (Needs attention rows, client card renewal rows).
- 2026-11-12 — Copyable payment / monthly budget statements in the client project editor.
- 2026-11-12 — Statements show BDT math (`$20 × 126 = ৳2,520`) on plan, payments, totals, funds and costs (incl. month total costs breakdown).
