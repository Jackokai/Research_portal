import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrastFailures, contrastRatio, readTokens } from './contrast.ts';

test('black on white is 21:1', () => {
  assert.ok(Math.abs(contrastRatio('#000000', '#ffffff') - 21) < 1e-9);
});

test('#767676 on white just passes, #777777 just fails 4.5:1', () => {
  assert.ok(contrastRatio('#767676', '#ffffff') >= 4.5);
  assert.ok(contrastRatio('#777777', '#ffffff') < 4.5);
});

const css = (light: string, dark: string) =>
  `:root{${light}}\n@media (prefers-color-scheme: dark){:root{${dark}}}`;
const all = (v: Record<string, string>) => Object.entries(v).map(([k, x]) => `${k}:${x};`).join('');
const good = {
  '--bg': '#ffffff', '--surface': '#f5f5f7', '--text': '#1d1d1f', '--text-secondary': '#6e6e73',
  '--accent': '#0066cc', '--accent-text': '#ffffff', '--danger': '#c4001a',
};

test('dark block overrides light values', () => {
  const t = readTokens(css(all(good), '--bg:#000000;'));
  assert.equal(t.light['--bg'], '#ffffff');
  assert.equal(t.dark['--bg'], '#000000');
  assert.equal(t.dark['--text'], '#1d1d1f');
});

test('a low-contrast pair is reported with mode and names', () => {
  const failures = contrastFailures(css(all({ ...good, '--text-secondary': '#aaaaaa' }), ''));
  assert.ok(failures.some((f) => f.startsWith('light: --text-secondary on --bg')));
});

test('all good tokens pass', () => {
  assert.deepEqual(contrastFailures(css(all(good), '--bg:#ffffff;')), []);
});
