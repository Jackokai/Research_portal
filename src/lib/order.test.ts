import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openFirstNewest, orderGoals, splitArchive } from './order.ts';

const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

test('goals: current quarter first, then newest to oldest', () => {
  const g = [
    { id: 'a', data: { current: false, quarter: '2026-Q2' } },
    { id: 'b', data: { current: false, quarter: '2026-Q3' } },
    { id: 'c', data: { current: true, quarter: '2026-Q1' } },
    { id: 'd', data: { current: false, quarter: '2025-Q4' } },
  ];
  assert.deepEqual(ids(orderGoals(g)), ['c', 'b', 'a', 'd']);
});

test('goals: does not mutate its input', () => {
  const g = [
    { id: 'a', data: { current: false, quarter: '2026-Q2' } },
    { id: 'b', data: { current: true, quarter: '2026-Q3' } },
  ];
  orderGoals(g);
  assert.deepEqual(ids(g), ['a', 'b']);
});

test('archive: ongoing separated; completed newest completedOn first', () => {
  const a = [
    { id: 'x', data: { status: 'completed' as const, completedOn: '2026-01-05' } },
    { id: 'y', data: { status: 'ongoing' as const } },
    { id: 'z', data: { status: 'completed' as const, completedOn: '2026-09-30' } },
    { id: 'w', data: { status: 'ongoing' as const } },
  ];
  const { ongoing, completed } = splitArchive(a);
  assert.deepEqual(ids(ongoing), ['w', 'y']);
  assert.deepEqual(ids(completed), ['z', 'x']);
});

test('archive: no entries gives empty groups', () => {
  assert.deepEqual(splitArchive([]), { ongoing: [], completed: [] });
});

test('feedback: open before addressed, newest first within each', () => {
  const f = [
    { id: '1', data: { status: 'addressed', date: '2026-09-15' } },
    { id: '2', data: { status: 'open', date: '2026-08-01' } },
    { id: '3', data: { status: 'open', date: '2026-10-01' } },
    { id: '4', data: { status: 'addressed', date: '2026-09-20' } },
  ];
  assert.deepEqual(ids(openFirstNewest(f, 'open')), ['3', '2', '4', '1']);
});

test('requirements: same rule with status "done"', () => {
  const r = [
    { id: 'a', data: { status: 'done', date: '2026-10-09' } },
    { id: 'b', data: { status: 'open', date: '2026-10-01' } },
  ];
  assert.deepEqual(ids(openFirstNewest(r, 'open')), ['b', 'a']);
});

test('equal dates fall back to id so the order is deterministic', () => {
  const f = [
    { id: 'b', data: { status: 'open', date: '2026-10-01' } },
    { id: 'a', data: { status: 'open', date: '2026-10-01' } },
  ];
  assert.deepEqual(ids(openFirstNewest(f, 'open')), ['a', 'b']);
});
