// Independent check of the FINAL dist/ after the protect step. Routes come from src/lib/routes.ts.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { distProblems } from '../src/lib/dist-rules.ts';
import { sideChannelFiles } from '../src/lib/leak.ts';
import { LEGACY_PUBLIC, ROUTES, distFile } from '../src/lib/routes.ts';

const dist = new URL('../dist/', import.meta.url).pathname;
const read = (route: string) => readFileSync(join(dist, distFile(route)), 'utf8');

const problems = distProblems({
  researcher: read(ROUTES.researcher),
  supervisor: read(ROUTES.supervisor),
  publicRoot: read(ROUTES.public),
  legacy: read(LEGACY_PUBLIC),
});

const walk = (d: string): string[] =>
  readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const side = sideChannelFiles(walk(dist).map((p) => p.replace(dist, '')));
if (side.length) problems.push(`possible side channels: ${side.join(', ')}`);

if (problems.length) {
  console.error(['check-protected: FAILED', ...problems.map((p) => `  - ${p}`)].join('\n'));
  process.exit(1);
}
console.log('check-protected ok');
