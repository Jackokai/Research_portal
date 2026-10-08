# Tech Stack

> The README prescribes no technology. Everything below is a **proposal** derived from its requirements. Items marked *Decision needed* must be confirmed before implementation.

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

## Key trade-off (Decision needed)
Static hosting on GitHub Pages is **public by default**; a "view" is not access control. If supervisor/researcher content must be private, options are: (a) private repo + Pages on a plan that supports private Pages, (b) put auth in front (e.g. Cloudflare Access), (c) publish only the external view and keep the rest repo-only. Until decided, assume **no confidential content in the repo**.

## Other decisions needed
1. Is GitHub Projects acceptable for supervisors (requires GitHub accounts)? Alternative: a Markdown board in-repo, which loses native commenting.
2. Is the researcher comfortable editing Markdown/YAML, or is a UI editor required?
3. Astro vs. a lighter option (plain Markdown + a small build script). Astro is proposed because of typed content collections; it is not the only viable choice.

## Out of scope
Custom backend, database, user management, real-time sync.
