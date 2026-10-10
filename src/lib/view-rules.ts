// What each view may and must show, derived from the content. This generalises the Phase 4 external guard to
// all three views. Rules follow Phases 2-4; changing a view on purpose means changing them here, with tests.
import { externalRules, fragmentsOf, findProblems, leaves, markdownToText, normalise, pageText, decodeEntities, type Fragment, type GuardEntry, type Rules } from './external-guard.ts';
import { percent } from './format.ts';
import { keyResultProgress, objectiveLabel, objectiveProgress } from './okr.ts';
import { isPublished } from './publish.ts';
import { recentCompleted } from './select.ts';

export type View = 'researcher' | 'supervisor' | 'public';
export const VIEWS: View[] = ['researcher', 'supervisor', 'public'];

export interface ExpectedObjective {
  source: string;
  title: string;
  label: string;
  pct: string;
  krPcts: string[];
}

export interface ViewRules extends Rules {
  /** Texts that must appear exactly once in the view. */
  once: Fragment[];
  /** Objective values the page must show, computed from the content. */
  objectives: ExpectedObjective[];
}

type Data = Record<string, any>; // content data is untyped YAML; shapes are enforced by the schemas

/** Prose fields the researcher and supervisor views render, per collection. */
const PRIVATE_SHOWN: Record<string, (path: string) => boolean> = {
  vision: (p) => p === 'body',
  goals: (p) => /^objectives\.\d+\.(title|description)$/.test(p) || /^objectives\.\d+\.keyResults\.\d+\.title$/.test(p),
  archive: (p) => p === 'title' || p === 'summary' || p === 'body',
  feedback: (p) => p === 'from' || p === 'feedback',
  requirements: (p) => p === 'requirement',
};

/** The one field per collection that identifies an entry on the page. */
const PRIMARY: Record<string, (path: string) => boolean> = {
  vision: (p) => p === 'body',
  goals: (p) => /^objectives\.\d+\.title$/.test(p),
  archive: (p) => p === 'title',
  feedback: (p) => p === 'feedback',
  requirements: (p) => p === 'requirement',
};

export function feedbackOn(entries: GuardEntry[]): boolean {
  const s = entries.find((e) => e.collection === 'settings');
  return (s?.data as Data | undefined)?.features?.feedback === true;
}

const listsSupervisor = (e: GuardEntry) => ((e.data as Data).audience ?? []).includes('supervisor');

/** Whether a view shows an entry at all. The public view is handled by externalRules. */
export function shows(view: 'researcher' | 'supervisor', e: GuardEntry, entries: GuardEntry[]): boolean {
  const d = e.data as Data;
  if (view === 'researcher') return e.collection === 'feedback' ? feedbackOn(entries) : e.collection in PRIVATE_SHOWN;
  if (!listsSupervisor(e)) return false;
  switch (e.collection) {
    case 'goals':
      return d.current === true;
    case 'archive': {
      if (d.status === 'ongoing') return true;
      const supervisorArchive = entries.filter((x) => x.collection === 'archive' && listsSupervisor(x));
      const recent = recentCompleted(
        supervisorArchive.map((x) => ({ id: x.id, data: x.data as { status: string; completedOn?: string } })),
        3,
      );
      return recent.some((r) => r.id === e.id);
    }
    case 'feedback':
      return feedbackOn(entries);
    default:
      return false; // vision and requirements are not on the supervisor page
  }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function expectedObjectives(e: GuardEntry): ExpectedObjective[] {
  return ((e.data as Data).objectives ?? []).map((o: Data) => ({
    source: `goals/${e.id}`,
    title: o.title,
    label: cap(objectiveLabel(o as never)),
    pct: percent(objectiveProgress(o as never)),
    krPcts: (o.keyResults ?? []).map((kr: Data) => percent(keyResultProgress(kr as never))),
  }));
}

export function viewRules(view: View, entries: GuardEntry[]): ViewRules {
  if (view === 'public') {
    const rules = externalRules(entries);
    const once: Fragment[] = [];
    for (const e of entries) {
      if (!['vision', 'archive'].includes(e.collection) || !isPublished({ data: e.data as never })) continue;
      const d = e.data as Data;
      once.push({ text: d.summaryPlain, source: `${e.collection}/${e.id} summaryPlain` });
      if (e.collection === 'archive') once.push({ text: d.title, source: `archive/${e.id} title` });
    }
    return { ...rules, once, objectives: [] };
  }

  const required: Fragment[] = [];
  const once: Fragment[] = [];
  const candidates: Fragment[] = [];
  const allowed: string[] = [];
  const objectives: ExpectedObjective[] = [];

  for (const e of entries) {
    const show = e.collection !== 'settings' && shows(view, e, entries);
    const all = leaves(e.data, '');
    if (e.body) all.push({ path: 'body', text: markdownToText(e.body) });
    for (const { path, text } of all) {
      const source = `${e.collection}/${e.id} ${path}`;
      if (show && PRIVATE_SHOWN[e.collection]?.(path)) {
        allowed.push(text);
        for (const f of fragmentsOf(text, false)) required.push({ text: f, source });
        if (PRIMARY[e.collection]?.(path)) {
          const first = fragmentsOf(text, false)[0];
          if (first) once.push({ text: first, source });
        }
      } else if (show && e.collection === 'archive' && path === 'link') {
        allowed.push(text); // shown as a link target, not as text
      } else if (view === 'supervisor' && e.collection === 'settings' && path === 'board.url') {
        allowed.push(text); // the supervisor page links to the board
      } else {
        for (const f of fragmentsOf(text)) candidates.push({ text: f, source });
      }
    }
    if (show && e.collection === 'goals') objectives.push(...expectedObjectives(e));
  }
  const forbidden = candidates.filter((c) => !allowed.some((a) => a.includes(c.text)));
  return { required, forbidden, once, objectives };
}

/** Objectives as the page shows them: title, label, objective percentage and key result percentages. */
export function parseObjectives(html: string): { title: string; label: string; pct: string; krPcts: string[] }[] {
  return html
    .split('<div class="objective">')
    .slice(1)
    .map((chunk) => {
      const title = /class="objective-title">([^<]*)</.exec(chunk)?.[1] ?? '';
      const label = /class="badge badge-status">([^<]*)</.exec(chunk)?.[1] ?? '';
      const pcts = [...chunk.matchAll(/class="pct">([^<]*)</g)].map((m) => m[1]);
      return { title: normalise(decodeEntities(title)), label, pct: pcts[0] ?? '', krPcts: pcts.slice(1) };
    });
}

/** Everything wrong with one built page against its rules. */
export function viewProblems(view: View, html: string, rules: ViewRules): string[] {
  const problems = findProblems(html, rules);
  // Count whole lines, not substrings: an objective title inside its own key-result title is not a second render.
  const lines = pageText(html).split('\n').map((l) => l.trim());
  for (const f of rules.once) {
    const n = lines.filter((l) => l === normalise(f.text)).length;
    if (n > 1) problems.push(`twice: ${JSON.stringify(f.text)} (from ${f.source}) appears ${n} times, expected once`);
  }
  if (rules.objectives.length) {
    const onPage = parseObjectives(html);
    for (const o of rules.objectives) {
      const got = onPage.find((p) => p.title === normalise(o.title));
      if (!got) {
        problems.push(`objective: ${JSON.stringify(o.title)} (from ${o.source}) is not on the page`);
        continue;
      }
      if (got.label !== o.label) problems.push(`objective: ${JSON.stringify(o.title)} shows "${got.label}", the content gives "${o.label}"`);
      if (got.pct !== o.pct) problems.push(`objective: ${JSON.stringify(o.title)} shows ${got.pct}, the content gives ${o.pct}`);
      if (JSON.stringify(got.krPcts) !== JSON.stringify(o.krPcts)) {
        problems.push(`objective: ${JSON.stringify(o.title)} key results show [${got.krPcts}], the content gives [${o.krPcts}]`);
      }
    }
  }
  return problems.map((p) => `${view}: ${p}`);
}
