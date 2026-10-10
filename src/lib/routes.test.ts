import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEGACY_PUBLIC, PRIVATE_LENSES, ROUTES, distFile, href } from './routes.ts';

test('the three routes are distinct and end in a slash', () => {
  const all = [...Object.values(ROUTES), LEGACY_PUBLIC];
  assert.equal(new Set(all).size, all.length);
  for (const r of all) assert.ok(r.startsWith('/') && r.endsWith('/'), r);
});

test('href adds the base path, with or without a trailing slash on the base', () => {
  assert.equal(href(ROUTES.public, '/Research_portal'), '/Research_portal/');
  assert.equal(href(ROUTES.researcher, '/Research_portal'), '/Research_portal/researcher/');
  assert.equal(href(ROUTES.supervisor, '/Research_portal/'), '/Research_portal/supervisor/');
  assert.equal(href(ROUTES.researcher, ''), '/researcher/');
  assert.equal(href(ROUTES.public, ''), '/');
});

test('distFile: the root is index.html, others are nested', () => {
  assert.equal(distFile(ROUTES.public), 'index.html');
  assert.equal(distFile(ROUTES.researcher), 'researcher/index.html');
  assert.equal(distFile(ROUTES.supervisor), 'supervisor/index.html');
  assert.equal(distFile(LEGACY_PUBLIC), 'public/index.html');
});

test('the private lenses are the researcher and supervisor, never the public one', () => {
  assert.deepEqual([...PRIVATE_LENSES].sort(), ['researcher', 'supervisor']);
});
