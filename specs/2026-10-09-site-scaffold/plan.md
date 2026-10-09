# Plan: Site Scaffold

Each group is one reviewable commit. Order matters.

## 1. Project initialisation
1. Add Astro with TypeScript (strict) at the repo root; pin versions via lockfile.
2. Add `.gitignore` (node_modules, dist, .astro), `.nvmrc`, `engines` in `package.json`.
3. Add npm scripts: `dev`, `build`, `check` (`astro check`), `preview`.
4. Configure `astro.config` with `site` and `base` for the Pages sub-path.

## 2. Layout and stub pages
1. Create a shared layout: title, minimal readable CSS, nav linking `/`, `/supervisor`, `/public`.
2. Create the three pages, each declaring its audience and a "stub, content in Phase 1+" notice.
3. Make all internal links base-aware (no hard-coded leading `/`).

## 3. CI (pull requests)
1. Workflow triggered on `pull_request`: checkout, set up Node from `.nvmrc`, `npm ci`, `npm run check`, `npm run build`.
2. Cache npm dependencies.
3. Confirm a deliberately broken type fails the job (then revert).

## 4. Pages deploy (manual trigger)
1. Workflow triggered by `workflow_dispatch`: build, upload Pages artifact, deploy with the official Pages actions and required permissions (`pages: write`, `id-token: write`).
2. Document the one-time manual step: repo Settings > Pages > Source: GitHub Actions.
3. Run it once and verify the live URL.

## 5. Documentation and roadmap
1. Add a short "Developing" section covering run, build, check and deploy. Keep the original README content unchanged.
2. Tick the Phase 0 items in `specs/roadmap.md` that this completes.
3. Note the manual-deploy decision and how to switch to automatic.
