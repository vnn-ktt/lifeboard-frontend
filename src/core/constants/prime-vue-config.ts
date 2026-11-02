import type { usePrimeVue } from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { primeVueRuLocale } from '@/core/i18n/prime-vue/ru';

export type PrimeVueConfiguration = ReturnType<typeof usePrimeVue>['config'];

const BudgeePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: 'var(--color-primary-muted)',
      100: 'var(--color-primary-muted)',
      200: 'var(--color-emerald-200)',
      300: 'var(--color-emerald-300)',
      400: 'var(--color-emerald-400)',
      500: 'var(--color-primary)',
      600: 'var(--color-primary)',
      700: 'var(--color-primary-hover)',
      800: 'var(--color-emerald-800)',
      900: 'var(--color-emerald-900)',
      950: 'var(--color-emerald-950)',
    },
    secondary: {
      50: 'var(--color-secondary-muted)',
      100: 'var(--color-secondary-muted)',
      200: 'var(--color-secondary)',
      300: 'var(--color-secondary)',
      400: 'var(--color-secondary)',
      500: 'var(--color-secondary)',
      600: 'var(--color-secondary-hover)',
      700: 'var(--color-secondary-hover)',
      800: 'var(--color-secondary-text)',
      900: 'var(--color-secondary-text)',
      950: 'var(--color-secondary-text)',
    },
    colorScheme: {
      light: {
        surface: {
          0: 'var(--color-surface)',
          50: 'var(--color-bg)',
          100: 'var(--color-surface-muted)',
          200: 'var(--color-border)',
          300: 'var(--color-border)',
          400: 'var(--color-text-muted)',
          500: 'var(--color-text-muted)',
          600: 'var(--color-text-muted)',
          700: 'var(--color-text)',
          800: 'var(--color-text)',
          900: 'var(--color-text)',
          950: 'var(--color-text)',
        },
        primary: {
          color: 'var(--color-primary)',
          hoverColor: 'var(--color-primary-hover)',
          activeColor: 'var(--color-primary-hover)',
          contrastColor: 'var(--color-primary-text)',
        },
        secondary: {
          color: 'var(--color-secondary)',
          hoverColor: 'var(--color-secondary-hover)',
          activeColor: 'var(--color-secondary-hover)',
          contrastColor: 'var(--color-secondary-text)',
        },
        highlight: {
          background: 'var(--color-primary-muted)',
          focusBackground: 'var(--color-primary-muted)',
          color: 'var(--color-primary-hover)',
          focusColor: 'var(--color-primary-hover)',
        },
        text: {
          color: 'var(--color-text)',
          hoverColor: 'var(--color-text)',
          mutedColor: 'var(--color-text-muted)',
          hoverMutedColor: 'var(--color-text-muted)',
        },
        content: {
          background: 'var(--color-surface)',
          hoverBackground: 'var(--color-surface-muted)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          hoverColor: 'var(--color-text)',
        },
        overlay: {
          select: {
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          },
          popover: {
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          },
          modal: {
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          },
        },
        formField: {
          background: 'var(--color-surface)',
          disabledBackground: 'var(--color-surface-muted)',
          filledBackground: 'var(--color-surface-muted)',
          filledHoverBackground: 'var(--color-surface-muted)',
          filledFocusBackground: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          hoverBorderColor: 'var(--color-text-muted)',
          focusBorderColor: 'var(--color-primary)',
          color: 'var(--color-text)',
          disabledColor: 'var(--color-text-muted)',
          placeholderColor: 'var(--color-text-muted)',
          invalidBorderColor: 'var(--color-danger)',
        },
      },
      dark: {
        surface: {
          0: 'var(--color-surface)',
          50: 'var(--color-bg)',
          100: 'var(--color-surface)',
          200: 'var(--color-surface-muted)',
          300: 'var(--color-border)',
          400: 'var(--color-border)',
          500: 'var(--color-text-muted)',
          600: 'var(--color-text-muted)',
          700: 'var(--color-text)',
          800: 'var(--color-text)',
          900: 'var(--color-text)',
          950: 'var(--color-text)',
        },
        primary: {
          color: 'var(--color-primary)',
          hoverColor: 'var(--color-primary-hover)',
          activeColor: 'var(--color-primary-hover)',
          contrastColor: 'var(--color-primary-text)',
        },
        highlight: {
          background: 'var(--color-primary-muted)',
          focusBackground: 'var(--color-primary-muted)',
          color: 'var(--color-primary-hover)',
          focusColor: 'var(--color-primary-hover)',
        },
        text: {
          color: 'var(--color-text)',
          hoverColor: 'var(--color-text)',
          mutedColor: 'var(--color-text-muted)',
          hoverMutedColor: 'var(--color-text-muted)',
        },
        content: {
          background: 'var(--color-surface)',
          hoverBackground: 'var(--color-surface-muted)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          hoverColor: 'var(--color-text)',
        },
        overlay: {
          select: {
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          },
          popover: {
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          },
          modal: {
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          },
        },
        formField: {
          background: 'var(--color-surface)',
          disabledBackground: 'var(--color-surface-muted)',
          filledBackground: 'var(--color-surface-muted)',
          filledHoverBackground: 'var(--color-surface-muted)',
          filledFocusBackground: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          hoverBorderColor: 'var(--color-text-muted)',
          focusBorderColor: 'var(--color-primary)',
          color: 'var(--color-text)',
          disabledColor: 'var(--color-text-muted)',
          placeholderColor: 'var(--color-text-muted)',
          invalidBorderColor: 'var(--color-danger)',
        },
      },
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: 'transparent',
      offset: '2px',
      shadow: '0 0 0 3px var(--color-focus-ring)',
    },
  },
  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            primary: {
              background: 'var(--color-primary)',
              hoverBackground: 'var(--color-primary-hover)',
              activeBackground: 'var(--color-primary-hover)',
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary-text)',
            },
            secondary: {
              background: 'var(--color-secondary)',
              hoverBackground: 'var(--color-secondary-hover)',
              activeBackground: 'var(--color-secondary-hover)',
              borderColor: 'var(--color-secondary)',
              color: 'var(--color-secondary-text)',
            },
          },
        },
        dark: {
          root: {
            primary: {
              background: 'var(--color-primary)',
              hoverBackground: 'var(--color-primary-hover)',
              activeBackground: 'var(--color-primary-hover)',
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary-text)',
            },
            secondary: {
              background: 'var(--color-secondary)',
              hoverBackground: 'var(--color-secondary-hover)',
              activeBackground: 'var(--color-secondary-hover)',
              borderColor: 'var(--color-secondary)',
              color: 'var(--color-secondary-text)',
            },
          },
        },
      },
    },
  },
});

export const primeVueConfig: PrimeVueConfiguration = {
  ripple: true,
  theme: {
    preset: BudgeePreset,
    options: {
      darkModeSelector: '.app-dark',
    },
  },
  locale: primeVueRuLocale,
};
