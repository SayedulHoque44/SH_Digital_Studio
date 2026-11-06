# SH Digital Studio — website & admin (Next.js)

The public agency website (home, work, demos, services, about, contact) and
the admin CMS at `/admin`. Content comes from the API in `../Server`.

**Stack:** Next.js 16 (App Router, server components), React 19, Tailwind CSS
v4, TanStack Query, react-hook-form + Zod (contact form), Ant Design (admin
only), `next/og` for social images. Package manager: **pnpm**.

---

## Quick start

```bash
cd Client
pnpm install
cp .env.example .env.local     # then fill in the values below
pnpm dev                       # http://localhost:3000
```

The API must be running too (`cd ../Server && npm run dev`, port 3001).
Admin: <http://localhost:3000/admin/login> — accounts are created on the
server with `npm run seed:admin` (see `Server/README.md`).

| Command | |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build / serve it |
| `pnpm lint` | ESLint |
| `pnpm exec tsc --noEmit` | Type-check |

> **Console Ninja:** this VS Code extension rewrites the Next.js dev server's
> JavaScript, which corrupted it here (sections stayed blank, the admin hung
> on its loader) and made `pnpm dev` take ~8 minutes. It's disabled for this
> project in `.vscode/settings.json` — keep it off.

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | public | Final site URL, no trailing slash (canonical URLs, sitemap, Open Graph, structured data) |
| `API_ORIGIN` | **server only** | Origin of the Express API, e.g. `https://api.your-domain.com`. Default `http://localhost:3001` |
| `INTERNAL_API_KEY` | **server only** | Same value as the API's `INTERNAL_API_KEY` |
| `NEXT_PUBLIC_IMAGE_HOSTS` | public | Optional extra image hosts for `next/image` (comma separated) |
| `NEXT_PUBLIC_SENTRY_DSN` | public | Optional; Sentry stays off when empty |

Only `NEXT_PUBLIC_*` values reach the browser — never put secrets in them.
The old `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_AWS_IMAGES_CDN_BASE_URL`
variables from the previous project are no longer read and can be removed
from your local `.env`.

## Routes

| Public | |
| --- | --- |
| `/` | Homepage (sections, order and copy are edited in **Site settings → Homepage**) |
| `/work` | All published projects, filterable by type and industry |
| `/demos`, `/demos/[slug]` | Shareable industry pages (copy link, native share, e-mail intro; WhatsApp once a number is set in Site settings) |
| `/industries` | Industry overview (`/industries/[slug]` redirects to `/demos/[slug]`) |
| `/projects/[slug]` | Project / case study pages |
| `/services`, `/services/[slug]` | Services |
| `/about`, `/contact`, `/privacy`, `/terms` | |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | Generated |
| `/og/...` | Generated 1200×630 social images |

| Admin (`noindex`) | |
| --- | --- |
| `/admin` | Dashboard with launch checklist |
| `/admin/projects`, `/admin/categories`, `/admin/services` | Content (drafts, preview, reorder, duplicate) |
| `/admin/inquiries` | Contact-form leads |
| `/admin/media` | Media library |
| `/admin/profile` | About page / profile |
| `/admin/settings` | Branding, homepage, navigation, contact & social, SEO, announcement, legal, inquiries |
| `/admin/account` | Name, password, sign out everywhere |

## How it works

- **Rendering:** public pages are server components. API data is fetched on
  the server (`lib/server/api.ts`) and cached with the tag `content` for 5
  minutes. Every save in the admin calls `/revalidate`, which expires that
  tag, so changes are live on the next request without a redeploy.
- **Same-origin API proxy:** the browser only talks to `/api/*` on this site
  (`app/api/[...path]/route.ts`), which forwards allow-listed paths and
  headers to the API. The admin session lives in an `HttpOnly`,
  `SameSite=Strict` cookie that JavaScript can't read — no tokens in
  `localStorage`.
- **Draft preview:** "Preview" in the editors opens `/preview?path=…`, which
  checks the admin session server-side and enables Next.js Draft Mode for
  that browser only.
- **SEO:** metadata is generated per page on the server (title, description,
  canonical, Open Graph, Twitter cards, JSON-LD for the organization,
  projects, services, breadcrumbs and FAQs). Unlisted or `noIndex` content
  gets `robots: noindex` and is left out of the sitemap.
- **Status codes:** unknown project/demo/service URLs return a real `404`
  and renamed slugs a `308` to the new URL. Don't add a `loading.tsx` above
  those routes (e.g. at the app root): a loading boundary makes Next.js send
  the page shell — and a `200` — before the page runs, which turns those into
  soft 404s. The progress bar lives in `app/(site)/work/loading.tsx` only.
- **Security headers** (CSP in production, frame protection, referrer and
  permissions policies) are set in `next.config.ts`.

## Design system

- Tokens (colours, type scale, radii, shadows, motion) live in
  `styles/globals.css` under `@theme`. Palette: ink, warm paper off-whites,
  stone greys and one electric-lime accent (`--color-accent`, editable in
  **Site settings → Branding**; text on the accent switches between ink and
  white automatically for contrast).
- Fonts are self-hosted from `assets/fonts` (SIL Open Font License, see the
  README there).
- Motion is CSS-first: reveal-on-scroll via one shared IntersectionObserver
  (`components/shared/RevealObserver`), a staggered hero entrance and a small
  pointer parallax. Everything respects `prefers-reduced-motion`.
- Logo: `components/brand/Logo.tsx` (SVG wordmark + symbol, light/dark);
  static files in `public/brand/` and `app/icon.svg`.

## Content

All copy, projects, industries and settings are edited in the admin — no
code changes needed. The nine restaurant demo screenshots in
`public/media/demos/` are real captures of the deployed demo sites. To add a
new industry demo: create the category (industry) in **Categories**, then a
project linked to it in **Projects** with its live URL and screenshots.

## Deployment (Vercel)

1. Deploy the API (see `Server/README.md`) and note its URL.
2. Import `Client/` as a Vercel project (framework: Next.js, install with
   pnpm).
3. Set `NEXT_PUBLIC_SITE_URL`, `API_ORIGIN` and `INTERNAL_API_KEY`.
4. Add the website origin to the API's `CLIENT_ORIGINS`.

