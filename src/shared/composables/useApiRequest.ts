import { useToast } from 'primevue/usetoast';
import { useAsyncState } from './useAsyncState';
import { apiErrorMessage, serverMessage } from '@/shared/lib/apiErrors';

/** Every API-consuming component uses this rather than repeating try/catch + toast. */
export function useApiRequest<T>() {
  const toast = useToast();
  const async = useAsyncState<T>((message) => {
    toast.add({ group: 'api', severity: 'error', summary: 'Ошибка запроса', detail: message, life: 5500 });
  });
  return {
    ...async,
    async execute(request: (signal: AbortSignal) => Promise<T>, options?: { successMessage?: string; notifySuccess?: boolean }) {
      const result = await async.run(request);
      if (result !== null && (options?.notifySuccess || options?.successMessage)) {
        toast.add({ group: 'api', severity: 'success', summary: 'Готово',
          detail: options.successMessage || serverMessage(result) || 'Изменения сохранены', life: 3500 });
      }
      return result;
    },
    notifyError(error: unknown) {
      toast.add({ group: 'api', severity: 'error', summary: 'Ошибка запроса', detail: apiErrorMessage(error), life: 5500 });
    },
  };
}
