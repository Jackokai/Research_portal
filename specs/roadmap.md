# Roadmap

Phases are ordered by dependency, not dates (the README gives none). Each phase should be shippable on its own.

## Phase 0: Foundations
- [x] Confirm open decisions in `tech-stack.md` (access control, Kanban tool, editing workflow)
- [x] Add README.md (done) and these specs
- [x] Scaffold site, CI build, Pages deploy workflow (manual trigger; live deploy verification pending, see `2026-10-09-site-scaffold/validation.md`)

## Phase 1: Content model
- [ ] Define schemas: vision, quarterly goals, archive entries, feedback, requirements
- [ ] Migrate README placeholders into `content/` with an `audience` field
- [ ] CI validates schemas and links

## Phase 2: Researcher workspace
- [ ] Vision, quarterly goals (current + past), archive (ongoing / completed)
- [ ] Feedback log and requirements with status

## Phase 3: Supervisor view
- [ ] Orientation page: current goals, recent archive items, update cadence, contact
- [ ] Kanban board integration (view, add cards, comment)
- [ ] Feedback items visible with open/addressed status

## Phase 4: External view
- [ ] Plain-language summary page (no jargon)
- [ ] Applications, reusable outputs, links to demos/datasets/tools
- [ ] Review step: external content flagged as publishable before it appears

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
