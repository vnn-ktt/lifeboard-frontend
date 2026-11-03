import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import AppBreadcrumbs from './AppBreadcrumbs.vue';

describe('AppBreadcrumbs', () => {
  it('shows a clickable root and the active route from meta', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes: [
      { path: '/', component: { template: '<div />' }, meta: { breadcrumb: 'Обзор' } },
      { path: '/profile', component: { template: '<div />' }, meta: { breadcrumb: 'Личный кабинет' } },
    ] });
    await router.push('/profile');
    await router.isReady();
    const wrapper = mount(AppBreadcrumbs, { global: { plugins: [router] } });
    expect(wrapper.text()).toContain('Обзор');
    expect(wrapper.text()).toContain('Личный кабинет');
    expect(wrapper.find('a').attributes('href')).toBe('/');
    expect(wrapper.find('[aria-current="page"]').text()).toBe('Личный кабинет');
  });
});
