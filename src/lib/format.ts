// Display formatting for the OKR section.

/** Whole percent. 100% only when actually complete, and never 0% when something has started. */
export function percent(progress: number): string {
  if (progress >= 1) return '100%';
  if (progress <= 0) return '0%';
  return `${Math.min(99, Math.max(1, Math.round(progress * 100)))}%`;
}

/** Drops floating-point noise: 0.1 + 0.2 shows as 0.3, 8 as 8. */
export function num(n: number): string {
  return String(Number(n.toFixed(2)));
}

/** "8 / 20 papers". */
export function keyResultText(kr: { current: number; target: number; unit: string }): string {
  return `${num(kr.current)} / ${num(kr.target)} ${kr.unit}`;
}
