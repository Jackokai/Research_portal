# Plan: Supervisor View

Each group is one reviewable commit.

## 1. Settings
1. `content/settings.yaml` with `features.feedback: false` and no board URL.
2. A `settings` collection in `src/content.config.ts` (strict schema, one entry, no `audience`), documented as the one exception to the audience rule.
3. `src/lib/settings.ts`: pure parsing helpers with defaults (feedback off, board URL absent), unit-tested; `scripts/check-content.ts` unchanged unless the file needs a cross-check.

## 2. Selection helpers
1. `src/lib/select.ts`: `forAudience(entries, 'supervisor')`, `recentCompleted(entries, 3)` (by `completedOn`, newest first), `currentQuarter(entries)`.
2. Unit tests, including entries with no `supervisor` audience, fewer than 3 completed, and no current quarter.
3. `src/lib/repo.ts`: add `newCardUrl()` for the issue-template link, with tests.

## 3. Component changes
1. `EntryMeta`, `Quarter`, `ArchiveEntry` and `Feedback` gain an `editable` prop (default true); the supervisor page passes false.
2. A `KanbanBlock.astro` with the three states: board URL set, board URL missing, and the public-issues note next to "Add a card".

## 4. Supervisor page
1. `src/pages/supervisor.astro`: orientation list, Kanban block, current-quarter OKRs, archive summary, feedback when on. Remove the stub notice from this page.
2. Everything filtered through `forAudience`; no Edit links; `summaryPlain` not rendered.

## 5. Feedback toggle on the researcher page
1. `src/pages/index.astro`: hide the Feedback section and its TOC entry when the toggle is off.
2. Confirm the supervisor page follows the same switch.

## 6. Issue template and filter proof
1. `.github/ISSUE_TEMPLATE/card.yml` (name, short fields: what, why, optional date), plus `config.yml` allowing blank issues.
2. `content/archive/sample-researcher-only.md`: researcher-only sample entry, used to prove the filter.

## 7. Verification and docs
1. Build plain; check `dist/supervisor/index.html` against `validation.md`, including that no researcher-only text appears.
2. Build protected; run the browser check on the decrypted supervisor page (anchors, details, light/dark, phone width).
3. README: toggle, settings, Kanban setup (creating the board, auto-add note, public issues), supervisor page.
4. Roadmap Phase 3 items, `tech-stack.md` decisions.
