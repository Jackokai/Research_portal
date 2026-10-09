// WCAG 2.x contrast helpers and a tiny tokens.css reader.

export function parseHex(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Not a 6-digit hex colour: ${hex}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Custom properties from a CSS block body, e.g. "--bg: #fff; --text: #000;". */
export function readVars(block: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const m of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) vars[m[1]] = m[2].trim();
  return vars;
}

/** Light and dark variable sets from tokens.css (":root {…}" and the dark media block). */
export function readTokens(css: string): { light: Record<string, string>; dark: Record<string, string> } {
  const dark = /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([^}]*)\}/.exec(css);
  if (!dark) throw new Error('tokens.css: dark-mode block not found');
  const withoutDark = css.replace(dark[0], '');
  const light = /:root\s*\{([^}]*)\}/.exec(withoutDark);
  if (!light) throw new Error('tokens.css: :root block not found');
  const lightVars = readVars(light[1]);
  return { light: lightVars, dark: { ...lightVars, ...readVars(dark[1]) } };
}

/** [foreground, background] pairs that must reach 4.5:1 (WCAG AA, normal text). */
export const TEXT_PAIRS: Array<[string, string]> = [
  ['--text', '--bg'],
  ['--text', '--surface'],
  ['--text-secondary', '--bg'],
  ['--text-secondary', '--surface'],
  ['--accent', '--bg'],
  ['--accent', '--surface'],
  ['--accent-text', '--accent'],
  ['--danger', '--bg'],
  ['--danger', '--surface'],
];

export function contrastFailures(css: string, min = 4.5): string[] {
  const { light, dark } = readTokens(css);
  const failures: string[] = [];
  for (const [mode, vars] of [['light', light], ['dark', dark]] as const) {
    for (const [fg, bg] of TEXT_PAIRS) {
      const ratio = contrastRatio(vars[fg], vars[bg]);
      if (ratio < min) failures.push(`${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1 (needs ${min}:1)`);
    }
  }
  return failures;
}
