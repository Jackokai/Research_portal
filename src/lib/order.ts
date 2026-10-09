// Pure ordering helpers for the researcher workspace. Entries only need an id and the fields used.

interface WithId {
  id: string;
}

const cmp = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** Current quarter first, then newest to oldest. Quarters look like "2026-Q4". */
export function orderGoals<T extends WithId & { data: { current: boolean; quarter: string } }>(entries: T[]): T[] {
  return [...entries].sort(
    (a, b) => Number(b.data.current) - Number(a.data.current) || cmp(b.data.quarter, a.data.quarter) || cmp(a.id, b.id),
  );
}

/** Ongoing entries (by id, stable) and completed entries (newest `completedOn` first). */
export function splitArchive<
  T extends WithId & { data: { status: 'ongoing' | 'completed'; completedOn?: string } },
>(entries: T[]): { ongoing: T[]; completed: T[] } {
  const ongoing = entries.filter((e) => e.data.status === 'ongoing').sort((a, b) => cmp(a.id, b.id));
  const completed = entries
    .filter((e) => e.data.status === 'completed')
    .sort((a, b) => cmp(b.data.completedOn ?? '', a.data.completedOn ?? '') || cmp(a.id, b.id));
  return { ongoing, completed };
}

/** Open before closed, newest first within each group. Used for feedback and requirements. */
export function openFirstNewest<T extends WithId & { data: { status: string; date: string } }>(
  entries: T[],
  openStatus: string,
): T[] {
  const rank = (e: T) => (e.data.status === openStatus ? 0 : 1);
  return [...entries].sort((a, b) => rank(a) - rank(b) || cmp(b.data.date, a.data.date) || cmp(a.id, b.id));
}
