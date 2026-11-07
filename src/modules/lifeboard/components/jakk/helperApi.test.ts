import { describe, expect, it, vi } from 'vitest';
import { createHelperHttpTransport, HelperTransportError, type HelperSendRequest } from './helperApi';

const request: HelperSendRequest = {
  requestId: 'req1', conversationId: null,
  message: { id: 'msg1', body: 'What next?', replyToId: null },
  context: { locale: 'en', timezone: 'Europe/Helsinki', focusGoalIds: ['goal1'] },
};

describe('Helper transport', () => {
  it('sends a typed body without provider credentials', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({
      conversationId: 'c1', message: { id: 'm2', role: 'assistant', content: 'One step', createdAt: '2026-11-08T10:00:00Z' },
    }) });
    const transport = createHelperHttpTransport({ baseUrl: 'https://api.example.test/', getAccessToken: () => 'token1', fetcher });
    const result = await transport.send(request);
    expect(result.message.content).toBe('One step');
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe('https://api.example.test/api/v1/helper/messages');
    expect(init.headers.Authorization).toBe('Bearer token1');
    expect(JSON.parse(init.body)).toEqual(request);
  });

  it('refuses invalid response schemas', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ content: 'missing role' }) });
    await expect(createHelperHttpTransport({ baseUrl: '', fetcher }).send(request)).rejects.toBeInstanceOf(HelperTransportError);
  });

  it('surfaces API failures rather than silently falling back to demo', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 429 });
    await expect(createHelperHttpTransport({ baseUrl: '', fetcher }).send(request)).rejects.toMatchObject({ status: 429 });
  });

  it('does not send empty messages', async () => {
    const fetcher = vi.fn();
    await expect(createHelperHttpTransport({ baseUrl: '', fetcher }).send({ ...request, message: { ...request.message, body: '  ' } })).rejects.toMatchObject({ status: 400 });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
