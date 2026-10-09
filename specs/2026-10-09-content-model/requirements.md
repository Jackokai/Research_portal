# Requirements: Content Model

Roadmap: Phase 1. Guidance: `specs/mission.md` (single source of truth, role-aware views), `specs/tech-stack.md` (Markdown + YAML, Astro content collections, TypeScript schemas).

## Goal
Turn the README's template sections into typed, validated content that later phases render through three audience lenses. Nothing in this feature renders content; it makes the content valid and queryable.

## In scope
- Astro content collections with Zod schemas for five types: vision, quarterly goals, archive entries, feedback, requirements.
- `content/` directory holding sample entries derived from the README placeholders.
- An `audience` field on every entry.
- CI failing on schema-invalid content.
- Slimming `README.md` so content lives only in `content/`.

## Out of scope
- Rendering content on pages (Phase 2+), Kanban (stays in GitHub Projects), role-switching UI.
- Link checking (deferred, as decided in Phase 0).
- Supervisor orientation text (update cadence, contact) and the external audience's standalone summary: they have no schema here and are handled in Phases 3 and 4. See "Known gap".
- Real research content.

## Decisions (feature interview, 2026-10-09)
| Topic | Decision |
|-------|----------|
| Scope | Schemas + migration + schema validation in CI; no link check |
| Migrated content | README placeholders kept as clearly marked **sample** entries |
| `audience` | Array per entry: any of `researcher`, `supervisor`, `external` |
| README | Slimmed; `content/` is the only home of content |
| Goals format | **OKR**: objectives with key results (added after first review) |
| Key result measure | Numeric: `start`, `target`, `current`; progress is computed |
| Structure | 1-5 objectives per quarter, 2-5 key results each; status is derived, never stored; target date at quarter level |

## Proposed schema design (assumptions, review in PR)
All dates are `YYYY-MM-DD`. Every entry has `audience` (non-empty array) and optional `sample: true`.

| Collection | Shape | Fields |
|------------|-------|--------|
| `vision` | one Markdown document | body; `summaryPlain` |
| `goals` (OKRs) | one YAML file per quarter (`2026-q4.yaml`) | `quarter` (`YYYY-Qn`), `current` (bool), `endDate`, `objectives[]` (1-5): `title`, `description`, `summaryPlain`, `keyResults[]` (2-5): `title`, `unit`, `start`, `target`, `current` |
| `archive` | one Markdown file per entry | `title`, `status` (ongoing / completed), `completedOn` (required iff completed), `summary`, `link`, `summaryPlain` |
| `feedback` | one YAML file per entry | `date`, `from`, `feedback`, `status` (open / addressed) |
| `requirements` | one YAML file per entry | `date`, `requirement`, `status` (open / done) |

Rules enforced by the schemas:
- `summaryPlain` (plain-language text for outsiders) is **required when `audience` includes `external`**. It is a separate field, not a second copy of the entry.
- OKR rules: `target` must differ from `start` (decreasing metrics are allowed, e.g. 10 → 2); a milestone KR uses `start: 0`, `target: 1`; `endDate` must fall inside the quarter named by `quarter`; objectives hold 1-5 and key results 2-5 (OKR convention, enforced).
- `status` is **not a stored field** for objectives or key results. A stored status could contradict the numbers.
- `summaryPlain` on goals is required **per objective** when the quarter file's `audience` includes `external`.
- `completedOn` required when archive `status` is completed, and absent when ongoing.
- Exactly one quarter file has `current: true`.
- Dates must be **quoted** YAML strings. Unquoted dates parse to Date objects, and an impossible one (2026-13-40) was observed to pass validation (exit 0; the cause is probably the parser rolling it over to a valid date, not confirmed); the schema rejects Date objects outright.
- Unknown fields are rejected, so typos fail the build instead of being silently ignored.
- Sample entries carry `sample: true` and a visible "SAMPLE" marker in their title/text.

## OKR derivation (defined here, implemented as one shared function)
- Key result progress = `(current − start) / (target − start)`, clamped to 0–1.
- Objective progress = mean of its key results' progress.
- Derived label: **planned** if every key result is at `start`; **done** if every key result is at 1; otherwise **in progress**.
- Phase 2+ pages call this function; no page recomputes it.
- Overshoot is clamped, so a KR at 150% of target shows 100%. This hides over-delivery; revisit if it matters.

## Context and constraints
- Phase 0 left a working Astro 7 + TypeScript site; CI runs `npm run check` and `npm run build` on PRs.
- The repo and site are public, so sample data must contain no real names, emails or unpublished research.
- Single researcher; the schema does not model multiple authors.
- The README's requirement (role-aware interface, status Open) is migrated as the first `requirements` entry, as real content, not a sample.

## Known gap
Deleting the README's "For Supervisors" and "For External Audience" sections removes the cadence/contact placeholders and the external-summary guidance. They are preserved in git history and listed in `roadmap.md` under Phases 3 and 4. If you want them modelled now, say so and this spec grows by one singleton collection.

## Open questions
- Feedback intake: the tech-stack proposes GitHub Issues for incoming feedback, while the README keeps an in-repo log. This spec keeps the in-repo YAML log as the record; whether Issues feed it is left to Phase 3.
- Whether `audience` should default when omitted (this spec: no default, it is required).

## Risks
- Astro content-layer APIs differ by version. Mitigation: implement against the installed version and check its docs, not memory.
- Fixed 2-5 key result bounds may not suit every research quarter. They are cheap to loosen later but expensive to tighten once content exists, so they start strict.
- Numeric KRs fit research milestones awkwardly. The 0 → 1 convention is the workaround; if it proves clumsy in practice, revisit before Phase 2 renders it.
- Over-strict schemas frustrate the single researcher. Mitigation: error messages must name the file and field (validated).
