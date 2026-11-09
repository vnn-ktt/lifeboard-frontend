import { describe, expect, it } from 'vitest';
import { ApiRequestError, apiErrorMessage, serverMessage, readApiJson } from './apiErrors';
describe('API errors', () => {
  it('reads NestJS validation messages', () => expect(serverMessage({ message: ['value must be positive', 'missing name'] })).toBe('value must be positive; missing name'));
  it('rejects malformed server messages', () => expect(serverMessage({ message: { html: '<script>' } })).toBeNull());
  it('limits untrusted text length', () => expect(serverMessage({ detail: 'A'.repeat(1000) })?.length).toBe(300));
  it('keeps meaningful status codes', async () => {
    const response = { status: 422, ok: false, json: async () => ({ message: 'Invalid input' }) } as Response;
    await expect(readApiJson(response)).rejects.toMatchObject({ status: 422, message: 'Invalid input' });
  });
  it('handles 204 without attempting JSON', async () => {
    const data = await readApiJson({ status: 204, ok: true } as Response);
    expect(data).toBeNull();
  });
  it('falls back to the HTTP status for broken error JSON', async () => {
    await expect(readApiJson({ status: 502, ok: false, json: async () => { throw 1; } } as Response)).rejects.toBeInstanceOf(ApiRequestError);
  });
  it('preserves errors and converts unknown failures', () => {
    expect(apiErrorMessage(new Error('offline'))).toBe('offline');
    expect(apiErrorMessage({ status: 500 })).toContain('Не удалось');
  });
});
