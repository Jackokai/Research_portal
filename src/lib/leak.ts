// Checks that a protected page leaks nothing from its plain version.

/** Visible text fragments (scripts, styles and tags removed), trimmed. */
export function textFragments(html: string, minLength = 8): string[] {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  const titles = [...text.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map((m) => m[1]);
  const body = text.replace(/<[^>]+>/g, '\n');
  return [...titles, ...body.split('\n')]
    .map((s) => s.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim())
    .filter((s) => s.length >= minLength);
}

/** Fragments of the plain page that still appear in the protected page. Empty means no leak. */
export function findLeaks(plainHtml: string, protectedHtml: string): string[] {
  return [...new Set(textFragments(plainHtml))].filter((f) => protectedHtml.includes(f));
}

export function isNoindex(html: string): boolean {
  return /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

/** True for a page that still carries real content, i.e. is not a password prompt. */
export function isPrompt(html: string): boolean {
  return html.includes('staticrypt');
}

/** File names in dist/ that could carry page content outside the encrypted HTML. */
export function sideChannelFiles(paths: string[]): string[] {
  return paths.filter((p) => /\.(json|xml|rss|atom|txt|csv|ya?ml|md)$/i.test(p));
}

/** Prompt wording: single source for scripts/protect.ts (template options) and the allowlist below. */
export const PROMPT = {
  title: 'Sign in',
  instructions: 'Enter the password to continue.',
  placeholder: 'Password',
  button: 'Continue',
  remember: 'Remember on this device for 30 days',
  error: 'Incorrect password.',
  toggleShow: 'Show',
  toggleHide: 'Hide',
  loading: 'Loading…', // fixed text inside scripts/password-template.html
};

/** The only visible text a protected page may contain (the error message is filled in on failure only). */
export const PROMPT_TEXT = [PROMPT.title, PROMPT.instructions, PROMPT.placeholder, PROMPT.toggleShow, PROMPT.remember, PROMPT.button, PROMPT.loading];

/** Visible text in a protected page that is not part of the prompt. Empty means only the prompt is visible. */
export function unexpectedPromptText(html: string): string[] {
  return [...new Set(textFragments(html, 1))].filter((f) => !PROMPT_TEXT.includes(f));
}
