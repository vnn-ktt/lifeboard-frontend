import type { Meta, StoryObj } from '@storybook/vue3-vite';
import GoalHierarchyOutline from './GoalHierarchyOutline.vue';
import type { LifeGoal } from '../../types';
const base = { description: '', areaId: 'career', target: 5, createdAt: '2026-11-01T00:00:00.000Z' };
const goals: LifeGoal[] = [
  { ...base, id: 'long', title: 'Развивать карьеру', horizon: 'five-years', parentId: null, status: 'active' },
  { ...base, id: 'year', title: 'Стать Senior Developer', horizon: 'year', parentId: 'long', status: 'paused' },
  { ...base, id: 'month', title: 'Разработать API', horizon: 'month', parentId: 'year', status: 'completed' },
];
const meta = { title: 'Goals/Hierarchy Tree', component: GoalHierarchyOutline, tags: ['autodocs'], args: { goals }, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof GoalHierarchyOutline>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ThreeLevels: Story = {};
export const Empty: Story = { args: { goals: [] } };
