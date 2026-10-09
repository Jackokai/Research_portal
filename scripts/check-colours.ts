import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { findHardCodedColours } from '../src/lib/colours.ts';

const root = new URL('../', import.meta.url).pathname;
const src = join(root, 'src');
const tokens = join(src, 'styles', 'tokens.css');

const walk = (d: string): string[] =>
  readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));

const problems: string[] = [];
for (const file of walk(src)) {
  if (file === tokens || !/\.(astro|css|ts)$/.test(file) || /\.test\.ts$/.test(file) || file.endsWith('/lib/colours.ts') || file.endsWith('/lib/contrast.ts')) continue;
  for (const f of findHardCodedColours(readFileSync(file, 'utf8'))) {
    problems.push(`${relative(root, file)}:${f.line}: ${f.kind}: ${f.text}`);
  }
}
if (problems.length) {
  console.error(['Hard-coded colours found (use variables from src/styles/tokens.css):', ...problems.map((p) => `  - ${p}`)].join('\n'));
  process.exit(1);
}
console.log('colours ok: no hard-coded colours outside tokens.css');
