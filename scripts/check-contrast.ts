import { readFileSync } from 'node:fs';
import { contrastFailures } from '../src/lib/contrast.ts';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const failures = contrastFailures(css);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('contrast ok: all text pairs reach 4.5:1 in light and dark');
