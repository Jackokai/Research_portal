# Roadmap

Phases are ordered by dependency, not dates (the README gives none). Each phase should be shippable on its own.

## Phase 0: Foundations
- [x] Confirm open decisions in `tech-stack.md` (access control, Kanban tool, editing workflow)
- [x] Add README.md (done) and these specs
- [x] Scaffold site, CI build, Pages deploy workflow (manual trigger; live deploy verified 2026-10-09, see `2026-10-09-site-scaffold/validation.md`)

## Phase 1: Content model
- [x] Define schemas: vision, quarterly goals (as OKRs), archive entries, feedback, requirements
- [x] Migrate README placeholders into `content/` with an `audience` field (as sample entries)
- [x] CI validates schemas (link checking deferred, see `2026-10-09-content-model/requirements.md`)
- [ ] CI validates links (deferred)

## Phase 1b: Private views (password gate)
Inserted before Phase 2 so private content is never rendered on an open URL. Spec: `2026-10-09-private-views/`.
- [x] Design tokens (light + dark) and a login page
- [x] Build-time password protection of `/` and `/supervisor/` (one password each); `/public/` stays open
- [x] CI leak check; deploy fails closed without secrets (verified live: runs #4 and #5 failed before upload, #6 succeeded)
- [x] README documents setup and limits (public repo means raw `content/` is public)

## Phase 2: Researcher workspace
Depends on Phase 1b. Applies the design tokens (Apple-style look).
- [x] Vision, quarterly goals (current + past), archive (ongoing / completed)
- [x] Feedback log and requirements with status (live deploy and user review pending; spec `2026-10-09-researcher-workspace/`)

## Phase 3: Supervisor view
- [x] Orientation page: current goals and recent archive items (update cadence and contact were dropped on 2026-10-09; the Kanban is the channel. Original text: commit `e3d8b49`)
- [x] Kanban board integration (view, add cards, comment): link out to the GitHub Project plus an "Add a card" link; no embed or sync
- [x] Feedback items visible with open/addressed status, behind a feature toggle that is off by default (the Kanban covers day-to-day feedback)

## Phase 4: External view
- [ ] Plain-language summary page (no jargon): the vision's plain summary plus published research; original README guidance in commit `e3d8b49`. No automated jargon check, only length bounds and a review checklist
- [ ] Applications, reusable outputs, links to demos/datasets/tools: an `outputs` list on archive entries
- [ ] Review step: external content flagged as publishable before it appears: two keys (`external` audience and `publishable: true`), samples never published, plus a post-build guard. Spec: `2026-10-09-external-view/`

## Phase 5: Role-aware UI (the open requirement in README)
- [ ] Single navigation that switches lens (researcher / supervisor / external)
- [ ] Verify the same source content renders in all views without duplication
- [ ] Close the README requirement once accepted by the researcher

## Phase 6: Polish
- [ ] Accessibility and mobile pass
- [ ] Automated stale-content warning (e.g. goals past target date, no update within cadence)

## Risks
- Public hosting exposing unreleased research (see `tech-stack.md`)
- Portal goes stale if updates feel like extra work, so Phase 2 editing ergonomics matter most
- Supervisors may not engage with GitHub; validate early with them
