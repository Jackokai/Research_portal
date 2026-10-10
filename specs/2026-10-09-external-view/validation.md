# Validation: External View

Mergeable when every item passes. Put command output or run links in the PR description.

## Automated
- [x] `npm ci` succeeds from a clean checkout. _(local install; CI re-runs it)_
- [x] `npm run check`, `npm test` and `npm run build` pass. _(79 tests)_
- [x] `npm run build:protected` passes with throwaway passwords, including the new external guard.
- [ ] CI is green on the final commit.

## Selection (unit tests)
- [x] An entry is published only with `external`, `publishable: true` and not `sample`.
- [x] Each missing condition on its own keeps the entry out (three cases).
- [x] A sample flagged `publishable: true` is still excluded. _(also shown end to end: it builds but is not on the page)_
- [x] Ordering: ongoing before completed; completed newest first; ties by id.
- [x] No entries, or none published, gives an empty list.

## Schema (each tried once with a bad file, then reverted; message names file and field)
- [x] `publishable: true` without `external` in `audience`.
- [x] A publishable entry with `summaryPlain` shorter than 20 or longer than 600 characters. _(19 and 601 characters)_
- [x] An output with a non-https URL, an unknown `kind`, a missing `title`, or an unknown key. _(http, javascript:, unknown kind, missing title, unknown key)_
- [x] `publishable` on a goals, feedback or requirements entry (unknown key).

## Rendered output with temporary non-sample fixtures (reverted afterwards)
- [x] The published vision's `summaryPlain` is shown; its body is not.
- [x] The published archive entry shows title, status and date, `summaryPlain` and outputs; its `summary`, body and `link` are absent.
- [x] Outputs show kind label, title and an https link with `target="_blank"` and `rel="noopener noreferrer"`.
- [x] A draft (`external` without `publishable`) is absent, text and title.
- [x] An entry without `external` is absent even with `publishable: true` blocked by the schema (covered above).
- [x] No goals, feedback, requirements, progress numbers, audience badges, SAMPLE badges or Edit links.
- [x] Ongoing entries appear before completed ones.

## Rendered output with the real content
- [x] With nothing published, `/public/` shows the empty state and no sample text.
- [x] No sample entry's text appears anywhere in `dist/public/index.html`.
- [x] Nav links carry the `/Research_portal/` base; no stub notice on `/public/`; the other views are unchanged. _(supervisor view re-checked; its board link is now set, so the old "Board link not set" assertions no longer apply)_

## Guards
- [x] `scripts/check-external.ts` passes on the clean build.
- [x] It fails (exit 1, naming the fragment) when each of these is deliberately leaked into the page: a draft's text, a published entry's `summary`, its body, its `link`, a feedback text, a requirement text, a researcher-only entry. _(injected into the page, and also through the real templates: rendering `summary`, `link`, a truncated `summary`)_
- [x] It fails when a published entry's `summaryPlain` is missing from the page. _(by dropping it from the template)_
- [x] `check-protected` still confirms `/public/` is plaintext and unmodified by the protect step.

## Researcher workspace
- [x] An entry listing `external` shows "Published" or "Draft"; entries without `external` show neither. _(vision and archive only: goals, feedback and requirements are never published, so they get no badge)_
- [x] `/` and `/supervisor/` are otherwise unchanged. _(supervisor regression passes; `/` checked for the badges, the Phase 2 script was not re-run because the sample data has since changed)_

## Browser (Chromium, not committed)
- [x] `/public/` opens with no password, in light and dark, at desktop and phone width, with no horizontal scroll.
- [x] Output links open in a new tab.
- [ ] Reviewed by the user (screenshots). _(my own review done; user review pending)_

## Repository hygiene
- [x] No hard-coded colours; no screenshots, `dist/`, `node_modules/` or `.astro/` committed.
- [x] README explains how to publish, the plain-language checklist, and the limits.
- [x] `specs/roadmap.md` Phase 4 reflects reality.

## Live (after merge and a deploy)
- [ ] `/public/` shows the empty state in a logged-out browser.
- [ ] After the researcher publishes one real entry and deploys, it appears with its outputs and nothing else from the content leaks.

## Not required for merge
Real content, jargon detection, goals on the external page, contact or feedback for outsiders.

## Definition of done
All boxes checked and CI green. The guard must be shown to fail on each deliberate leak; a leak it cannot catch is fixed in the guard, not waived.
