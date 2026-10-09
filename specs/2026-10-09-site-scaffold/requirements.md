# Requirements: Site Scaffold

Roadmap: Phase 0, remaining item "Scaffold site, CI build, Pages deploy".
Guidance: `specs/mission.md`, `specs/tech-stack.md`.

## Goal
Prove the full path from a Markdown/Astro source in the repo to a live public page, with CI guarding the build, before any real content or schemas exist (Phase 1).

## In scope
- Astro + TypeScript project at the repo root.
- Shared layout and three stub pages: `/` (researcher), `/supervisor`, `/public`. Each states its audience and links to the other two. No real content.
- Correct `site` and `base` for a GitHub Pages project site (`https://jackokai.github.io/Research_portal/`), so links work under the sub-path.
- GitHub Actions CI on pull requests: install, typecheck (`astro check`), build.
- GitHub Actions Pages deploy workflow.
- Short developer instructions (how to run, build, deploy) in a new `docs`-style section of the README or a `CONTRIBUTING`-free note; README content from the original file stays intact.

## Out of scope
- Content schemas, content migration, real page content (Phase 1+).
- Kanban integration, role-switching navigation, styling beyond a minimal readable layout.
- Link checking, accessibility audit, stale-content warnings.
- Access control (decided: not needed initially).

## Decisions (from the feature interview, 2026-10-09)
| Topic | Decision |
|-------|----------|
| Scope | Remaining Phase 0 only |
| Generator | Astro + TypeScript |
| Placeholder content | Three stub pages |
| CI gates | Build + typecheck only |
| Deploy trigger | **Manual** (`workflow_dispatch`), see note |

### Note on deploy
The roadmap lists "Pages deploy", but "deploy on merge" was not selected as a CI gate. To satisfy both, the deploy workflow exists and is verified, but runs only when triggered manually. Switching to automatic deploy on the default branch is a one-line trigger change and can be decided after first successful deploy.

## Context and constraints
- Public repo and public Pages are accepted; no sensitive material in the repo.
- Single researcher; supervisors use GitHub.
- Repository currently contains only `README.md` and `specs/`.
- Pages must be enabled once in repo settings (Source: GitHub Actions). This is a manual step outside the code.

## Assumptions to verify
- Default branch name (assumed `main`); confirm in repo settings.
- Repo owner/name for the Pages URL is `jackokai/Research_portal` (taken from the session's repo scope; case in the URL path matters).
- Node LTS is available in Actions; version pinned via `.nvmrc`/`engines`.

## Risks
- Wrong `base` produces a site whose CSS/links 404 on Pages while working locally. Mitigated by validating the built output under the base path.
- Pages not enabled, so the deploy workflow fails for a reason unrelated to the code.
