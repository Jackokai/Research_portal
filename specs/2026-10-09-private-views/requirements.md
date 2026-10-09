# Requirements: Private Views (password gate)

Roadmap: new Phase 1b, inserted before Phase 2 so that nothing private is ever rendered on an open URL. Guidance: `specs/mission.md` (role-aware views; audiences differ), `specs/tech-stack.md` (static site on GitHub Pages, no backend).

## Goal
Put a password in front of the researcher view (`/`) and the supervisor view (`/supervisor/`) while keeping `/public/` open, without leaving the current free GitHub Pages setup.

## In scope
- Build-time encryption of the rendered HTML of `/` and `/supervisor/` with one password each, decrypted in the browser.
- A login prompt page styled with a small shared design-tokens file (Apple-style: system fonts, whitespace, light and automatic dark mode).
- Passwords supplied as GitHub Actions secrets; **deploy fails closed** if either is missing or too weak.
- CI proof that the protected pages contain no plaintext and that `/public/` stays open.
- Documentation of setup, rotation and limits.

## Out of scope
- Real privacy of the raw files in `content/` (see "Limits", decided: accept for now).
- Per-person accounts, revocation of individual people, rate limiting (not possible with client-side decryption).
- Rendering the researcher or supervisor content (Phases 2 and 3). This phase gates the existing stub pages.
- The full restyle of pages (Phase 2 applies the tokens to the workspace).
- Moving host (Cloudflare etc.).

## Decisions (feature interview, 2026-10-09)
| Topic | Decision |
|-------|----------|
| Approach | Keep GitHub Pages and the public repo; add a password to the researcher and supervisor views (client-side, build-time encryption) |
| Passwords | One per view: researcher for `/`, supervisor for `/supervisor/`. Stored as GitHub secrets, never in the repo |
| Raw content exposure | **Accepted for now**: no real private content in `content/` while the repo is public |
| Fail mode | Deploy fails closed if a password is missing or too weak |
| Design | Small tokens file now (light + dark); full restyle in Phase 2 |
| Supervisor login method | Shared password (the earlier "decide later" is resolved by this approach) |

## Limits (stated plainly; repeated in the README)
1. **The repo is public.** Anything committed under `content/` is readable on GitHub regardless of the page passwords. The password protects the rendered pages only. Real researcher or supervisor material must not be committed until content moves to a private source (options recorded in `tech-stack.md`).
2. **Ciphertext is public.** Anyone can download the encrypted page and try passwords offline. Protection is only as strong as the password: minimum length enforced, a random multi-word passphrase recommended.
3. **Shared passwords.** Whoever knows a password can share it. Revoking means changing the secret and redeploying. A previously downloaded ciphertext (cached copy, web archive) stays decryptable with the old password, so rotation does not un-leak anything already seen.
4. **No unencrypted side channels.** Private data must appear only inside the encrypted HTML: no separate JSON/data files, feeds, sitemaps or page titles that carry it. Binding on Phases 2-4.
5. Titles, navigation labels and file paths of protected pages are visible. The login page uses generic text.

## Proposed design (assumptions, review in PR)
- **Tool:** StatiCrypt (npm `staticrypt`, MIT; AES-256 via WebCrypto in the browser; version 3.5.4, last published June 2025, so check maintenance state and pin the version). Alternative if it proves unsuitable: a small in-repo WebCrypto implementation, which means more code to own and review.
- **Pipeline:** `npm run build` produces plain output (dev, PRs, Phase 2 verification). `npm run build:protected` runs the build, then encrypts `dist/index.html` and `dist/supervisor/index.html` and verifies the result. Only the deploy workflow uses it with real secrets.
- **Passwords:** read from `RESEARCHER_PASSWORD` and `SUPERVISOR_PASSWORD`. The script refuses empty values, values shorter than 16 characters, and identical passwords for the two views.
- **Login page:** custom template using `src/styles/tokens.css`; generic title; `noindex`.
- **Remember me:** enabled with an expiry, so supervisors are not prompted on every visit. Assumption; it stores a derived value in the browser's localStorage, which is a trade-off on shared computers. Revisit in review.
- **Design tokens** (`src/styles/tokens.css`): CSS custom properties for colour (light and dark via `prefers-color-scheme`), type (system font stack, which renders as SF on Apple devices), spacing, radius, one accent colour. No Apple fonts, icons or branding are used.

## Context and constraints
- Phase 0/1 deliver a manual-trigger deploy workflow on GitHub Pages, CI on pull requests, and stub pages at `/`, `/supervisor/`, `/public/`.
- A one-time manual step is needed: add the two repository secrets (Settings > Secrets and variables > Actions). This cannot be done from code.
- PR CI has no access to real secrets; it uses throwaway passwords to exercise the protection step.
- Pages are served under `/Research_portal/`; the encrypted pages must still resolve their assets and links under that base.

## Risks
- A misconfigured pipeline could publish plaintext. Mitigation: fail-closed password check, a leak check in CI and again in the deploy job before upload.
- Passwords weaker than required, or shared too widely. Mitigation: length rule, documentation, rotation steps.
- StatiCrypt maintenance and template compatibility. Mitigation: pin the version, keep the encryption step behind one script so it can be swapped.
- False sense of privacy: the public repo. Mitigation: the Limits above, in the README as well.

## Open questions
- Whether real privacy (private content repo or encrypted content files) should become its own phase before real content is added. Recorded in the roadmap as an option, not scheduled.
