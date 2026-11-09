# Remote-data conventions — Lifeboard v0.18.0

**Scope:** Presentation and client-side request state only. No NestJS endpoints changed.

## Type contract

```ts
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
```

`src/shared/types/asyncState.ts` is the single source for all server-backed resource state. Components read `state.status`; TypeScript narrows `state.data` in the success branch. Never store fake `null` data on loading or use `boolean loading` + `string error` + `T | null` as competing state sources.

`useAsyncState<T>()` handles state, request cancellation, race protection, data, loading, error and reset. `useApiRequest<T>()` wraps it with UI notifications and is the **standard entry point for API-consuming Vue components** (requires the PrimeVue Toast provider).

### Example

```ts
import { useApiRequest } from '@/shared/composables/useApiRequest';
import { readApiJson } from '@/shared/lib/apiErrors';

const request = useApiRequest<Goal[]>();
const goals = request.data;

async function reload() {
  return request.execute(signal => fetch('/api/v1/goals', {
    signal, credentials: 'include', headers: { Accept: 'application/json' },
  }).then(readApiJson<Goal[]>));
}

async function createGoal(payload: CreateGoalDto) {
  return mutation.execute(signal => fetch('/api/v1/goals', {
    method: 'POST', signal, credentials: 'include',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  }).then(readApiJson<Goal>), { notifySuccess: true, successMessage: 'Цель сохранена' });
}
```

Read queries only notify on errors, to prevent notification spam. Mutations may notify on success. Every API failure has a **single top-right PrimeVue Toast** (group `api`), with the server's `message`, `error` or `detail` field normalized to plain text and bounded to 300 characters.

### Components

`AsyncStateView.vue` supports four slots: `idle`, `loading`, `error` (with error string), and default success (with `data: T`). Loading uses PrimeVue Skeleton and errors use Message + Retry. Use `useApiRequest()` in the component's `<script setup>`; do not instantiate `useToast()` in each leaf component.

### Cancellation and races

New requests cancel preceding ones; stale responses cannot overwrite newer success. On scope disposal pending requests are aborted. Reset reverts to idle. Any abort is **not** shown as a user error toast.

### Existing project scope

The frontend still uses local Pinia state for goals, notes, routines, reflections, profile and settings. Their mutations are **not** remote operations; do not add artificial network spinners or Toast errors to them. The Helper transport is retained but hidden behind `<InDevelop />` until after v1.0.0; when restored it is already wired to `useApiRequest`. For the future NestJS API adapter, apply the same composable to each server-backed domain query and mutation. The backend contract is [here](BACKEND_INTEGRATION_V0.17.1.md).
