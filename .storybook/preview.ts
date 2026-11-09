import type { Preview } from '@storybook/vue3-vite';
import { setup } from '@storybook/vue3-vite';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { primeVueConfig } from '../src/core/constants/prime-vue-config';
import { i18n } from '../src/core/i18n';
import '../src/index.css';

setup(app => {
  app.use(createPinia());
  app.use(PrimeVue, primeVueConfig);
  app.use(ToastService);
  app.use(i18n);
});
const preview: Preview = {
  globalTypes: { theme: { description: 'Lifeboard theme', toolbar: { title: 'Theme', items: [
    { value: 'forest', title: 'Light' }, { value: 'dark', title: 'Dark' }, { value: 'orange', title: 'Orange' },
  ] } } },
  initialGlobals: { theme: 'forest' },
  decorators: [(story, context) => {
    const classes = ['app-theme-forest', 'app-theme-dark', 'app-theme-orange'];
    document.documentElement.classList.remove(...classes);
    document.documentElement.classList.add(`app-theme-${context.globals.theme || 'forest'}`);
    return story();
  }],
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    backgrounds: { disable: true },
    viewport: { defaultViewport: 'responsive' },
  },
};
export default preview;
