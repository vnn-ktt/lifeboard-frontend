/** Unique browser-local IDs. crypto.randomUUID() may be unavailable on plain HTTP. */
let fallbackCounter = 0;
export function createId(): string {
  const api = typeof crypto === 'undefined' ? undefined : crypto;
  if (api && typeof api.randomUUID === 'function') return api.randomUUID();
  if (api && typeof api.getRandomValues === 'function') {
    const bytes = api.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0'));
    return `${hex.slice(0,4).join('')}-${hex.slice(4,6).join('')}-${hex.slice(6,8).join('')}-${hex.slice(8,10).join('')}-${hex.slice(10).join('')}`;
  }
  // Non-cryptographic last resort, only for IDs in local demo data (not auth tokens).
  return `local-${Date.now().toString(36)}-${(++fallbackCounter).toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
