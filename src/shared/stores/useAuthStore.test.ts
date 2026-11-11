import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from './useAuthStore';

const user = {
  id: '711b2c9e-ec5e-4fb6-bda4-1d340a402abc',
  email: 'ivan@example.com', name: 'Иван', nickname: 'ivan',
  about: '', avatar: null, avatarFileId: null, timezone: 'Europe/Moscow',
  createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json' },
});
beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(() => vi.unstubAllGlobals());

describe('server session authentication', () => {
  it('registers with password only in the request body, using credentials include', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ user }));
    vi.stubGlobal('fetch', fetchMock);
    const auth = useAuthStore();
    await auth.register({ name: ' Иван ', email: ' IVAN@example.com ', password: 'twelve-character-secret' });
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.profile?.email).toBe('ivan@example.com');
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/auth/register');
    expect(options.credentials).toBe('include');
    expect(JSON.parse(String(options.body)).password).toBe('twelve-character-secret');
    expect(localStorage.getItem('lifeboard:local-session:v1')).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('hydrates a current account through /users/me', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(user));
    vi.stubGlobal('fetch', fetchMock);
    const auth = useAuthStore();
    await auth.bootstrap();
    expect(auth.isReady).toBe(true);
    expect(auth.userId).toBe(user.id);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('treats an HTTP 401 as a logged-out browser', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ code: 'UNAUTHORIZED' }, 401)));
    const auth = useAuthStore();
    await auth.bootstrap();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.isReady).toBe(true);
  });

  it('updates only supported profile properties and logs out through backend', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json({ user }))
      .mockResolvedValueOnce(json({ ...user, about: 'Node.js' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const auth = useAuthStore();
    await auth.login({ email: user.email, password: 'twelve-character-secret' });
    await auth.updateProfile({ name: 'Иван', nickname: 'ivan', about: 'Node.js' });
    const [, options] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(String(options.body))).toEqual({ name: 'Иван', nickname: 'ivan', about: 'Node.js' });
    await auth.logout();
    expect(auth.isAuthenticated).toBe(false);
  });
});
