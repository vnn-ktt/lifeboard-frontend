/** Errors returned by NestJS and other REST endpoints are untrusted input. */
export interface ApiErrorPayload {
  message?: string | string[];
  error?: string;
  detail?: string;
  statusCode?: number;
}

export class ApiRequestError extends Error {
  readonly status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

export function apiErrorMessage(error: unknown, fallback = 'Не удалось выполнить запрос'): string {
  if (error instanceof Error) return error.message.trim().slice(0, 300) || fallback;
  if (typeof error === 'string') return error.trim().slice(0, 300) || fallback;
  return fallback;
}

export function serverMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const parsed = payload as ApiErrorPayload;
  const text = Array.isArray(parsed.message) ? parsed.message.join('; ') : parsed.message ?? parsed.detail ?? parsed.error;
  return typeof text === 'string' && text.trim() ? text.trim().slice(0, 300) : null;
}

/** Response may have no JSON body (204) or unexpected error shapes. */
export async function readApiJson<T>(response: Response): Promise<T> {
  let body: unknown;
  try { body = response.status === 204 ? null : await response.json(); }
  catch {
    if (response.ok) throw new ApiRequestError('Некорректный ответ сервера', response.status);
    throw new ApiRequestError(`HTTP ${response.status}`, response.status);
  }
  if (!response.ok) throw new ApiRequestError(serverMessage(body) ?? `HTTP ${response.status}`, response.status);
  return body as T;
}
