import type { LifeGoal } from '../types';

/** Keeps the garden compact even with 30–50 goals in the same stage.
 * The full list remains in the goal list and in the expandable, scrollable stage.
 */
export const GARDEN_PREVIEW_LIMIT = 4;
export function gardenPreview(goals: LifeGoal[], selectedId: string | null, expanded: boolean, limit = GARDEN_PREVIEW_LIMIT): LifeGoal[] {
  if (expanded || goals.length <= limit) return goals;
  const preview = goals.slice(0, limit);
  const selected = goals.find(goal => goal.id === selectedId);
  if (selected && !preview.some(goal => goal.id === selected.id)) preview[preview.length - 1] = selected;
  return preview;
}
