import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentQuarter, forAudience, recentCompleted, type Audience } from './select.ts';

const e = (id: string, audience: Audience[]) => ({ id, data: { audience } });

test('forAudience keeps only entries listing the audience', () => {
  const all = [e('a', ['researcher']), e('b', ['researcher', 'supervisor']), e('c', ['external']), e('d', ['supervisor'])];
  assert.deepEqual(forAudience(all, 'supervisor').map((x) => x.id), ['b', 'd']);
  assert.deepEqual(forAudience(all, 'external').map((x) => x.id), ['c']);
});

test('forAudience: researcher-only entries never reach the supervisor', () => {
  assert.deepEqual(forAudience([e('private', ['researcher'])], 'supervisor'), []);
});

test('forAudience does not mutate its input', () => {
  const all = [e('a', ['researcher']), e('b', ['supervisor'])];
  forAudience(all, 'supervisor');
  assert.equal(all.length, 2);
});

const c = (id: string, status: string, completedOn?: string) => ({ id, data: { status, completedOn } });

test('recentCompleted: 3 newest by completedOn, ongoing ignored', () => {
  const a = [c('o', 'ongoing'), c('1', 'completed', '2026-01-01'), c('2', 'completed', '2026-09-01'), c('3', 'completed', '2026-05-01'), c('4', 'completed', '2026-07-01')];
  assert.deepEqual(recentCompleted(a, 3).map((x) => x.id), ['2', '4', '3']);
});

test('recentCompleted: fewer than n returns all; none returns empty', () => {
  assert.deepEqual(recentCompleted([c('1', 'completed', '2026-01-01')], 3).map((x) => x.id), ['1']);
  assert.deepEqual(recentCompleted([c('o', 'ongoing')], 3), []);
  assert.deepEqual(recentCompleted([], 3), []);
});

test('recentCompleted: equal dates are ordered by id', () => {
  const a = [c('b', 'completed', '2026-01-01'), c('a', 'completed', '2026-01-01')];
  assert.deepEqual(recentCompleted(a, 3).map((x) => x.id), ['a', 'b']);
});

test('currentQuarter returns the current one, or undefined', () => {
  assert.equal(currentQuarter([{ data: { current: false } }, { data: { current: true } }])?.data.current, true);
  assert.equal(currentQuarter([{ data: { current: false } }]), undefined);
  assert.equal(currentQuarter([]), undefined);
});
