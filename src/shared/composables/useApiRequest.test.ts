import { describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
const mocks = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: mocks.add }) }));
import { useApiRequest } from './useApiRequest';

describe('useApiRequest', () => {
  it('does not toast on successful reads', async () => {
    mocks.add.mockClear();
    const scope = effectScope();
    await scope.run(async () => {
      const result = useApiRequest<{ id: number }>();
      await result.execute(async () => ({ id: 1 }));
      expect(result.data.value?.id).toBe(1);
      expect(mocks.add).not.toHaveBeenCalled();
    });
    scope.stop();
  });
  it('shows server message on mutation success', async () => {
    mocks.add.mockClear();
    const scope = effectScope();
    await scope.run(async () => {
      const action = useApiRequest<{ message: string }>();
      await action.execute(async () => ({ message: 'Saved by API' }), { notifySuccess: true });
      expect(mocks.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', detail: 'Saved by API', group: 'api' }));
    });
    scope.stop();
  });
  it('shows a standard error toast on request failures', async () => {
    mocks.add.mockClear();
    const scope = effectScope();
    await scope.run(async () => {
      const request = useApiRequest<number>();
      await request.execute(async () => { throw new Error('Server is offline'); });
      expect(mocks.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', detail: 'Server is offline', group: 'api' }));
      expect(request.state.value.status).toBe('error');
    });
    scope.stop();
  });
  it('recognizes successful 204 null bodies', async () => {
    mocks.add.mockClear();
    const scope = effectScope();
    await scope.run(async () => {
      const mutation = useApiRequest<null>();
      await mutation.execute(async () => null, { notifySuccess: true });
      expect(mocks.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });
    scope.stop();
  });
});
