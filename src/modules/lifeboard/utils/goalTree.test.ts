import { describe, expect, it } from 'vitest';
import { goalsToTree } from './goalTree';
import type { LifeGoal } from '../types';
const goal = (id: string, parentId: string | null = null, horizon: LifeGoal['horizon'] = 'month'): LifeGoal => ({
  id, title: id, description: '', parentId, areaId: 'learning', horizon, target: 5, createdAt: new Date(2026, 0, 1).toISOString(),
});
describe('goalsToTree', () => {
  it('keeps parent-child links without mutating store objects', () => {
    const data = [goal('child', 'parent'), goal('parent', null, 'year')];
    const tree = goalsToTree(data, goal => goal.title);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.children?.[0]?.key).toBe('child');
    expect(data[0]?.parentId).toBe('parent');
  });
  it('promotes orphans to roots instead of hiding them', () => expect(goalsToTree([goal('x', 'deleted')], g => g.title)).toHaveLength(1));
  it('breaks cycles safely', () => {
    const result = goalsToTree([goal('a', 'b'), goal('b', 'a')], g => g.title);
    expect(result.map(n => n.key).sort()).toEqual(['a', 'b']);
  });
  it('sorts by horizon, then label', () => expect(goalsToTree([goal('month'), goal('year', null, 'year')], g => g.title).map(n => n.key)).toEqual(['year', 'month']));
  it('does not repeat duplicate IDs', () => expect(goalsToTree([goal('a'), goal('a')], g => g.title)).toHaveLength(1));
});
