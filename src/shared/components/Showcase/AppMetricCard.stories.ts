import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AppMetricCard from './AppMetricCard.vue';
const meta = { title: 'Data/Metric Card', component: AppMetricCard, tags: ['autodocs'], args: { label: 'Накопления', value: '$35 000 / $100 000', percent: 35, icon: 'bi-cash-stack' } } satisfies Meta<typeof AppMetricCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Savings: Story = {};
export const Completed: Story = { args: { label: 'Этапы', value: '5 / 5', percent: 100, icon: 'bi-check-circle' } };
