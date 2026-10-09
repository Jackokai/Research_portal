# Validation: Private Views

Mergeable when every item passes. Put command output or run links in the PR description.

## Automated
- [x] `npm ci` succeeds from a clean checkout. _(local install)_
- [x] `npm run check`, `npm test` and `npm run build` pass.
- [x] `npm run build:protected` passes with two valid throwaway passwords.
- [ ] CI is green on the final commit, including the protected build and leak check.

## Password policy (each tried once, then reverted)
- [x] Missing `RESEARCHER_PASSWORD`: `build:protected` exits non-zero, nothing encrypted or published.
- [x] Missing `SUPERVISOR_PASSWORD`: same.
- [x] Empty value: same.
- [x] Shorter than 16 characters: same, with a message naming the variable (not the value).
- [x] Identical passwords for both views: same.
- [x] The password value never appears in any log output. _(checked on failing and passing runs)_

## Protected output
- [x] `dist/index.html` and `dist/supervisor/index.html` contain no plaintext marker strings from the plain build (the leak check passes; verified to fail when a marker is deliberately left in).
- [x] `dist/public/index.html` is still plaintext and unchanged.
- [x] Protected pages carry `noindex`; the prompt page has a generic title.
- [x] Protected pages work under the `/Research_portal/` base (assets load). _(decrypted page keeps `/Research_portal/` links)_
- [x] No private data in separate files: `dist/` has no data, feed or sitemap file carrying page content.

## Browser check (one-off with the preinstalled Chromium, not committed)
- [x] Correct password decrypts `/` and `/supervisor/` and the stub content appears.
- [x] Wrong password, and the other view's password, are rejected.
- [x] Prompt page is readable in light and dark mode and at phone width, without horizontal scroll. _(screenshots reviewed by Claude; user review pending)_
- [x] Remember-me skips the prompt on reload and expires as configured. _(expiry measured at 30.00 days)_

## Design tokens
- [x] Text/background pairs meet 4.5:1 contrast in light and dark (computed, not eyeballed). _(`scripts/check-contrast.ts`, part of `npm run check`)_
- [x] No Apple fonts, icons or logos are included; the font stack is system fonts only.

## Live (after merge and setting the two secrets)
- [ ] Deploy with secrets succeeds; `/` and `/supervisor/` show the prompt in a logged-out browser; `/public/` opens freely.
- [ ] "View source" on the live `/` shows ciphertext, no stub text.
- [ ] Deploy with a secret removed fails before upload.

## Documentation
- [x] README states the Limits in plain language (public repo, public ciphertext, shared passwords, no side channels).
- [x] README explains adding the two secrets and rotating a password.
- [x] `tech-stack.md`, `mission.md`, `roadmap.md` reflect the decision.

## Not required for merge
Content rendering, restyling the pages, real privacy of `content/`, per-user access.

## Definition of done
All boxes checked and CI green. If the live checks cannot be done (secrets not yet set), the PR may merge only with that gap stated explicitly.
