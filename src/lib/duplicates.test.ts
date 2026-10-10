import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findDuplicates } from './duplicates.ts';
import type { GuardEntry } from './external-guard.ts';

const e = (collection: string, id: string, data: Record<string, unknown>, body?: string): GuardEntry => ({ collection, id, data, body });
const shared = 'The same long sentence written once and then copied into another file.';

test('the same prose in two non-sample entries is flagged, naming both files', () => {
  const p = findDuplicates([e('archive', 'a', { audience: ['researcher'], summary: shared }), e('feedback', 'f', { audience: ['researcher'], feedback: shared })]);
  assert.equal(p.length, 1);
  assert.ok(p[0].includes('archive/a') && p[0].includes('feedback/f'));
});

test('duplicates inside a Markdown body are found, markup stripped', () => {
  const p = findDuplicates([e('archive', 'a', { audience: ['researcher'] }, `Intro line.\n\n**${shared}**`), e('vision', 'v', { audience: ['researcher'] }, shared)]);
  assert.equal(p.length, 1);
});

test('sample entries are exempt', () => {
  assert.deepEqual(findDuplicates([e('archive', 'a', { sample: true, audience: ['researcher'], summary: shared }), e('archive', 'b', { sample: true, audience: ['researcher'], summary: shared })]), []);
  assert.deepEqual(findDuplicates([e('archive', 'a', { sample: true, audience: ['researcher'], summary: shared }), e('archive', 'b', { audience: ['researcher'], summary: shared })]), [], 'one sample is enough to exempt the pair');
});

test('the same text twice inside one entry is not a duplicate', () => {
  assert.deepEqual(findDuplicates([e('archive', 'a', { audience: ['researcher'], summary: shared, summaryPlain: shared })]), []);
});

test('short repeats and audience arrays are ignored; the threshold is configurable', () => {
  assert.deepEqual(findDuplicates([e('archive', 'a', { audience: ['researcher'], summary: 'Short repeat.' }), e('archive', 'b', { audience: ['researcher'], summary: 'Short repeat.' })]), []);
  assert.equal(findDuplicates([e('archive', 'a', { audience: ['researcher'], summary: 'Short repeat.' }), e('archive', 'b', { audience: ['researcher'], summary: 'Short repeat.' })], 10).length, 1);
});

test('settings are not content duplicates', () => {
  assert.deepEqual(findDuplicates([e('settings', 'settings', { board: { url: 'https://github.com/users/x/projects/3/views/1' } }), e('archive', 'a', { audience: ['researcher'], link: 'https://github.com/users/x/projects/3/views/1' })]), []);
});

test('a sentence copied into a different paragraph is found', () => {
  const p = findDuplicates([
    e('archive', 'a', { audience: ['researcher'], summary: `Something short. ${shared} Another bit.` }),
    e('feedback', 'f', { audience: ['researcher'], feedback: `Different opening words here. ${shared}` }),
  ]);
  assert.equal(p.length, 1);
  assert.ok(p[0].includes(shared));
});
