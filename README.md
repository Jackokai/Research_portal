# Research Repository

A living workspace for tracking research progress, collaborating with supervisors, and sharing results with external audiences. One source of truth, shown through three role-aware views (researcher, supervisor, external).

Live site: https://jackokai.github.io/Research_portal/

- **Content** lives in [`content/`](content/) and is validated on every build.
- **Specs** (mission, tech stack, roadmap, per-feature plans) live in [`specs/`](specs/).
- The original README template (vision, quarterly goals, Kanban, archive, supervisor and external sections, feedback) is preserved in git history at commit `e3d8b49`.

## Editing content

| Folder | What | Format |
|--------|------|--------|
| `content/vision/` | Long-term aim | Markdown with front matter |
| `content/goals/` | One file per quarter, as OKRs (`2026-q4.yaml`) | YAML |
| `content/archive/` | One file per research item, ongoing or completed | Markdown with front matter |
| `content/feedback/` | One file per piece of feedback | YAML |
| `content/requirements/` | One file per requirement raised by the researcher | YAML |

Rules the build enforces (errors name the file and field):
- Every entry has `audience`: a list of `researcher`, `supervisor` and/or `external`.
- If `audience` includes `external`, add `summaryPlain` (plain-language text for outsiders). For goals this goes on each objective.
- **Dates must be quoted**: `date: "2026-10-01"`. Unquoted YAML dates are rejected, because an impossible one such as `2026-13-40` was observed to pass validation.
- Goals are OKRs: 1-5 objectives per quarter, 2-5 key results each, with numeric `start`, `target` and `current`. A milestone is `start: 0, target: 1`. Status is never stored; progress is computed from the numbers. Exactly one quarter has `current: true`, and the file name matches the quarter (`2026-Q4` is `2026-q4.yaml`).
- Unknown fields are rejected, so typos fail the build.

Entries marked `sample: true` (and "SAMPLE" in their text) are placeholders from the original template. Replace or delete them.

## Developing

Requires Node 22 (see `.nvmrc`).

```bash
npm ci            # install
npm run dev       # local dev server
npm run check     # typecheck, content schemas, cross-file content rules
npm test          # unit tests (OKR progress)
npm run build     # build to dist/
npm run preview   # serve the build at /Research_portal/
```

- **CI** runs `check`, `test` and `build` on every pull request.
- **Deploy** is manual: Actions > "Deploy to GitHub Pages" > Run workflow. To deploy automatically on merge, add `push: { branches: [<default-branch>] }` (the repo's default branch) to `.github/workflows/deploy.yml`.
