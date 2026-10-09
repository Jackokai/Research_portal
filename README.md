# Research Repository

A living workspace for tracking research progress, collaborating with supervisors, and sharing results with external audiences.

## Table of Contents

- [Vision](#vision)
- [Quarterly Goals](#quarterly-goals)
- [Kanban Board](#kanban-board)
- [Research Archive](#research-archive)
- [For Supervisors](#for-supervisors)
- [For External Audience](#for-external-audience)
- [Feedback & Requirements](#feedback--requirements)

---

## Vision

[One short paragraph describing the long-term aim of the research.  
What problem are you solving, and why does it matter?]

---

## Quarterly Goals

### Current Quarter (Q[X] YYYY)

| Goal | Status | Target Date |
|------|--------|-------------|
| [Goal 1] | Planned / In Progress / Done | YYYY-MM-DD |
| [Goal 2] | Planned / In Progress / Done | YYYY-MM-DD |
| [Goal 3] | Planned / In Progress / Done | YYYY-MM-DD |

<details>
<summary>Past Quarters</summary>

### Q[X] YYYY
- Goal A — Done
- Goal B — Done

</details>

---

## Kanban Board

Primary channel for day-to-day interaction between researcher and supervisors.

| To Do | In Progress | Done |
|-------|-------------|------|
| [Card title](link)  <br> Owner: …  <br> Short description | [Card title](link)  <br> Owner: …  <br> Short description | [Card title](link)  <br> Owner: …  <br> Short description |

Supervisors can add new cards or leave comments directly on existing ones.

---

## Research Archive

### Completed Research
- **[Title]** (YYYY-MM-DD)  
  One-paragraph summary.  
  [Link to full output]

### Ongoing Research
- **[Title]**  
  One-paragraph summary of the active thread.  
  [Link to current materials]

---

## For Supervisors

**Quick orientation**
1. Start with the current [Quarterly Goals](#quarterly-goals).
2. Use the [Kanban Board](#kanban-board) for day-to-day interaction (add cards, leave comments).
3. Review recent items in the [Research Archive](#research-archive).

Updates are expected on a [weekly / bi-weekly] cadence.  
Preferred contact: [email / Slack / etc.].

---

## For External Audience

Plain-language summary of the research: what it is about, why it matters, and what someone outside the field can take away or reuse.

- No jargon.
- Clear statement of potential applications or reusable outputs.
- Links to demos, datasets, tools, or public materials (if available).

---

## Feedback & Requirements

### Feedback Log
| Date | From | Feedback | Status |
|------|------|----------|--------|
| YYYY-MM-DD | [Name / Role] | [Summary of comment] | Open / Addressed |

### Requirements (raised by researcher)

| Date | Requirement | Status |
|------|-------------|--------|
| YYYY-MM-DD | Intuitive, role-aware user interface that presents the research appropriately depending on the audience (researcher workspace, supervisor overview + Kanban interaction, external layman’s view). The same underlying content should be accessible through different lenses so the repository itself becomes the presentation tool. | Open |

---

*This repository is designed so that the same source of truth can serve the researcher, supervisors, and external audiences through a clean, role-aware interface.*

---

## Developing

Requires Node 22 (see `.nvmrc`).

```bash
npm ci            # install
npm run dev       # local dev server
npm run check     # typecheck
npm run build     # build to dist/
npm run preview   # serve the build at /Research_portal/
```

- **CI** runs `check` and `build` on every pull request.
- **Deploy** is manual: Actions > "Deploy to GitHub Pages" > Run workflow. One-time setup: repo Settings > Pages > Source: GitHub Actions. To deploy automatically on merge, add `push: { branches: [<default-branch>] }` (the repo's default branch) to `.github/workflows/deploy.yml`.
- Live site: https://jackokai.github.io/Research_portal/
