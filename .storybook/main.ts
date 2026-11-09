import type { StorybookConfig } from '@storybook/vue3-vite';
// Storybook builds a component catalog, not the app PWA.
process.env.LIFEBOARD_NO_PWA = '1';
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/vue3-vite', options: { docgen: false } },
  docs: { autodocs: 'tag' },
  staticDirs: ['../public'],
};
export default config;
