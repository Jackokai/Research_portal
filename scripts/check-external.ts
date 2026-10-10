// Fails if the public page (the site root) carries prose it must not, or lacks a published entry's summaryPlain.
// Reads the content files directly, so it checks the page against the source of truth, not the templates.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { externalRules, findProblems } from '../src/lib/external-guard.ts';
import { ROUTES, distFile } from '../src/lib/routes.ts';
import { loadContent } from './content-loader.ts';

const root = new URL('../', import.meta.url).pathname;
const entries = loadContent(root);

const html = readFileSync(join(root, 'dist', distFile(ROUTES.public)), 'utf8');
const rules = externalRules(entries);
const problems = findProblems(html, rules);

if (problems.length) {
  console.error(['check-external: FAILED', ...problems.map((p) => `  - ${p}`)].join('\n'));
  process.exit(1);
}
console.log(`check-external ok: ${rules.required.length} required and ${rules.forbidden.length} forbidden fragment(s) checked`);
