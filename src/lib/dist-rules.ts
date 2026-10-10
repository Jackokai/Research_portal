// Rules for the FINAL dist/ after the protect step, as pure functions so they can be tested,
// including with the routes deliberately swapped.
import { isNoindex, isPrompt, unexpectedPromptText } from './leak.ts';

export interface DistPages {
  researcher: string;
  supervisor: string;
  publicRoot: string;
  legacy: string; // the /public/ redirect page
}

/** A redirect page forwards and nothing else: a refresh, no headings, no content. */
export function isRedirectOnly(html: string): boolean {
  return /http-equiv="refresh"/i.test(html) && !/<h[1-6][\s>]/i.test(html) && !isPrompt(html);
}

export function distProblems(p: DistPages): string[] {
  const problems: string[] = [];
  for (const [name, html] of [['researcher', p.researcher], ['supervisor', p.supervisor]] as const) {
    if (!isPrompt(html)) problems.push(`${name} page is not a password prompt`);
    if (!isNoindex(html)) problems.push(`${name} page lacks noindex`);
    const extra = unexpectedPromptText(html);
    if (extra.length) problems.push(`${name} page shows text beyond the prompt: ${extra.map((e) => JSON.stringify(e)).join(', ')}`);
  }
  if (isPrompt(p.publicRoot)) problems.push('the public root must stay open, but it is a password prompt');
  if (!isRedirectOnly(p.legacy)) problems.push('/public/ must be a plain redirect page');
  if (p.researcher === p.supervisor) problems.push('the researcher and supervisor pages are identical');
  return problems;
}
