# Tech Stack

> The README prescribes no technology. Everything below is a **proposal** derived from its requirements, except the decisions recorded here.

## Decisions made
- **Privacy:** not required initially. Repo is now public (2026-10-09), which makes free GitHub Pages available; Cloudflare/Netlify not needed. No unpublished or sensitive material goes in the repo.
- **Researcher:** single researcher.
- **Kanban/collaboration:** GitHub (Projects + Issues). Supervisors create a GitHub account if they don't have one.
- **External audience:** read-only static page, no account needed. Feedback from outsiders is out of scope for now (would need an account for Issues, or a separate mailto/form).
- **Build vs. buy:** GitHub is the backend (storage, auth, comments, history); the role-aware front end is custom.

## Constraints derived from the README
- Content lives in the repository (it "is the presentation tool").
- One source of truth rendered through three role-aware views.
- Kanban cards with owners, descriptions, links and supervisor comments.
- Researcher edits must be low-friction.

## Proposed stack
| Concern | Choice | Rationale |
|---------|--------|-----------|
| Content format | Markdown + YAML front matter, in `content/` | Plain text, diffable, editable anywhere |
| Structured data | YAML files (goals, feedback, requirements) | Tables in README become validated data, not hand-edited Markdown tables |
| Site generator | Astro (static output) | Content collections with schemas, per-audience pages from one source, no server |
| Language | TypeScript | Typed content schemas |
| Styling | Plain CSS / Tailwind | Simple, themeable per view |
| Hosting | GitHub Pages via GitHub Actions | Free, lives with the repo |
| Kanban | GitHub Projects (board) linked/embedded; cards link to Issues | Supervisors already can add cards and comment natively; avoids building a collaboration backend |
| Feedback intake | GitHub Issues with a label/template | Dated, attributed, status = open/closed |
| CI | GitHub Actions: build, schema validation, link check | Keeps content valid |

## Role-aware views
Static pages generated from the same collections, filtered by a `audience` field in front matter (`researcher | supervisor | external`):
- `/` researcher workspace
- `/supervisor` overview + board link
- `/public` plain-language view

## Revisit later
- Access control if private content is ever needed: private repo with private Pages, auth in front (e.g. Cloudflare Access), or publish only the external view.
- Whether the researcher needs a UI editor instead of Markdown/YAML.
- Astro vs. a lighter generator; Astro is proposed for typed content collections, not the only option.

## Out of scope
Custom backend, database, user management, real-time sync.
