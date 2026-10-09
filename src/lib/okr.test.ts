import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keyResultProgress, objectiveLabel, objectiveProgress } from './okr.ts';

const kr = (start: number, target: number, current: number) => ({ start, target, current });

test('increasing KR: 0 -> 3, current 1', () => {
  assert.ok(Math.abs(keyResultProgress(kr(0, 3, 1)) - 1 / 3) < 1e-9);
});

test('decreasing KR: 10 -> 2, current 6', () => {
  assert.equal(keyResultProgress(kr(10, 2, 6)), 0.5);
});

test('milestone KR: 0 -> 1', () => {
  assert.equal(keyResultProgress(kr(0, 1, 0)), 0);
  assert.equal(keyResultProgress(kr(0, 1, 1)), 1);
});

test('clamping beyond target and before start', () => {
  assert.equal(keyResultProgress(kr(0, 4, 6)), 1);
  assert.equal(keyResultProgress(kr(2, 4, 1)), 0);
  assert.equal(keyResultProgress(kr(10, 2, 12)), 0);
  assert.equal(keyResultProgress(kr(10, 2, 0)), 1);
});

test('target equal to start throws', () => {
  assert.throws(() => keyResultProgress(kr(1, 1, 1)));
});

test('objective progress is the mean of its KRs', () => {
  assert.equal(objectiveProgress({ keyResults: [kr(0, 4, 2), kr(0, 1, 1)] }), 0.75);
});

test('derived labels', () => {
  assert.equal(objectiveLabel({ keyResults: [kr(0, 4, 0), kr(10, 2, 10)] }), 'planned');
  assert.equal(objectiveLabel({ keyResults: [kr(0, 4, 4), kr(0, 1, 1)] }), 'done');
  assert.equal(objectiveLabel({ keyResults: [kr(0, 4, 4), kr(0, 1, 0)] }), 'in progress');
});
