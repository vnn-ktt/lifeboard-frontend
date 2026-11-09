# Testing Lifeboard

All new UI code should be covered at three levels.

1. **Unit** (`Vitest`): goal tree normalization, check-in calculations, outcomes, async-state discriminants, API errors, races/abort, stores.
2. **Component** (`@vue/test-utils`): idle/loading/error/success rendering, retry events, placeholder content, shared UI behaviors.
3. **E2E** (`Playwright`): login landing, local registration, Notes and Goals navigation, PrimeVue Tree, mobile rendering and Helper fallback.

```bash
bun run test:all
bun run test:browser
bun run build-storybook
```

Playwright test runs a Vite preview server via `webServer`; never point E2E at a live user's data. For screenshots run `bun run screenshots` after `bunx playwright install chromium`. It registers a new local **demo** profile and renders seeded, non-personal content.

Accessibility: all new controls should have labels and keyboard focus. Storybook ships with the a11y addon for component checks. Test all three themes, 390px mobile and desktop widths. Respect `prefers-reduced-motion`.

**CI:** GitHub Actions verifies production compilation, unit and component tests, Storybook build, and browser tests. A screenshot-refresh step keeps README screenshots in sync with the UI. If a screenshot fails to generate, treat it as a CI defect, not a reason to invent placeholder images.
