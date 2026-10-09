# Requirements: External View

Roadmap: Phase 4. Guidance: `specs/mission.md` (plain language externally, no jargon, clear applications and reusable outputs), `specs/tech-stack.md` (static site; the password gate applies to the researcher and supervisor views only).

## Goal
Turn the `/public/` stub into the one view meant for strangers: what the research is about and what someone outside the field can take away or reuse. It is the only view with no password, so the main design problem is making sure nothing unreviewed can appear on it.

## In scope
- `/public/` page: a plain-language vision summary, then published research entries, each with its plain summary and a list of outputs (demos, datasets, tools).
- A review step: an entry appears publicly only when it is flagged `publishable: true` **and** lists `external` in its `audience`.
- An `outputs` list on archive entries.
- Build-time guards that fail the build if the external page could carry anything it should not.
- An empty state for when nothing is published yet (the expected state today).
- A "Published / Draft" indicator on the researcher workspace, so the researcher can see what is public.

## Out of scope
- Goals, OKR progress, feedback and requirements on the external page.
- Contact details, feedback intake and analytics for outside readers.
- Automated jargon detection (not reliably possible; see "Plain language").
- The role-switching navigation (Phase 5) and visual polish beyond the shared tokens (Phase 6).
- Real content: the sample entries stay unpublished.

## Decisions (feature interview, 2026-10-09)
| Topic | Decision |
|-------|----------|
| Review step | Two keys: `external` in `audience` **and** `publishable: true`. `publishable: true` without `external` is a build error; `external` without `publishable` is a draft and is not shown |
| Samples | Never published: entries with `sample: true` are excluded from the external view even if flagged |
| Outputs | An optional `outputs` list on each archive entry (kind, title, URL) |
| Scope | The vision's plain summary plus published research with its outputs; no goals, feedback or requirements |

## Behaviour
- **Vision:** for each vision entry that is published, show its `summaryPlain` (never the body).
- **Research:** published archive entries, ongoing before completed, completed newest first. Each shows title, status ("Ongoing" or "Completed" with date), `summaryPlain` and its outputs. The jargon-prone `summary`, the Markdown body and the single `link` field are **not** shown.
- **Outputs:** a list with a kind label (Demo, Dataset, Tool, Paper, Other), the title, and an https link opening in a new tab with `rel="noopener noreferrer"`.
- **Empty state:** with nothing published, a short "Nothing is published yet" message instead of blank sections.
- **No chrome from other views:** no audience badges, no SAMPLE badge (samples never appear), no Edit links, no progress numbers.
- **Researcher workspace:** each entry that lists `external` shows "Published" (when `publishable: true`) or "Draft" (otherwise), as a text badge.
- **Indexing:** the page is public by design and is not marked `noindex`. The protected pages stay `noindex`.

## Schema changes (assumptions, review in PR)
- `publishable: boolean` (optional) on `vision` and `archive` only. Rules: `publishable: true` requires `external` in `audience`; for a publishable entry `summaryPlain` must be 20-600 characters.
- `outputs` (optional, archive only): list of `{ kind: demo | dataset | tool | paper | other, title, url }`; `url` must be `https:`; unknown keys rejected.
- Goals, feedback and requirements are unchanged. An `external` audience on them has no effect on the external page; the README says so.
- Existing sample entries stay unpublished (no `publishable`), so the live page shows the empty state.

## Plain language
No automated check can judge jargon. The guards are structural: `summaryPlain` is required for external entries (already enforced), has a length range when published, and is the only prose shown. The README gets a short checklist (short sentences, define any term, say why it matters, say what a reader can use). The review itself is the researcher's act of setting `publishable: true`.

## Guards (the heart of this phase)
1. **Selection is one tested function** (`src/lib/publish.ts`): only entries with `external`, `publishable: true` and not `sample` pass. Pages never filter on their own.
2. **Post-build check** (`scripts/check-external.ts`): reads the content files and fails if `dist/public/index.html` contains any prose from content that must not be there: a draft's or sample's text, any entry's `summary`, body or `link`, feedback, requirements, objective text, researcher-only or supervisor-only text. It also fails if a published entry's `summaryPlain` is missing from the page.
3. **No side channels:** no data, feed or sitemap file carrying content (extends the existing check).
4. Existing protect step is unchanged: `/public/` must stay plaintext and unmodified by it.

## Context and constraints
- The repo is public, so raw `content/` is readable regardless of these flags. `publishable` controls what the site presents, not what is exposed in the repo. Real unpublished research must not be committed yet (see the README limits).
- The external page is open even when the password protection is on; the deploy default is now unprotected, which does not affect `/public/`.
- Phase 3 left the sample goals with an `external` audience and per-objective `summaryPlain`; they are simply not rendered here.
- No sample entry is publishable, so verifying the page needs temporary non-sample fixtures that are reverted.

## Risks
- **Accidental publication.** The two-key rule, sample exclusion, and the post-build check exist for this. The remaining risk is the researcher publishing text that is not actually plain or not meant to be public; only review can catch that.
- **The guard missing a case.** The check compares against the content files; a field added later but not covered could slip through. Mitigation: the guard reads every string field of every entry, not a hand-written list, and a new field fails closed (unknown fields are not allowed by the schemas).
- **Misreading "Published".** The repo itself is public, so "Draft" entries are still readable on GitHub. The README says so.
- **Empty live page** until real content is published; that is the intended state.

## Open questions
- Whether to add a "last updated" date to the external page (not decided; omitted).
- Whether published entries should get permalinks or pages of their own (later, if the list grows).
