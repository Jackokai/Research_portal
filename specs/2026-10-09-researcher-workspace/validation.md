# Validation: Researcher Workspace

Mergeable when every item passes. Put command output or run links in the PR description.

## Automated
- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm run check` exits 0.
- [ ] `npm test` passes, including new ordering and formatting tests.
- [ ] `npm run build` exits 0 and still produces the three pages.
- [ ] CI is green on the final commit.

## Unit tests cover
- [ ] Goals: current quarter first, then newest to oldest.
- [ ] Archive: ongoing before completed; completed by `completedOn` descending.
- [ ] Feedback and requirements: open before closed; newest first within each.
- [ ] Percent formatting: 1/3 gives 33%, 0.5 gives 50%, 1 gives 100%.
- [ ] Key result text: `current / target unit`.

## Rendered output (plain build, `dist/index.html`)
- [ ] Sections appear in order: vision, goals, archive, feedback, requirements, with a table of contents whose anchors resolve.
- [ ] Current quarter (2026-Q4) is expanded; 2026-Q3 sits inside a collapsed `<details>`.
- [ ] Sample Q4 objective 1 shows the correct derived values: papers 8/20, open questions 6 of the way from 10 to 2 (50%), plan approved 1/1; objective progress is the mean (about 63%) and label "in progress".
- [ ] Sample Q4 objective 2 shows 0% and label "planned"; sample Q3 objective shows 100% and "done".
- [ ] Archive shows the ongoing sample before the completed one, each with a working link, summary and body.
- [ ] Feedback shows the open sample before the addressed one; requirements shows the real entry with status open.
- [ ] Every `sample: true` entry has a SAMPLE badge; the real requirement does not.
- [ ] Audience appears as text on each entry.
- [ ] Links and anchors carry the `/Research_portal/` base; `/supervisor/` and `/public/` still render and still show the stub notice; `/` does not.
- [ ] External links use `rel="noopener"`.
- [ ] An empty section renders its "Nothing here yet" line (tested once by temporarily removing a collection's entries, then reverted).

## Look (Apple-style, minimalistic)
- [ ] No hard-coded colours in components or pages; all colours come from `tokens.css` variables.
- [ ] System font stack only; no web font file, Apple font, icon or logo is added.
- [ ] Light and dark mode both render correctly (switch the OS/browser setting); text contrast is at least 4.5:1 in both (computed).
- [ ] The one-off visual check shows generous whitespace, thin dividers, rounded cards and subtle bars, and is reviewed by the user.

## Visual check (one-off, not committed)
- [ ] At desktop and phone width: no horizontal scroll, text readable, bars visible, `<details>` toggles.
- [ ] Status and progress are readable without colour (text labels present).

## Repository hygiene
- [ ] No `node_modules/`, `dist/` or `.astro/` committed; no screenshots committed.
- [ ] `summaryPlain` is not rendered anywhere on `/`.
- [ ] `specs/roadmap.md` Phase 2 reflects reality.
- [ ] README notes that `/` is password-gated while raw `content/` is public, and warns against real names and sensitive feedback.
- [ ] `npm run build:protected` still succeeds with the new page: `dist/index.html` is ciphertext and the leak check passes.
- [ ] After merge: manual deploy succeeds; the live `/` shows the password prompt and, after entering the researcher password, matches the local plain build.

## Not required for merge
Supervisor and external views, Kanban, role switching, polish, link checking.

## Definition of done
All boxes checked and CI green. A rendering check that cannot be made to pass must be fixed in the component, not waived.
