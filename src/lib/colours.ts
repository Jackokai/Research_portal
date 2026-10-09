// Finds hard-coded colours. All colours must come from the tokens in src/styles/tokens.css.

const PATTERNS: Array<[string, RegExp]> = [
  ['hex colour', /#[0-9a-fA-F]{3,8}\b/g],
  ['rgb()/hsl() colour', /\b(?:rgba?|hsla?)\s*\(/g],
];

/** Named colours are rare in our CSS, but the common ones are caught too. */
const NAMED = /(?:color|background|border(?:-[a-z]+)?|fill|stroke)\s*:\s*(?:white|black|red|green|blue|gray|grey|orange|yellow|purple)\b/gi;

export interface ColourFinding {
  line: number;
  kind: string;
  text: string;
}

export function findHardCodedColours(source: string): ColourFinding[] {
  const findings: ColourFinding[] = [];
  source.split('\n').forEach((text, i) => {
    // Anchors like href="#goals" and entities are not colours.
    const line = text.replace(/(?:href|id|for|aria-controls)\s*=\s*["'][^"']*["']/g, '').replace(/&#\d+;/g, '');
    for (const [kind, re] of PATTERNS) if (new RegExp(re).test(line)) findings.push({ line: i + 1, kind, text: text.trim() });
    if (new RegExp(NAMED).test(line)) findings.push({ line: i + 1, kind: 'named colour', text: text.trim() });
  });
  return findings;
}
