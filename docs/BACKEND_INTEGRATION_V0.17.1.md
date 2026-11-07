# Lifeboard Frontend v0.17.1 — Backend integration contract

**Status:** implementation guide, **not** a claim that all the endpoints below already exist. Updated 2026-11-08.

This document distinguishes **existing NestJS API** from **proposed endpoints** so that the backend can be extended without breaking the current frontend. Backend repository: `vnn-ktt/lifeboard-backend` (NestJS, TypeORM, PostgreSQL, cookie sessions). Frontend: Vue 3, TypeScript, Pinia, PrimeVue.

## 1. Principles and integration order

1. Today the frontend is local-first: `useLifeStore` persists `LifeState` at `lifeboard:state:v1`, `useAuthStore` uses `lifeboard:local-profile:v1` and `lifeboard:local-session:v1`. **Local email-only login is not secure authentication.** Do not use local profile id as an authenticated backend user id.
2. Backend already uses HTTP-only session cookie `lifeboard.sid`. Frontend API client should send `credentials: 'include'`, backend must restrict `Access-Control-Allow-Origin`, enable `Access-Control-Allow-Credentials` only for the authorized app origin, use Secure and SameSite cookie policy appropriate to deployment. Prefer same-origin reverse proxy `/api` to avoid cross-site cookie problems.
3. User identification on the server comes exclusively from the session guard, not request JSON. Do not put LLM keys, secrets, system prompts or trust decisions into browser code or `VITE_*` variables.
4. During migration, treat the **server as canonical**. Import a local snapshot *once with explicit user approval*, map legacy non-UUID identifiers, and keep a server-side import audit/idempotency key. Do **not** overwrite server data every time the page opens.
5. Preserve dates `YYYY-MM-DD` as local calendar dates (no UTC midnight shift), timestamps as ISO 8601 UTC, durations as minutes, weekdays as 1–7 (Monday–Sunday).
6. API and client operations must be transactional where two records are created together (`updated` check-in and metric), and idempotent on retries. Always return explicit 401/403/404/409/422 errors, with stable machine-readable `code`.

## 2. Existing API (confirmed in Lifeboard Backend main)

The backend controllers currently define the following routes. The deployed prefix depends on NestJS bootstrap (`/api/v1` in examples below); verify `main.ts` before using an absolute URL.

| Area | Routes | Notes |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` | Cookie sessions; **not** the frontend demo login |
| Goals | `GET /goals`, `GET /goals/:id`, `POST /goals`, `PATCH /goals/:id`, `DELETE /goals/:id` | Authenticated |
| Focus | `GET /goals/focus`, `PUT /goals/focus` | `{goalIds: string[]}` |
| Metrics | `GET /goals/:goalId/metrics`, `POST /goals/:goalId/metrics`, `DELETE /goals/:goalId/metrics/:entryId` | Time series |
| Check-ins | `GET /goal-checkins/due`, `GET /goals/:goalId/checkins`, `POST /goals/:goalId/checkins` | Earliest pending per goal |
| Routines | `GET /routines`, `POST /routines`, `GET /routines/day?date=YYYY-MM-DD`, `GET /routines/checks?from=…&to=…`, `PUT /routines/:id/checks/:date`, `PATCH /routines/:id`, `DELETE /routines/:id` | Daily completion |
| Reflection | `GET /reviews?from=…&to=…`, `GET /reviews/:date`, `PUT /reviews/:date`, `DELETE /reviews/:date` | Monday weekStart |
| Vision | `GET /life/vision`, `PUT /life/vision` | `{vision}` |

**Caution:** the frontend currently uses some non-UUID seed IDs (for example `dogs-goal`). The existing backend controllers use `ParseUUIDPipe({version:'4'})` for many resources. Migration must create a mapping from local IDs to server IDs, including parent goal, routine goal, milestone, task, notes, check-in and quote references. Never silently treat a seed ID as a server UUID.

## 3. Frontend goal model — exact domain shape

```ts
export type GoalStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type Horizon = 'month' | 'quarter' | 'year' | 'five-years';
export type GoalMeasurement =
  | { kind: 'activity' }
  | { kind: 'numeric'; direction: 'increase' | 'decrease'; startValue: number; targetValue: number; unit: string }
  | { kind: 'binary' };
export type GoalCheckinFrequency = 'off' | 'manual' | 'daily' | 'weekly';
export interface GoalCheckinSchedule { frequency: GoalCheckinFrequency; weekday?: number; fromDate: string }
export interface Goal {
  id: string; areaId: string; title: string; description: string;
  horizon: Horizon; target: number; parentId?: string | null;
  createdAt: string; startDate?: string; dueDate?: string;
  measurement?: GoalMeasurement; checkin?: GoalCheckinSchedule;
  status?: GoalStatus; completedAt?: string | null;
}
export interface GoalMetricEntry { id: string; goalId: string; date: string; value: number; note: string; createdAt: string }
export interface GoalCheckin { id: string; goalId: string; dueDate: string; completedAt: string; status: 'updated' | 'unchanged' | 'skipped'; metricEntryId?: string }
```

`GoalProgress`: **outcome** and **activity** are independent. A numeric goal's percent is clamped `(currentValue - startValue) / (targetValue - startValue) * 100`, binary is `0`/`100`, activity uses routine checks. No metric entry is added for an `unchanged` or `skipped` check-in. Do not recompute the result percent from tasks or milestones.

### Additions in v0.16 + v0.17.1

```ts
export interface GoalMilestone {
  id: string; goalId: string; title: string; description: string;
  order: number; dueDate?: string; completedAt?: string | null; createdAt: string;
}
export interface GoalTask {
  id: string; goalId: string; milestoneId: string | null;
  title: string; description: string; dueDate?: string;
  completedAt?: string | null; createdAt: string;
}
/** v0.17.1: only real transitions recorded; do not fabricate old status events. */
export interface GoalStatusEvent {
  id: string; goalId: string; status: GoalStatus; changedAt: string;
}
```

**New endpoints required on backend** (not present in checked backend main):

| Method | Path | Purpose |
|---|---|---|
| `PATCH` | `/goals/:goalId/status` | `{status: GoalStatus}`; atomic change + status event; idempotent if same status |
| `GET` | `/goals/:goalId/status-events` | Transitions newest first; cursor pagination |
| `GET`/`POST` | `/goals/:goalId/milestones` | List or create milestone; order field |
| `PATCH`/`DELETE` | `/goals/:goalId/milestones/:milestoneId` | Edit or delete milestone (detach linked tasks, do not delete tasks) |
| `PUT` | `/goals/:goalId/milestones/:milestoneId/completion` | `{completed: boolean}`; server-generated timestamp |
| `GET`/`POST` | `/goals/:goalId/tasks` | List or create one-time task, optional milestoneId |
| `PATCH`/`DELETE` | `/goals/:goalId/tasks/:taskId` | Edit or delete task |
| `PUT` | `/goals/:goalId/tasks/:taskId/completion` | `{completed: boolean}`; server-generated timestamp |
| `GET` | `/tasks/due?date=YYYY-MM-DD` | Due today, outstanding overdue, unscheduled open tasks |

Constraints: `title` 2–90 chars, `description` max 500, date valid calendar day, `order` integer 0–10000; `milestoneId` must belong to same goal, and all records to the authenticated account. `goalStatus` doesn't retroactively change metric/history. Completed, paused or cancelled goals should not surface new scheduled check-ins; historical logs stay intact. Deleting goal removes milestones, tasks, status events, metrics/check-ins/routine references consistently.

### Example payloads

```http
POST /api/v1/goals/6aac4d5e-5f69-4081-90ed-113add79c512/milestones
Content-Type: application/json
```
```json
{ "title": "Deploy first MVP", "description": "Production smoke-test", "dueDate": "2026-12-01", "order": 0 }
```
```http
PATCH /api/v1/goals/6aac4d5e-5f69-4081-90ed-113add79c512/status
Content-Type: application/json
```
```json
{ "status": "paused" }
```

`status-events` returns `[ { "id": "<uuid>", "goalId": "<uuid>", "status": "paused", "changedAt": "2026-11-08T12:00:00.000Z" } ]`. Status event creation and goal state change happen in one DB transaction, including concurrent requests. Client displays only real events, plus current status. No artificial “progress timeline” is stored.

## 4. Helper AI — frontend-ready transport contract

The optional HTTP transport is implemented in `src/modules/lifeboard/components/jakk/helperApi.ts`. Enable it with `VITE_HELPER_API_BASE_URL` (e.g., same-origin `''` is currently demo; set an explicit backend origin to enable HTTP). The UI keeps existing chat history and sender IDs `jakk` internally for compatibility; visible assistant name is `Helper`.

**Backend endpoint REQUIRED:** `POST /api/v1/helper/messages`, authenticated through `lifeboard.sid`. Backend owns all model/provider integrations. No external AI call is performed until this endpoint is configured.

```ts
interface HelperSendRequest {
  requestId: string;             // unique client request ID, idempotency key
  conversationId: string | null;  // null: create a new conversation
  message: {
    id: string;                  // unique client message ID
    body: string;                // 1..2000 UTF-16 chars in UI, apply server-side limits
    replyToId: string | null;
  };
  context: {
    locale: 'ru' | 'en' | 'de';
    timezone: string;            // IANA name, e.g. Europe/Helsinki
    focusGoalIds: string[];      // hints only; backend MUST authorize ownership
  };
}
interface HelperSendResponse {
  conversationId: string;
  message: {
    id: string; role: 'assistant'; content: string; createdAt: string;
  };
}
```

Example:

```http
POST /api/v1/helper/messages
Cookie: lifeboard.sid=<httpOnly session cookie>
X-Request-Id: 316bd440-2070-421e-99e0-11a64645dd12
Content-Type: application/json
```

```json
{
  "requestId": "316bd440-2070-421e-99e0-11a64645dd12",
  "conversationId": null,
  "message": { "id": "ea599fb4-f44a-4322-a9dd-74701a98fd15", "body": "What should I focus on this week?", "replyToId": null },
  "context": { "locale": "en", "timezone": "Europe/Helsinki", "focusGoalIds": [] }
}
```

```json
{
  "conversationId": "3e2446dd-b96a-4353-9e72-d0a32f11e077",
  "message": { "id": "302504cf-833f-461d-91bf-6fd4a560b947", "role": "assistant", "content": "Choose one small task toward your active goal.", "createdAt": "2026-11-08T14:11:24.000Z" }
}
```

Required backend behaviors: validate inputs; resolve focusGoalIds to authenticated user's own goals (never blindly trust request context); expose rate limits and `429`; cap token costs and output length <= 10000 chars; protect private data with data minimization; never execute model-proposed mutations without explicit user approval; log requestId for tracing without storing plaintext prompts indefinitely by default; `AbortSignal` on frontend only cancels HTTP wait, backend should set model timeout; ensure conversationId belongs to user; reject mismatched replyToId; no cross-user access.

**Errors**:

```json
{ "statusCode": 429, "code": "HELPER_RATE_LIMITED", "message": "Too many messages", "requestId": "316bd440-2070-421e-99e0-11a64645dd12" }
```

The frontend currently shows this failure rather than substituting a fake AI reply. Demo mode is explicit fallback **only when no backend URL is configured**, not when the server errors. The frontend is not yet a full server-side history UI: next integration increment needs `GET /api/v1/helper/conversations`, `GET /api/v1/helper/conversations/:id/messages?cursor=...`, and `DELETE /api/v1/helper/conversations/:id`; establish retention policy before storing chat server-side.

## 5. Other frontend entities that need API parity

- **Areas:** `{id,name,icon,accent,subtle}`. Built-in default areas, per-user additional areas. `GET /areas`, `POST /areas`, `DELETE /areas/:id`; protect deletion while referenced.
- **Notes and groups:** `LifeNoteGroup` `{id,name,goalId,color,createdAt}`, `LifeNote` `{id,title,content,groupId,goalId,imageDataUrl,pinned,createdAt,updatedAt}`. Prefer attachment upload IDs/URLs over storing base64 in DB. APIs: `GET/POST/PATCH/DELETE /note-groups`, `/notes`.
- **Quotes:** system quote catalog RU/EN/DE, two placement keys `dashboard`/`review`. `GET /quotes`, `GET/PUT /quotes/assignments`; preserve archive behavior, do not allow frontend direct system quote mutations.
- **User profile:** fields `id,name,nickname,email,about,avatar,createdAt`; preferences `theme`, `language`, `goalEntryMode`, `showHelper`, `privacy`. `GET/PATCH /users/me`, `GET/PUT /users/me/preferences`, avatar upload, cookie logout.
- **Backups:** archive format version 1 (see frontend `LifeState`) contains arrays `goals`, `goalMetricEntries`, `goalCheckins`, `milestones`, `goalTasks`, `goalStatusEvents`, `routines`, `checks`, `reviews`, `categories`, `notes`, `noteGroups`, `focusGoalIds`, `quoteAssignments`, `vision`. Add `POST /imports/lifeboard-v1` for one-time migration with dry-run validation and ID mapping; `GET /exports/lifeboard-v1` for complete backup. Do not silently import localStorage on login.
- **Progress Intelligence:** predictions are currently deterministic frontend computations using measured history. Backend may expose `GET /goals/:goalId/intelligence` later, but keep the same assumptions (minimum observations, forecast vs certainty) and explain uncertainty.

## 6. Backend acceptance checklist

- [ ] Preserve existing auth/goals/metric/check-in/routine/review routes and their DTO semantics.
- [ ] Add migrations for milestones, one-time tasks, goal status events; `synchronize: false`.
- [ ] Add Helper controller/service and mockable AI provider interface; configure provider key **server side only**.
- [ ] Session-based auth (`lifeboard.sid`) with correct cookie/CORS/CSRF policy; **do not use local demo login for production**.
- [ ] Implement repository ownership checks for every API (including nested goalIds, message/conversation IDs).
- [ ] Normalize dates/timezones; add indexes `(user_id, goal_id)`, `(goal_id, changed_at)`, `(goal_id, due_date)`.
- [ ] Add contract tests: goal status transition & idempotency; task/milestone ownership; Helper empty input/429/401/invalid reply/no exposure of provider credentials.
- [ ] Provide OpenAPI 3.1 schema, Postman collection and update backend README.
- [ ] Test migration of old local JSON with non-UUID IDs and repeated import idempotency.

## 7. Frontend integration points

| Existing frontend module | Backend-bound operation |
|---|---|
| `stores/useLifeStore.ts` | Replace local persistent actions by typed API services incrementally; retain offline cache as explicit mode |
| `components/goals/GoalStatusTimeline.vue` | `PATCH status` + `GET status-events` |
| `components/goals/GoalExecutionPanel.vue` | Milestone and task CRUD/completion |
| `components/checkins/GoalCheckinsPanel.vue` | Already available check-in routes |
| `components/goals/GoalMetricPanel.vue` | Already available metrics routes |
| `composables/useJakkChat.ts` | `HelperTransport` injectable interface, configured HTTP transport |
| `components/jakk/helperApi.ts` | Concrete wire format and response validation; extend cookie/session handling after enabling backend auth |

**Compatibility constraint:** keep existing goal progress types independent (activity vs outcome), current legacy local state and JSON backups intact. The v0.17.1 UI modifications by themselves do not switch goals/notes/etc. to the server.
