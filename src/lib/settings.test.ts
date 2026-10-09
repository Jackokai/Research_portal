import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSettings, settingsSchema } from './settings.ts';

test('defaults: feedback off and no board URL', () => {
  assert.deepEqual(resolveSettings({}), { features: { feedback: false }, board: {} });
  assert.equal(resolveSettings(undefined).features.feedback, false);
  assert.equal(resolveSettings(null).board.url, undefined);
});

test('explicit values are kept', () => {
  const s = resolveSettings({ features: { feedback: true }, board: { url: 'https://github.com/users/x/projects/1' } });
  assert.equal(s.features.feedback, true);
  assert.equal(s.board.url, 'https://github.com/users/x/projects/1');
});

test('a malformed board URL is rejected, naming the field', () => {
  const r = settingsSchema.safeParse({ board: { url: 'not a url' } });
  assert.ok(!r.success);
  assert.deepEqual(r.error.issues[0].path, ['board', 'url']);
});

test('unknown keys are rejected at both levels', () => {
  assert.ok(!settingsSchema.safeParse({ featurs: {} }).success);
  assert.ok(!settingsSchema.safeParse({ features: { feedbak: true } }).success);
  assert.ok(!settingsSchema.safeParse({ board: { link: 'https://x.dev' } }).success);
});

test('a non-boolean toggle is rejected', () => {
  const r = settingsSchema.safeParse({ features: { feedback: 'yes' } });
  assert.ok(!r.success);
  assert.deepEqual(r.error.issues[0].path, ['features', 'feedback']);
});

test('empty sections (YAML null, e.g. everything commented out) fall back to defaults', () => {
  assert.deepEqual(resolveSettings({ features: null, board: null }), { features: { feedback: false }, board: {} });
  assert.deepEqual(resolveSettings({ features: { feedback: true }, board: null }).board, {});
});
