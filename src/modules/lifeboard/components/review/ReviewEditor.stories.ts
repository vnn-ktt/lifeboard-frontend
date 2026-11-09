import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ReviewEditor from './ReviewEditor.vue';

const meta = {
  title: 'Review/Weekly mood and editor',
  component: ReviewEditor,
  tags: ['autodocs'],
  args: { draft: { wins: 'Completed an important milestone', obstacles: '', nextStep: 'Keep up the momentum', mood: 7 }, saved: false },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ReviewEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const DifficultWeek: Story = { args: { draft: { wins: '', obstacles: 'Unexpected interruptions', nextStep: '', mood: 2 }, saved: false } };
export const Saved: Story = { args: { draft: { wins: 'A lot of progress', obstacles: '', nextStep: 'Plan the next step', mood: 9 }, saved: true } };
