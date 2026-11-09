import { computed, onScopeDispose, shallowRef, type ShallowRef } from 'vue';
import { apiErrorMessage } from '@/shared/lib/apiErrors';
import { asyncError, asyncIdle, asyncLoading, asyncSuccess, type AsyncState } from '@/shared/types/asyncState';

/** Framework-agnostic runner: useful in stores, tests and in components with no Vue Toast provider. */
export function createAsyncRunner<T>(
  setState: (value: AsyncState<T>) => void,
  onError?: (message: string, error: unknown) => void,
) {
  let requestNumber = 0;
  let controller: AbortController | null = null;
  return {
    async run(request: (signal: AbortSignal) => Promise<T>): Promise<T | null> {
      controller?.abort();
      const current = ++requestNumber;
      const next = new AbortController();
      controller = next;
      setState(asyncLoading());
      try {
        const data = await request(next.signal);
        if (current !== requestNumber || next.signal.aborted) return null;
        setState(asyncSuccess(data));
        return data;
      } catch (error) {
        if (current !== requestNumber || next.signal.aborted) return null;
        const message = apiErrorMessage(error);
        setState(asyncError(message));
        onError?.(message, error);
        return null;
      } finally {
        if (controller === next) controller = null;
      }
    },
    reset() { ++requestNumber; controller?.abort(); controller = null; setState(asyncIdle()); },
    dispose() { ++requestNumber; controller?.abort(); controller = null; },
  };
}

export function useAsyncState<T>(onError?: (message: string, error: unknown) => void) {
  const state: ShallowRef<AsyncState<T>> = shallowRef(asyncIdle<T>());
  const runner = createAsyncRunner<T>(next => { state.value = next; }, onError);
  const data = computed(() => state.value.status === 'success' ? state.value.data : null);
  const isLoading = computed(() => state.value.status === 'loading');
  const isError = computed(() => state.value.status === 'error');
  const setSuccess = (value: T) => { state.value = asyncSuccess(value); };
  const setError = (value: string) => { state.value = asyncError(value); };
  onScopeDispose(() => runner.dispose(), true);
  return { state, data, isLoading, isError, setSuccess, setError, run: runner.run, reset: runner.reset, dispose: runner.dispose };
}
