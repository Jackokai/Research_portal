# Plan: Researcher Workspace

Each group is one reviewable commit.

## 0. Prerequisite
Phase 1b is merged and deployed with its secrets set, so `src/styles/tokens.css` exists and `/` is protected.

## 1. Ordering helpers
1. `src/lib/order.ts`: pure functions to order goals (current first, then newest), archive (ongoing first, then `completedOn` desc), feedback and requirements (open first, newest first).
2. Unit tests next to it (`order.test.ts`), run by `npm test`.
3. `src/lib/format.ts`: whole-percent formatting and `current / target unit` text, with tests.

## 2. Small components
1. `src/components/Badge.astro` for audience, status and SAMPLE labels (text-based).
2. `src/components/ProgressBar.astro`: accessible bar (text value plus `role="progressbar"` or `<progress>`), fed by `okr.ts` values.
3. `src/components/Section.astro`: heading with anchor id and empty-state slot.

## 3. Section components
1. `Vision.astro`, `Goals.astro` (current open, past in `<details>`), `Archive.astro`, `Feedback.astro`, `Requirements.astro`.
2. Markdown bodies rendered with `render()` from `astro:content`.
3. Components call `okr.ts` and the helpers; no OKR maths or sorting inline.

## 4. Assemble the page
1. `src/pages/index.astro` loads the five collections, orders them, renders the table of contents and sections.
2. Layout prop to drop the "stub" notice on `/` only.
3. Apple-style CSS using only the Phase 1b tokens (no hard-coded colours): system font stack, whitespace scale, thin dividers, rounded cards, subtle bars, light and automatic dark mode. Restyle `Base.astro` so all three pages share the look.
4. Base-aware anchors and links.

## 5. Verify and document
1. Build with `npm run build` (plain) and check `dist/index.html` against `validation.md` (sections, order, percentages, badges, base path).
2. One-off visual check with the preinstalled Chromium at desktop and phone width, in light and dark mode; record the result, do not commit screenshots. Also confirm `build:protected` still encrypts `/` with the new page (leak check passes).
3. Tick Phase 2 in `specs/roadmap.md`; tick the content-model live-deploy item (confirmed by the user on 2026-10-09).
4. README: note that `/` is password-gated but raw `content/` is public, so real names and sensitive feedback should not be added yet.
