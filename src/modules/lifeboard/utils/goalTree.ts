import type { TreeNode } from 'primevue/treenode';
import type { LifeGoal } from '../types';

export interface GoalTreeNode extends TreeNode {
  key: string;
  label: string;
  data: { goal: LifeGoal };
  children?: GoalTreeNode[];
}

/** Pure adapter: handles orphaned parents and cycles without mutating stored goals. */
export function goalsToTree(goals: readonly LifeGoal[], title: (goal: LifeGoal) => string): GoalTreeNode[] {
  const nodes = new Map<string, GoalTreeNode>();
  for (const goal of goals) {
    if (!goal.id || nodes.has(goal.id)) continue;
    nodes.set(goal.id, { key: goal.id, label: title(goal), data: { goal } });
  }
  const roots: GoalTreeNode[] = [];
  const isValidParent = (childId: string, parentId: string): boolean => {
    const seen = new Set([childId]);
    let candidate: string | null | undefined = parentId;
    while (candidate) {
      if (seen.has(candidate)) return false;
      seen.add(candidate);
      const next = nodes.get(candidate);
      if (!next) return false;
      candidate = next.data.goal.parentId;
    }
    return true;
  };
  for (const node of nodes.values()) {
    const parentId = node.data.goal.parentId;
    const parent = parentId && nodes.get(parentId);
    if (!parent || !isValidParent(node.key, parentId!)) { roots.push(node); continue; }
    (parent.children ??= []).push(node);
  }
  const horizonOrder: Record<LifeGoal['horizon'], number> = { 'five-years': 0, year: 1, quarter: 2, month: 3 };
  const sort = (list: GoalTreeNode[]) => {
    list.sort((a, b) => horizonOrder[a.data.goal.horizon] - horizonOrder[b.data.goal.horizon]
      || a.label.localeCompare(b.label));
    list.forEach(node => { if (node.children) sort(node.children); });
  };
  sort(roots);
  return roots;
}
