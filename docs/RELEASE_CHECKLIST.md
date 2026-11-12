# Lifeboard frontend v1.0.0 — Backend integration release checklist

## Выполнено в PR

- [x] Bun 1.4.4 frozen lockfile, Docker SPA, static release checks.
- [x] Server account registration/login/logout with HttpOnly `lifeboard.sid` and `credentials: include`.
- [x] Protected router bootstraps session with `GET /users/me`.
- [x] Reactive store loads the authenticated server `LifeState v1`, no new private data in localStorage.
- [x] Mutations for goals, metrics, check-ins, status, focus, milestones, tasks, routines, reviews, areas, quotes, notes and note groups.
- [x] Private S3 images through backend `POST /files`; profile and UI preferences.
- [x] Authenticated server backup/export and opt-in migration of existing local `lifeboard:state:v1`, with dry-run and confirmation.
- [x] RU/EN/DE notice about necessary session and preference cookies.
- [x] Frontend unit tests, mocked-session E2E and automated CI workflow.
- [x] Vite development proxy for `/api/v1`, updated README and deployment/integration documentation.
- [x] Jakk demo remains local and ephemeral; unsupported helper transport removed.

## Проверить **до merge / production**

- [ ] Latest PR head passes `bun run check:release`, frozen install, build, Vitest, Storybook and Playwright CI.
- [ ] Deploy a **real** backend main + PostgreSQL migrations + private S3; verify login, cookie and authenticated data across browser reloads.
- [ ] CRUD smoke tests of Goals/Today/Notes/Reflection/Profile, including linked UUIDs and image upload/download.
- [ ] Verify 401/403/409/422/429, backend outage and concurrent writes; confirm sync error banner and recovery.
- [ ] Confirm legacy import succeeds once in an empty account, rejects non-empty, doesn't touch the original browser data.
- [ ] Confirm TLS, `WEB_ORIGIN`, `COOKIE_SECURE=true`, correct same-origin `/api/v1` reverse proxy and backend CSRF Origin checks.
- [ ] Test responsive layout, language variants, theme variants, stale PWA cache, and visual changes after actual authenticated login.
- [ ] Backup PostgreSQL/S3 and validate recovery/rollback runbook.

**CI with a mocked backend confirms client behavior but cannot establish full integration with production services. Do not merge as a verified fullstack production release without staging smoke tests.**
