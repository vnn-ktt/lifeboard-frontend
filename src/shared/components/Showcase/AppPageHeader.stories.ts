import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AppPageHeader from './AppPageHeader.vue';
const meta = { title: 'Foundations/Page Header', component: AppPageHeader, tags: ['autodocs'], args: { eyebrow: 'ТВОЙ ФОКУС', title: 'Мои цели', description: 'Большое направление, этапы и конкретные шаги.' } } satisfies Meta<typeof AppPageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const English: Story = { args: { eyebrow: 'YOUR WORKSPACE', title: 'Your progress', description: 'Keep moving, one step at a time.' } };
