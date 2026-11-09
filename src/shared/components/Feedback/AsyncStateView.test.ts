import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AsyncStateView from './AsyncStateView.vue';
import { asyncIdle, asyncLoading, asyncError, asyncSuccess } from '../../types/asyncState';
describe('AsyncStateView', () => {
  it('renders idle state', () => expect(mount(AsyncStateView, { props: { state: asyncIdle() } }).text()).toContain('Ничего не загружено'));
  it('renders loading state', () => expect(mount(AsyncStateView, { props: { state: asyncLoading() } }).attributes('role')).toBe('status'));
  it('renders server error and retry button', async () => {
    const comp = mount(AsyncStateView, { props: { state: asyncError('Server is down') } });
    expect(comp.text()).toContain('Server is down');
    await comp.find('button').trigger('click');
    expect(comp.emitted('retry')).toHaveLength(1);
  });
  it('exposes typed data to success slot', () => {
    const comp = mount(AsyncStateView, { props: { state: asyncSuccess({ name: 'Test' }) },
      slots: { default: '<p data-test="success">Ready</p>' } });
    expect(comp.find('[data-test="success"]').text()).toBe('Ready');
  });
});
