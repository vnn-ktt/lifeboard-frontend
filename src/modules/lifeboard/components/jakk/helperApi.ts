/**
 * Helper v1 transport contract (server-side AI only).
 * Never ship a provider API key, private system prompt or provider credentials in the browser.
 * The frontend sends short user text and IDs; authorized goal data is resolved by backend.
 */
export interface HelperSendRequest {
  requestId: string;
  conversationId: string | null;
  message: { id: string; body: string; replyToId: string | null };
  context: { locale: 'ru' | 'en' | 'de'; timezone: string; focusGoalIds: string[] };
}

export interface HelperSendResponse {
  conversationId: string;
  message: { id: string; role: 'assistant'; content: string; createdAt: string };
}

export interface HelperTransport {
  send(request: HelperSendRequest, signal?: AbortSignal): Promise<HelperSendResponse>;
}

export class HelperTransportError extends Error {
  constructor(message: string, readonly status: number | null) {
    super(message);
    this.name = 'HelperTransportError';
  }
}

export interface HelperHttpConfig {
  baseUrl: string;
  getAccessToken?: () => string | undefined | Promise<string | undefined>;
  fetcher?: typeof fetch;
}

function isResponse(value: unknown): value is HelperSendResponse {
  if (!value || typeof value !== 'object') return false;
  const body = value as Partial<HelperSendResponse>;
  if (typeof body.conversationId !== 'string' || !body.conversationId ||
    !body.message || typeof body.message !== 'object') return false;
  return typeof body.message.id === 'string' && body.message.role === 'assistant' &&
    typeof body.message.content === 'string' && body.message.content.length <= 10000 &&
    typeof body.message.createdAt === 'string' && !Number.isNaN(Date.parse(body.message.createdAt));
}

/** Can be independently tested and later injected with an auth token provider. */
export function createHelperHttpTransport(config: HelperHttpConfig): HelperTransport {
  const base = config.baseUrl.replace(/\/+$/, '');
  return {
    async send(request, signal) {
      if (!request.message.body.trim() || request.message.body.length > 2000) throw new HelperTransportError('Invalid message', 400);
      const token = await config.getAccessToken?.();
      const response = await (config.fetcher ?? fetch)(`${base}/api/v1/helper/messages`, {
        method: 'POST', credentials: 'include', signal,
        headers: {
          'Content-Type': 'application/json', Accept: 'application/json',
          'X-Request-Id': request.requestId,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new HelperTransportError(`Helper request failed (${response.status})`, response.status);
      let payload: unknown;
      try { payload = await response.json(); }
      catch { throw new HelperTransportError('Invalid helper response', 502); }
      if (!isResponse(payload)) throw new HelperTransportError('Invalid helper response schema', 502);
      return payload;
    },
  };
}

/** Only send requests when the backend URL is explicitly configured. */
export function configuredHelperTransport(): HelperTransport | null {
  const baseUrl = import.meta.env.VITE_HELPER_API_BASE_URL?.trim() ?? '';
  return baseUrl ? createHelperHttpTransport({ baseUrl }) : null;
}
