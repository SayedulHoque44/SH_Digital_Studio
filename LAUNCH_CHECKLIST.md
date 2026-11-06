# SH Digital Studio — launch checklist

Work through this before sharing the site. The admin dashboard
(`/admin`) also shows a live checklist of the content items below.

## 1. Security (do first)

- [ ] **Rotate credentials that were stored in `Server/.env`.** The original
      project's `Server/.gitignore` did not exclude `.env`. If that repository
      was ever pushed to GitHub (or anywhere else), assume these values are
      exposed and replace them:
  - [ ] MongoDB database user password (Atlas → Database Access → Edit user),
        then update `mongoDbUrl` locally and in Vercel.
  - [ ] `JWT_ACCESS_SECRET` (currently read from the old `JWT_ACCESS_SECRCT`
        name) — generate a new 64+ character secret. All admin sessions end.
  - [ ] AWS access keys — **both** the active pair and the older pair that is
        commented out in `.env`. Deactivate them in AWS IAM and create new
        ones only if you enable S3 uploads (they also need
        `MEDIA_PUBLIC_BASE_URL`).
  - [ ] If the repo is public or shared, also clean its history (e.g.
        `git filter-repo`) — rotating is still required.
- [ ] `.env` files are now git-ignored in both projects; only `.env.example`
      (placeholders) is meant to be committed. Check `git status` before
      your first commit.
- [ ] Generate `INTERNAL_API_KEY` and set the **same** value in the API and
      the client:
      `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Create your own admin account (and remove `ADMIN_PASSWORD` from the
      environment afterwards):
      `ADMIN_EMAIL=… ADMIN_NAME=… ADMIN_PASSWORD=… npm run seed:admin`
- [ ] MongoDB Atlas → Network Access: allow only what you need (Vercel needs
      broad access unless you use a static-IP integration).

## 2. Content only you can provide

None of this was invented — fill it in or leave it out.

- [ ] **Site settings → Contact & social:** public e-mail, WhatsApp number
      (optional — WhatsApp buttons appear only when it's set), location,
      response time (only one you can keep), social profile links.
- [ ] **Profile & about:** real photo, biography in your own words,
      experience and education (optional), skills. The availability badge
      currently says "Taking on new projects" — confirm it, change it or set
      it to hidden.
- [ ] **Services:** "Mobile Application Development" is a **draft** — publish
      it only if you offer it, otherwise delete it. Review every service's
      wording; no prices or delivery times are published.
- [ ] **Projects:** the nine restaurant demos are concept websites and are
      labelled as such. Add real projects when you have them — for example the
      Easy Bangla Patente platform, if you're allowed to show it — with real
      screenshots only.
- [ ] **Legal pages** (Site settings → Legal pages): the privacy policy and
      terms are templates. Review them, ideally with a professional.
- [ ] **Inquiries:** set the notification e-mail (Site settings →
      Inquiries) and configure SMTP on the server if you want e-mails. Without
      SMTP, inquiries are still saved in the dashboard.

## 3. Deploy

- [ ] API (Vercel project from `Server/`): build command `npm run build`;
      env: `mongoDbUrl`, `JWT_ACCESS_SECRET`, `CLIENT_ORIGINS=https://your-domain`,
      `INTERNAL_API_KEY`, `NODE_ENV=production` (+ SMTP / S3 if used).
      Check `https://<api>/api/health`.
- [ ] Website (Vercel project from `Client/`, pnpm): env
      `NEXT_PUBLIC_SITE_URL=https://your-domain`, `API_ORIGIN=https://<api>`,
      `INTERNAL_API_KEY`.
- [ ] Custom domain + HTTPS on both.

## 4. After deploying

- [ ] Sign in at `/admin/login`, save something, and confirm the public page
      updates (instant revalidation).
- [ ] Send a test inquiry from `/contact` and find it under Inquiries.
- [ ] Open `/sitemap.xml` and `/robots.txt` — URLs must use your real domain.
- [ ] Share a project and a demo link in a private chat to check the social
      preview images (or use the LinkedIn Post Inspector / opengraph.xyz).
- [ ] Google Search Console: add the property, paste the verification code
      in Site settings → SEO defaults, submit `/sitemap.xml`.
- [ ] Run Lighthouse on the homepage, a demo page and a project page.

## 5. Old project

The Easy Bangla Patente code, images and packages have been removed. A copy
is in `_legacy/original-patente-setup-2026-10-22.zip`; delete the `_legacy`
folder when you no longer need it.

The old database `patenteDB` is untouched on the cluster. Back it up
(`mongodump`) and delete it in Atlas only when you're sure you don't need it.

## Notes

- **Console Ninja:** this VS Code extension corrupted the Next.js dev server's
  JavaScript (blank sections, admin stuck on its loader) and made `pnpm dev`
  take ~8 minutes. It's turned off for this project in `.vscode/settings.json`
  — keep it that way.
- **Build warnings about `import-in-the-middle`** come from the Sentry SDK's
  dependencies (two versions installed). They're harmless while Sentry is
  disabled; aligning the versions (`pnpm add import-in-the-middle@<version
  Sentry wants>`) or removing Sentry silences them.
- **Database latency:** from this development machine, MongoDB Atlas round
  trips were 0.3–3.7 s, which makes local admin pages feel slow. Production
  hosting in (or near) the Atlas region is typically a few milliseconds.
