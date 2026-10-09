import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findHardCodedColours } from './colours.ts';

test('finds hex, rgb and named colours', () => {
  assert.equal(findHardCodedColours('a { color: #fff; }')[0].kind, 'hex colour');
  assert.equal(findHardCodedColours('a { background: rgba(0,0,0,.5); }')[0].kind, 'rgb()/hsl() colour');
  assert.equal(findHardCodedColours('a { color: white; }')[0].kind, 'named colour');
});

test('reports the line number', () => {
  assert.equal(findHardCodedColours('a {\n  color: #123456;\n}')[0].line, 2);
});

test('token variables and in-page anchors are fine', () => {
  assert.deepEqual(findHardCodedColours('a { color: var(--accent); border: 1px solid var(--border); }'), []);
  assert.deepEqual(findHardCodedColours('<a href="#goals">Goals</a> <h2 id="archive">'), []);
  assert.deepEqual(findHardCodedColours('<p>It&#39;s fine</p>'), []);
});
