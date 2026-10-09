import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'astro/zod';
import { OUTPUT_KINDS, checkPublishable, isPublished, outputSchema, publicationState, published } from './publish.ts';

type D = { audience: string[]; publishable?: boolean; sample?: boolean };
const e = (data: D) => ({ data });

test('published only with external, publishable: true and not sample', () => {
  assert.equal(isPublished(e({ audience: ['external'], publishable: true })), true);
  assert.equal(isPublished(e({ audience: ['researcher', 'external'], publishable: true, sample: false })), true);
});

test('each missing condition on its own keeps the entry out', () => {
  assert.equal(isPublished(e({ audience: ['external'] })), false, 'no publishable');
  assert.equal(isPublished(e({ audience: ['external'], publishable: false })), false, 'publishable false');
  assert.equal(isPublished(e({ audience: ['researcher', 'supervisor'], publishable: true })), false, 'no external');
});

test('a sample flagged publishable is still excluded', () => {
  assert.equal(isPublished(e({ audience: ['external'], publishable: true, sample: true })), false);
});

test('published() filters and does not mutate', () => {
  const all = [e({ audience: ['external'], publishable: true }), e({ audience: ['external'] }), e({ audience: ['external'], publishable: true, sample: true })];
  assert.equal(published(all).length, 1);
  assert.equal(all.length, 3);
  assert.deepEqual(published([]), []);
});

test('publicationState: published, draft, or nothing without external', () => {
  assert.equal(publicationState(e({ audience: ['external'], publishable: true })), 'published');
  assert.equal(publicationState(e({ audience: ['external'] })), 'draft');
  assert.equal(publicationState(e({ audience: ['external'], publishable: true, sample: true })), 'draft');
  assert.equal(publicationState(e({ audience: ['researcher'] })), undefined);
});

const plain = 'A clear sentence for outsiders about this work.';
const schema = z
  .strictObject({ audience: z.array(z.string()), publishable: z.boolean().optional(), summaryPlain: z.string().optional() })
  .superRefine((v, ctx) => checkPublishable(v, ctx));

test('publishable: true without external is an error naming the field', () => {
  const r = schema.safeParse({ audience: ['researcher'], publishable: true, summaryPlain: plain });
  assert.ok(!r.success);
  assert.deepEqual(r.error.issues.map((i) => i.path[0]), ['publishable']);
});

test('summaryPlain length: 19 and 601 fail, 20 and 600 pass; missing fails', () => {
  const t = (s?: string) => schema.safeParse({ audience: ['external'], publishable: true, summaryPlain: s });
  assert.ok(!t('x'.repeat(19)).success);
  assert.ok(t('x'.repeat(20)).success);
  assert.ok(t('x'.repeat(600)).success);
  assert.ok(!t('x'.repeat(601)).success);
  assert.ok(!t(undefined).success);
});

test('a draft (external, not publishable) has no length rule', () => {
  assert.ok(schema.safeParse({ audience: ['external'], summaryPlain: 'short' }).success);
  assert.ok(schema.safeParse({ audience: ['external'], publishable: false }).success);
});

test('outputs: https only, known kinds, title required, no unknown keys', () => {
  const ok = { kind: 'demo', title: 'Try it', url: 'https://example.com/demo' };
  assert.ok(outputSchema.safeParse(ok).success);
  for (const kind of OUTPUT_KINDS) assert.ok(outputSchema.safeParse({ ...ok, kind }).success);
  assert.ok(!outputSchema.safeParse({ ...ok, url: 'http://example.com' }).success, 'http');
  assert.ok(!outputSchema.safeParse({ ...ok, url: 'javascript:alert(1)' }).success, 'javascript:');
  assert.ok(!outputSchema.safeParse({ ...ok, url: 'ftp://example.com/x' }).success, 'ftp');
  assert.ok(!outputSchema.safeParse({ ...ok, kind: 'video' }).success, 'unknown kind');
  assert.ok(!outputSchema.safeParse({ kind: 'demo', url: ok.url }).success, 'missing title');
  assert.ok(!outputSchema.safeParse({ ...ok, note: 'x' }).success, 'unknown key');
});
