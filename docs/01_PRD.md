# 01 — Product Requirements (PRD)

> Status: **built and verified** (MVP complete). This document describes the
> product as it exists in this repository. Changes to scope must be made here
> first, then reflected in `06_Plan.md`.

## 1. Product

**SH Digital Studio** — the agency website, portfolio and content-management
system (CMS) of a one-person web design & development studio run by Sayedul.

Two applications in one repo:

| App | Folder | Purpose |
| --- | --- | --- |
| Website + Admin CMS | `Client/` (Next.js) | Public marketing site at `/`, admin dashboard at `/admin` |
| API | `Server/` (Express + MongoDB) | Content, auth, inquiries, media references |

## 2. Core problem

A solo studio needs to win clients with proof of work, but:

1. Prospects in a specific industry (e.g. restaurants) want to see **relevant,
   live examples**, not a generic portfolio.
2. The studio owner needs to **share an industry-specific page** with a
   prospect (link, WhatsApp, e-mail) in seconds.
3. Content (projects, demos, services, copy) must be **editable without code**
   and go live immediately.
4. Everything shown must be **truthful**: no invented clients, results,
   testimonials, prices or capabilities.

## 3. Target personas

| Persona | Who | Needs |
| --- | --- | --- |
| **Prospect (primary visitor)** | Small/medium business owner, often on a phone, often non-technical (restaurant, gym, clinic, salon…) | See live demos for their industry, understand services, contact easily (form / WhatsApp / e-mail) |
| **Studio owner (admin)** | Sayedul — developer & sole operator | Add/edit projects and demos, publish/unpublish, share industry pages, manage inquiries, edit site copy and SEO |
| **Search engines & link previews** | Google, LinkedIn, WhatsApp, Slack crawlers | Server-rendered HTML, correct status codes, metadata, sitemap, Open Graph images |

## 4. MVP user stories

### Prospect
- **P1** As a prospect I can open the homepage and immediately understand what the studio builds, see selected work and reach "Start a project".
- **P2** As a prospect I can browse all work at `/work` and filter by type, industry, search text and sort order; filters are real URLs.
- **P3** As a prospect I can open `/demos/<industry>` to see all live demos for my industry, with screenshots and "Live demo" links.
- **P4** As a prospect I can open a project page (`/projects/<slug>`) with screenshots, features, tech stack, case-study sections and, if enabled, public demo credentials.
- **P5** As a prospect I can read services (`/services`, `/services/<slug>`) and the About page.
- **P6** As a prospect I can send an inquiry from `/contact` (optionally pre-filled with industry/service/project from the URL) and see an honest confirmation.
- **P7** As a prospect I can contact via WhatsApp when the studio has configured a number.
- **P8** As a prospect on a phone, every page is usable at 390 px width with no horizontal scroll.

### Studio owner (admin)
- **A1** I can sign in at `/admin/login` with an account created by `npm run seed:admin` (no public registration).
- **A2** I see a dashboard with counts, recent inquiries, recent changes and a launch checklist computed from real data.
- **A3** I can create, edit, duplicate, reorder, preview (draft), publish, unlist, archive and delete projects.
- **A4** I can manage industry categories (two levels), services, the About profile and all site settings (branding, homepage sections, navigation, contact & social, SEO, announcement, legal, inquiry options).
- **A5** I can manage a media library (URL references; S3 uploads when configured) and see where an asset is used before deleting it.
- **A6** I can work inquiries: filter by status, search, open details, change status, add private notes, reply by e-mail/WhatsApp, delete.
- **A7** Every save is live on the public site on the next request (cache revalidation), without redeploying.
- **A8** I can change my name and password and "sign out everywhere".
- **A9** I can copy an industry page link + ready-made e-mail intro to send to a prospect.
- **A10** I can keep a private record of each client project (client contact, links and repositories, which account owns hosting/domain/code, handover checklist, notes) and track its renewals (domain, hosting, maintenance, server): amount, cycle, who pays, paid-until date and a per-renewal reminder window. Overdue and due-soon renewals show in the admin only (sidebar badge, dashboard banner and card, "Needs attention" list). "Record payment" moves the due date forward and keeps a payment history. A **monthly budget** per project records salary, funds the client sends, carried-over balance, cost lines (USD/BDT with a monthly BDT rate, usage such as GB) and the remaining amount; money statistics (total credited, salary, funds, costs, renewal payments, balance; per year or all time) show on the Clients page and on each project. No e-mail reminders, no file uploads.

## 5. Success metrics

| Metric | Target |
| --- | --- |
| Inquiries received per month (stored, not spam) | Tracked in admin dashboard; baseline after launch |
| Inquiry form completion → stored success rate | ≥ 98 % of valid submissions stored (spam filters must not drop humans) |
| Time from admin "Save" to public page updated | ≤ 1 request (on-demand revalidation) |
| Lighthouse (mobile) on home, a demo page, a project page | Performance ≥ 90, Accessibility ≥ 95, SEO 100 |
| axe-core WCAG 2.1 AA violations on public pages | 0 serious/critical |
| Correct HTTP status codes | Unknown slug → 404, renamed slug → 308, legacy URLs → 307/308 |
| API integration test suite | 100 % passing (`npm run test:api`, currently 33/33) |
| Private data leakage in public HTML/API | 0 (internal notes, admin data, disabled demo credentials) |

## 6. Out of scope (Non-Goals)

The coding agent **must not** build these without an explicit change to this document:

1. **Public user accounts, registration or login** for visitors. Only admins sign in.
2. **Admin self-registration** or an HTTP endpoint that creates admin accounts.
3. **Payments, checkout, pricing calculators, invoices** or storing payment data (card/bank details). *Exception (A10):* the admin-only client tracker records amounts and dates of payments received or made — no card data, no online payment.
4. **Blog / articles / comments** (the previous project's blog was removed).
5. **Quizzes, courses, students, videos-for-sale** — anything from the previous Easy Bangla Patente product (archived in `_legacy/`).
6. **Multi-language / i18n** and RTL support.
7. **User-selectable dark mode** for the site or admin (the design uses fixed light and dark sections — see `03_UI_Spec.md`).
8. **Live chat, chatbots, AI features**, newsletter, marketing automation.
9. **Client portal / project tracking for customers.** (The A10 tracker is private to the admin; clients never see it.)
10. **Analytics dashboards** inside the admin (use external analytics if ever needed).
11. **Real-time collaboration / multiple concurrent editors** (single owner; an `editor` role exists but no per-record permissions).
12. **Invented content**: fake clients, testimonials, metrics, awards, certifications, prices, delivery guarantees, availability claims or fabricated screenshots.
13. **Migrating or deleting the old `patenteDB` database.**
