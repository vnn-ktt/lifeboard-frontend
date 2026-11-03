import { useLifeStore } from '../stores/useLifeStore';

const MAX_BACKUP_BYTES = 5_000_000;

/** Export / import of the entire Lifeboard v1 state, including note groups and image data URLs. */
export function useLifeBackup() {
  const store = useLifeStore();

  function downloadBackup(): void {
    const blob = new Blob([store.exportState()], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `lifeboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function restoreBackup(file: File): Promise<boolean> {
    if (file.size > MAX_BACKUP_BYTES) throw new Error('Backup exceeds 5 MB');
    return store.importState(await file.text());
  }

  return { downloadBackup, restoreBackup };
}
