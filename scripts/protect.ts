// Encrypts the researcher and supervisor pages in dist/ and verifies the result. Fails closed:
// any problem exits non-zero, so the deploy never uploads an unprotected page.
//
// Run after `astro build`:  RESEARCHER_PASSWORD=... SUPERVISOR_PASSWORD=... node scripts/protect.ts
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PROMPT, findLeaks, isNoindex, isPrompt, sideChannelFiles } from '../src/lib/leak.ts';
import { validatePasswords } from '../src/lib/protect-policy.ts';

const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist');

function fail(messages: string[]): never {
  console.error(['protect: FAILED, nothing is safe to publish.', ...messages.map((m) => `  - ${m}`)].join('\n'));
  process.exit(1);
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const { errors, passwords } = validatePasswords(process.env);
if (!passwords) fail(errors);

try {
  statSync(join(dist, 'index.html'));
} catch {
  fail(['dist/index.html not found; run `npm run build` first']);
}

const targets = [
  { file: join(dist, 'index.html'), password: passwords.researcher },
  { file: join(dist, 'supervisor', 'index.html'), password: passwords.supervisor },
];
const publicFile = join(dist, 'public', 'index.html');
const publicHash = createHash('sha256').update(readFileSync(publicFile)).digest('hex');

// Template = our prompt page with the design tokens inlined.
const work = mkdtempSync(join(tmpdir(), 'protect-'));
const tokens = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8');
const template = join(work, 'template.html');
writeFileSync(template, readFileSync(join(root, 'scripts/password-template.html'), 'utf8').replace('/*TOKENS*/', tokens));

const problems: string[] = [];
const results: Array<{ file: string; encrypted: string }> = [];
try {
  for (const t of targets) {
    const plain = readFileSync(t.file, 'utf8');
    const out = mkdtempSync(join(work, 'out-'));
    try {
      // The password goes through the environment, never argv (visible in process lists).
      execFileSync(
        join(root, 'node_modules/.bin/staticrypt'),
        [
          t.file, '-d', out, '-c', '.staticrypt.json', '-t', template, '--short', '--remember', '30',
          '--template-title', PROMPT.title, '--template-instructions', PROMPT.instructions,
          '--template-button', PROMPT.button, '--template-placeholder', PROMPT.placeholder,
          '--template-remember', PROMPT.remember, '--template-error', PROMPT.error,
          '--template-toggle-show', PROMPT.toggleShow, '--template-toggle-hide', PROMPT.toggleHide,
        ],
        { cwd: root, env: { ...process.env, STATICRYPT_PASSWORD: t.password }, stdio: ['ignore', 'pipe', 'pipe'] },
      );
    } catch (err) {
      const detail = String((err as { stderr?: Buffer; message?: string }).stderr ?? (err as Error).message)
        .split(t.password).join('[redacted]')
        .trim();
      problems.push(`encryption failed for ${t.file.replace(root, '')}: ${detail}`);
      continue;
    }
    const encrypted = readFileSync(join(out, 'index.html'), 'utf8');
    const rel = t.file.replace(root, '');
    if (!isPrompt(encrypted)) problems.push(`${rel}: output is not a password prompt`);
    if (!isNoindex(encrypted)) problems.push(`${rel}: output lacks noindex`);
    const leaks = findLeaks(plain, encrypted);
    if (leaks.length) problems.push(`${rel}: plaintext leaked: ${leaks.map((l) => JSON.stringify(l)).join(', ')}`);
    if (encrypted.includes(t.password)) problems.push(`${rel}: password value appears in output`);
    results.push({ file: t.file, encrypted });
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (createHash('sha256').update(readFileSync(publicFile)).digest('hex') !== publicHash) {
  problems.push('dist/public/index.html was modified; it must stay open and unchanged');
}
const side = sideChannelFiles(walk(dist).map((p) => p.replace(dist + '/', '')));
if (side.length) problems.push(`possible side channels in dist/: ${side.join(', ')}`);

if (problems.length) fail(problems);
// Write only after every check passed, so a failure never leaves a half-protected dist/.
for (const r of results) writeFileSync(r.file, r.encrypted);
console.log('protect ok: / and /supervisor/ are encrypted; /public/ is open and unchanged');
