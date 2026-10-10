// Fails if dist/public/index.html carries prose it must not, or lacks a published entry's summaryPlain.
// Reads the content files directly, so it checks the page against the source of truth, not the templates.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { externalRules, findProblems, splitFrontMatter, type GuardEntry } from '../src/lib/external-guard.ts';

const root = new URL('../', import.meta.url).pathname;
const contentDir = join(root, 'content');
const entries: GuardEntry[] = [];

for (const collection of ['vision', 'goals', 'archive', 'feedback', 'requirements']) {
  const dir = join(contentDir, collection);
  for (const file of readdirSync(dir)) {
    const text = readFileSync(join(dir, file), 'utf8');
    const id = file.replace(/\.[^.]+$/, '');
    if (file.endsWith('.md')) {
      const { front, body } = splitFrontMatter(text);
      entries.push({ collection, id, data: (parse(front) ?? {}) as Record<string, unknown>, body });
    } else if (/\.ya?ml$/.test(file)) {
      entries.push({ collection, id, data: (parse(text) ?? {}) as Record<string, unknown> });
    }
  }
}
entries.push({ collection: 'settings', id: 'settings', data: (parse(readFileSync(join(contentDir, 'settings.yaml'), 'utf8')) ?? {}) as Record<string, unknown> });

const html = readFileSync(join(root, 'dist', 'public', 'index.html'), 'utf8');
const rules = externalRules(entries);
const problems = findProblems(html, rules);

if (problems.length) {
  console.error(['check-external: FAILED', ...problems.map((p) => `  - ${p}`)].join('\n'));
  process.exit(1);
}
console.log(`check-external ok: ${rules.required.length} required and ${rules.forbidden.length} forbidden fragment(s) checked`);
