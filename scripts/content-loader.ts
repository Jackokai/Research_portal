// Reads every content file into guard entries. Shared by the external-page guard and the view-matrix check.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { splitFrontMatter, type GuardEntry } from '../src/lib/external-guard.ts';

export function loadContent(root: string): GuardEntry[] {
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
  const settings = readFileSync(join(contentDir, 'settings.yaml'), 'utf8');
  entries.push({ collection: 'settings', id: 'settings', data: (parse(settings) ?? {}) as Record<string, unknown> });
  return entries;
}
