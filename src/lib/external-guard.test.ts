import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STEP, WINDOW, decodeEntities, externalRules, findProblems, pageText, splitFrontMatter, type GuardEntry } from './external-guard.ts';

const published: GuardEntry = {
  collection: 'archive',
  id: 'pub',
  data: {
    audience: ['researcher', 'external'],
    publishable: true,
    title: 'Mapping coastal erosion',
    status: 'completed',
    completedOn: '2026-05-01',
    summary: 'Technical summary with lots of jargon about sediment flux.',
    link: 'https://example.com/private-materials',
    summaryPlain: 'We measured how fast beaches are disappearing.',
    outputs: [{ kind: 'dataset', title: 'Beach photos 2020-2025', url: 'https://example.com/data' }],
  },
  body: 'First paragraph of internal notes.\n\nSecond paragraph of internal notes.',
};
const draft: GuardEntry = { collection: 'archive', id: 'draft', data: { audience: ['external'], title: 'Unfinished draft work', summary: 'Draft summary that is not approved.', summaryPlain: 'Draft plain text not yet approved.' } };
const sample: GuardEntry = { collection: 'archive', id: 'sample', data: { audience: ['external'], publishable: true, sample: true, title: 'SAMPLE: Placeholder entry', summaryPlain: 'SAMPLE: placeholder plain text for outsiders.' } };
const feedback: GuardEntry = { collection: 'feedback', id: 'f', data: { audience: ['supervisor'], from: 'Dr Someone', feedback: 'Please tighten the methods section.' } };
const settings: GuardEntry = { collection: 'settings', id: 'settings', data: { board: { url: 'https://github.com/users/x/projects/9' } } };
const all = [published, draft, sample, feedback, settings];

// A page that renders exactly what the external view is allowed to show.
const goodPage = `<html><body><h1>Research in plain language</h1><article><h3>Mapping coastal erosion</h3>
<p>Completed 2026-05-01</p><p>We measured how fast beaches are disappearing.</p>
<ul><li><a href="https://example.com/data">Beach photos 2020-2025</a></li></ul></article></body></html>`;

test('a page showing only the allowed fields has no problems', () => {
  assert.deepEqual(findProblems(goodPage, externalRules(all)), []);
});

test('required: the published summaryPlain; shown fields and drafts are classified correctly', () => {
  const r = externalRules(all);
  assert.deepEqual(r.required.map((f) => f.text), ['We measured how fast beaches are disappearing.']);
  const forbidden = r.forbidden.map((f) => f.text);
  for (const t of [
    'Technical summary with lots of jargon about sediment flux.',
    'https://example.com/private-materials',
    'First paragraph of internal notes.',
    'Draft summary that is not approved.',
    'Draft plain text not yet approved.',
    'SAMPLE: placeholder plain text for outsiders.',
    'Please tighten the methods section.',
    'https://github.com/users/x/projects/9',
  ]) assert.ok(forbidden.includes(t), `should be forbidden: ${t}`);
  assert.ok(!forbidden.includes('Mapping coastal erosion'), 'shown title is not forbidden');
  assert.ok(!forbidden.includes('Beach photos 2020-2025'), 'shown output title is not forbidden');
});

const leakInto = (extra: string) => findProblems(goodPage.replace('</article>', `${extra}</article>`), externalRules(all));

test('each deliberate leak is caught and names its source', () => {
  for (const [label, html, source] of [
    ['summary', '<p>Technical summary with lots of jargon about sediment flux.</p>', 'archive/pub summary'],
    ['body', '<p>First paragraph of internal notes.</p>', 'archive/pub body'],
    ['link', '<a href="https://example.com/private-materials">materials</a>', 'archive/pub link'],
    ['draft', '<p>Draft plain text not yet approved.</p>', 'archive/draft'],
    ['sample', '<p>SAMPLE: placeholder plain text for outsiders.</p>', 'archive/sample'],
    ['feedback', '<p>Please tighten the methods section.</p>', 'feedback/f'],
    ['board url', '<a href="https://github.com/users/x/projects/9">board</a>', 'settings/settings'],
  ]) {
    const p = leakInto(html);
    assert.ok(p.some((x) => x.startsWith('leak:') && x.includes(source)), `${label}: ${p.join(' / ')}`);
  }
});

test('a leak is found even when the page escapes it (&amp; and quotes)', () => {
  const e: GuardEntry = { collection: 'feedback', id: 'q', data: { audience: ['supervisor'], feedback: `It's wrong & "bad" in several ways.` } };
  const p = findProblems('<p>It&#39;s wrong &amp; &quot;bad&quot; in several ways.</p>', externalRules([e]));
  assert.equal(p.length, 1);
});

test('a missing summaryPlain is reported', () => {
  const p = findProblems('<html><body>Nothing here</body></html>', externalRules(all));
  assert.ok(p.some((x) => x.startsWith('missing:') && x.includes('archive/pub summaryPlain')));
});

test('text that is legitimately shown is not a leak even if it is also another field', () => {
  const e: GuardEntry = { ...published, data: { ...published.data, link: 'https://example.com/data' } };
  assert.deepEqual(findProblems(goodPage, externalRules([e])), []);
});

test('a new unknown field on a published entry is forbidden by default', () => {
  const e: GuardEntry = { ...published, data: { ...published.data, internalNote: 'Remember to hide this extra note.' } };
  const p = findProblems(goodPage.replace('</article>', '<p>Remember to hide this extra note.</p></article>'), externalRules([e]));
  assert.ok(p.some((x) => x.includes('internalNote')));
});

test('nothing published: empty page needs nothing and any entry text is a leak', () => {
  const r = externalRules([draft]);
  assert.deepEqual(r.required, []);
  assert.deepEqual(findProblems('<p>Nothing is published yet.</p>', r), []);
  assert.equal(findProblems('<p>Draft plain text not yet approved.</p>', r).length, 1);
});

test('helpers: entity decoding, page text, front matter', () => {
  assert.equal(decodeEntities('a &amp; b &lt;c&gt; &#39;d&#39; &quot;e&quot; &#x41;'), `a & b <c> 'd' "e" A`);
  assert.ok(!pageText('<p>a</p><script>var secret="hidden text here";</script><style>.x{}</style>').includes('hidden text here'));
  assert.deepEqual(splitFrontMatter('---\nk: v\n---\nBody text\n'), { front: 'k: v', body: 'Body text' });
  assert.deepEqual(splitFrontMatter('No front matter'), { front: '', body: 'No front matter' });
});

const long: GuardEntry = {
  collection: 'archive',
  id: 'long',
  data: { audience: ['researcher'], title: 'Long internal entry', summary: 'The first sentence of the summary is quite ordinary. The second sentence carries the confidential finding about sediment flux in estuaries. The third sentence wraps things up neatly.' },
};

test('showing only part of a long text is caught', () => {
  const r = externalRules([long]);
  const s = long.data.summary as string;
  const run = (n: number, from = 0) => `<p>${s.slice(from, from + n)}</p>`;
  assert.ok(findProblems(run(s.length), r).length > 0, 'whole text');
  assert.ok(findProblems(run(80), r).length > 0, 'first 80 chars');
  assert.ok(findProblems(run(70, 55), r).length > 0, '70 chars from the middle');
  assert.ok(findProblems(run(70, s.length - 70), r).length > 0, 'the last 70 chars');
  assert.ok(findProblems('<p>The second sentence carries the confidential finding about sediment flux in estuaries.</p>', r).length > 0, 'one sentence');
});

test('every copied run of WINDOW + STEP - 1 characters is caught, at every offset', () => {
  const r = externalRules([long]);
  const s = long.data.summary as string;
  const n = WINDOW + STEP - 1;
  for (let from = 0; from + n <= s.length; from++) {
    assert.ok(findProblems(`<p>${s.slice(from, from + n)}</p>`, r).length > 0, `offset ${from}`);
  }
});

test('documented limit: a short run from the middle of a long line is not caught', () => {
  const r = externalRules([long]);
  const s = long.data.summary as string;
  assert.deepEqual(findProblems(`<p>${s.slice(60, 60 + 25)}</p>`, r), []);
});
