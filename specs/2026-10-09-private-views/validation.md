# Validation: Private Views

Mergeable when every item passes. Put command output or run links in the PR description.

## Automated
- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm run check`, `npm test` and `npm run build` pass.
- [ ] `npm run build:protected` passes with two valid throwaway passwords.
- [ ] CI is green on the final commit, including the protected build and leak check.

## Password policy (each tried once, then reverted)
- [ ] Missing `RESEARCHER_PASSWORD`: `build:protected` exits non-zero, nothing encrypted or published.
- [ ] Missing `SUPERVISOR_PASSWORD`: same.
- [ ] Empty value: same.
- [ ] Shorter than 16 characters: same, with a message naming the variable (not the value).
- [ ] Identical passwords for both views: same.
- [ ] The password value never appears in any log output.

## Protected output
- [ ] `dist/index.html` and `dist/supervisor/index.html` contain no plaintext marker strings from the plain build (the leak check passes; verified to fail when a marker is deliberately left in).
- [ ] `dist/public/index.html` is still plaintext and unchanged.
- [ ] Protected pages carry `noindex`; the prompt page has a generic title.
- [ ] Protected pages work under the `/Research_portal/` base (assets load).
- [ ] No private data in separate files: `dist/` has no data, feed or sitemap file carrying page content.

## Browser check (one-off with the preinstalled Chromium, not committed)
- [ ] Correct password decrypts `/` and `/supervisor/` and the stub content appears.
- [ ] Wrong password, and the other view's password, are rejected.
- [ ] Prompt page is readable in light and dark mode and at phone width, without horizontal scroll.
- [ ] Remember-me skips the prompt on reload and expires as configured.

## Design tokens
- [ ] Text/background pairs meet 4.5:1 contrast in light and dark (computed, not eyeballed).
- [ ] No Apple fonts, icons or logos are included; the font stack is system fonts only.

## Live (after merge and setting the two secrets)
- [ ] Deploy with secrets succeeds; `/` and `/supervisor/` show the prompt in a logged-out browser; `/public/` opens freely.
- [ ] "View source" on the live `/` shows ciphertext, no stub text.
- [ ] Deploy with a secret removed fails before upload.

## Documentation
- [ ] README states the Limits in plain language (public repo, public ciphertext, shared passwords, no side channels).
- [ ] README explains adding the two secrets and rotating a password.
- [ ] `tech-stack.md`, `mission.md`, `roadmap.md` reflect the decision.

## Not required for merge
Content rendering, restyling the pages, real privacy of `content/`, per-user access.

## Definition of done
All boxes checked and CI green. If the live checks cannot be done (secrets not yet set), the PR may merge only with that gap stated explicitly.
