# Validation: External View

Mergeable when every item passes. Put command output or run links in the PR description.

## Automated
- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm run check`, `npm test` and `npm run build` pass.
- [ ] `npm run build:protected` passes with throwaway passwords, including the new external guard.
- [ ] CI is green on the final commit.

## Selection (unit tests)
- [ ] An entry is published only with `external`, `publishable: true` and not `sample`.
- [ ] Each missing condition on its own keeps the entry out (three cases).
- [ ] A sample flagged `publishable: true` is still excluded.
- [ ] Ordering: ongoing before completed; completed newest first; ties by id.
- [ ] No entries, or none published, gives an empty list.

## Schema (each tried once with a bad file, then reverted; message names file and field)
- [ ] `publishable: true` without `external` in `audience`.
- [ ] A publishable entry with `summaryPlain` shorter than 20 or longer than 600 characters.
- [ ] An output with a non-https URL, an unknown `kind`, a missing `title`, or an unknown key.
- [ ] `publishable` on a goals, feedback or requirements entry (unknown key).

## Rendered output with temporary non-sample fixtures (reverted afterwards)
- [ ] The published vision's `summaryPlain` is shown; its body is not.
- [ ] The published archive entry shows title, status and date, `summaryPlain` and outputs; its `summary`, body and `link` are absent.
- [ ] Outputs show kind label, title and an https link with `target="_blank"` and `rel="noopener noreferrer"`.
- [ ] A draft (`external` without `publishable`) is absent, text and title.
- [ ] An entry without `external` is absent even with `publishable: true` blocked by the schema (covered above).
- [ ] No goals, feedback, requirements, progress numbers, audience badges, SAMPLE badges or Edit links.
- [ ] Ongoing entries appear before completed ones.

## Rendered output with the real content
- [ ] With nothing published, `/public/` shows the empty state and no sample text.
- [ ] No sample entry's text appears anywhere in `dist/public/index.html`.
- [ ] Nav links carry the `/Research_portal/` base; no stub notice on `/public/`; the other views are unchanged.

## Guards
- [ ] `scripts/check-external.ts` passes on the clean build.
- [ ] It fails (exit 1, naming the fragment) when each of these is deliberately leaked into the page: a draft's text, a published entry's `summary`, its body, its `link`, a feedback text, a requirement text, a researcher-only entry.
- [ ] It fails when a published entry's `summaryPlain` is missing from the page.
- [ ] `check-protected` still confirms `/public/` is plaintext and unmodified by the protect step.

## Researcher workspace
- [ ] An entry listing `external` shows "Published" or "Draft"; entries without `external` show neither.
- [ ] `/` and `/supervisor/` are otherwise unchanged.

## Browser (Chromium, not committed)
- [ ] `/public/` opens with no password, in light and dark, at desktop and phone width, with no horizontal scroll.
- [ ] Output links open in a new tab.
- [ ] Reviewed by the user (screenshots).

## Repository hygiene
- [ ] No hard-coded colours; no screenshots, `dist/`, `node_modules/` or `.astro/` committed.
- [ ] README explains how to publish, the plain-language checklist, and the limits.
- [ ] `specs/roadmap.md` Phase 4 reflects reality.

## Live (after merge and a deploy)
- [ ] `/public/` shows the empty state in a logged-out browser.
- [ ] After the researcher publishes one real entry and deploys, it appears with its outputs and nothing else from the content leaks.

## Not required for merge
Real content, jargon detection, goals on the external page, contact or feedback for outsiders.

## Definition of done
All boxes checked and CI green. The guard must be shown to fail on each deliberate leak; a leak it cannot catch is fixed in the guard, not waived.
