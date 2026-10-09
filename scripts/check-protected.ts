// Independent check of the FINAL dist/: protected pages are prompts, public stays open,
// nothing else can carry page content. Runs after protect.ts, in CI and in the deploy job.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { isNoindex, isPrompt, sideChannelFiles, unexpectedPromptText } from '../src/lib/leak.ts';

const dist = new URL('../dist/', import.meta.url).pathname;
const problems: string[] = [];

for (const rel of ['index.html', 'supervisor/index.html']) {
  const html = readFileSync(join(dist, rel), 'utf8');
  if (!isPrompt(html)) problems.push(`${rel} is not a password prompt`);
  if (!isNoindex(html)) problems.push(`${rel} lacks noindex`);
  const extra = unexpectedPromptText(html);
  if (extra.length) problems.push(`${rel} shows text beyond the prompt: ${extra.map((e) => JSON.stringify(e)).join(', ')}`);
}
if (isPrompt(readFileSync(join(dist, 'public/index.html'), 'utf8'))) problems.push('public/index.html must stay open');

const walk = (d: string): string[] =>
  readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const side = sideChannelFiles(walk(dist).map((p) => p.replace(dist, '')));
if (side.length) problems.push(`possible side channels: ${side.join(', ')}`);

if (problems.length) {
  console.error(['check-protected: FAILED', ...problems.map((p) => `  - ${p}`)].join('\n'));
  process.exit(1);
}
console.log('check-protected ok');
