# Plan: Role-aware UI

Each group is one reviewable commit.

## 1. Routes in one place
1. `src/lib/routes.ts`: `ROUTES` (`public: '/'`, `researcher: '/researcher/'`, `supervisor: '/supervisor/'`, legacy `'/public/'`), `href(route, base)` and `distFile(route)` helpers.
2. Unit tests: trailing slashes, base-path handling, `distFile` for the root and nested routes, no two routes equal.

## 2. Move the pages
1. `src/pages/researcher.astro` takes the current workspace page; `src/pages/index.astro` takes the current public page; `src/pages/public.astro` becomes the redirect page.
2. `Base.astro` gets a `lens` prop: `public`, `researcher` or `supervisor` (plus a `redirect` variant). Private lenses add `<meta name="robots" content="noindex">`.
3. Redirect page: meta refresh, canonical link, visible link, base-aware, no content.

## 3. Navigation switcher
1. `src/components/LensSwitcher.astro`: segmented control built from `ROUTES`, `aria-current` on the current lens, shown on private lenses only.
2. CSS from the tokens (no hard-coded colours), wraps at phone width, visible focus.
3. Public lens: no nav, brand as plain text.

## 4. Route-driven scripts
1. `scripts/protect.ts`: encrypt the researcher and supervisor routes; assert the public root and the redirect page are unchanged.
2. `scripts/check-protected.ts`: protected routes are prompts and `noindex`; public root and redirect are not prompts; side channels as before.
3. `scripts/check-external.ts`: reads the public root.
4. Tests, including a case with the researcher and public routes swapped that must fail.

## 5. View-matrix check
1. Move the content loader out of `check-external.ts` into a shared `scripts/content-loader.ts`.
2. `src/lib/view-rules.ts`: per-view rules (shown and hidden fields per collection), the Phase 4 external rules as the public case; settings (feedback toggle) as input. Unit-tested with fixtures covering every view.
3. `src/lib/duplicates.ts`: duplicate-prose finder with the sample exemption; tested.
4. `scripts/check-views.ts`: presence/absence per view, once per view, cross-view consistency of objective values, duplicates; output names the view, entry and field.
5. Prove it fails: deliberately leak, drop, double-render and desynchronise one value each; run from CI and from `build:protected` and the deploy's unprotected path.

## 6. Docs and acceptance
1. README: the three URLs and which are protected, bookmark guidance, the navigation behaviour, the view-matrix check.
2. Roadmap Phase 5, `tech-stack.md` decisions.
3. Acceptance walkthrough in `validation.md`; the researcher closes the requirement afterwards.

## 7. Verification
1. Plain build: pages, nav, redirect, `noindex`, view matrix.
2. Protected build: the right routes are encrypted; Chromium login to `/researcher/` and `/supervisor/`; switcher links work between lenses; public root opens freely.
3. Light/dark and phone-width screenshots of the switcher.
