import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AppEmptyState from './AppEmptyState.vue';
const meta = { title: 'Feedback/Empty State', component: AppEmptyState, tags: ['autodocs'], args: { title: 'Пока нет заметок', description: 'Сохрани первую мысль и возвращайся к ней, когда понадобится.', icon: 'bi-journal-text', action: 'Новая заметка' } } satisfies Meta<typeof AppEmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithAction: Story = {};
export const WithoutAction: Story = { args: { action: undefined, title: 'На сегодня всё', icon: 'bi-check-circle' } };
