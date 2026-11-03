import { describe, expect, it, vi } from 'vitest';
import { createId } from './createId';

describe('createId on HTTP origins', () => {
  it('creates an ID when randomUUID is unavailable', () => {
    const original = globalThis.crypto;
    vi.stubGlobal('crypto', { getRandomValues(bytes: Uint8Array) { bytes.forEach((_, i) => { bytes[i] = i + 5; }); return bytes; } });
    try {
      expect(createId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    } finally { vi.stubGlobal('crypto', original); }
  });
  it('has a local fallback when Web Crypto is unavailable', () => {
    const original = globalThis.crypto;
    vi.stubGlobal('crypto', undefined);
    try {
      expect(createId()).toMatch(/^local-/);
      expect(createId()).not.toEqual(createId());
    } finally { vi.stubGlobal('crypto', original); }
  });
});
