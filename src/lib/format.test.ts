import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keyResultText, num, percent } from './format.ts';

test('percent: 1/3 is 33%, 0.5 is 50%, 1 is 100%', () => {
  assert.equal(percent(1 / 3), '33%');
  assert.equal(percent(0.5), '50%');
  assert.equal(percent(1), '100%');
  assert.equal(percent(0), '0%');
});

test('percent: the sample objective mean 0.6333 is 63%', () => {
  assert.equal(percent((0.4 + 0.5 + 1) / 3), '63%');
});

test('percent: never shows 100% unless complete, nor 0% once started', () => {
  assert.equal(percent(0.996), '99%');
  assert.equal(percent(0.001), '1%');
});

test('num drops floating-point noise', () => {
  assert.equal(num(0.1 + 0.2), '0.3');
  assert.equal(num(8), '8');
  assert.equal(num(2.5), '2.5');
});

test('key result text is "current / target unit"', () => {
  assert.equal(keyResultText({ current: 8, target: 20, unit: 'papers' }), '8 / 20 papers');
  assert.equal(keyResultText({ current: 6, target: 2, unit: 'questions' }), '6 / 2 questions');
  assert.equal(keyResultText({ current: 1, target: 1, unit: 'milestone' }), '1 / 1 milestone');
});
