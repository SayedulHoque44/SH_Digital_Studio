# 02 — App Flow (routes, screens, states)

> Source of truth for navigation and screen behavior. Route files live in
> `Client/app/`. Public pages are React Server Components; admin pages are
> client components inside `AdminShell`.

## 1. Route map

### Public site (`Client/app/(site)/` + `Client/app/page.tsx`)

| Route | Render | Data (API) | Notes |
| --- | --- | --- | --- |
| `/` | Static/ISR (5 min) | `GET /public/home`, `/public/settings` | Sections toggled in Site settings |
| `/work` | Dynamic (query params) | `GET /public/projects?type&category&searchTerm&sort&page` | Query: `type`, `category`, `q`, `sort`, `page`. Filtered views are `noindex, follow` |
| `/demos` | ISR | `GET /public/categories` | Top-level industries with demo counts |
| `/demos/[slug]` | SSG + ISR | `GET /public/categories/:slug` | Share actions; sub-categories; 404 / 308 |
| `/industries` | ISR | `GET /public/categories` | Overview; `/industries/[slug]` → 308 `/demos/[slug]` (`next.config.ts`) |
| `/projects/[slug]` | SSG + ISR | `GET /public/projects/:slug` | Unlisted = reachable, `noindex`; draft preview via Draft Mode |
| `/services` | ISR | `GET /public/services` | |
| `/services/[slug]` | SSG + ISR | `GET /public/services/:slug` | FAQ JSON-LD |
| `/about` | ISR | `GET /public/profile` | Person / ProfilePage JSON-LD |
| `/contact` | Dynamic | settings, categories, services, optional project | Query: `industry`, `service`, `project` prefill |
| `/privacy`, `/terms` | ISR | `GET /public/legal/:doc` | Markdown |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | Generated | `GET /public/sitemap` | |
| `/og`, `/og/[kind]/[slug]` | Route handler | settings + entity | 1200×630 PNG; kinds: `pages`, `projects`, `demos`, `services` |

### Utility route handlers

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/[...path]` | any | Same-origin proxy to the Express API; only `public/*` and `admin/*` prefixes |
| `/preview?path=/projects/<slug>` | GET | Verifies admin session server-side → enables Draft Mode → 307 to path. Off-site path → 400. No session → 307 `/admin/login` |
| `/preview/exit` | GET | Disables Draft Mode |
| `/revalidate` | POST | Admin session required (401 otherwise) → `revalidateTag("content")` |

### Legacy redirects (`next.config.ts`)
`/login`→`/admin/login` (307), `/register`→`/` , `/dashboard*`→`/admin`, `/privacy-policy`→`/privacy` (308), `/blogs*`, `/App/*`→`/work`, `/feedback`, `/propile/*`, `/YTFreevideo`→`/`. Keep them: old links must not break.

### Admin (`Client/app/admin/`, all `noindex`)

| Route | Screen |
| --- | --- |
| `/admin/login` | Sign-in form |
| `/admin` | Dashboard |
| `/admin/projects` | Projects table |
| `/admin/projects/new`, `/admin/projects/[id]` | Project editor (7 tabs) |
| `/admin/categories` (`?edit=<id>`) | Categories table + editor drawer |
| `/admin/services`, `/admin/services/new`, `/admin/services/[id]` | Services table / editor (6 tabs) |
| `/admin/inquiries` | Inquiries table + detail drawer |
| `/admin/media` | Media library grid + details drawer |
| `/admin/clients` | Private client tracker: summary tiles, "Needs attention" renewals, project cards (filter + search) |
| `/admin/clients/new`, `/admin/clients/[id]` | Client project editor (renewal overview + tabs) |
| `/admin/profile` (`?tab=`) | Profile & About editor (7 tabs) |
| `/admin/settings` (`?tab=`) | Site settings (9 tabs) |
| `/admin/account` | Account & security |

## 2. Global public layout

`SiteHeader` (fixed pill nav, hides on scroll-down, reappears on scroll-up; mobile menu closes on navigation) → optional announcement bar → page → closing CTA band (from settings, hidden when `sections.finalCta = false`) → `SiteFooter` (services/industries lists, contact, social).

- Skip link "Skip to content" is the first focusable element.
- Scroll-reveal: elements with `data-reveal` fade in when ≥1 px is on screen. Failsafe: if client JS hasn't started within 6 s, the `js` class is removed and all content shows. `prefers-reduced-motion` disables motion.

## 3. Public screens — actions & states

### `/` Homepage
Sections in order (each toggleable in Site settings → Homepage): Hero → Selected work → What we build (services) → Industries → Process → Capabilities & technologies → About preview → Closing CTA.

| Element | Action |
| --- | --- |
| Primary CTA (default "Start a project") | → `/contact` (href from settings) |
| Secondary CTA | → href from settings (default `/work`) |
| Project card | → `/projects/<slug>`; "Live demo" chip → external live URL (new tab) |
| Service card | → `/services/<slug>`; "All services" → `/services` |
| Industry card | → `/demos/<slug>` |
| WhatsApp button | Shown **only** if `contact.whatsappNumber` is set → `https://wa.me/...` with templated message |

Empty: a section with no items renders nothing (no empty headings).

### `/work`
| State | Behavior |
| --- | --- |
| Default | All listed + published projects, curated order, count "Showing N projects" |
| Filtered | Type tabs (with counts), industry select, search, sort; "Apply" submits GET form (works without JS) |
| No results | Empty state with "Clear filters" → `/work` |
| Pagination | `?page=N` links |
| Loading (client nav) | `app/(site)/work/loading.tsx` slim progress bar |

### `/demos/[slug]`
Actions: **Copy link**, **Share** (native share sheet, only when supported), **Email** (`mailto:` with the category's e-mail intro), WhatsApp CTA (if configured), "Request a similar website" → `/contact?industry=<slug>`.
States: unknown slug → **404**; renamed slug → **308** to new slug; draft category → 404.

### `/projects/[slug]`
Sections render only when data exists (screenshots, features, tech stack, case study, content blocks, demo access panel, related projects, CTA).
- Demo access panel: shown only when `demoAccess.enabled` on a published project. Credentials are copyable.
- Embeds: click-to-load, sandboxed, https only.
- Draft preview: banner with "Exit preview" (→ `/preview/exit`), `noindex`.
- States: unknown/draft/archived → 404; unlisted → 200 + `noindex`; renamed → 308.

### `/contact` — inquiry form state machine

```
idle ──submit──▶ client validation ──fail──▶ field errors (aria-invalid, messages) ──edit──▶ idle
                        │ pass
                        ▼
                   submitting (button loading, inputs stay)
                        │
      ┌─────────────────┼──────────────────────────┐
      ▼                 ▼                          ▼
  201 success       400 validation              429 / network / 5xx
  → success panel   → server field errors       → form-level error message,
    (heading gets     shown on matching            inputs preserved, retry
    focus, 3 "what    inputs + form message
    happens next"
    steps, link /work)
```
Rules: consent checkbox required; phone required when preferred contact is WhatsApp/phone; honeypot `homepage` field hidden; `fillMs` (time on form) sent. The success message never claims an e-mail was sent.

### Error & not-found (public)
- `not-found.tsx`: "Page not found" + links home/work; HTTP 404; `noindex`.
- `(site)/error.tsx`: API unreachable or render error → friendly message + "Try again" (`reset()`).
- `global-error.tsx`: root fallback.

## 4. Admin flows

### Session gate (`AdminShell`)
```
visit /admin/* ──▶ GET /admin/auth/me
   loading ─────▶ full-screen spinner "Checking your session…"
   200 ─────────▶ render shell (sidebar, header, page)
   401 ─────────▶ redirect /admin/login?next=<path>
   other error ─▶ "The admin API is not reachable" + [Try again] (refetch)
```
Any admin request returning 401 **mid-session** → redirect to `/admin/login?next=<path>&expired=1` ("Your session ended. Please sign in again.").

### `/admin/login`
| Action | Result |
| --- | --- |
| Submit valid credentials | Cookie set → `router.replace(next || "/admin")` |
| Wrong email or password | 401 "Invalid email or password" (same message for both) |
| 5 failures on one account | 429 locked 15 min (even with correct password) |
| >10 attempts / IP / 15 min | 429 "Too many sign-in attempts…" |
| Already signed in | Redirect to `next` |

### Shell
Sidebar (desktop ≥ lg) / drawer (mobile, closes on navigation): Dashboard, Projects, Categories, Services, Inquiries (badge = new count), Clients (badge = overdue + due-soon renewals; red if any overdue, gold otherwise), Media library, Profile & about, Site settings, View website. Header menu: Account & security, Sign out.

### Editors (project, service, category, profile, settings)
| Step | Behavior |
| --- | --- |
| Load | Skeleton until data; missing id → 404 result "Project not found" + back link |
| Edit | Any change marks the page **dirty** |
| Navigate away while dirty | Confirm dialog (in-app links) / browser `beforeunload` prompt |
| Save | Client validation → scroll to first error. Submits the **full form store** (keeps list-item `_id`s). Success → toast, dirty cleared, admin queries invalidated, `POST /revalidate` |
| Server validation error | Toast with API message; field errors mapped where possible |
| Create | POST → `router.replace` to the new record's edit page |
| Preview (project) | Opens `/preview?path=/projects/<slug>` in a new tab |
| Duplicate (project) | Creates a draft copy → navigate to it |
| Delete | Popconfirm; categories show delete impact; media shows "used in N places" |
| Reorder (lists) | Modal with up/down buttons → single PATCH `/reorder` |

Settings screen specifics: the form is filled **once**; saving the embedded Contact & social form does not overwrite unsaved edits in other tabs. After save the form re-syncs from the response.

### Inquiries
Status chips with counts (All, New, Contacted, Qualified, Proposal sent, Won, Lost, Archived), search, date range, sort. Row click → drawer: details, status select (saves immediately), private notes (Save), Reply by e-mail (`mailto:`), WhatsApp (if phone), Delete (Popconfirm). Empty: "No inquiries yet".

### Clients (private tracker)
- **List**: tiles (active projects, overdue, due soon, monthly income from active "client pays me" renewals with ≈ BDT), "Needs attention" list (overdue first, then due soon; each with **Record payment**), status filter + search, cards sorted pinned → urgency → name. Card border/pill colour = most urgent renewal (red overdue, amber due soon, green paid, grey not billing / no date).
- **Renewal state**: inactive → "Not billing yet"; no paid-until → "No due date"; days left < 0 → overdue; ≤ remind-days → due soon; else paid.
- **Editor**: header links (live, admin, e-mail/phone/WhatsApp) + renewal overview tiles with **Paid** button; tabs Overview · Client · Renewals & payments (preset add buttons, reminder presets, payment history) · Accounts & hosting (collapsible per service; header = service logo (Icon picker, or auto from the service name, else first letter) + service + dashboard link icon + account; warning: no passwords) · Env (collapsible env sets: label, note and one large .env text box, hidden until Show, Copy all; locked alert when the server can't decrypt) · Links & code · Checklist (n/m, "Add standard handover tasks") · Notes · **Settings** (status, pin to top, mute renewal alerts, tags, danger zone). **Delete** only from Settings → Danger zone: a dialog requires typing `delete <project name>` exactly before the button enables. Same save/dirty/delete behaviour as other editors, but saves **do not** revalidate the website.
- **Money**: tiles (total credited = salary + funds + renewal payments, salary, funds, costs, renewal payments, balance after latest month; red when negative) with an All time / year filter — across all clients on the list page, per project in the editor.
- **Monthly budget tab**: month table (newest first) + one collapsible card per month: month, BDT rate, carried over; money received (Fund / Salary); cost lines (name, category, amount, currency, usage, note); live totals (have − costs = remaining; salary shown separately). "Add <next month> (copy last month)" pre-fills rate, lines and carried over = last remaining.
- **Record payment** modal: paid on (today), number of cycles, amount (default amount × cycles), BDT rate, note; previews "Covers X → Y". The new period starts at the old paid-until date. Warns first if the editor has unsaved changes.

Every delete/remove button in the admin asks Yes/No first (`fields/ConfirmDelete.tsx`, or a confirm modal for categories/media).

### Media library
Grid with search and kind filter (All/Images/Videos), pagination. "Add media": by URL (always) or upload (only when S3 configured — otherwise an info alert). Details drawer: copy URL, edit title/alt/caption/description/tags, delete with usage check. Missing alt text flagged on the card.

### Account & security
Display name (save), change password (current + new ≥ 12 chars with letters and digits + confirm; keeps this session, ends all others), "Sign out everywhere" (confirm → login page).

### Dashboard
Renewal banner when any client renewal is overdue/due soon (Review → `/admin/clients`), stat cards (projects by status, websites/apps, categories, new inquiries), "Client renewals" card, launch checklist (derived from real data: contact e-mail, photo, bio, social links, legal review, cover images, SMTP, draft services), recent inquiries, recent changes. Load error → error alert.
