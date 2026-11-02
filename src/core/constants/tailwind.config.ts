export default {
  darkMode: ['class', '.app-dark'],
  theme: {
    extend: {
      fontFamily: {
        theme: 'var(--font-family)',
      },
      colors: {
        bg: 'var(--color-bg)',
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        muted: 'var(--color-surface-muted)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        foreground: 'var(--color-text)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-muted': 'var(--color-primary-muted)',
        'primary-foreground': 'var(--color-primary-text)',
        danger: 'var(--color-danger)',
        'danger-hover': 'var(--color-danger-hover)',
        'danger-muted': 'var(--color-danger-muted)',
        focus: 'var(--color-focus-ring)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
      },
    },
  },
  plugins: [],
};
