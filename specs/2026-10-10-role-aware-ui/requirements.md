# Requirements: Role-aware UI

Roadmap: Phase 5, the README's open requirement (`content/requirements/role-aware-interface.yaml`): "an intuitive, role-aware user interface that presents the research appropriately depending on the audience ... the same underlying content should be accessible through different lenses so the repository itself becomes the presentation tool." Guidance: `specs/mission.md` (single source of truth, role-aware lenses), `specs/tech-stack.md`.

## Goal
Make the three views feel like one product with three lenses, make the bare site URL friendly to outsiders, and prove with an automated check that every piece of content shows up in exactly the views it should, from a single source.

## In scope
- **URL move:** `/` becomes the public (external) view, `/researcher/` the researcher workspace, `/supervisor/` unchanged. `/public/` stays as a small redirect page to `/`.
- **Navigation:** a lens switcher on the private views; none on the public view.
- **Routes in one place:** a single `routes` module that pages, guards and the protect step all use.
- **View-matrix check:** an automated post-build check that every content entry is present only where its rules allow, once, with values consistent across views.
- **Duplication check:** no prose duplicated across two non-sample content files.
- `noindex` on the private views.
- Docs, and a path for the researcher to close the requirement.

## Out of scope
- Changing what any view shows (Phases 2-4 decided that), except navigation chrome.
- Visual polish, accessibility audit, stale-content warnings (Phase 6).
- Per-person accounts, role detection, or remembering a visitor's lens.
- A landing page that asks "who are you?" (considered and declined: it costs outsiders a click).

## Decisions (feature interview, 2026-10-10)
| Topic | Decision |
|-------|----------|
| URLs | **Move:** `/` public, `/researcher/`, `/supervisor/`; `/public/` becomes a redirect to `/` |
| Navigation | The public page shows **no private links**; the private pages show a switcher between all three lenses (segmented control, Apple-style) |
| Verification | An **automated view-matrix check** after the build, run in CI |

## Behaviour
- **Routes:** `src/lib/routes.ts` is the only place that names the three paths. Pages, `Base.astro`, `scripts/protect.ts`, `check-protected.ts`, `check-external.ts` and the new check import from it. A future move is a one-file change.
- **Public (`/`):** the external view from Phase 4, unchanged in content. No navigation links. The brand is plain text. Indexable.
- **Researcher (`/researcher/`):** the workspace from Phase 2, unchanged in content, with the switcher. Password-gated when protection is on. `noindex`.
- **Supervisor (`/supervisor/`):** unchanged in content, with the switcher. Password-gated when protection is on. `noindex`.
- **Switcher:** three segments (Researcher, Supervisor, Public) with the current lens marked `aria-current="page"`, keyboard reachable, readable without colour, wrapping cleanly at phone width.
- **Redirect (`/public/`):** a tiny static page with `<meta http-equiv="refresh">`, a canonical link and a visible "continue" link, all under the site base path. No content, no navigation. Never encrypted.
- **Old researcher bookmark:** `/` now shows the public page. This is deliberate; nothing private is exposed by it.

## View-matrix check (`scripts/check-views.ts`)
Runs on the plain build (`dist/`), reading the content files directly, like the Phase 4 guard.
1. **Presence and absence per view.** For each entry and each of the three views, the rules from Phases 2-4 say whether it is shown and which fields:
   - researcher: everything except `summaryPlain`; feedback only when the toggle is on;
   - supervisor: only entries listing `supervisor`; current-quarter goals only; ongoing archive plus the 3 latest completed; feedback only when the toggle is on and the entry lists `supervisor`; never vision, requirements, past quarters or `summaryPlain`;
   - public: published vision and archive entries, `summaryPlain` plus title, status and outputs only (the Phase 4 guard, now one case of this check).
   Required fragments must be present in the view; forbidden fragments must be absent.
2. **Once per view.** An entry's distinctive text appears exactly once in a view that shows it (no accidental double render).
3. **Consistent across views.** Wherever the same objective appears (researcher and supervisor), its title, progress percentage and derived label are identical.
4. **Single source.** No prose fragment of 40 characters or more appears in two different non-sample content entries (samples are template placeholders and are exempt). The check names both files.
The Phase 4 `check-external.ts` keeps working and keeps its tests; the matrix check generalises it rather than replacing it.

## Context and constraints
- The Phase 1b protect step encrypts `dist/index.html` and `dist/supervisor/index.html` and asserts `dist/public/index.html` is unchanged. After the move it must encrypt `researcher/index.html` and `supervisor/index.html`, and assert the new public root (`index.html`) and the redirect page are unchanged and not prompts. A mistake here would encrypt the public page or expose the researcher page, so the final-`dist/` check (`check-protected.ts`) is made route-driven too and is tested with the routes swapped.
- The deploy default is now unprotected (or ticked, if PR #9 is not merged); the move does not change that.
- The repo is public and `content/` readable; nothing here changes that.
- Edit links, anchors and the content are unaffected by the move.
- All internal links must keep the `/Research_portal/` base path.

## Closing the requirement
The requirement stays `open` until the researcher accepts it. After the walkthrough in `validation.md`, the researcher sets `status: done` in `content/requirements/role-aware-interface.yaml` (via its Edit link) and the roadmap item is ticked. This spec does not edit that file.

## Risks
- **Breaking links.** Anyone with `/` bookmarked as the researcher workspace lands on the public page. Mitigation: README lists the three URLs; `/public/` keeps working through the redirect.
- **A wrong route in the protect step** could encrypt the public page or leave the researcher page open. Mitigation: route-driven code, the final-`dist/` check, and a swapped-routes test.
- **Redirect on GitHub Pages is client-side** (meta refresh), so crawlers and old links get a page, not an HTTP redirect. Acceptable for this site.
- **The matrix check encodes view rules a second time**, so a deliberate change to a view must update the rules too. That is the point (a view cannot change silently), but it is a maintenance cost; the rules live in one module with tests.
- **False positives** from short or common phrases. Mitigation: the 12-character minimum and the 40-character duplicate threshold from the Phase 4 guard.
- **Nav reveals nothing new to outsiders** (the public page lists no private links), but the private URLs are guessable (`/researcher/`, `/supervisor/`). They were already guessable; the password, not obscurity, is the protection.

## Open questions
- Whether the public page should eventually carry a discreet link for supervisors (declined for now).
- Whether to add a real HTTP redirect later if the site moves to a host that supports it.
