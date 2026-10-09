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
| `content/settings.yaml` | Site settings: the feedback toggle and the board URL (no `audience`) | YAML |

Rules the build enforces (errors name the file and field):
- Every entry has `audience`: a list of `researcher`, `supervisor` and/or `external`.
- If `audience` includes `external`, add `summaryPlain` (plain-language text for outsiders). For goals this goes on each objective.
- **Dates must be quoted**: `date: "2026-10-01"`. Unquoted YAML dates are rejected, because an impossible one such as `2026-13-40` was observed to pass validation.
- Goals are OKRs: 1-5 objectives per quarter, 2-5 key results each, with numeric `start`, `target` and `current`. A milestone is `start: 0, target: 1`. Status is never stored; progress is computed from the numbers. Exactly one quarter has `current: true`, and the file name matches the quarter (`2026-Q4` is `2026-q4.yaml`).
- `publishable` and `outputs` exist on vision and archive entries only (see Publishing to the external page).
- Unknown fields are rejected, so typos fail the build.

The researcher workspace (`/`) shows all of this on one page, and every entry has an **Edit** link that opens its source file in GitHub's web editor. Interface colours come only from `src/styles/tokens.css`; `npm run check` fails on hard-coded colours.

Entries marked `sample: true` (and "SAMPLE" in their text) are placeholders from the original template. Replace or delete them.

## Publishing to the external page

`/public/` is open to everyone and is the only view meant for people outside the project. A **vision or archive** entry appears there only when all three hold:
1. `external` is in its `audience`,
2. `publishable: true` is set (a deliberate second key, so a draft with `external` is never shown),
3. it is not `sample: true` (samples are never published).

`publishable: true` without `external` fails the build. The researcher workspace marks each such entry **Published** or **Draft**.

To publish: write a `summaryPlain` (20-600 characters), add `external` to the audience, set `publishable: true`, optionally list `outputs`, then deploy.

```yaml
publishable: true
summaryPlain: "We measured how fast beaches are disappearing and shared the photos."
outputs:
  - { kind: dataset, title: "Beach photos 2020-2025", url: "https://example.com/photos" }
```

`kind` is one of `demo`, `dataset`, `tool`, `paper`, `other`; the URL must be `https://`. The page shows only the title, status, `summaryPlain` and outputs. It never shows `summary`, the body or `link`, and nothing from goals, feedback or requirements. Goals, feedback and requirements are never published, so `external` has no effect on them.

**Plain-language checklist** (no tool can check this for you): short sentences; explain every technical term or leave it out; say why it matters; say what a reader can use or try.

**What guards the page:** `npm run check:external` runs after the build, in CI and in the deploy. It reads every content file and fails the build if a draft, a sample, an entry's `summary`, body or `link`, or any text from the other views appears on `/public/`, or if a published `summaryPlain` is missing. It catches verbatim copies of roughly 60 characters or more, not paraphrases.

**Limits:** the repository is public, so drafts and every other file in `content/` are readable on GitHub. `publishable` controls what the site shows, not what the repository exposes.

## Supervisor view and the Kanban board

`/supervisor/` shows the current quarter's goals and the recent research (ongoing entries plus the three latest completed), using only entries whose `audience` includes `supervisor`. Researcher-only entries never appear in its HTML, even if the password is switched off.

- **Board link:** create a GitHub Project board, then paste its URL into `content/settings.yaml` under `board.url`. Until you do, the page shows "Board link not set".
- **Add a card:** the page links to a new-issue form (`.github/ISSUE_TEMPLATE/card.yml`). Issues in this public repository are **public**, and so are comments on them. For a new issue to land on the board automatically, the Project needs an auto-add workflow; otherwise add cards by hand.
- **Feedback toggle:** `features.feedback` in `content/settings.yaml` controls the Feedback section on both `/` and `/supervisor/`. It is `false` by default, because the board covers day-to-day feedback. Set it to `true` to bring the section back; the feedback files and schema are kept. Changes take effect on the next deploy.
- There is no update cadence or contact line; the board is the channel.

## Private views

`/` (researcher) and `/supervisor/` are password-protected; `/public/` is open. Each protected page is encrypted at build time and decrypted in the browser. Passwords are GitHub Actions secrets, never committed.

**Setup (once):** repo Settings > Secrets and variables > Actions > New repository secret, add both:
- `RESEARCHER_PASSWORD`: for `/`
- `SUPERVISOR_PASSWORD`: for `/supervisor/`

Each must be at least 16 characters and they must differ. A random passphrase of four or more words is a good choice. The deploy refuses to publish if either is missing, empty or too short.

**Rotating a password:** change the secret, then run the deploy workflow again. Supervisors who ticked "Remember on this device" are asked again.

**Limits, in plain words:**
- **The repo is public.** The password protects the rendered pages only. Everything in `content/` is readable on GitHub by anyone. Do not commit real names, feedback or unpublished research until real privacy exists (see `specs/tech-stack.md`).
- **The encrypted page is public too**, so anyone can try passwords against it offline. Only a strong password protects it.
- **Shared passwords.** Anyone who knows one can pass it on. Changing the secret revokes it for future visits, but a copy of the encrypted page someone already saved still opens with the old password.
- **No side channels.** Private data must only ever appear inside the encrypted HTML, never in separate data files, feeds or sitemaps. The build fails if such files appear.
- Page titles and navigation of protected pages are visible in the repo source, not on the live prompt.

## Developing

Requires Node 22 (see `.nvmrc`).

```bash
npm ci            # install
npm run dev       # local dev server
npm run check     # typecheck, content schemas, cross-file rules, colour contrast, hard-coded colours
npm test          # unit tests
npm run build     # plain build to dist/ (dev, PRs)
RESEARCHER_PASSWORD=... SUPERVISOR_PASSWORD=... npm run build:protected   # build + encrypt + verify
npm run preview   # serve the build at /Research_portal/
```

- **CI** runs `check`, `test`, `build`, the external-page guard, and `build:protected` with throwaway passwords on every pull request.
- **Deploy** uses `build:protected` with the two secrets and is manual. The run dialog has a "Password-protect" box, ticked by default; untick it only while testing with sample content, to publish `/` and `/supervisor/` as plain public pages (the run shows a warning): Actions > "Deploy to GitHub Pages" > Run workflow. To deploy automatically on merge, add `push: { branches: [<default-branch>] }` (the repo's default branch) to `.github/workflows/deploy.yml`.
