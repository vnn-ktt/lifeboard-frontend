import type { PublicUser } from './types';

// Session is exclusively owned by the server and sent as HttpOnly lifeboard.sid.
// Do not put access tokens, passwords or session identifiers in browser storage.
const base = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function apiUrl(path: string): string {
  return base + (path.startsWith('/') ? path : '/' + path);
}

export function assetUrl(url: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/api/v1/')) return apiUrl(url.slice('/api/v1'.length));
  return url;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });
  if (!response.ok) {
    let payload: { message?: string | string[]; code?: string } = {};
    try { payload = await response.json(); } catch { /* non-JSON error */ }
    const message = Array.isArray(payload.message) ? payload.message.join('; ') : payload.message;
    if (response.status === 401) window.dispatchEvent(new Event('lifeboard:unauthorized'));
    throw new ApiError(response.status, payload.code || 'HTTP_' + response.status, message || response.statusText);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, data: unknown, headers?: HeadersInit) =>
    apiRequest<T>(path, { method: 'POST', headers, body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown) =>
    apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(path: string, data: unknown) =>
    apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path: string) => apiRequest<void>(path, { method: 'DELETE' }),
  upload: <T>(path: string, file: File) => {
    const body = new FormData();
    body.append('file', file);
    return apiRequest<T>(path, { method: 'POST', body });
  },
};

export function toProfile(user: PublicUser): PublicUser {
  return { ...user, avatar: assetUrl(user.avatar) ?? null };
}
