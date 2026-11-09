<div align="center">

# 🌵 Lifeboard

### Your life. Your goals. Your progress.

**v0.18.0 — Living Workspace** · Vue 3 · TypeScript · PrimeVue · Pinia · Vite

A calm personal space for measurable goals, one-time tasks, recurring actions, reflections and notes.

</div>

![Lifeboard landing page](docs/screenshots/auth-desktop.png)

> **Prototype warning:** authentication is currently a local browser profile, **not secure server authentication**. User content is stored in `localStorage`. Export a JSON backup before clearing browser data. A future NestJS integration will replace this; v0.18.0 does not modify backend contracts.

## Product tour

| Goals Garden | PrimeVue goal hierarchy |
|---|---|
| ![Garden](docs/screenshots/goals-garden.png) | ![Tree](docs/screenshots/goals-tree.png) |

| Notes · Light | Notes · Dark |
|---|---|
| ![Light Notes](docs/screenshots/notes-light.png) | ![Dark Notes](docs/screenshots/notes-dark.png) |

<p align="center"><img src="docs/screenshots/notes-mobile.png" width="340" alt="Notes on mobile" /></p>

All screenshots are reproducibly generated from **demo content** by `bun run screenshots`. No personal account information is included.

## Features

- **Goals and measurable outcomes:** numeric increases/decreases, binary milestones and activity goals, independent outcome and action progress.
- **Goals Garden and Tree:** winding garden stays intact; the alternative hierarchy now uses **PrimeVue Tree** with category icons, status tags and progress.
- **Today:** one-off tasks, recurring routines and weekly goal check-ins.
- **Notes:** photo cards, groups, goal links, search, pinning, contrasting light and dark boards and list/card layout switch.
- **Reflection:** weekly reviews, outcome trends and progress forecasting.
- **Three locales / themes:** Russian, English, German; light/forest, dark, orange.
- **Helper:** intentionally **on hold until after v1.0.0**. The launcher shows `<InDevelop />`; the existing experimental network transport is not activated by UI.
- **Export/import:** existing v1 local-state JSON remains compatible.

## Run locally

Node.js 22+ and [Bun](https://bun.sh/) 1.4+ are recommended:

```bash
bun install --frozen-lockfile
bun run dev
```

Open `http://localhost:8080`. The project also supports Docker Compose (`docker compose up --build -d`).

## Storybook & tests

```bash
bun run storybook          # Component library at localhost:6006
bun run build-storybook    # Static component documentation
bun run test:all           # Vitest: domain, UI, state, async transport
bun run test:lifeboard     # Lifeboard-focused Vitest suite
bun run test:shared        # Shared UI / state / API tests
bun run build              # Vite production build
bunx playwright install chromium
bun run test:browser       # E2E, desktop and mobile Chromium
bun run screenshots        # Recreate docs/screenshots from demo state
```

See [Testing Guide](docs/TESTING.md) and [Design System](docs/DESIGN_SYSTEM.md).

## Structure

```text
src/
├── modules/
│   ├── lifeboard/            # Goals, Today, Notes, Reflection, Quotes
│   ├── auth/                 # Local browser profile (prototype)
│   └── profile/
├── shared/
│   ├── components/Feedback/  # InDevelop / AsyncStateView
│   ├── components/Showcase/  # Reusable presentation components
│   ├── composables/          # useAsyncState / useApiRequest
│   ├── types/asyncState.ts   # Discriminated union for server resources
│   └── lib/apiErrors.ts      # Safe NestJS error normalization
└── index.css                # Theme and visual layer imports
.storybook/                  # Isolated UI catalog, themes and docs
e2e/                         # Browser scenarios for key user flows
scripts/capture-screenshots.mjs
```

### Backend integration readiness (no backend changes in this release)

Use the shared discriminated union for **remote data** (local Pinia collections should not claim to be fetching):

```ts
import { useApiRequest } from '@/shared/composables/useApiRequest';

const request = useApiRequest<User>();
const user = request.data;                  // User | null
const loading = request.isLoading;          // ComputedRef<boolean>

await request.execute(signal => fetchUser(signal));  // idle → loading → success | error
```

`useApiRequest` normalizes errors from REST responses, cancels stale requests and shows **PrimeVue Toast in the top-right corner** for actual API errors and meaningful mutation success messages. `AsyncStateView.vue` renders all four UI states and supports typed success slots. No duplicate per-component Toast logic is necessary. For sample NestJS HTTP response handling use `readApiJson<T>`.

[Async architecture and conventions](docs/API_ASYNC.md) · [Existing NestJS contracts](docs/BACKEND_INTEGRATION_V0.17.1.md)

## Release notes — 0.18.0

- New Editorial Notes design with a distinctive light surface; preserved dark design.
- Landing-style login and registration experience (desktop and mobile), with honest local-profile copy.
- PrimeVue Tree with icon-based nodes, status chips and progress; Garden remains available.
- `<InDevelop />` replaces Helper chat UI until after 1.0.0 (legacy chat state preserved).
- Shared `AsyncState<T>`, stale-request cancellation, safe server-error parser and global top-right Toast.
- New reusable components, Storybook catalog, Vitest tests, Chromium E2E tests and screenshot automation.
- All old local state keys, goals, notes and backups remain unchanged.

Licensed under AGPL-3.0.
