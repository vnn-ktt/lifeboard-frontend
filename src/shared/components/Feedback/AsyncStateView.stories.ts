import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AsyncStateView from './AsyncStateView.vue';
const meta = { title: 'Feedback/Async State', component: AsyncStateView, tags: ['autodocs'] } satisfies Meta<typeof AsyncStateView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Idle: Story = { args: { state: { status: 'idle' } } };
export const Loading: Story = { args: { state: { status: 'loading' } } };
export const ServerError: Story = { args: { state: { status: 'error', error: 'Не удалось получить данные: HTTP 503' } } };
export const Success: Story = { args: { state: { status: 'success', data: { name: 'Demo' } } }, render: args => ({ components: { AsyncStateView }, setup: () => ({ args }), template: '<AsyncStateView v-bind="args"><template #default="{ data }"><strong>Привет, {{ data.name }}</strong></template></AsyncStateView>' }) };
