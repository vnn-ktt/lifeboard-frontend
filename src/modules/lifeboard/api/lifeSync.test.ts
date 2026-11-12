import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useLifeStore } from '../stores/useLifeStore';
import { LifeSync } from './lifeSync';

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json' },
});
const emptyState = {
  version: 1 as const, vision: '', goals: [], routines: [], checks: {},
  reviews: [], focusGoalIds: [], categories: [], notes: [], noteGroups: [],
};

beforeEach(() => setActivePinia(createPinia()));
afterEach(() => vi.unstubAllGlobals());

describe('server-backed LifeSync', () => {
  it('loads the authenticated snapshot, writes new goals with session credentials', async () => {
    const calls: { url: string; options: RequestInit }[] = [];
    vi.stubGlobal('fetch', vi.fn((url: string, options: RequestInit) => {
      calls.push({ url, options });
      if (url.endsWith('/exports/lifeboard-v1')) return Promise.resolve(json(emptyState));
      if (url.endsWith('/goals') && options.method === 'POST') {
        return Promise.resolve(json({ id: '24e2baa8-2573-4435-a544-c1587076fd32' }, 201));
      }
      return Promise.resolve(json({ message: 'Unexpected API route' }, 404));
    }));
    const store = useLifeStore();
    const sync = new LifeSync(store);
    await sync.ensureLoaded('2bc33edb-19de-46fb-be9c-de114a37825f');
    expect(store.goals).toHaveLength(0);

    const newId = store.addGoal({
      areaId: 'health', title: 'Exercise every week', description: '',
      horizon: 'month', target: 12, measurement: { kind: 'activity' },
    });
    expect(newId).toBeTruthy();
    await sync.settled();

    const request = calls.find(call => call.url.endsWith('/goals') && call.options.method === 'POST');
    expect(request).toBeDefined();
    expect(request?.options.credentials).toBe('include');
    expect(JSON.parse(String(request?.options.body))).toMatchObject({
      areaId: 'health', title: 'Exercise every week', horizon: 'month', target: 12,
    });
    sync.reset();
  });
});
