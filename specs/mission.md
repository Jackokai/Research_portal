# Mission

## Purpose
Research Portal is a living workspace where one researcher tracks progress, collaborates with supervisors, and shares results with outsiders, all from a single source of truth.

## Problem
Research status is usually scattered across notes, slides, emails and chat. Each audience gets a separately maintained (and quickly stale) view. Supervisors can't see current state without asking; outsiders can't understand the work at all.

## Core idea
The repository is the presentation tool. The same content is exposed through role-aware lenses rather than duplicated per audience.

## Audiences
| Audience | Needs | Lens |
|----------|-------|------|
| Researcher | Fast capture and editing of goals, tasks, archive, feedback | Workspace |
| Supervisors | Quick orientation; day-to-day interaction (add cards, comment) | Overview + Kanban |
| External | Plain-language summary, reusable outputs, no jargon | Layman's view |

## Content model (from README)
Vision · Quarterly Goals · Kanban Board · Research Archive (completed / ongoing) · Supervisor orientation · External summary · Feedback Log · Requirements.

## Principles
1. **Single source of truth.** Content is written once; views are derived, never copied.
2. **Role-aware presentation.** Each audience sees only what is relevant to them, in suitable language.
3. **Low friction for the researcher.** If updating is a chore, the portal goes stale. Editing should be plain text/Markdown.
4. **Kanban is the primary interaction channel** between researcher and supervisors.
5. **Plain language externally.** No jargon; state applications and reusable outputs explicitly.
6. **Everything traceable.** Feedback and requirements carry a date, source and status.

## Success criteria
- A supervisor can understand current status within minutes, without asking the researcher.
- A non-expert can state what the research is about and why it matters after reading the external view.
- Updating the portal adds no meaningful work beyond doing the research.
- No content is maintained in more than one place.

## Non-goals
- Not a general-purpose project management tool or multi-project platform.
- Not a publication/reference manager.
- Not a replacement for the research outputs themselves; it links to them.

## Open questions
- Access control: researcher and supervisor views are password-gated (Phase 1b); raw content in the public repo is not private. Real privacy is an open item before real content is added.
- Single researcher (decided).
- Update cadence expected by supervisors (README leaves "weekly / bi-weekly" undecided).
