// Single source: the same prose must not live in two content entries. Samples are template placeholders and exempt.
import type { GuardEntry } from './external-guard.ts';
import { leaves, markdownToText } from './external-guard.ts';

export const MIN_DUPLICATE = 40;

export function findDuplicates(entries: GuardEntry[], minLength = MIN_DUPLICATE): string[] {
  const where = new Map<string, Set<string>>();
  for (const e of entries) {
    if (e.collection === 'settings' || (e.data as { sample?: boolean }).sample === true) continue;
    const all = leaves(e.data, '').filter((l) => !l.path.startsWith('audience'));
    if (e.body) all.push({ path: 'body', text: markdownToText(e.body) });
    for (const { text } of all) {
      // Compare sentences, so a sentence copied into a different paragraph is still found.
      for (const sentence of text.split(/\n+/).flatMap((l) => l.split(/(?<=[.!?])\s+/)).map((s) => s.trim())) {
        if (sentence.length < minLength) continue;
        if (!where.has(sentence)) where.set(sentence, new Set());
        where.get(sentence)!.add(`${e.collection}/${e.id}`);
      }
    }
  }
  return [...where].filter(([, files]) => files.size > 1).map(([line, files]) => `duplicate: ${JSON.stringify(line)} appears in ${[...files].join(' and ')}`);
}
