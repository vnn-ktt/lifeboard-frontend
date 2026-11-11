# Lifeboard Frontend ↔ Backend v1

Backend source of truth: [lifeboard-backend main](https://github.com/vnn-ktt/lifeboard-backend/tree/main); all API routes below are relative to `/api/v1`. Frontend branch: `feat/backend-v1-cookie-session-integration`.

## Architecture

- `src/shared/api/client.ts` — typed fetch adapter, `credentials: 'include'`, JSON/stream errors, HttpOnly cookie. No browser token storage.
- `src/shared/stores/useAuthStore.ts` — register/login/logout, restore the session with `GET /users/me`, profile and avatar.
- `src/main.ts` — async route guard, account-aware initial workspace hydration; protected screens never read a previous user's state.
- `src/modules/lifeboard/stores/useLifeStore.ts` — reactive UI model, *not* durable storage; backend is authoritative.
- `src/modules/lifeboard/api/lifeSync.ts` — serialized optimistic actions translated to REST mutations; after each batch refetch authenticated export to reconcile UUIDs, computed progress and server timestamps. Errors show a persistent alert and changes revert to the server state.
- `src/shared/api/preferencesSync.ts` — GET/PUT server preferences and PATCH account timezone.
- `src/modules/lifeboard/composables/useLifeBackup.ts` — server export, validate + explicit confirmation import, optional one-time import of legacy `lifeboard:state:v1`.

## Endpoint map

| Function | REST |
| --- | --- |
| Account | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET/PATCH /users/me` |
| Avatar, timezone, preferences | `PUT /users/me/avatar`, `PATCH /users/me/timezone`, `GET/PUT /users/me/preferences` |
| Areas | `GET/POST /areas`, `DELETE /areas/:id` |
| Goals and focus | `GET/POST /goals`, `PATCH/DELETE /goals/:id`, `PUT /goals/focus` |
| Goal status, metrics, check-ins | `PATCH /goals/:id/status`, `POST/DELETE /goals/:id/metrics`, `POST /goals/:id/checkins` |
| Milestones and tasks | `POST/PATCH/PUT/DELETE /goals/:id/milestones/*`, `POST/PATCH/PUT/DELETE /goals/:id/tasks/*` |
| Routines and checks | `POST/DELETE /routines`, `PUT /routines/:id/checks/:date` |
| Notes, groups and images | `POST/PATCH/DELETE /notes`, `POST/PATCH/DELETE /note-groups`, `POST /files` (multipart `file`) |
| Reflection, vision, quotes | `PUT /reviews/:date`, `PUT /life/vision`, `PUT /quotes/assignments` |
| Backup/import | `GET /exports/lifeboard-v1`, `POST /imports/lifeboard-v1/validate`, `POST /imports/lifeboard-v1` |

Full original API remains available in backend Swagger `/api/docs`. Data is initially hydrated via the v1 export to keep the existing frontend view models compatible. A later PR may replace this with paginated and domain-specific GET endpoints to avoid exporting the whole workspace on every refresh.

## Cookie and deployment

Backend sets `lifeboard.sid` as `HttpOnly; SameSite=Lax; Path=/api/v1` with optional `Secure`, and validates `Origin` for mutating requests. Production must use HTTPS, `COOKIE_SECURE=true`, matching `WEB_ORIGIN` and ideally **same-origin reverse proxy**: `https://example.com/api/v1/*` → NestJS, everything else → SPA. Do **not** point frontend straight to private Docker DNS; browser must reach the API.

`VITE_API_BASE_URL` default is `/api/v1`. Local `bun run dev` proxies `/api/v1` to `VITE_DEV_API_TARGET` (default `http://localhost:3000`).

The app displays an RU/EN/DE disclosure on necessary auth and UI preference cookies. Acknowledgment is local to the browser; it is not a consent gate for necessary session handling.

## Legacy data migration

The browser-local `lifeboard:state:v1` is **never** read into authenticated store automatically. User can download a JSON backup, register/login, open Profile → Import local data, inspect backend dry-run and confirm. Backend rejects imports into non-empty accounts. Local copy is **not deleted**. Existing JSON export is from server after login.

## Verification before merge

1. `bun install --frozen-lockfile && bun run check:release && bun run build && bun run test:all`
2. `bunx playwright install chromium && bun run test:browser`
3. Stage a real NestJS + PostgreSQL + S3 stack: register → reload → CRUD in all screens → upload avatar/photo → export → logout → login → verify persistence.
4. Test 401, network loss, conflicting writes, server throttle 429 and legacy import into empty vs non-empty accounts.

Limitations: optimistic serialized writes are not an offline queue; changes can roll back after network failures. Big snapshots may be costly. Jakk remains a local demo; backend v1 has no Helper API. No OAuth flows exist in backend v1.
