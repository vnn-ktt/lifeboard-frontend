import type { Meta, StoryObj } from '@storybook/vue3-vite';
import InDevelop from './InDevelop.vue';
const meta = { title: 'Feedback/In Develop', component: InDevelop, tags: ['autodocs'], args: { feature: 'Helper' } } satisfies Meta<typeof InDevelop>;
export default meta;
type Story = StoryObj<typeof meta>;
export const HelperComingAfterV1: Story = {};
