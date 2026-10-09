# Validation: Researcher Workspace

Mergeable when every item passes. Put command output or run links in the PR description.

## Automated
- [x] `npm ci` succeeds from a clean checkout. _(local install; CI re-runs it)_
- [x] `npm run check` exits 0.
- [x] `npm test` passes, including new ordering and formatting tests. _(44 tests)_
- [x] `npm run build` exits 0 and still produces the three pages.
- [ ] CI is green on the final commit.

## Unit tests cover
- [x] Goals: current quarter first, then newest to oldest.
- [x] Archive: ongoing before completed; completed by `completedOn` descending.
- [x] Feedback and requirements: open before closed; newest first within each.
- [ ] `EditLink` renders nothing when `filePath` is undefined. _(not tested: the guard is a single `filePath ?` condition and there is no component-render test setup)_
- [x] `editUrl`: builds `https://github.com/Jackokai/Research_portal/edit/<branch>/content/...`, keeps slashes, encodes spaces and special characters.
- [x] Percent formatting: 1/3 gives 33%, 0.5 gives 50%, 1 gives 100%.
- [x] Key result text: `current / target unit`.

## Rendered output (plain build, `dist/index.html`)
- [x] Sections appear in order: vision, goals, archive, feedback, requirements, with a table of contents whose anchors resolve.
- [x] Current quarter (2026-Q4) is expanded; 2026-Q3 sits inside a collapsed `<details>`.
- [x] Sample Q4 objective 1 shows the correct derived values: papers 8/20, open questions 6 of the way from 10 to 2 (50%), plan approved 1/1; objective progress is the mean (about 63%) and label "in progress". _(63%, 8/20 papers, 6/2 questions at 50%, 1/1 milestone)_
- [x] Sample Q4 objective 2 shows 0% and label "planned"; sample Q3 objective shows 100% and "done".
- [x] Archive shows the ongoing sample open; the completed sample sits in a collapsed `<details>` labelled with its count ("Completed (1)"); each entry has a working link, summary and body.
- [x] Every entry has an Edit link whose URL matches its source file under `content/` (checked for all 8 sample/real entries, including both goals files). _(8 distinct files)_
- [ ] Edit links open in a new tab with `rel="noopener"`, and resolve on GitHub after the branch rename (checked by hand once). _(new-tab and `rel` verified; the GitHub resolution needs the user to click one Edit link while logged in)_
- [x] Feedback shows the open sample before the addressed one; requirements shows the real entry with status open.
- [x] Every `sample: true` entry has a SAMPLE badge; the real requirement does not. _(7 badges)_
- [x] Audience appears as text on each entry.
- [x] Links and anchors carry the `/Research_portal/` base; `/supervisor/` and `/public/` still render and still show the stub notice; `/` does not.
- [x] External links use `rel="noopener"`.
- [x] An empty section renders its "Nothing here yet" line (tested once by temporarily removing a collection's entries, then reverted).

## Decrypted-state behaviour (Chromium, `build:protected` with throwaway passwords, not committed)
- [x] After entering the researcher password, clicking each table-of-contents link scrolls to its section.
- [x] Loading `/#goals` and `/#archive` after login lands on the section (or, if the browser does not jump after decryption, this is documented as a known limit). _(browser jumps after decryption; scrollY 512 and 1437)_
- [x] `<details>` for past quarters and completed archive entries toggle in the decrypted page.

## Look (Apple-style, minimalistic)
- [x] No hard-coded colours in components or pages; all colours come from `tokens.css` variables. _(`scripts/check-colours.ts`, part of `npm run check`)_
- [x] System font stack only; no web font file, Apple font, icon or logo is added.
- [x] Light and dark mode both render correctly (switch the OS/browser setting); text contrast is at least 4.5:1 in both (computed). _(screenshots reviewed; contrast computed by `check-contrast.ts`)_
- [ ] The one-off visual check shows generous whitespace, thin dividers, rounded cards and subtle bars, and is reviewed by the user. _(my own review done; user review pending)_

## Visual check (one-off, not committed)
- [x] At desktop and phone width: no horizontal scroll, text readable, bars visible, `<details>` toggles. _(Chromium, light and dark)_
- [x] Status and progress are readable without colour (text labels present). _(text badges and percentages)_

## Repository hygiene
- [x] No `node_modules/`, `dist/` or `.astro/` committed; no screenshots committed.
- [x] `summaryPlain` is not rendered anywhere on `/`.
- [x] `specs/roadmap.md` Phase 2 reflects reality.
- [x] README notes that `/` is password-gated while raw `content/` is public, and warns against real names and sensitive feedback.
- [x] `npm run build:protected` still succeeds with the new page: `dist/index.html` is ciphertext and the leak check passes.
- [ ] After merge: manual deploy succeeds; the live `/` shows the password prompt and, after entering the researcher password, matches the local plain build.

## Not required for merge
Supervisor and external views, Kanban, role switching, polish, link checking.

## Definition of done
All boxes checked and CI green. A rendering check that cannot be made to pass must be fixed in the component, not waived.
