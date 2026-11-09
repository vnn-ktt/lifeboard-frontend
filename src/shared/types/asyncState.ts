/** Single request state for every server-backed resource (not local Pinia snapshots). */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

export const asyncIdle = <T>(): AsyncState<T> => ({ status: 'idle' });
export const asyncLoading = <T>(): AsyncState<T> => ({ status: 'loading' });
export const asyncSuccess = <T>(data: T): AsyncState<T> => ({ status: 'success', data });
export const asyncError = <T>(error: string): AsyncState<T> => ({ status: 'error', error });

export const isAsyncSuccess = <T>(state: AsyncState<T>): state is Extract<AsyncState<T>, { status: 'success' }> =>
  state.status === 'success';
