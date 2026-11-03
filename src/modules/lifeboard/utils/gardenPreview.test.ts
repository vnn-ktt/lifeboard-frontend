import { describe, expect, it } from 'vitest';
import { gardenPreview, GARDEN_PREVIEW_LIMIT } from './gardenPreview';
import type { LifeGoal } from '../types';

function goals(count: number): LifeGoal[] {
  return Array.from({ length: count }, (_, i) => ({
    id:`id-${i}`, title:`Goal ${i}`, areaId:'other', horizon:'month', description:'',
    target:1, createdAt:'2026-11-01T00:00:00.000Z',
  }));
}
describe('garden preview', () => {
  it('renders only four of fifty goals until expanded', () => {
    const entries = goals(50);
    expect(gardenPreview(entries,null,false)).toHaveLength(GARDEN_PREVIEW_LIMIT);
    expect(gardenPreview(entries,null,true)).toHaveLength(50);
  });
  it('keeps selected goal accessible without expanding all', () => {
    const entries=goals(50);
    const preview=gardenPreview(entries,'id-49',false);
    expect(preview).toHaveLength(4);
    expect(preview.some(goal=>goal.id==='id-49')).toBe(true);
  });
  it('shows every goal if there are fewer than four', () => {
    expect(gardenPreview(goals(3),null,false)).toHaveLength(3);
  });
});
