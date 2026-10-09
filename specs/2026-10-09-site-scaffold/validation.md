# Validation: Site Scaffold

The work is mergeable when every item below passes. Evidence (command output, run link, or URL) goes in the PR description.

## Automated
- [x] `npm ci` succeeds from a clean checkout.
- [x] `npm run check` exits 0 (no type errors).
- [x] `npm run build` exits 0 and produces `dist/` containing `index.html`, `supervisor/index.html`, `public/index.html`.
- [x] CI workflow runs on the PR and is green on the final commit.
- [x] CI fails on an intentionally introduced type error (checked once, then reverted). _(verified locally with `npm run check`; not exercised on GitHub)_

## Base-path correctness
- [x] In the built `dist/`, internal links and asset URLs are prefixed with `/Research_portal/`.
- [x] `npm run preview` serves the site under that base and all three pages load with CSS applied; nav links work between them. _(HTTP 200 on all pages checked by Claude; styling/nav confirmed by the user on the live site)_

## Deploy
- [x] Repo Pages source is set to GitHub Actions.
- [x] Manual run of the deploy workflow succeeds.
- [x] `https://jackokai.github.io/Research_portal/`, `/supervisor/` and `/public/` all load publicly in a logged-out browser, with styling and working nav. _(user reported all pages load; confirmed 2026-10-09)_

## Repository hygiene
- [x] No `node_modules/`, `dist/` or `.astro/` committed.
- [x] Original README content is unchanged (additions only).
- [x] `specs/roadmap.md` Phase 0 items reflect reality.
- [x] No secrets or tokens in the diff.

## Not required for merge
Real content, schemas, link checking, visual polish, automatic deploy.

## Definition of done
All boxes checked, CI green, live URL verified. If the live deploy can't be verified (e.g. Pages not yet enabled), the PR may merge only with that gap stated explicitly.
