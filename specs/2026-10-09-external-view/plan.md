# Plan: External View

Each group is one reviewable commit.

## 1. Schema and selection
1. Add `publishable` (vision, archive) and `outputs` (archive) to `src/content.config.ts` with the rules in `requirements.md`.
2. `src/lib/publish.ts`: `isPublished(entry)` (external audience, `publishable: true`, not sample) and `published(entries)`; ordering for published research (ongoing first, completed newest first).
3. Unit tests: every combination of the three conditions, sample excluded even when flagged, ordering, empty input.
4. Schema tests (or build-failure cases run once): `publishable` without `external`, `summaryPlain` too short and too long, a non-https output URL, an unknown output kind, an unknown key.

## 2. External page
1. `src/components/PublicVision.astro`, `PublicResearch.astro` and `Outputs.astro`; kind labels in one place.
2. `src/pages/public.astro`: intro, vision summary, research, empty state. Only `summaryPlain`, title, status, date and outputs are rendered. No Edit links, no badges, no stub notice.
3. Minimal CSS reusing the tokens; no hard-coded colours.

## 3. Researcher workspace indicator
1. A "Published" / "Draft" badge in `EntryMeta` for entries that list `external`, driven by the same `isPublished` helper.
2. Confirm the supervisor view and external page are unaffected.

## 4. Guards
1. `src/lib/external-guard.ts`: collect every prose string from the content entries and decide which must be absent from the external page; unit-tested with fixtures.
2. `scripts/check-external.ts`: read the content files and `dist/public/index.html`, fail on any forbidden fragment or a missing `summaryPlain`.
3. Run it from `build:protected` and from CI after the plain build.
4. Prove it fails: deliberately leak a draft, a `summary`, a body and a link, one at a time.

## 5. Content and docs
1. README: how to publish (write `summaryPlain`, add `external`, set `publishable: true`, deploy), the plain-language checklist, and the limits (public repo, drafts readable on GitHub).
2. Roadmap Phase 4 and `tech-stack.md` decisions.

## 6. Verification
1. Temporary non-sample fixtures: one published entry with outputs, one draft, one with `external` only; build, check the page, revert.
2. Empty-state build with the real content.
3. Browser check of `/public/` in light and dark at desktop and phone width.
