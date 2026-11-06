# CLAUDE.md — SH Digital Studio

Agency website + admin CMS (`Client/`, Next.js 16) and REST API (`Server/`, Express + MongoDB).

## Before every task — load only the context you need (automatic)

The user will not tell you which docs to read. Decide yourself from the task, read only what applies, and read each doc **once per session** (it stays in context — don't re-read it for follow-up tasks in the same session).

**Always:** `docs/06_Plan.md` (current state, open steps). It's short.

**Then pick by what the task touches:**

| If the task involves… | Read |
| --- | --- |
| A new feature, or "should we build X?" | `01_PRD.md` (check Non-Goals first) |
| Pages, routes, navigation, buttons, forms, loading/empty/error states | `02_AppFlow.md` |
| Styling, layout, colors, fonts, spacing, animation, components | `03_UI_Spec.md` |
| Dependencies, folder placement, API endpoints, env vars, security, deploy, build/test commands | `04_TRD.md` |
| Data fields, models, queries, references, indexes, login/sessions/permissions | `05_Schema.md` |
| A tiny edit (typo, copy text, one-line fix) | Nothing beyond `06_Plan.md` — open the file directly |

For a mixed task, read every row it matches. If unsure, read `04_TRD.md` §3 (folder structure) to locate the code, then the matching doc.

The docs are the source of truth. If code and docs disagree, stop and report it instead of guessing.

**Save tokens:** go straight to the files the docs point to; don't scan the whole repo. Use Grep/Glob with exact paths instead of reading large files end to end.

**Session hygiene:** when the user starts a task unrelated to the current session's work, or the session is long, suggest `/clear` (new topic) or `/compact` (same topic) before continuing. You can't run these yourself; just say so in one line.

## After every completed task (mandatory, automatic)

1. Run the quality gates in `docs/04_TRD.md` §8 that apply to what you changed (types/lint at minimum; API tests if the server changed).
2. Update `docs/06_Plan.md`: tick the matching step (`[ ]` → `[x]`), or add a new ticked step if the task wasn't in the plan, plus one dated Changelog line. Add newly discovered work as unchecked steps.
3. If you changed routes, screens, tokens, dependencies, schema or security behavior, update the matching doc (02–05) in the same change. Keep edits short — the docs must stay small to stay cheap to read.
4. Tiny edits (typos, copy) need no doc update.

## Hard rules

- **Secrets**: never print, log, commit or copy values from `.env` files. Example env files hold placeholders only. Never put secrets in `NEXT_PUBLIC_*`.
- **Truthful content**: never invent clients, testimonials, metrics, prices, availability, awards or screenshots. Leave fields empty and tell the owner.
- **Stack is locked** (`04_TRD.md`): no new dependencies, UI kits, state libraries or animation libraries without updating the TRD first. antd is admin-only.
- **Security model** (`04_TRD.md` §7): Zod-validate every route; public data only through `modules/Public/public.mappers.ts`; no admin registration endpoint; never expose drafts, internal notes, disabled demo credentials or `notificationEmail`.
- **Databases**: app uses `agency_portfolio`; tests use `agency_portfolio_test` only. Never modify or drop `patenteDB`. Seeds must stay idempotent (`$setOnInsert`).
- **Server modules** follow model → interface → validation → service → controller → routes (register in `src/app/routes/index.ts`).
- **Admin saves** submit `form.getFieldsValue(true)` so list items keep their `_id`; every content mutation calls `revalidateSite()`.
- **Do not add `loading.tsx`** above slug routes (breaks 404/308 status codes).
- Use design tokens, never raw hex in components; respect `prefers-reduced-motion`; pages must work at 390 px with no horizontal scroll.
- Ask before destructive actions (deleting files/records, dropping data, force operations).

## Commands

| Task | Command |
| --- | --- |
| API dev (port 3001) | `cd Server && npm run dev` |
| Site dev (port 3000) | `cd Client && pnpm dev` |
| Types | `cd Client && pnpm exec tsc --noEmit` · `cd Server && npm run typecheck` |
| Lint | `cd Client && pnpm exec eslint .` · `cd Server && npm run lint` |
| API tests | `cd Server && npm run test:api` |
| Production build | `cd Client && pnpm build` |
| Seed content / admin | `cd Server && npm run seed` · `npm run seed:admin` (env `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD`) |

## Environment notes

- Windows + VS Code. Keep the **Console Ninja** extension disabled for this workspace (`.vscode/settings.json`); it corrupts the Next dev bundles.
- MongoDB Atlas round trips from the dev machine can be slow (seconds); that is the network, not the code.
- `ts-node-dev` can keep a stale type cache after rapid multi-file edits — restart `npm run dev` if it reports a type error `tsc` doesn't.
- Owner-facing launch tasks: `LAUNCH_CHECKLIST.md`. Old project archive: `_legacy/` (never import from it).
