import { useToast } from 'primevue/usetoast';
import { useAsyncState } from './useAsyncState';
import { apiErrorMessage, serverMessage } from '@/shared/lib/apiErrors';

const labels = {
  ru: { error: 'Ошибка запроса', success: 'Готово', saved: 'Изменения сохранены' },
  en: { error: 'Request failed', success: 'Done', saved: 'Changes saved' },
  de: { error: 'Anfrage fehlgeschlagen', success: 'Fertig', saved: 'Änderungen gespeichert' },
};
function phrases() {
  const lang = typeof document !== 'undefined' ? document.documentElement.lang.slice(0, 2) : 'ru';
  return labels[lang as keyof typeof labels] ?? labels.ru;
}

/** Single API layer: always 4 typed states, a single top-right toast and no stale writes. */
export function useApiRequest<T>() {
  const toast = useToast();
  const async = useAsyncState<T>((message) => {
    toast.add({ group: 'api', severity: 'error', summary: phrases().error, detail: message, life: 5500 });
  });
  return {
    ...async,
    async execute(request: (signal: AbortSignal) => Promise<T>, options?: { successMessage?: string; notifySuccess?: boolean }) {
      const result = await async.run(request);
      // A successful 204 response legitimately returns null; consult the discriminant.
      if (async.state.value.status === 'success' && (options?.notifySuccess || options?.successMessage)) {
        toast.add({ group: 'api', severity: 'success', summary: phrases().success,
          detail: options.successMessage || serverMessage(result) || phrases().saved, life: 3500 });
      }
      return result;
    },
    notifyError(error: unknown) {
      toast.add({ group: 'api', severity: 'error', summary: phrases().error, detail: apiErrorMessage(error), life: 5500 });
    },
  };
}
