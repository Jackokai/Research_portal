# Validation: Site Scaffold

The work is mergeable when every item below passes. Evidence (command output, run link, or URL) goes in the PR description.

## Automated
- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm run check` exits 0 (no type errors).
- [ ] `npm run build` exits 0 and produces `dist/` containing `index.html`, `supervisor/index.html`, `public/index.html`.
- [ ] CI workflow runs on the PR and is green on the final commit.
- [ ] CI fails on an intentionally introduced type error (checked once, then reverted).

## Base-path correctness
- [ ] In the built `dist/`, internal links and asset URLs are prefixed with `/Research_portal/`.
- [ ] `npm run preview` serves the site under that base and all three pages load with CSS applied; nav links work between them.

## Deploy
- [ ] Repo Pages source is set to GitHub Actions.
- [ ] Manual run of the deploy workflow succeeds.
- [ ] `https://jackokai.github.io/Research_portal/`, `/supervisor/` and `/public/` all load publicly in a logged-out browser, with styling and working nav.

## Repository hygiene
- [ ] No `node_modules/`, `dist/` or `.astro/` committed.
- [ ] Original README content is unchanged (additions only).
- [ ] `specs/roadmap.md` Phase 0 items reflect reality.
- [ ] No secrets or tokens in the diff.

## Not required for merge
Real content, schemas, link checking, visual polish, automatic deploy.

## Definition of done
All boxes checked, CI green, live URL verified. If the live deploy can't be verified (e.g. Pages not yet enabled), the PR may merge only with that gap stated explicitly.
