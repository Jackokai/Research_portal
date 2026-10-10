// View-matrix check on the PLAIN build (run it before the protect step): every content entry is shown only in the
// views whose rules allow it, once, with values that match the content; and no prose lives in two content files.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findDuplicates } from '../src/lib/duplicates.ts';
import { isPrompt } from '../src/lib/leak.ts';
import { ROUTES, distFile } from '../src/lib/routes.ts';
import { VIEWS, viewProblems, viewRules } from '../src/lib/view-rules.ts';
import { loadContent } from './content-loader.ts';

const root = new URL('../', import.meta.url).pathname;
const entries = loadContent(root);
const problems: string[] = [...findDuplicates(entries)];
const counts: string[] = [];

for (const view of VIEWS) {
  const html = readFileSync(join(root, 'dist', distFile(ROUTES[view])), 'utf8');
  if (isPrompt(html)) {
    console.error(`check-views: the ${view} page is an encrypted prompt. Run this check on the plain build, before scripts/protect.ts.`);
    process.exit(1);
  }
  const rules = viewRules(view, entries);
  problems.push(...viewProblems(view, html, rules));
  counts.push(`${view}: ${rules.required.length} required, ${rules.forbidden.length} forbidden, ${rules.once.length} once, ${rules.objectives.length} objectives`);
}

if (problems.length) {
  console.error(['check-views: FAILED', ...problems.map((p) => `  - ${p}`)].join('\n'));
  process.exit(1);
}
console.log(`check-views ok (${counts.join('; ')})`);
