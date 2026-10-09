# Plan: Private Views

Each group is one reviewable commit.

## 1. Design tokens and login template
1. `src/styles/tokens.css`: colour (light and dark), type, spacing, radius, accent. Text and background pairs meet WCAG AA contrast (4.5:1) in both modes.
2. Custom password-prompt template using the tokens (inlined so the page is standalone), generic title, `noindex`.
3. Import the tokens in `Base.astro` without restyling pages yet.

## 2. Protection step
1. Add `staticrypt` as a pinned dev dependency; read its docs for the installed version.
2. `scripts/protect.ts`: read the two passwords, enforce the policy (non-empty, at least 16 characters, different), encrypt `dist/index.html` and `dist/supervisor/index.html`, leave `dist/public/` untouched.
3. `npm run build:protected` = build, then protect. `noindex` on protected output.
4. Unit tests for the password policy.

## 3. Leak check
1. `scripts/check-protected.ts`: assert the two protected pages contain no plaintext marker strings (headings and stub text taken from the plain build) and do contain the prompt; assert `dist/public/index.html` is still plaintext.
2. Unit test using small fixture HTML.
3. Invoke it from `build:protected` so a failed check fails the build.

## 4. CI and deploy
1. CI (pull requests): run `build:protected` with throwaway passwords and the leak check, in addition to `check`, `test` and `build`.
2. Deploy workflow: pass `RESEARCHER_PASSWORD` and `SUPERVISOR_PASSWORD` from secrets to `build:protected`; no secrets means no artifact is uploaded.
3. Confirm manually that a deploy with a missing secret fails before upload.

## 5. Documentation and roadmap
1. README: setup (adding the two secrets), choosing passwords, rotation, and the Limits section in plain words.
2. `specs/tech-stack.md`: record the decision and the options for real privacy (private content repo, encrypted content files, move host).
3. `specs/mission.md`: update the access-control open question.
4. `specs/roadmap.md`: Phase 1b items ticked; Phase 2 notes its dependency.
