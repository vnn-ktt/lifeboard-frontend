import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from './useAuthStore';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  setActivePinia(createPinia());
});

describe('local account prototype', () => {
  it('creates one local profile, normalizes email and opens a tab session', () => {
    const auth = useAuthStore();
    auth.createProfile({ name: ' Иван ', email: ' IVAN@EXAMPLE.COM ' });
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.profile?.name).toBe('Иван');
    expect(auth.profile?.email).toBe('ivan@example.com');
    expect(auth.userId).toBeTruthy();
    expect(localStorage.getItem('lifeboard:local-profile:v1')).toContain('ivan@example.com');
  });

  it('closes only session and allows local login again', () => {
    const auth = useAuthStore();
    auth.createProfile({ name: 'Иван', email: 'ivan@example.com' });
    auth.logout();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.profile?.email).toBe('ivan@example.com');
    expect(() => auth.loginLocal('wrong@example.com')).toThrow();
    auth.loginLocal('IVAN@example.com');
    expect(auth.isAuthenticated).toBe(true);
  });

  it('persists edits and restores local session on reload', () => {
    const auth = useAuthStore();
    auth.createProfile({ name: 'Иван', email: 'ivan@example.com' });
    auth.updateProfile({ name: 'Иван К.', email: 'new@example.com', about: 'Node.js' });
    setActivePinia(createPinia());
    const restored = useAuthStore();
    expect(restored.isAuthenticated).toBe(true);
    expect(restored.profile?.about).toBe('Node.js');
    expect(restored.profile?.email).toBe('new@example.com');
  });

  it('rejects duplicate and invalid profiles', () => {
    const auth = useAuthStore();
    expect(() => auth.createProfile({ name: 'И', email: 'wrong' })).toThrow();
    auth.createProfile({ name: 'Иван', email: 'ivan@example.com' });
    expect(() => auth.createProfile({ name: 'Другой', email: 'other@example.com' })).toThrow();
  });
});


describe('Lifeboard v0.12 nickname', () => {
  it('prioritizes nickname in profile data and keeps full name unchanged', () => {
    const auth = useAuthStore();
    auth.createProfile({ name: 'Test Person', email: 'test-person@example.com' });
    auth.updateProfile({ name: 'Test Person', nickname: 'my_handle', email: 'test-person@example.com', about: '' });
    expect(auth.profile?.nickname).toBe('my_handle');
    expect(auth.profile?.name).toBe('Test Person');
    const persisted = JSON.parse(localStorage.getItem('lifeboard:local-profile:v1')!);
    expect(persisted.nickname).toBe('my_handle');
  });
});
