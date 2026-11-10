# Lifeboard Living Workspace — visual language

## Philosophy

Quietly useful, not gamified. The interface responds to a user action and then becomes calm again. The brand mascot is **Jakk**, a friendly cactus with visible eyes and a small smile. Only the pupils animate in the loader, with reduced-motion support.

## Themes

- **Forest:** clean green/graphite surfaces, warm paper note cards and a noticeably distinct Notes canvas.
- **Dark:** existing contrasting dark Notes design is intentionally preserved.
- **Orange:** warm, subdued paper and terracotta accents.

Use `--life-*` CSS custom properties. The Living Workspace styles live in `src/modules/lifeboard/living-workspace.css`; avoid piling new `!important` rules into old release styles. Product fonts are Inter and Manrope. Consistent keyboard focus uses `--color-focus-ring`.

## Interaction

- Motion only confirms interaction, reordering, completed tasks or a transition; no continuous wobbling.
- 150–450ms, low travel distance, with `prefers-reduced-motion: reduce` disabling nonessential effects.
- Tree structure uses PrimeVue Tree with native keyboard handling and control of expanded keys.
- Reusable Storybook UI: AppPageHeader, AppMetricCard, AppEmptyState, AsyncStateView and InDevelop.

## Component catalogue

Run `bun run storybook`, open `http://localhost:6006`, switch themes in the toolbar, and inspect component states. For new reusable elements add stories for success, empty, error, dark and mobile as applicable.
