# Validation: Supervisor View

Mergeable when every item passes. Put command output or run links in the PR description.

## Automated
- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm run check`, `npm test` and `npm run build` pass.
- [ ] `npm run build:protected` passes with throwaway passwords; the leak check passes with the new page.
- [ ] CI is green on the final commit.

## Settings and helpers (unit tests)
- [ ] Settings defaults: feedback off and no board URL when the file omits them.
- [ ] A malformed board URL, an unknown key, or a non-boolean toggle fails the build with the file and field named.
- [ ] `forAudience` keeps only entries listing `supervisor`.
- [ ] `recentCompleted`: 3 newest by `completedOn`; fewer than 3 returns all; none returns empty; ties broken by id.
- [ ] `currentQuarter` returns the one current quarter; none returns undefined.
- [ ] `newCardUrl` points at the repo's `issues/new` with the card template.

## Rendered output (`dist/supervisor/index.html`, plain build)
- [ ] Orientation list present with the three steps.
- [ ] Kanban block with no board URL shows "Board link not set" and no broken "Open board" link; "Add a card" link present and pointing at the issue template.
- [ ] With a board URL set (temporarily, then reverted) "Open board" links to it with `rel="noopener"` and opens in a new tab.
- [ ] The note that cards are public issues is shown next to "Add a card".
- [ ] Current quarter (2026-Q4) only; objective progress and labels match `/` (63% In progress, 0% Planned); no past quarter.
- [ ] Archive shows ongoing entries plus at most the 3 latest completed; no `<details>` required for fewer entries.
- [ ] No Edit links anywhere on the page.
- [ ] No researcher-only text anywhere in the HTML: the researcher-only archive sample's title and body, and the requirement text, are absent.
- [ ] No `summaryPlain` text and no vision section.
- [ ] Nav and anchors carry the `/Research_portal/` base; no stub notice on `/supervisor/`; `/public/` still shows its stub notice.

## Feedback toggle
- [ ] Default (off): no Feedback section and no TOC link on `/` or on `/supervisor/`.
- [ ] Turned on (temporarily, then reverted): Feedback appears on `/` (open first) and on `/supervisor/` with open/addressed badges, supervisor-audience entries only.
- [ ] The feedback collection, schema and sample entries are untouched.

## Browser check (decrypted `/supervisor/`, Chromium, not committed)
- [ ] The supervisor password opens the page; the researcher password does not.
- [ ] Table-of-contents or section anchors work, and deep links land after login.
- [ ] Light and dark mode render correctly; no horizontal scroll at desktop and phone width.
- [ ] Reviewed by the user (screenshots).

## Repository hygiene
- [ ] No hard-coded colours (`npm run check`); no screenshots, `dist/`, `node_modules/` or `.astro/` committed.
- [ ] `.github/ISSUE_TEMPLATE/card.yml` parses as valid YAML and renders as a form on GitHub (checked by opening "New issue").
- [ ] README documents the toggle, the settings file, Kanban setup, and that Issues are public.
- [ ] `specs/roadmap.md` Phase 3 reflects reality, including feedback being off by default.

## Live (after merge and a deploy)
- [ ] `/supervisor/` shows the page (or the prompt when protected) and, once a board URL is set, "Open board" works.
- [ ] "Add a card" opens a new issue with the template.
- [ ] After merge: manual deploy succeeds.

## Not required for merge
Creating the GitHub Project board itself, auto-add workflows, feedback sync, cadence and contact, past quarters on the supervisor page.

## Definition of done
All boxes checked and CI green. If the board does not exist yet, the placeholder state is the accepted outcome and "Open board" is verified with a temporary URL instead.
