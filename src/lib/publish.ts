// The review step for the external (public) view. An entry is published only with BOTH keys:
// `external` in its audience and `publishable: true`. Samples are never published.
// Pages never filter on their own: they call these helpers.
import { z } from 'astro/zod';

export const OUTPUT_KINDS = ['demo', 'dataset', 'tool', 'paper', 'other'] as const;
export type OutputKind = (typeof OUTPUT_KINDS)[number];

export const OUTPUT_KIND_LABEL: Record<OutputKind, string> = {
  demo: 'Demo',
  dataset: 'Dataset',
  tool: 'Tool',
  paper: 'Paper',
  other: 'Other',
};

/** A reusable output of a piece of research: a demo, dataset, tool, paper. */
export const outputSchema = z.strictObject({
  kind: z.enum(OUTPUT_KINDS),
  title: z.string().min(1),
  url: z.url().refine((u) => u.startsWith('https://'), 'must be an https:// URL'),
});

export const PLAIN_MIN = 20;
export const PLAIN_MAX = 600;

/** Rules for an entry that may be published. Messages name the field. */
export function checkPublishable(
  entry: { audience: string[]; publishable?: boolean; summaryPlain?: string },
  ctx: z.RefinementCtx,
): void {
  if (entry.publishable !== true) return;
  if (!entry.audience.includes('external')) {
    ctx.addIssue({
      code: 'custom',
      path: ['publishable'],
      message: 'publishable: true requires "external" in audience',
    });
  }
  const n = entry.summaryPlain?.length ?? 0;
  if (n < PLAIN_MIN || n > PLAIN_MAX) {
    ctx.addIssue({
      code: 'custom',
      path: ['summaryPlain'],
      message: `a publishable entry needs a summaryPlain of ${PLAIN_MIN}-${PLAIN_MAX} characters (found ${n})`,
    });
  }
}

interface Publishable {
  data: { audience: string[]; publishable?: boolean; sample?: boolean };
}

/** Both keys set, and not a sample. */
export function isPublished(entry: Publishable): boolean {
  const { audience, publishable, sample } = entry.data;
  return audience.includes('external') && publishable === true && sample !== true;
}

export function published<T extends Publishable>(entries: T[]): T[] {
  return entries.filter(isPublished);
}

/** For the researcher workspace: undefined when the entry does not list `external`. */
export function publicationState(entry: Publishable): 'published' | 'draft' | undefined {
  if (!entry.data.audience.includes('external')) return undefined;
  return isPublished(entry) ? 'published' : 'draft';
}
