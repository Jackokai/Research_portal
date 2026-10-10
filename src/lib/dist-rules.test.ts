import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distProblems, isRedirectOnly, type DistPages } from './dist-rules.ts';
import { PROMPT } from './leak.ts';

const prompt = (salt: string) =>
  `<html><head><title>${PROMPT.title}</title><meta name="robots" content="noindex, nofollow"></head><body><div class="staticrypt-form"><main><h1>${PROMPT.title}</h1><p>${PROMPT.instructions}</p><button>${PROMPT.toggleShow}</button><button>${PROMPT.button}</button></main></div><script>const cipher = "${salt}";</script></body></html>`;
const plain = '<html><head><title>Research in plain language</title></head><body><h1>Research in plain language</h1><p>Open to everyone.</p></body></html>';
const redirect = '<html><head><meta http-equiv="refresh" content="0; url=/Research_portal/"><title>Moved</title></head><body><main><p>This page has moved. <a href="/Research_portal/">Continue</a>.</p></main></body></html>';
const good: DistPages = { researcher: prompt('aaaa'), supervisor: prompt('bbbb'), publicRoot: plain, legacy: redirect };

test('a correctly protected dist has no problems', () => {
  assert.deepEqual(distProblems(good), []);
});

test('the redirect page is recognised, a page with a heading or a prompt is not', () => {
  assert.equal(isRedirectOnly(redirect), true);
  assert.equal(isRedirectOnly(plain), false);
  assert.equal(isRedirectOnly(redirect.replace('<main>', '<main><h1>Content</h1>')), false);
  assert.equal(isRedirectOnly(prompt('x')), false);
});

test('the public root encrypted by mistake is caught', () => {
  assert.ok(distProblems({ ...good, publicRoot: prompt('cccc') }).some((p) => p.includes('public root must stay open')));
});

test('the researcher page left plain is caught, naming it', () => {
  const p = distProblems({ ...good, researcher: plain });
  assert.ok(p.some((x) => x.startsWith('researcher page is not a password prompt')));
  assert.ok(p.some((x) => x.startsWith('researcher page lacks noindex')));
});

test('the supervisor page left plain is caught', () => {
  assert.ok(distProblems({ ...good, supervisor: plain }).some((x) => x.startsWith('supervisor page is not a password prompt')));
});

test('routes swapped: public and researcher pages exchanged fails twice', () => {
  const p = distProblems({ ...good, researcher: good.publicRoot, publicRoot: good.researcher });
  assert.ok(p.some((x) => x.startsWith('researcher page is not a password prompt')));
  assert.ok(p.some((x) => x.includes('public root must stay open')));
});

test('a prompt that shows extra text (a leak) is caught', () => {
  const leaky = good.researcher.replace('</main>', '<p>Goals and feedback live here.</p></main>');
  assert.ok(distProblems({ ...good, researcher: leaky }).some((x) => x.includes('beyond the prompt')));
});

test('/public/ turned into a content page or an encrypted prompt is caught', () => {
  assert.ok(distProblems({ ...good, legacy: plain }).some((x) => x.includes('plain redirect')));
  assert.ok(distProblems({ ...good, legacy: prompt('dddd') }).some((x) => x.includes('plain redirect')));
});

test('identical protected pages are caught', () => {
  assert.ok(distProblems({ ...good, supervisor: good.researcher }).some((x) => x.includes('identical')));
});
