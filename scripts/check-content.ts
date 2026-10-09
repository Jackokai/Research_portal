// Cross-entry rules that a per-file schema cannot express.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const dir = new URL('../content/goals/', import.meta.url).pathname;
const files = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));
const errors: string[] = [];
let current = 0;

for (const f of files) {
  const data = parse(readFileSync(join(dir, f), 'utf8')) as { quarter?: string; current?: boolean };
  if (data.current === true) current++;
  const expected = typeof data.quarter === 'string' ? data.quarter.toLowerCase() : null;
  if (expected && f.replace(/\.ya?ml$/, '') !== expected) {
    errors.push(`content/goals/${f}: filename must match quarter (expected ${expected}.yaml)`);
  }
}
if (current !== 1) {
  errors.push(`content/goals: exactly one quarter must have current: true (found ${current})`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`content ok: ${files.length} quarter file(s), 1 current`);
