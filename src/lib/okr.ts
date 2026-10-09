// OKR progress derivation. Single implementation: pages must call this, never recompute.

export interface KeyResultValues {
  start: number;
  target: number;
  current: number;
}

export interface ObjectiveValues {
  keyResults: KeyResultValues[];
}

export type OkrLabel = 'planned' | 'in progress' | 'done';

/** Progress 0-1, clamped. Works for decreasing metrics (target < start). */
export function keyResultProgress({ start, target, current }: KeyResultValues): number {
  if (target === start) throw new Error('Key result target must differ from start');
  const raw = (current - start) / (target - start);
  return Math.min(1, Math.max(0, raw));
}

/** Mean of the key results' progress. */
export function objectiveProgress(objective: ObjectiveValues): number {
  const krs = objective.keyResults;
  if (krs.length === 0) throw new Error('Objective has no key results');
  return krs.reduce((sum, kr) => sum + keyResultProgress(kr), 0) / krs.length;
}

/** planned: every KR at start; done: every KR at 1; otherwise in progress. */
export function objectiveLabel(objective: ObjectiveValues): OkrLabel {
  const progress = objective.keyResults.map(keyResultProgress);
  if (progress.every((p) => p === 0)) return 'planned';
  if (progress.every((p) => p === 1)) return 'done';
  return 'in progress';
}
