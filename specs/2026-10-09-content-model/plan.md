# Plan: Content Model

Each group is one reviewable commit.

## 1. Collections and schemas
1. Add `src/content.config.ts` defining the five collections with loaders for `content/`.
2. Shared Zod pieces: `audience` array (non-empty enum), date string (`YYYY-MM-DD`, real calendar date), `sample` flag.
3. Per-collection schemas as in `requirements.md`, strict (unknown keys rejected).
4. Goals schema as OKRs: nested `objectives[]` and `keyResults[]` with the count bounds from `requirements.md`.
5. Cross-field rules: `summaryPlain` required for `external` (per objective for goals); `completedOn` iff completed; `target != start`; `endDate` inside the named quarter.
6. Cross-entry rule: exactly one `current` quarter (checked where practical, otherwise by a small script run in CI; decide during implementation and record it).
7. `src/lib/okr.ts`: key result progress, objective progress and derived label, as defined in `requirements.md`. Unit-tested (Node's built-in test runner if it can run the TypeScript directly, otherwise a minimal alternative; record the choice).

## 2. Sample content
1. `content/vision/vision.md` from the README vision placeholder, marked SAMPLE.
2. `content/goals/2026-q4.yaml` (current) and one past-quarter file, rewritten from the README goal tables as OKRs (at least one objective with a decreasing-metric KR and one milestone KR), marked SAMPLE.
3. `content/archive/` one ongoing and one completed entry, marked SAMPLE.
4. `content/feedback/` one open and one addressed entry, marked SAMPLE, fictitious names.
5. `content/requirements/` the README's role-aware-interface requirement, real, status open.

## 3. Validation in CI
1. Confirm `npm run check` / `npm run build` fail on invalid content with a message naming file and field (add a `content:check` script via `astro sync` if that gives a faster, clearer failure).
2. Update `.github/workflows/ci.yml` only if a new step is needed.
3. Exercise the failure cases listed in `validation.md` once locally, then revert.

## 4. README slim-down
1. Replace template sections with: project description, link to the live site, pointer to `content/` and `specs/`, and the existing "Developing" section.
2. Add a short "Editing content" note: where each type lives, the `audience` field, how to mark/remove sample entries.
3. Confirm nothing that was only in the README is lost (see Known gap).

## 5. Roadmap and docs
1. Tick Phase 1 items (note that goals are OKRs) in `specs/roadmap.md` (link check noted as deferred).
2. Add the deferred README sections (cadence/contact, external summary) to Phases 3 and 4.
3. Record final schema decisions in `requirements.md` if implementation changed them.
