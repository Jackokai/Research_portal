import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePasswords } from './protect-policy.ts';

const ok = { RESEARCHER_PASSWORD: 'a-long-researcher-pass', SUPERVISOR_PASSWORD: 'a-long-supervisor-pass' };

test('two valid, different passwords are accepted', () => {
  const r = validatePasswords(ok);
  assert.deepEqual(r.errors, []);
  assert.equal(r.passwords?.researcher, ok.RESEARCHER_PASSWORD);
});

test('missing variables are reported by name', () => {
  assert.deepEqual(validatePasswords({ SUPERVISOR_PASSWORD: ok.SUPERVISOR_PASSWORD }).errors, ['RESEARCHER_PASSWORD is not set']);
  assert.deepEqual(validatePasswords({ RESEARCHER_PASSWORD: ok.RESEARCHER_PASSWORD }).errors, ['SUPERVISOR_PASSWORD is not set']);
});

test('empty counts as missing', () => {
  assert.ok(validatePasswords({ ...ok, RESEARCHER_PASSWORD: '' }).errors.includes('RESEARCHER_PASSWORD is not set'));
});

test('short passwords are rejected; 15 fails, 16 passes', () => {
  assert.ok(validatePasswords({ ...ok, SUPERVISOR_PASSWORD: 'x'.repeat(15) }).errors[0].startsWith('SUPERVISOR_PASSWORD is shorter'));
  assert.deepEqual(validatePasswords({ ...ok, SUPERVISOR_PASSWORD: 'x'.repeat(16) }).errors, []);
});

test('identical passwords are rejected', () => {
  const same = 'the-very-same-password';
  assert.ok(validatePasswords({ RESEARCHER_PASSWORD: same, SUPERVISOR_PASSWORD: same }).errors.some((e) => e.includes('must be different')));
});

test('error messages never contain a password value', () => {
  const secret = 'short-secret';
  const r = validatePasswords({ RESEARCHER_PASSWORD: secret, SUPERVISOR_PASSWORD: secret });
  assert.ok(r.errors.every((e) => !e.includes(secret)));
});
