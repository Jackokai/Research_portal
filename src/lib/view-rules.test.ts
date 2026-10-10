import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { GuardEntry } from './external-guard.ts';
import { parseObjectives, shows, viewProblems, viewRules, type View } from './view-rules.ts';

const e = (collection: string, id: string, data: Record<string, unknown>, body?: string): GuardEntry => ({ collection, id, data, body });
const settings = (feedback: boolean, url?: string) => e('settings', 'settings', { features: { feedback }, board: url ? { url } : {} });

const objective = (title: string, current: number) => ({
  title,
  description: `Description of ${title}`,
  keyResults: [
    { title: `${title} first result`, unit: 'papers', start: 0, target: 20, current },
    { title: `${title} second result`, unit: 'questions', start: 10, target: 2, current: 6 },
  ],
});
const arch = (id: string, audience: string[], status: string, extra: Record<string, unknown> = {}) =>
  e('archive', id, { audience, title: `Title of ${id} entry`, status, summary: `Summary text of the ${id} entry.`, link: `https://example.com/${id}-materials`, ...extra }, `Body paragraph of the ${id} entry.`);

const content = (feedback: boolean): GuardEntry[] => [
  e('vision', 'main', { audience: ['researcher', 'external'], publishable: true, summaryPlain: 'Plain words about the whole vision for outsiders.' }, 'Internal vision body for the researcher.'),
  e('goals', 'q4', { audience: ['researcher', 'supervisor'], quarter: '2026-Q4', current: true, endDate: '2026-12-31', objectives: [objective('Current objective title', 8)] }),
  e('goals', 'q3', { audience: ['researcher', 'supervisor'], quarter: '2026-Q3', current: false, endDate: '2026-09-30', objectives: [objective('Older objective title', 20)] }),
  arch('private', ['researcher'], 'ongoing'),
  arch('live', ['researcher', 'supervisor'], 'ongoing'),
  arch('c1', ['researcher', 'supervisor'], 'completed', { completedOn: '2026-01-01' }),
  arch('c2', ['researcher', 'supervisor'], 'completed', { completedOn: '2026-02-01' }),
  arch('c3', ['researcher', 'supervisor'], 'completed', { completedOn: '2026-03-01' }),
  arch('c4', ['researcher', 'supervisor'], 'completed', { completedOn: '2026-04-01' }),
  arch('pub', ['researcher', 'external'], 'ongoing', { publishable: true, summaryPlain: 'A plain sentence about the published entry.' }),
  e('feedback', 'fb', { audience: ['researcher', 'supervisor'], from: 'Sample Supervisor', feedback: 'Please tighten the methods section.', status: 'open', date: '2026-10-01' }),
  e('feedback', 'fb-private', { audience: ['researcher'], from: 'Sample Reviewer', feedback: 'A private remark only for the researcher.', status: 'open', date: '2026-10-02' }),
  e('requirements', 'req', { audience: ['researcher'], requirement: 'A requirement raised by the researcher alone.', status: 'open', date: '2026-10-08' }),
  settings(feedback, 'https://github.com/users/x/projects/3'),
];

const texts = (fs: { text: string }[]) => fs.map((f) => f.text);

test('researcher: everything is required except summaryPlain; feedback follows the toggle', () => {
  const off = viewRules('researcher', content(false));
  for (const t of ['Title of private entry', 'Title of c1 entry', 'Current objective title', 'Older objective title', 'A requirement raised by the researcher alone.', 'Internal vision body for the researcher.']) {
    assert.ok(texts(off.required).includes(t), `required: ${t}`);
  }
  assert.ok(texts(off.forbidden).some((t) => t.includes('Plain words about the whole vision')), 'summaryPlain forbidden');
  assert.ok(texts(off.forbidden).includes('Please tighten the methods section.'), 'feedback forbidden when off');
  assert.ok(texts(off.forbidden).includes('https://github.com/users/x/projects/3'), 'board url not on the researcher page');
  const on = viewRules('researcher', content(true));
  assert.ok(texts(on.required).includes('Please tighten the methods section.'));
  assert.ok(texts(on.required).includes('A private remark only for the researcher.'));
});

test('supervisor: only supervisor-audience entries, current quarter, ongoing plus the 3 latest completed', () => {
  const r = viewRules('supervisor', content(false));
  const req = texts(r.required), forb = texts(r.forbidden);
  assert.ok(req.includes('Current objective title') && req.includes('Title of live entry'));
  assert.deepEqual(['c2', 'c3', 'c4'].every((id) => req.includes(`Title of ${id} entry`)), true, 'latest three completed');
  assert.ok(forb.includes('Title of c1 entry'), 'the oldest completed is not shown');
  assert.ok(forb.includes('Title of private entry'), 'researcher-only entry');
  assert.ok(forb.includes('Older objective title'), 'past quarter');
  assert.ok(forb.includes('Internal vision body for the researcher.'), 'vision');
  assert.ok(forb.includes('A requirement raised by the researcher alone.'), 'requirement');
  assert.ok(forb.includes('Title of pub entry'), 'an entry without supervisor');
  assert.ok(!forb.includes('https://github.com/users/x/projects/3'), 'the board link is allowed on the supervisor page');
  assert.ok(forb.includes('Please tighten the methods section.'), 'feedback off');
});

test('supervisor feedback: shown when on, but only entries listing supervisor', () => {
  const r = viewRules('supervisor', content(true));
  assert.ok(texts(r.required).includes('Please tighten the methods section.'));
  assert.ok(texts(r.forbidden).includes('A private remark only for the researcher.'));
});

test('public view is the Phase 4 external rule set', () => {
  const r = viewRules('public', content(true));
  assert.ok(texts(r.required).includes('A plain sentence about the published entry.'));
  assert.ok(texts(r.forbidden).includes('Summary text of the pub entry.'));
  assert.ok(texts(r.forbidden).some((t) => t.includes('Internal vision body')));
});

test('shows(): the toggle and the audience decide', () => {
  const all = content(false);
  const fb = all.find((x) => x.id === 'fb')!;
  assert.equal(shows('researcher', fb, all), false);
  assert.equal(shows('supervisor', fb, content(true)), true);
  assert.equal(shows('supervisor', all.find((x) => x.id === 'private')!, all), false);
});

// A page that shows exactly what the rules require, so each mutation below changes one thing.
function pageFor(view: View, feedback = false): { html: string; rules: ReturnType<typeof viewRules> } {
  const rules = viewRules(view, content(feedback));
  const blocks = rules.objectives.map((o) => `<div class="objective"><div class="objective-head"><h4 class="objective-title">${o.title}</h4><span class="badge badge-status">${o.label}</span></div><div class="progress-row"><span class="pct">${o.pct}</span></div><ul>${o.krPcts.map((p) => `<li class="kr"><span class="pct">${p}</span></li>`).join('')}</ul></div>`);
  const objectiveTitles = new Set(rules.objectives.map((o) => o.title));
  const paragraphs = rules.required.filter((f) => !objectiveTitles.has(f.text)).map((f) => `<p>${f.text}</p>`);
  return { html: `<html><body>${paragraphs.join('')}${blocks.join('')}</body></html>`, rules };
}

for (const view of ['researcher', 'supervisor', 'public'] as const) {
  test(`${view}: a page showing exactly what the rules require has no problems`, () => {
    for (const fb of [false, true]) {
      const { html, rules } = pageFor(view, fb);
      assert.deepEqual(viewProblems(view, html, rules), [], `feedback ${fb}`);
    }
  });
}

test('a forbidden text on a view is reported with the view and its source', () => {
  const cases: [View, string, string][] = [
    ['supervisor', 'Body paragraph of the private entry.', 'archive/private body'],
    ['supervisor', 'Older objective title', 'goals/q3'],
    ['supervisor', 'A requirement raised by the researcher alone.', 'requirements/req'],
    ['researcher', 'Plain words about the whole vision for outsiders.', 'vision/main summaryPlain'],
    ['public', 'Summary text of the pub entry.', 'archive/pub summary'],
  ];
  for (const [view, text, source] of cases) {
    const { html, rules } = pageFor(view);
    const p = viewProblems(view, html.replace('</body>', `<p>${text}</p></body>`), rules);
    assert.ok(p.some((x) => x.startsWith(`${view}: leak:`) && x.includes(source)), `${view} ${source}: ${p.join(' | ')}`);
  }
});

test('a required entry missing from a view is reported', () => {
  const { html, rules } = pageFor('supervisor');
  const p = viewProblems('supervisor', html.replace('<p>Title of live entry</p>', ''), rules);
  assert.ok(p.some((x) => x.startsWith('supervisor: missing:') && x.includes('archive/live title')));
});

test('an entry rendered twice in one view is reported', () => {
  const { html, rules } = pageFor('researcher');
  const p = viewProblems('researcher', html.replace('</body>', '<p>Title of live entry</p></body>'), rules);
  assert.ok(p.some((x) => x.startsWith('researcher: twice:') && x.includes('Title of live entry')));
});

test('objective values that differ from the content are reported (percent, label, key results, missing)', () => {
  const { html, rules } = pageFor('supervisor');
  const pct = rules.objectives[0].pct;
  assert.ok(viewProblems('supervisor', html.replace(`class="pct">${pct}<`, 'class="pct">99%<'), rules).some((x) => x.includes('shows 99%')));
  assert.ok(viewProblems('supervisor', html.replace('badge-status">In progress', 'badge-status">Done'), rules).some((x) => x.includes('shows "Done"')));
  const kr = rules.objectives[0].krPcts[0];
  assert.ok(viewProblems('supervisor', html.replace(`<li class="kr"><span class="pct">${kr}<`, '<li class="kr"><span class="pct">1%<'), rules).some((x) => x.includes('key results show')));
  assert.ok(viewProblems('supervisor', html.replace('class="objective"', 'class="other"'), rules).some((x) => x.includes('is not on the page')));
});

test('the same objective is identical in both views that show it', () => {
  const a = parseObjectives(pageFor('researcher').html).find((o) => o.title === 'Current objective title');
  const b = parseObjectives(pageFor('supervisor').html).find((o) => o.title === 'Current objective title');
  assert.deepEqual(a, b);
});

test('an objective title inside a longer line is not counted as a second render', () => {
  const { html, rules } = pageFor('researcher');
  const withEcho = html.replace('</body>', '<p>Description of Current objective title, repeated inside a longer line.</p></body>');
  assert.deepEqual(viewProblems('researcher', withEcho, rules), []);
});
