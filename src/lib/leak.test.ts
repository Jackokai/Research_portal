import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findLeaks, isNoindex, isPrompt, sideChannelFiles, textFragments, unexpectedPromptText } from './leak.ts';

const plain = '<html><head><title>Researcher workspace · Research Portal</title></head><body><h1>Researcher workspace</h1><p>Goals and feedback live here.</p><script>var secretCode = "do-not-count-me-as-text";</script></body></html>';

test('text fragments ignore scripts and tags, include the title', () => {
  const f = textFragments(plain);
  assert.ok(f.includes('Goals and feedback live here.'));
  assert.ok(f.includes('Researcher workspace · Research Portal'));
  assert.ok(!f.some((x) => x.includes('do-not-count-me-as-text')));
});

test('a protected page with no shared text has no leaks', () => {
  assert.deepEqual(findLeaks(plain, '<html><body>Enter the password</body></html>'), []);
});

test('a leaked sentence or title is found', () => {
  assert.deepEqual(findLeaks(plain, '<p>Goals and feedback live here.</p>'), ['Goals and feedback live here.']);
  const leaks = findLeaks(plain, '<title>Researcher workspace · Research Portal</title>');
  assert.ok(leaks.includes('Researcher workspace · Research Portal'));
  assert.ok(leaks.includes('Researcher workspace'));
});

test('noindex and prompt detection', () => {
  assert.ok(isNoindex('<meta name="robots" content="noindex, nofollow">'));
  assert.ok(!isNoindex('<meta name="robots" content="index">'));
  assert.ok(isPrompt('<div class="staticrypt-form">'));
  assert.ok(!isPrompt(plain));
});

test('side-channel files are flagged, html/css/js are not', () => {
  assert.deepEqual(sideChannelFiles(['index.html', '_astro/a.css', 'feed.xml', 'data.json', 'sitemap.txt', 'x.js']), ['feed.xml', 'data.json', 'sitemap.txt']);
});

test('only prompt text is allowed on a protected page', () => {
  const prompt = '<title>Sign in</title><main><h1>Sign in</h1><p>Enter the password to continue.</p><button>Show</button><button>Continue</button></main><script>const x = "Goals in script are ignored";</script>';
  assert.deepEqual(unexpectedPromptText(prompt), []);
  assert.deepEqual(unexpectedPromptText(prompt + '<p>Goals and feedback live here.</p>'), ['Goals and feedback live here.']);
  assert.deepEqual(unexpectedPromptText(plain), ['Researcher workspace · Research Portal', 'Researcher workspace', 'Goals and feedback live here.']);
});
