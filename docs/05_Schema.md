# 05 — Data Schema & Auth

> **Database: MongoDB Atlas (document store) via Mongoose 8** — not a relational
> database. "Tables" below are **collections**, "foreign keys" are
> `ObjectId` **references** (no DB-enforced integrity — services keep them
> consistent), and there is **no Row-Level Security**: authorization is
> enforced in the API (§4). Models: `Server/src/app/modules/*/*.model.ts`.
> Request validation (Zod) is the authority for allowed values and lengths:
> `*.validation.ts`.

- Database: `agency_portfolio` (production/dev) · `agency_portfolio_test` (API tests only) · `patenteDB` (old project — **never touch**).
- Every top-level collection has `_id: ObjectId` (PK) and, unless noted, `createdAt` / `updatedAt` (`timestamps: true`).
- `[]` = array. **PK** primary key, **FK→X** reference to collection X, **U** unique index, **I** index.

## 1. Enumerations

| Name | Values |
| --- | --- |
| PUBLISH_STATUSES (projects) | `draft` · `published` · `archived` |
| SIMPLE_PUBLISH_STATUSES (categories, services) | `draft` · `published` |
| PROJECT_TYPES | `website` · `web-app` · `mobile-app` · `desktop-app` · `saas` · `ui-ux` · `other` |
| PROJECT_STATUSES | `concept` · `prototype` · `in-progress` · `completed` |
| PROJECT_VISIBILITY | `listed` · `unlisted` |
| ADMIN_ROLES | `owner` · `editor` |
| INQUIRY_STATUSES | `new` · `contacted` · `qualified` · `proposal-sent` · `won` · `lost` · `archived` |
| PREFERRED_CONTACT | `email` · `whatsapp` · `phone` · `video-call` |
| MEDIA_KINDS / PROVIDERS | `image` · `video` / `external` · `upload` |
| AVAILABILITY | `available` · `limited` · `unavailable` · `hidden` |
| CLIENT_PROJECT_STATUSES | `active` · `on-hold` · `ended` |
| CLIENT_LINK_KINDS | `live` · `admin` · `staging` · `repository` · `design` · `docs` · `other` |
| RENEWAL_KINDS | `domain` `hosting` `maintenance` `server` `database` `email` `ssl` `subscription` `other` |
| RENEWAL_DIRECTIONS | `receivable` (client pays you) · `payable` (you pay a provider) |
| BILLING_CYCLES | `monthly` (1) · `quarterly` (3) · `half-yearly` (6) · `yearly` (12) · `one-time` (0 months) |
| CURRENCIES | `USD` `BDT` `EUR` `GBP` `SAR` `AED` `INR` |
| BLOCK_TYPES | `richText` `heading` `image` `gallery` `video` `imageText` `featureGrid` `techList` `stats` `comparison` `quote` `callout` `embed` `beforeAfter` `timeline` `cta` |

## 2. Embedded sub-documents (shared, `shared/shared.model.ts`)

| Type | Fields | `_id`? |
| --- | --- | --- |
| **MediaRef** | `url` String req · `alt` · `caption` · `width` Number · `height` Number · `assetId` ObjectId FK→mediaassets | no |
| **VideoRef** | `url` req · `title` · `posterUrl` · `captionsUrl` · `transcript` | no |
| **Seo** | `title` · `description` · `ogImage` · `canonicalUrl` · `noIndex` Bool=false | no |
| **Cta** | `heading` · `text` · `buttonLabel` · `buttonHref` | no |
| **Faq** | `question` req · `answer` req | yes |
| **FeatureItem** | `title` req · `description` · `icon` | yes |
| **ContentBlock** | `type` enum BLOCK_TYPES req · `data` Mixed (shape validated per type by Zod) | yes |

Array items **with `_id` must keep their `_id` on update** — the admin sends the full form store so ids survive saves.

## 3. Collections

### 3.1 `adminusers` (AdminUser)
| Column | Type | Constraints |
| --- | --- | --- |
| `_id` | ObjectId | PK |
| `name` | String | required, trimmed |
| `email` | String | required, **U**, lowercase |
| `passwordHash` | String | required, bcrypt (12), `select: false` |
| `role` | enum ADMIN_ROLES | default `owner` |
| `isActive` | Boolean | default true |
| `tokenVersion` | Number | default 0 — bump to revoke all sessions |
| `failedLoginCount` | Number | default 0 |
| `lockUntil` | Date \| null | account lock |
| `lastLoginAt`, `passwordChangedAt` | Date | |

### 3.2 `projects` (Project)
| Column | Type | Constraints |
| --- | --- | --- |
| `title` | String | required |
| `slug` | String | required, **U**, lowercase |
| `subtitle`, `summary`, `overview` (md) | String | summary required to publish (UI warning) |
| `projectType` | enum PROJECT_TYPES | required, **I** |
| `categories` | ObjectId[] | **FK→categories**, **I** |
| `subcategory`, `brandName`, `clientName` | String | `clientName` only when `isClientWork` |
| `tags`, `platforms`, `techStack`, `corePages`, `designHighlights` | String[] | |
| `projectStatus` | enum PROJECT_STATUSES | default `concept` |
| `isClientWork` | Boolean | default false |
| `publishStatus` | enum PUBLISH_STATUSES | default `draft` |
| `visibility` | enum PROJECT_VISIBILITY | default `listed` |
| `featured` / `featuredOrder` / `sortOrder` | Bool / Number / Number | |
| `publishedAt` | Date | |
| `media` | { `coverImage`, `logo`, `browserMockup`, `fullPageScreenshot`: MediaRef; `desktopScreenshots`, `tabletScreenshots`, `mobileScreenshots`, `gallery`: MediaRef[] } | |
| `video` | VideoRef | |
| `links` | { `liveUrl`, `liveUrlLabel`, `secondaryUrl`, `secondaryUrlLabel`, `sourceUrl`, `showSourceUrl` Bool, `appStoreUrl`, `playStoreUrl` } | |
| `features`, `modules`, `workflows` | FeatureItem[] | |
| `caseStudy` | { goals, problem, solution, targetAudience, process, designDecisions, challenges, implementation, role, collaboration, timeline, outcomes, lessons, limitations } (markdown strings) | |
| `contentBlocks` | ContentBlock[] | |
| `demoAccess` | { `enabled` Bool, `username`, `password`, `loginUrl`, `instructions`, `limitations` } | public **only** when enabled + published; sandbox accounts only |
| `relatedProjects` | ObjectId[] | **FK→projects** |
| `cta` / `seo` | Cta / Seo | |
| `internalNotes` | String | **private — never public** |
| `previousSlugs` | String[] | **I**; server-managed (not client-writable) → 308 redirects |

Indexes: `{publishStatus, visibility, sortOrder}`, `{categories}`, `{projectType}`, `{featured, featuredOrder}`, `{previousSlugs}`, `slug` U.

### 3.3 `categories` (Category — industries, 2 levels)
| Column | Type | Constraints |
| --- | --- | --- |
| `name` | String | required |
| `slug` | String | required, **U** |
| `shortDescription`, `introduction` (md), `emailIntro`, `icon` | String | `emailIntro` = text for sharing |
| `highlights` | String[] | |
| `parent` | ObjectId \| null | **FK→categories** (self), **I**; max depth 2 |
| `coverImage`, `featuredImage` | MediaRef | |
| `contentBlocks` | ContentBlock[] | |
| `featuredProjects` | ObjectId[] | **FK→projects** |
| `relatedServices` | ObjectId[] | **FK→services** |
| `faqs` | Faq[] | |
| `cta`, `seo` | Cta, Seo | |
| `showOnHome` | Boolean | |
| `sortOrder` | Number | |
| `status` | enum SIMPLE | default `draft` |
| `previousSlugs` | String[] | **I** |
Indexes: `{status, sortOrder}`, `{previousSlugs}`, `{parent}`, `slug` U.

### 3.4 `services` (Service)
| Column | Type | Constraints |
| --- | --- | --- |
| `title` | String | required |
| `slug` | String | required, **U** |
| `shortDescription`, `description` (md), `icon` | String | |
| `image` | MediaRef | |
| `benefits`, `deliverables` | String[] | |
| `features` | FeatureItem[] | |
| `industries` | ObjectId[] | **FK→categories** |
| `relatedProjects` | ObjectId[] | **FK→projects** |
| `projectTypes` | enum PROJECT_TYPES[] | |
| `startingPrice`, `priceNote`, `timeline` | String | **only confirmed values** (empty = hidden) |
| `faqs`, `cta`, `seo` | Faq[], Cta, Seo | |
| `sortOrder`, `status`, `previousSlugs` | Number, enum SIMPLE, String[] | |
Indexes: `{status, sortOrder}`, `{previousSlugs}`, `slug` U.

### 3.5 `profiles` (Profile — singleton `key: "main"`)
| Column | Type |
| --- | --- |
| `key` | String **U**, default `main` |
| `name` (req), `title`, `shortIntro`, `bio` (md), `location`, `availabilityNote`, `resumeUrl` | String |
| `photo` | MediaRef |
| `availabilityStatus` | enum AVAILABILITY, default `hidden` |
| `specializations`, `workingArrangements`, `skillCategories` | String[] |
| `skills` | [{ name req, category req, description, icon, proficiencyLabel }] |
| `experience` | [{ organization req, position req, employmentType, location, startDate, endDate, isCurrent, description, responsibilities[], achievements[], technologies[], relatedProjects FK→projects[], logo MediaRef }] |
| `education` | [{ institution req, qualification req, field, startDate, endDate, description }] |
| `capabilities`, `workingProcess` | FeatureItem[] |
| `certifications` | [{ name req, issuer, date, url }] |
| `testimonials` | [{ quote req, author req, role, company, `approved` Bool=false, project FK→projects }] — **only `approved` are public** |
| `featuredProjects` | FK→projects[] |
| `seo` | Seo |

### 3.6 `sitesettings` (SiteSettings — singleton `key: "main"`)
| Path | Type |
| --- | --- |
| `key` | String **U**, default `main` |
| `brand` | { `name` req, `tagline`, `description`, `logoUrl`, `logoDarkUrl` } |
| `theme.accent` | String hex, default `#C8F25C` |
| `announcement` | { `enabled` Bool, `text`, `linkLabel`, `linkHref` } |
| `home` | `heroEyebrow`, `heroHeadline` req, `heroHighlight`, `heroSubtext`, `primaryCta`/`secondaryCta` {label, href} req, `sections` {selectedWork, services, industries, process, capabilities, about, finalCta: Bool=true}, `selectedWork` {heading, intro, `projects` FK→projects[]}, `services` {heading, intro, `items` FK→services[]}, `industries` {heading, intro, `items` FK→categories[]}, `process` {heading, intro, steps FeatureItem[]}, `capabilities` {heading, intro, items FeatureItem[], technologies String[]}, `about` {heading, text, ctaLabel}, `finalCta` {heading, text, buttonLabel, buttonHref} |
| `navigation.header` | [{ label req, href req, visible Bool=true }] |
| `footer` | { `blurb`, `showServices` Bool, `showIndustries` Bool } |
| `contact` | { `email`, `phone`, `whatsappNumber`, `whatsappMessage` (placeholders `{page}` `{project}` `{industry}`), `location`, `responseTime` } |
| `socialLinks` | [{ platform req, url req, label }] |
| `seo` | { `titleTemplate` (must contain `%s`), `defaultTitle`, `defaultDescription`, `defaultOgImage`, `twitterHandle`, `keywords[]`, `googleSiteVerification` } |
| `legal` | { `privacyPolicy` md, `terms` md, `updatedAt` Date — bumped only when text changes } |
| `inquiry` | { `budgetRanges[]`, `successMessage`, `notificationEmail` (**private**) } |

Homepage list semantics: an empty `home.*.items` / `projects` array means "automatic" (featured/sortOrder); a non-empty array is the exact, ordered selection (only published items render).

### 3.7 `mediaassets` (MediaAsset)
`kind` enum req · `provider` enum (default `external`) · `url` req · `title` · `alt` · `caption` · `description` · `width` · `height` · `mimeType` · `sizeBytes` · `posterUrl` · `storageKey` (S3 key) · `tags[]`. Indexes: `{createdAt:-1}`, `{kind}`.
Content documents embed **MediaRef copies** (with optional `assetId`); deleting an asset does not cascade — the API reports usage first.

### 3.8 `inquiries` (Inquiry)
| Column | Type | Constraints |
| --- | --- | --- |
| `name` | String | required (2–80) |
| `email` | String | required, lowercase, **I** (with createdAt) |
| `businessName`, `phone`, `country`, `website`, `industry`, `service`, `projectSlug`, `projectTitle`, `budgetRange`, `desiredLaunch`, `sourcePath` | String | |
| `message` | String | required (20–5000, ≤5 links) |
| `preferredContact` | enum | default `email`; phone required for whatsapp/phone |
| `consent` / `consentAt` | Bool / Date | required |
| `status` | enum INQUIRY_STATUSES | default `new` |
| `adminNotes` | String | private |
| `ipHash` | String | salted SHA-256 of IP (never raw IP), never returned |
| `notification` | { attempted Bool, sent Bool, error } | private delivery status |
Indexes: `{status, createdAt:-1}`, `{email, createdAt:-1}`, `{createdAt:-1}`.
Not stored (spam controls): `homepage` (honeypot), `fillMs`.

### 3.9 `clientprojects` (ClientProject — **private, admin only**)
| Column | Type | Constraints |
| --- | --- | --- |
| `name` | String | required |
| `status` | enum CLIENT_PROJECT_STATUSES | default `active` |
| `pinned` | Boolean | default false |
| `muteAlerts` | Boolean | default false — excluded from renewal alerts (badge, banner, dashboard) |
| `summary`, `techLead`, `notes` (md) | String | |
| `tags` | String[] | |
| `startDate`, `handoverDate` | Date | |
| `client` | { `name` req, `relation`, `company`, `email`, `phone`, `whatsapp`, `country` } | |
| `links` | [{ `kind` enum CLIENT_LINK_KINDS, `label`, `url` req (http/https) }] | `_id` |
| `accounts` | [{ `provider` req, `purpose`, `login` (e-mail/username — **never a password**), `projectName`, `dashboardUrl`, `notes` }] | `_id` |
| `renewals` | [{ `title` req, `kind`, `direction`, `provider`, `amount`, `currency` (USD), `exchangeRate` (BDT per unit), `cycle`, `paidFrom`, `paidUntil` (= next due), `remindDaysBefore` (30), `autoRenew`, `active` (true; false = not billing yet), `notes`, `payments` [{ `paidOn` req, `amount`, `currency`, `exchangeRate`, `periodFrom`, `periodTo`, `note` }] }] | `_id` |
| `checklist` | [{ `text` req, `done` }] | `_id` |
| `envSets` | [{ `label` req, `note`, `content` (whole .env text, ≤ 50,000 chars) = "enc:v1:…" AES-256-GCM ciphertext }] (max 20 sets) | `_id` |
| `ledger` | [{ `month` req "YYYY-MM" (unique per project), `exchangeRate` (BDT per 1 unit), `carriedOver` (BDT, may be negative), `income` [{ `kind` `salary`\|`fund`, `label`, `amount` req, `currency` (BDT) }], `costs` [{ `label` req, `category` (hosting, server, database, storage, api, domain, staff, software, other), `amount` req, `currency` (USD), `usage`, `note` }], `notes` }] | `_id` |

Indexes: `{status, updatedAt:-1}`, `{renewals.paidUntil}`. Dates are calendar days at UTC midnight. Recording a payment: `periodFrom = paidUntil ?? paidOn`, `periodTo = periodFrom + cycles × cycle months` (day clamped to month end), `paidUntil = periodTo`. Ledger totals (computed in `Client/lib/ledger.ts`, not stored): available = funds + carriedOver; costs in BDT via the month's rate; remaining = available − costs; salary is reported separately.

### 3.10 `ratelimits` (RateLimit)
`key` String **U** (collation en/strength 1, format `<type>:<clientIp>`) · `count` Number · `firstRequest` Date · `lastRequest` Date **TTL 3600 s**. No timestamps.

## 4. Relationships (reference graph)

```
categories ──parent──▶ categories
projects ──categories[]──▶ categories          projects ──relatedProjects[]──▶ projects
categories ──featuredProjects[]──▶ projects     categories ──relatedServices[]──▶ services
services ──industries[]──▶ categories           services ──relatedProjects[]──▶ projects
profiles ──featuredProjects[] / experience.relatedProjects[] / testimonials.project──▶ projects
sitesettings.home ──projects[] / services.items[] / industries.items[]──▶ projects / services / categories
any MediaRef ──assetId──▶ mediaassets
```
Integrity rules (enforced in services, no DB constraints):
- Delete **category** → `$pull` from `projects.categories`, `services.industries`, `sitesettings.home.industries.items`; its children get `parent: null`; the UI shows `GET /:id/delete-impact` first.
- Delete **project** → `$pull` from `projects.relatedProjects`, `categories.featuredProjects`, `services.relatedProjects`, profile references, `sitesettings.home.selectedWork.projects`.
- Delete **service** → `$pull` from `sitesettings.home.services.items` and `categories.relatedServices`.
- Slug change → old slug added to `previousSlugs` (`shared.utils.ts`); slugs must be unique across `slug` **and** `previousSlugs`. Duplicating a project resets `previousSlugs` and `publishedAt`.
- Category depth is max 2 (parent must be top-level).

## 5. Auth flow & authorization (RLS equivalent)

### Sign-in
1. `POST /api/admin/auth/login` {email, password} — rate limited (10/IP/15 min), Zod-validated.
2. Lookup by email (`+passwordHash`); unknown email still runs bcrypt against a dummy hash (timing-safe); same 401 message for both cases.
3. If `lockUntil > now` → 429. Wrong password → `failedLoginCount++`; at 5 → `lockUntil = now + 15 min`.
4. Success → reset counters, `lastLoginAt`, sign JWT `{ sub: adminId, role, tv: tokenVersion }` (`ADMIN_SESSION_EXPIRES_IN`, default 8 h) → cookie `shds_session` (HttpOnly, SameSite=Strict, Secure in prod).

### Every admin request (`middlewares/auth.ts`)
Cookie → verify JWT → load admin → reject if missing, `!isActive` or `tokenVersion ≠ tv` (401) → optional role check (403) → `req.admin`.

### Revocation
`POST logout` clears cookie · `POST logout-all` and password change increment `tokenVersion` (password change re-issues the current session's cookie) · `seed:admin` with `ADMIN_RESET_PASSWORD=true` resets password and revokes all sessions.

### Authorization matrix
| Actor | projects / categories / services | profile / settings | inquiries | media | admins |
| --- | --- | --- | --- | --- | --- |
| Anonymous (public API) | Read **published** only (projects: published + listed for lists; unlisted by slug); private fields stripped | Read public fields only | **Create** only (validated, rate-limited) | — | — |
| Admin `owner` / `editor` | Full CRUD (incl. drafts, internal notes) | Read / update | Read / update / delete | CRUD | Own account only (name, password) |
| Next.js server (`INTERNAL_API_KEY`) | Same as anonymous; exempt from per-IP limits | | | | |
`clientprojects`: admin CRUD only; anonymous visitors and the Next.js server have no access.
No endpoint lists, creates or deletes admin accounts.
