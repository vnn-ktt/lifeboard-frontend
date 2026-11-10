import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
vi.mock('@/modules/lifeboard/i18n', () => ({ useLifeI18n: () => ({ lang: { value: 'ru' } }) }));
import InDevelop from './InDevelop.vue';
describe('InDevelop', () => {
  it('displays the 1.0.0 timeline without making a network request', () => {
    const wrapper = mount(InDevelop, { props: { feature: 'Jakk' } });
    expect(wrapper.text()).toContain('Jakk');
  });
});
