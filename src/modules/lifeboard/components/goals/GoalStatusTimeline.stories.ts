import type { Meta, StoryObj } from '@storybook/vue3-vite';
import GoalStatusTimeline from './GoalStatusTimeline.vue';
import type { LifeGoal } from '../../types';

const base: LifeGoal = { id: 'story-goal', title: 'Become a better developer', areaId: 'career', description: '', horizon: 'year', target: 10, status: 'active', createdAt: '2026-11-09T00:00:00.000Z' };
const meta = {
  title: 'Goals/Compact status timeline',
  component: GoalStatusTimeline,
  tags: ['autodocs'],
  args: { goal: base },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof GoalStatusTimeline>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Active: Story = {};
export const Paused: Story = { args: { goal: { ...base, status: 'paused' } } };
export const Completed: Story = { args: { goal: { ...base, status: 'completed' } } };
