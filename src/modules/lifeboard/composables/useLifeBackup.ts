import { api } from '@/shared/api/client';
import { lifeSync } from '@/modules/lifeboard/api/lifeSync';
import type { LifeState } from '../types';

const MAX_BACKUP_BYTES = 5_000_000;
type Preview = {
  valid: boolean;
  canImport: boolean;
  alreadyImported: boolean;
  counts: Record<string, number>;
  warnings: string[];
};

/** Server-owned backups. Import never overwrites existing server data. */
export function useLifeBackup() {
  async function downloadBackup(): Promise<void> {
    await lifeSync().settled();
    const state = await api.get<LifeState>('/exports/lifeboard-v1');
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'lifeboard-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importSnapshot(raw: unknown): Promise<boolean> {
    await lifeSync().settled();
    const preview = await api.post<Preview>('/imports/lifeboard-v1/validate', raw);
    if (!preview.canImport) {
      throw new Error('Аккаунт уже содержит данные. Импорт разрешён только в пустой аккаунт. Экспортируй текущие данные перед продолжением.');
    }
    if (preview.alreadyImported) return true;
    const numbers = Object.entries(preview.counts)
      .filter(([, value]) => value > 0).map(([key, value]) => key + ': ' + value).join(', ');
    const warning = preview.warnings.length ? '\n\n' + preview.warnings.join('\n') : '';
    if (!window.confirm(
      'Перенести данные в аккаунт Lifeboard?\n' + numbers + warning +
      '\n\nДействие необратимо; локальные данные останутся в браузере. Продолжить?'
    )) return false;
    await api.post('/imports/lifeboard-v1', raw, { 'X-Import-Confirmed': 'true' });
    await lifeSync().reload();
    return true;
  }

  async function restoreBackup(file: File): Promise<boolean> {
    if (file.size > MAX_BACKUP_BYTES) throw new Error('Backup exceeds 5 MB');
    let snapshot: unknown;
    try { snapshot = JSON.parse(await file.text()); } catch { throw new Error('Invalid JSON'); }
    return importSnapshot(snapshot);
  }

  async function importLegacyBrowserData(): Promise<boolean> {
    const raw = localStorage.getItem('lifeboard:state:v1');
    if (!raw) throw new Error('Локальные данные не обнаружены');
    if (new Blob([raw]).size > MAX_BACKUP_BYTES) throw new Error('Local backup exceeds 5 MB');
    return importSnapshot(JSON.parse(raw) as unknown);
  }

  return { downloadBackup, restoreBackup, importLegacyBrowserData };
}
