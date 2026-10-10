// Guard for the open /public/ page. It reads the CONTENT (not the page templates) and decides which
// prose must never appear on the page and which must. Every string in every entry is considered, so a
// field added later is forbidden by default until it is explicitly listed as shown.
import { isPublished } from './publish.ts';

export interface GuardEntry {
  collection: string;
  id: string;
  data: Record<string, unknown>;
  body?: string;
}

export interface Fragment {
  text: string;
  source: string; // e.g. "archive/sample-ongoing summary"
}

export interface Rules {
  required: Fragment[];
  forbidden: Fragment[];
}

/** Shorter strings (enum values, years, one-word labels) would collide with ordinary page text. */
const MIN_PROSE = 12;

/** Paths the external page is allowed to show for a published entry. */
function isShown(collection: string, path: string): boolean {
  if (collection === 'vision') return path === 'summaryPlain';
  if (collection === 'archive') {
    return path === 'title' || path === 'summaryPlain' || /^outputs\.\d+\.(title|url)$/.test(path);
  }
  return false;
}

function leaves(value: unknown, path: string, out: { path: string; text: string }[] = []) {
  if (typeof value === 'string') out.push({ path, text: value });
  else if (Array.isArray(value)) value.forEach((v, i) => leaves(v, path ? `${path}.${i}` : String(i), out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) leaves(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}

/** A copied run of at least WINDOW + STEP - 1 characters always contains one whole window. */
export const WINDOW = 40;
export const STEP = 20;

/**
 * Recognisable pieces of prose: each line, and for long lines overlapping windows, so that showing only
 * part of a long text is still caught. Limit: a paraphrase, or a copied run shorter than about 60
 * characters from the middle of a long line, is not caught.
 */
function fragmentsOf(text: string, windows = true): string[] {
  const out: string[] = [];
  for (const line of text.split(/\n+/).map((s) => s.trim()).filter((s) => s.length >= MIN_PROSE)) {
    out.push(line);
    if (windows && line.length > WINDOW) {
      for (let i = 0; i + WINDOW <= line.length; i += STEP) out.push(line.slice(i, i + WINDOW));
      out.push(line.slice(-WINDOW)); // the tail, which the stepping can miss
    }
  }
  return [...new Set(out)];
}

export function externalRules(entries: GuardEntry[]): Rules {
  const required: Fragment[] = [];
  const candidates: Fragment[] = [];
  const allowed: string[] = [];

  for (const e of entries) {
    const mayPublish = e.collection === 'vision' || e.collection === 'archive';
    const pub = mayPublish && isPublished({ data: e.data as { audience: string[]; publishable?: boolean; sample?: boolean } });
    const all = leaves(e.data, '');
    if (e.body) all.push({ path: 'body', text: e.body });

    for (const { path, text } of all) {
      const source = `${e.collection}/${e.id} ${path}`;
      if (pub && isShown(e.collection, path)) {
        allowed.push(text);
        if (path === 'summaryPlain') for (const f of fragmentsOf(text, false)) required.push({ text: f, source });
      } else {
        for (const f of fragmentsOf(text)) candidates.push({ text: f, source });
      }
    }
  }
  // Text that is legitimately shown (for example a URL used both as `link` and as an output) is not a leak.
  const forbidden = candidates.filter((c) => !allowed.some((a) => a.includes(c.text)));
  return { required, forbidden };
}

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Visible text of a page, one element per line, entities decoded. */
export function pageText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '\n')
      .replace(/<style[\s\S]*?<\/style>/gi, '\n')
      .replace(/<[^>]+>/g, '\n'),
  );
}

export function findProblems(html: string, rules: Rules): string[] {
  const text = pageText(html);
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const f of rules.forbidden) {
    if (seen.has(f.text)) continue;
    if (html.includes(f.text) || text.includes(f.text)) {
      seen.add(f.text);
      problems.push(`leak: ${JSON.stringify(f.text)} (from ${f.source}) appears on the external page`);
    }
  }
  for (const f of rules.required) {
    if (!text.includes(f.text)) problems.push(`missing: ${JSON.stringify(f.text)} (from ${f.source}) is not on the external page`);
  }
  return problems;
}

/** Front matter and body of a Markdown file; the body is empty if there is no front matter. */
export function splitFrontMatter(source: string): { front: string; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  return m ? { front: m[1], body: m[2].trim() } : { front: '', body: source.trim() };
}
