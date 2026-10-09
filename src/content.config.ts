import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { settingsSchema } from './lib/settings';

const base = './content';

// ---- shared pieces ----

const audience = z
  .array(z.enum(['researcher', 'supervisor', 'external']))
  .min(1, 'audience must list at least one of: researcher, supervisor, external')
  .refine((a) => new Set(a).size === a.length, 'audience must not repeat a value');

/**
 * YYYY-MM-DD, a real calendar date, written as a QUOTED YAML string ("2026-10-01").
 * Unquoted YAML dates are parsed to Date objects, and an impossible one such as 2026-13-40
 * can be silently rolled over to a different valid date, so Dates are rejected outright.
 */
const isoDate = z
  .string({ error: 'dates must be quoted strings like "2026-10-01"' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, 'not a real calendar date');

const sample = z.boolean().optional();
const plain = z.string().min(1);

type Audience = z.infer<typeof audience>;

function requirePlain(
  audienceList: Audience,
  value: string | undefined,
  ctx: z.RefinementCtx,
  path: (string | number)[] = [],
) {
  if (audienceList.includes('external') && !value) {
    ctx.addIssue({
      code: 'custom',
      path: [...path, 'summaryPlain'],
      message: 'summaryPlain is required when audience includes "external"',
    });
  }
}

// ---- vision ----

const vision = defineCollection({
  loader: glob({ pattern: '*.md', base: `${base}/vision` }),
  schema: z
    .strictObject({ audience, sample, summaryPlain: plain.optional() })
    .superRefine((v, ctx) => requirePlain(v.audience, v.summaryPlain, ctx)),
});

// ---- goals (OKRs) ----

const keyResult = z
  .strictObject({
    title: z.string().min(1),
    unit: z.string().min(1),
    start: z.number(),
    target: z.number(),
    current: z.number(),
  })
  .refine((kr) => kr.target !== kr.start, {
    path: ['target'],
    message: 'target must differ from start (milestones use start 0, target 1)',
  });

const objective = z.strictObject({
  title: z.string().min(1),
  description: z.string().optional(),
  summaryPlain: plain.optional(),
  keyResults: z.array(keyResult).min(2, 'an objective needs 2-5 key results').max(5, 'an objective needs 2-5 key results'),
});

/** Last day of a calendar quarter "YYYY-Qn" falls in [first, last] month range. */
function quarterRange(q: string): { from: string; to: string } | null {
  const m = /^(\d{4})-Q([1-4])$/.exec(q);
  if (!m) return null;
  const year = m[1];
  const n = Number(m[2]);
  const ends = ['03-31', '06-30', '09-30', '12-31'];
  const starts = ['01-01', '04-01', '07-01', '10-01'];
  return { from: `${year}-${starts[n - 1]}`, to: `${year}-${ends[n - 1]}` };
}

const goals = defineCollection({
  loader: glob({ pattern: '*.{yaml,yml}', base: `${base}/goals` }),
  schema: z
    .strictObject({
      audience,
      sample,
      quarter: z.string().regex(/^\d{4}-Q[1-4]$/, 'quarter must look like 2026-Q4'),
      current: z.boolean(),
      endDate: isoDate,
      objectives: z.array(objective).min(1, 'a quarter needs 1-5 objectives').max(5, 'a quarter needs 1-5 objectives'),
    })
    .superRefine((g, ctx) => {
      const range = quarterRange(g.quarter);
      if (range && (g.endDate < range.from || g.endDate > range.to)) {
        ctx.addIssue({
          code: 'custom',
          path: ['endDate'],
          message: `endDate must fall inside ${g.quarter} (${range.from} to ${range.to})`,
        });
      }
      g.objectives.forEach((o, i) => requirePlain(g.audience, o.summaryPlain, ctx, ['objectives', i]));
    }),
});

// ---- archive ----

const archive = defineCollection({
  loader: glob({ pattern: '*.md', base: `${base}/archive` }),
  schema: z
    .strictObject({
      audience,
      sample,
      title: z.string().min(1),
      status: z.enum(['ongoing', 'completed']),
      completedOn: isoDate.optional(),
      summary: z.string().min(1),
      link: z.url().optional(),
      summaryPlain: plain.optional(),
    })
    .superRefine((a, ctx) => {
      if (a.status === 'completed' && !a.completedOn) {
        ctx.addIssue({ code: 'custom', path: ['completedOn'], message: 'completedOn is required when status is "completed"' });
      }
      if (a.status === 'ongoing' && a.completedOn) {
        ctx.addIssue({ code: 'custom', path: ['completedOn'], message: 'completedOn must be absent when status is "ongoing"' });
      }
      requirePlain(a.audience, a.summaryPlain, ctx);
    }),
});

// ---- feedback ----

const feedback = defineCollection({
  loader: glob({ pattern: '*.{yaml,yml}', base: `${base}/feedback` }),
  schema: z.strictObject({
    audience,
    sample,
    date: isoDate,
    from: z.string().min(1),
    feedback: z.string().min(1),
    status: z.enum(['open', 'addressed']),
  }),
});

// ---- requirements ----

const requirements = defineCollection({
  loader: glob({ pattern: '*.{yaml,yml}', base: `${base}/requirements` }),
  schema: z.strictObject({
    audience,
    sample,
    date: isoDate,
    requirement: z.string().min(1),
    status: z.enum(['open', 'done']),
  }),
});

// ---- settings (site configuration, exempt from the `audience` rule) ----

const settings = defineCollection({
  loader: glob({ pattern: 'settings.yaml', base }),
  schema: settingsSchema,
});

export const collections = { vision, goals, archive, feedback, requirements, settings };
