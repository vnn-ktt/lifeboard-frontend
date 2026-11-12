import path from 'node:path'
import Vue from '@vitejs/plugin-vue'
import { loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'
import SvgLoader from 'vite-svg-loader'

export default defineConfig(({ mode }) => ({
  base: './',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  // Keep /api/v1 same-origin in development to support HttpOnly session cookies.
  server: {
    proxy: {
      '/api/v1': {
        target: loadEnv(mode, process.cwd(), 'VITE_').VITE_DEV_API_TARGET || 'http://localhost:3000',
        changeOrigin: false,
      },
    },
  },

  test: {
    environment: 'jsdom',
    coverage: {
      all: true,
      include: [
        'src/**/components/*.vue',
        'src/**/views/*.vue',
        'src/**/hooks/*.ts',
        'src/**/services/*.ts',
        'src/**/filters/*.ts',
        'src/**/guards/*.ts',
        'src/**/utils/*.ts',
      ],
      reportsDirectory: 'coverage',
    },
  },

  // Storybook has its own preview bundle; never generate a PWA service worker for it.
  plugins: [Vue(), ...(process.env.LIFEBOARD_NO_PWA === '1' ? [] : [VitePWA({ registerType: 'autoUpdate' })]), SvgLoader()],

  build: {
    assetsInlineLimit: 4096,
  },
}));
