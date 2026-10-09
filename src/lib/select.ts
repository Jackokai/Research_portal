// Selection helpers for the supervisor view. Filtering by audience is the real separation between
// views, so it lives here, tested, and not in page templates.

interface WithId {
  id: string;
}

const cmp = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

export type Audience = 'researcher' | 'supervisor' | 'external';

/** Entries whose `audience` lists the given audience. */
export function forAudience<T extends { data: { audience: Audience[] } }>(entries: T[], audience: Audience): T[] {
  return entries.filter((e) => e.data.audience.includes(audience));
}

/** The `n` most recently completed entries, newest `completedOn` first (ties broken by id). */
export function recentCompleted<T extends WithId & { data: { status: string; completedOn?: string } }>(
  entries: T[],
  n: number,
): T[] {
  return entries
    .filter((e) => e.data.status === 'completed')
    .sort((a, b) => cmp(b.data.completedOn ?? '', a.data.completedOn ?? '') || cmp(a.id, b.id))
    .slice(0, n);
}

/** The quarter marked `current: true`, if any. */
export function currentQuarter<T extends { data: { current: boolean } }>(entries: T[]): T | undefined {
  return entries.find((e) => e.data.current);
}
