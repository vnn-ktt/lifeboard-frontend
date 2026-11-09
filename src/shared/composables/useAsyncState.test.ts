import { describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
import { createAsyncRunner, useAsyncState } from './useAsyncState';
import { asyncError, asyncIdle, asyncLoading, asyncSuccess, isAsyncSuccess } from '../types/asyncState';
import type { AsyncState } from '../types/asyncState';


describe('AsyncState<T>', () => {
  it('narrows success to data', () => {
    const state: AsyncState<{ name: string }> = asyncSuccess({ name: 'Ivan' });
    expect(isAsyncSuccess(state) && state.data.name).toBe('Ivan');
    expect(isAsyncSuccess(asyncIdle())).toBe(false);
  });
  it('has explicit idle, loading, success, error states', () => {
    expect(asyncIdle()).toEqual({ status: 'idle' });
    expect(asyncLoading()).toEqual({ status: 'loading' });
    expect(asyncError('no')).toEqual({ status: 'error', error: 'no' });
  });
  it('switches from loading to success with typed data', async () => {
    const scope = effectScope();
    await scope.run(async () => {
      const res = useAsyncState<{ id: number }>();
      const work = res.run(async () => ({ id: 42 }));
      expect(res.state.value.status).toBe('loading');
      expect(await work).toEqual({ id: 42 });
      expect(res.data.value?.id).toBe(42);
      expect(res.isLoading.value).toBe(false);
    });
    scope.stop();
  });
  it('sends errors to the common callback and exposes error status', async () => {
    const onError = vi.fn();
    let state: AsyncState<number> = asyncIdle();
    const runner = createAsyncRunner<number>(next => { state = next; }, onError);
    expect(await runner.run(async () => { throw new Error('Server unavailable'); })).toBeNull();
    expect(state).toEqual({ status: 'error', error: 'Server unavailable' });
    expect(onError).toHaveBeenCalledOnce();
  });
  it('ignores older responses after a newer request', async () => {
    let resolveOld!: (value: number) => void;
    let state: AsyncState<number> = asyncIdle();
    const runner = createAsyncRunner<number>(next => { state = next; });
    const old = runner.run(() => new Promise<number>(resolve => { resolveOld = resolve; }));
    const next = runner.run(async () => 9);
    expect(await next).toBe(9);
    resolveOld(1);
    expect(await old).toBeNull();
    expect(state).toEqual({ status: 'success', data: 9 });
  });
  it('reset aborts in flight work', async () => {
    let signal!: AbortSignal;
    let resolve!: (value: number) => void;
    let state: AsyncState<number> = asyncIdle();
    const runner = createAsyncRunner<number>(next => { state = next; });
    const pending = runner.run(s => { signal = s; return new Promise<number>(r => { resolve = r; }); });
    runner.reset();
    expect(signal.aborted).toBe(true);
    resolve(7);
    expect(await pending).toBeNull();
    expect(state.status).toBe('idle');
  });
});
