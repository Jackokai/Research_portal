# Requirements: Researcher Workspace

Roadmap: Phase 2. Guidance: `specs/mission.md` (single source of truth, low friction, researcher workspace lens), `specs/tech-stack.md` (Astro static site, content derived not copied).

## Dependency
Builds on **Phase 1b (private views)**, spec `2026-10-09-private-views/`. In production `/` is encrypted with the researcher password, so this page is not publicly readable once Phase 1b is deployed. Do not merge or deploy this feature before Phase 1b is live.

## Goal
Render all five content collections on `/` so the researcher can see the whole workspace in one place. This is the first phase that changes what the site shows.

## In scope
- `/` renders, in order: vision, quarterly goals (OKRs), research archive, feedback log, requirements.
- In-page table of contents with anchors, as in the README.
- OKR presentation with derived progress and labels, using `src/lib/okr.ts` (no recomputation in components).
- Audience badges and a SAMPLE badge on entries.
- An **Edit** link on each entry to its source file on GitHub (mission principle 3, low friction).
- Ordering and empty states for every section.
- Removing the "stub page" notice from `/` only (`/supervisor/` and `/public/` stay stubs).

## Out of scope
- Supervisor and external views, Kanban, role-switching navigation (Phases 3-5).
- A status strip at the top of `/` (considered and declined for this phase; better designed with the supervisor overview in Phase 3).
- Rendering `summaryPlain` (that text is for the external view, Phase 4).
- Restyling `/supervisor/` and `/public/` beyond what the shared layout and tokens give them (their phases). Accessibility audit and responsive polish beyond the basics listed here (Phase 6).
- Link checking, accessibility audit, mobile polish (Phase 6), though basics below apply.
- Real content: the sample entries remain.

## Decisions (feature interview, 2026-10-09)
| Topic | Decision |
|-------|----------|
| Layout | One page with sections and an in-page table of contents |
| Filtering | Show **everything**, each entry with audience badges (the workspace is the unfiltered lens) |
| Sample entries | Visible in production with a clear SAMPLE badge |
| Goals | Current quarter open; past quarters collapsed; objective label + progress bar; key result current/target with unit and its own bar |
| Archive growth | Ongoing entries always visible; completed entries collapsed in a `<details>` with a count, newest first |
| Edit links | Yes: each entry links to GitHub's web editor for its source file |
| Status strip | No (deferred to Phase 3) |
| Look | **Minimalistic, Apple-style** (requested 2026-10-09): system font stack, generous whitespace, thin dividers, rounded cards, one accent colour, subtle progress bars, light and automatic dark mode. Built on the tokens from Phase 1b (`src/styles/tokens.css`) |
| Privacy | `/` is password-gated by Phase 1b; the raw `content/` files remain public in the repo (accepted) |

## Behaviour
- **Goals:** current quarter (the one with `current: true`) first and expanded; past quarters below in `<details>`, newest first. Each objective shows its derived label (planned / in progress / done) and progress as a percentage plus a bar. Each key result shows `current / target unit` and its own bar. Decreasing metrics display correctly (start 10, target 2, current 6 shows 50%).
- **Archive:** ongoing entries open at all times. Completed entries sit in a collapsed `<details>` whose summary shows the count ("Completed (3)"), by `completedOn` descending. Each entry: title, status, summary, link (opens safely: `rel="noopener"`), body rendered from Markdown.
- **Edit links:** each entry (vision, archive, feedback, requirement, and each quarter's goals file) shows "Edit", linking to `https://github.com/Jackokai/Research_portal/edit/<branch>/<file path>`. The path comes from the entry's `filePath` (verified present for all 8 entries as `content/<collection>/<file>`; the type marks it optional, so a missing value renders no link rather than a broken one); the repo URL and branch live in one place (`src/lib/repo.ts`). Opens in a new tab with `rel="noopener"`.
- **Feedback:** open first, then addressed, newest first within each. Shows date, from, text, status.
- **Requirements:** open first, then done, newest first. Shows date, text, status.
- **Vision:** body rendered from Markdown.
- **Badges:** audience shown as text labels (not colour alone); SAMPLE badge on `sample: true`.
- **Empty states:** a section with no entries shows a short "Nothing here yet" line, not a blank gap.
- **Base path:** all links and anchors work under `/Research_portal/`.

## Context and constraints
- Phase 1 delivered strict schemas; entries are already valid, so components may rely on the typed data.
- Dates are validated strings (YYYY-MM-DD) and sort correctly as strings.
- Astro 7 exposes `render()` from `astro:content` for Markdown bodies (confirmed in the installed type definitions).
- Production `/` is ciphertext, so rendered-output checks run against the **plain build** (`npm run build`), not `build:protected`.
- The default branch is `main` (renamed 2026-10-09). Edit links use it through one constant (`EDIT_BRANCH` in `src/lib/repo.ts`) so a future rename is a one-line change.
- The encrypted page is decrypted in the browser, which replaces the document. In-page table-of-contents anchors and `<details>` must be checked in that decrypted state, not only in the plain build.
- No browser test tooling exists in the repo. Ordering logic should be pure functions with unit tests; layout is checked by build output and a one-off visual check.

## Risks
- **Raw content is still public.** The password protects the rendered `/` only. Feedback names, goals and notes in `content/` are readable on GitHub. Do not commit real names or sensitive feedback until real privacy exists (options in `tech-stack.md`). Accepted by decision.
- **Apple-style without Apple assets.** System fonts render as SF on Apple devices; other devices show their own system font. No Apple fonts, icons or branding. The look may differ across platforms.
- Sample data is visible to anyone with the researcher password and in the repo. Accepted; replace with real content when ready.
- A long single page will grow as feedback and requirements accumulate. Completed archive entries are collapsed; sectioned pages remain the escape hatch.
- Edit links reveal file paths and need GitHub write access to be useful. The paths are already public in the repo. Anyone without write access sees GitHub's fork-and-edit flow, not an error.
- Progress rounding: show whole percentages; 1/3 displays as 33%.

## Open questions
- None open for this phase.
