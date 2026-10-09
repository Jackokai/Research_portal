# Validation: Content Model

Mergeable when every item passes. Put command output or run links in the PR description.

## Automated
- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm run check` exits 0 on the sample content.
- [ ] `npm run build` exits 0; the three stub pages still build under `/Research_portal/`.
- [ ] CI is green on the final commit.

## Schema rejection (each tried once with a deliberately bad file, then reverted)
Each must fail `check` or `build`, with a message naming the file and field.
- [ ] Missing `audience`, empty `audience`, or an unknown audience value.
- [ ] Malformed date (`2026-13-40`, `10/09/2026`).
- [ ] `external` in `audience` without `summaryPlain`.
- [ ] Archive entry `completed` without `completedOn`, and `ongoing` with `completedOn`.
- [ ] Unknown field (e.g. a typo such as `stauts`).
- [ ] Invalid `status` value in goals, archive, feedback and requirements.
- [ ] Zero current quarters, and two current quarters.
- [ ] Goals: a stored `status` field on an objective or key result (must be rejected, status is derived).
- [ ] Goals: `target` equal to `start`; `endDate` outside the named quarter.
- [ ] Goals: 0 or 6 objectives; 1 or 6 key results in an objective.
- [ ] Goals: `external` audience with an objective lacking `summaryPlain`.

## OKR derivation (unit tests, run in CI or documented if run locally)
- [ ] Progress for an increasing KR (0 → 3, current 1 gives 1/3).
- [ ] Progress for a decreasing KR (10 → 2, current 6 gives 0.5).
- [ ] Milestone KR (0 → 1) gives 0 or 1.
- [ ] Clamping: current beyond target gives 1; before start gives 0.
- [ ] Objective progress equals the mean of its KRs.
- [ ] Derived label: planned / in progress / done for the three cases.

## Content migration
- [ ] The goals sample files are valid OKRs and include a decreasing KR and a milestone KR.
- [ ] Every README section maps to a collection, or is listed under "Known gap" with its destination phase.
- [ ] The README's role-aware-interface requirement exists in `content/requirements/` with status open.
- [ ] All placeholder-derived entries are marked `sample: true` and visibly SAMPLE.
- [ ] Sample feedback uses fictitious names; no emails, tokens or real personal data in `content/`.

## README
- [ ] README no longer duplicates content held in `content/`.
- [ ] Project description, site link, "Developing" and "Editing content" sections are present and accurate.
- [ ] Original README text is recoverable from git history (the commit is referenced in the PR).

## Repository hygiene
- [ ] No `node_modules/`, `dist/` or `.astro/` committed.
- [ ] `specs/roadmap.md` Phase 1 reflects reality; deferred items are noted.
- [ ] Live site still deploys: manual deploy run after merge, three pages load.

## Not required for merge
Rendering content, link checking, styling, real research content.

## Definition of done
All boxes checked and CI green. A rejection case that cannot be made to fail must be fixed in the schema, not waived.
