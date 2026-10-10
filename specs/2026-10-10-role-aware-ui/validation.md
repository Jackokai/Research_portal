# Validation: Role-aware UI

Mergeable when every item passes. Put command output or run links in the PR description.

## Automated
- [x] `npm ci` succeeds from a clean checkout. _(local install; CI re-runs it)_
- [x] `npm run check`, `npm test` and `npm run build` pass. _(116 tests)_
- [x] `npm run build:protected` passes with throwaway passwords, including the view-matrix and external guards.
- [ ] CI is green on the final commit.

## Routes (unit tests)
- [x] `href` and `distFile` give the right results for the root and nested routes, with and without the base path.
- [x] The three routes are distinct and end in a slash.

## URLs and pages (plain build)
- [x] `/` is the public view; `/researcher/` is the workspace; `/supervisor/` is unchanged in content.
- [x] `/public/` is a redirect page: refresh to the base root, canonical link, visible link, base-aware, no other content, no nav.
- [x] Each view's content is identical to before the move (public, researcher and supervisor spot-checked against the previous build: same sections, same values). _(previous `main` built in a worktree; visible text compared with navigation excluded: researcher 96 = 96 lines, supervisor 62 = 62, public 6 = 6, no differences)_
- [x] Private views carry `noindex`; the public root and the redirect do not.
- [x] No hard-coded route strings remain outside `routes.ts` (checked by search).

## Navigation
- [x] The public page shows no links to `/researcher/` or `/supervisor/` anywhere in its HTML.
- [x] The researcher and supervisor pages show the switcher with all three lenses; the current one has `aria-current="page"`.
- [x] Every switcher link works under the `/Research_portal/` base. _(Chromium navigation)_
- [x] The switcher is keyboard reachable with a visible focus, readable in light and dark, and wraps without horizontal scroll at phone width. _(real Tab presses: Researcher, Supervisor, Public each get a 2px outline)_

## Protection after the move (protected build)
- [x] `researcher/index.html` and `supervisor/index.html` are encrypted prompts; the public root and `/public/` redirect are plaintext and unchanged.
- [x] `check-protected` fails when the public root is encrypted, when the researcher page is left plain, and with the researcher and public routes swapped (each tried once, then reverted). _(also `/public/` turned into a prompt and the supervisor page left plain; all restored)_
- [x] Chromium: the researcher password opens `/researcher/` and not `/supervisor/`; the supervisor password opens `/supervisor/` and not `/researcher/`; the public root opens with no password; switching lens from a private view works.

## View-matrix check
- [x] Passes on the clean build with the real content.
- [x] Passes with temporary non-sample fixtures covering each view (published and draft entries, a researcher-only entry, a supervisor entry, a past quarter, more than 3 completed entries, feedback toggled on), then reverted. _(5 completed entries: only the latest 3 on the supervisor page; researcher-only entries absent from it; feedback on)_
- [x] Each is caught when introduced on purpose, naming the view, entry and field: a researcher-only text on the supervisor page; a draft on the public page; a past quarter on the supervisor page; `summaryPlain` on the researcher page; a required entry dropped from a view; an entry rendered twice in one view; a progress value that differs between researcher and supervisor. _(injected into the built pages and also through the real templates: supervisor without the audience filter, all quarters on the supervisor page, a wrong progress value, an objective rendered twice)_
- [x] The duplicate check flags the same prose in two non-sample entries (naming both files) and ignores sample entries. _(a sentence copied into a second file is found, naming both; samples are exempt by unit test)_
- [x] The Phase 4 external guard and its tests still pass.

## Repository hygiene
- [x] No hard-coded colours (`npm run check`); no screenshots, `dist/`, `node_modules/` or `.astro/` committed.
- [x] README lists the three URLs, which are protected, and the bookmark change.
- [x] `specs/roadmap.md` and `specs/tech-stack.md` reflect the decisions.

## Live (after merge and a deploy)
- [ ] The bare site URL shows the public page in a logged-out window, with no password prompt.
- [ ] `/public/` redirects to it.
- [ ] `/researcher/` and `/supervisor/` behave as configured for the deploy (open, or prompts when protection is ticked).

## Acceptance (the researcher closes the requirement)
- [ ] Walkthrough: open all three lenses; confirm each shows what its audience should see and nothing it should not; confirm the switcher is intuitive; confirm the same entry looks the same wherever it appears.
- [ ] The researcher sets `status: done` in `content/requirements/role-aware-interface.yaml` (not done by this change).

## Not required for merge
Visual polish, accessibility audit, stale-content warnings, per-visitor lens memory, real content.

## Definition of done
All boxes except the live and acceptance items checked and CI green. Acceptance is the researcher's decision and may follow the merge.
