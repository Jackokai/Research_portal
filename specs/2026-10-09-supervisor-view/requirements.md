# Requirements: Supervisor View

Roadmap: Phase 3. Guidance: `specs/mission.md` (supervisors understand status in minutes; the Kanban is the primary researcher-supervisor channel; role-aware lenses from one source), `specs/tech-stack.md` (static site, GitHub Projects and Issues for collaboration, password gate from Phase 1b).

## Goal
Turn the `/supervisor/` stub into an orientation page: current goals, recent research, and a clear path to the Kanban board, built from the same content as the researcher workspace and filtered by audience.

## In scope
- `/supervisor/` page: short orientation, Kanban block, current-quarter OKRs, archive summary, and (when switched on) feedback.
- Audience filtering: only entries whose `audience` includes `supervisor` reach this page.
- Kanban block: "Open board" link, "Add a card" link (pre-filled new issue), and a clear "board link not set" state until the board URL is configured.
- A `settings` content file holding the board URL and a feature toggle for feedback.
- The feedback toggle, **default off**, applied to both `/` and `/supervisor/`.
- A GitHub issue template for board cards.

## Out of scope
- Embedding or syncing the board (GitHub Projects boards generally cannot be embedded; no token, no API, no build-time snapshot).
- Update cadence and a contact line (declined; the Kanban is the channel, ad hoc meetings are recorded as cards).
- Feedback intake and sync from issues (feedback is being de-emphasised; see toggle).
- Past quarters, vision and requirements on the supervisor page.
- Edit links on the supervisor page (supervisors do not edit content).
- The external view and role-switching navigation (Phases 4-5).

## Decisions (feature interview, 2026-10-09)
| Topic | Decision |
|-------|----------|
| Kanban | Link out plus an "Add a card" link; no embed, no API |
| Board URL | Not created yet; ship with a placeholder state, configured later in `settings` |
| Feedback | Feature toggle, **default off**, hides the Feedback section and its table-of-contents link on both views; the collection, schema and sample entries stay so it can be switched back on |
| Cadence / contact | Neither; the Kanban is the channel |
| Supervisor scope | Summary: current-quarter OKRs, ongoing archive plus the 3 most recent completed, feedback when the toggle is on |
| Orientation text | The three steps from the original README ("start with the goals, use the board, review recent items") |

## Behaviour
- **Filtering:** `audience` includes `supervisor` is the only gate. Researcher-only entries must not appear anywhere in the supervisor page's HTML, so the separation holds even when the password is switched off.
- **Orientation:** a short numbered list: 1. start with the current goals; 2. use the Kanban board for day-to-day interaction (add cards, leave comments); 3. review recent research.
- **Kanban block:** "Open board" (the configured URL) and "Add a card" (a new-issue link using the card template). With no board URL configured, "Open board" is replaced by a visible "Board link not set" note; "Add a card" still works.
- **Goals:** current quarter only, objectives with derived label, progress bar and key results, as on `/` but without Edit links.
- **Archive:** all ongoing entries plus the 3 most recent completed (by `completedOn`, newest first), without Edit links. Summaries and bodies as on `/`.
- **Feedback (toggle on):** supervisor-audience entries, open first then newest, with status badges.
- **Toggle off:** no Feedback section and no TOC entry on `/`; none on `/supervisor/`.
- **`summaryPlain`** is not rendered (external view, Phase 4).

## Proposed settings design (assumptions, review in PR)
- `content/settings.yaml`, strict schema in `src/content.config.ts`: `features.feedback` (boolean, default false) and `board.url` (optional URL).
- Settings are site configuration, not research content, so they are **exempt from the `audience` rule**. They are edited the same way as all content.
- Because the site is static, a change to settings takes effect only after the next deploy.
- "Add a card" link: `https://github.com/Jackokai/Research_portal/issues/new?template=card.yml`, built from `src/lib/repo.ts`.

## Context and constraints
- `/supervisor/` is encrypted with the supervisor password in production (Phase 1b). The deploy has a per-run opt-out used while testing with sample content.
- The repo and its Issues are public. Cards created as issues, and supervisors' comments on them, are public unless the Project/Issues setup is changed. Supervisors need GitHub accounts (decided earlier).
- A board only receives a new issue automatically if the Project has an auto-add workflow. Whether that is available on the current plan is unverified; without it, the researcher adds cards to the board by hand.
- Sample content: Q4 and Q3 goals and both archive entries include `supervisor`; the requirement is researcher-only. One researcher-only archive sample is added to prove the filter.
- The Phase 2 feedback section exists and has been validated; this phase changes its default to hidden.

## Risks
- **Public Issues.** "Add a card" opens a public issue. Supervisors may not expect their comments to be public. The page says so next to the link.
- **Board visibility.** A private Project needs supervisors invited; a public Project is world-readable. Decide when the board is created.
- **Silent filter failure.** A wrong audience check would leak researcher-only text. Mitigated by unit tests and a leak check against the built page.
- **Toggle surprise.** Feedback disappears from `/` by default, which changes Phase 2's behaviour. Stated here and in the README.
- **Settings are public** in the repo. Only a board URL and a boolean live there.

## Open questions
- Whether the Project board should be public or private (decided when it is created).
- Whether "Add a card" should offer separate templates (meeting note, question). Single template for now.
