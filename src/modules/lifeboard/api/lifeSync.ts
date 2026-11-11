import { api } from '@/shared/api/client';
import { useLifeStore } from '../stores/useLifeStore';
import type {
  LifeState, LifeGoal, LifeNote,
} from '../types';

type Store = ReturnType<typeof useLifeStore>;
type BackendId = { id: string };
type SyncEvent = { name: string; args: unknown[]; before: LifeState; after: LifeState };

/** Translate optimistic synchronous Pinia actions to serialized backend v1 writes.
 * The server remains authoritative: after a write batch, refetch its LifeState v1 export.
 * Temporary browser IDs are mapped to the server-generated UUIDs throughout the queue.
 */
export class LifeSync {
  private ids = new Map<string, string>();
  private identity: string | null = null;
  private loaded = false;
  private queue: Promise<void> = Promise.resolve();
  private generation = 0;
  private revision = 0;
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;
  private failed = false;

  constructor(private readonly store: Store) {
    store.$onAction(({ name, args, after }) => {
      if (name === 'replaceRemoteSnapshot' || name === 'exportState' ||
          name === 'importState' || name === 'resetState' || name === 'addDemoContent') return;
      if (!this.loaded || !this.identity) return;
      const before = JSON.parse(store.exportState()) as LifeState;
      after(() => {
        const current = JSON.parse(store.exportState()) as LifeState;
        if (JSON.stringify(before) !== JSON.stringify(current)) {
          this.enqueue({ name, args: [...args], before, after: current });
        }
      });
    });
  }

  async ensureLoaded(userId: string): Promise<void> {
    if (this.identity !== userId) {
      this.reset();
      this.identity = userId;
    }
    if (this.loaded) return;
    await this.reload();
    this.loaded = true;
  }

  reset(): void {
    this.generation++;
    this.identity = null;
    this.loaded = false;
    this.failed = false;
    this.ids.clear();
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.store.replaceRemoteSnapshot({
      version: 1, vision: '', goals: [], routines: [], checks: {}, reviews: [],
      categories: [], focusGoalIds: [], noteGroups: [], notes: [],
    });
  }

  async reload(): Promise<void> {
    const generation = this.generation;
    const revision = this.revision;
    const snapshot = await api.get<LifeState>('/exports/lifeboard-v1');
    // Never overwrite newer user actions or another user's workspace.
    if (generation === this.generation && revision === this.revision) {
      this.store.replaceRemoteSnapshot(snapshot);
      this.ids.clear();
      this.failed = false;
      this.notify('');
    }
  }

  async settled(): Promise<void> {
    await this.queue;
    if (this.failed) throw new Error('Server synchronization failed');
  }

  private notify(message: string): void {
    window.dispatchEvent(new CustomEvent('lifeboard:sync-error', { detail: message }));
  }

  private id(value: string | null | undefined): string | null {
    return value ? this.ids.get(value) ?? value : null;
  }

  private require(value: string | null | undefined): string {
    const id = this.id(value);
    if (!id) throw new Error('Missing backend ID');
    return id;
  }

  private track(local: string, created: BackendId): void {
    this.ids.set(local, created.id);
  }

  private enqueue(event: SyncEvent): void {
    const generation = this.generation;
    this.revision++;
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.queue = this.queue.then(async () => {
      if (generation !== this.generation || this.failed) return;
      await this.write(event);
    }).catch(error => {
      if (generation !== this.generation) return;
      this.failed = true;
      this.notify(error instanceof Error ? error.message : String(error));
    }).then(() => {
      if (generation === this.generation) this.scheduleRefresh();
    });
  }

  private scheduleRefresh(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      const generation = this.generation;
      const revision = this.revision;
      void this.queue.then(async () => {
        if (generation !== this.generation) return;
        try {
          const snapshot = await api.get<LifeState>('/exports/lifeboard-v1');
          if (generation !== this.generation || revision !== this.revision) return;
          this.store.replaceRemoteSnapshot(snapshot);
          this.ids.clear();
          if (!this.failed) this.notify('');
          // On failure, revert optimistic changes to the last authoritative server snapshot.
          this.failed = false;
        } catch (error) {
          this.notify(error instanceof Error ? error.message : String(error));
        }
      });
    }, 350);
  }

  private findNew<T extends { id: string }>(before: T[], after: T[]): T | undefined {
    const existing = new Set(before.map(item => item.id));
    return after.find(item => !existing.has(item.id));
  }

  private goalPayload(goal: LifeGoal): Record<string, unknown> {
    return {
      areaId: this.require(goal.areaId), title: goal.title, description: goal.description,
      horizon: goal.horizon, target: goal.target, measurement: goal.measurement,
      startDate: goal.startDate ?? null, dueDate: goal.dueDate ?? null,
      checkin: goal.checkin ?? null, parentId: this.id(goal.parentId),
    };
  }

  private async imageFileId(image: string | null): Promise<string | null> {
    if (!image) return null;
    const response = await fetch(image);
    const blob = await response.blob();
    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    const stored = await api.upload<BackendId>('/files',
      new File([blob], 'lifeboard-note.' + ext, { type: blob.type || 'image/jpeg' }));
    return stored.id;
  }

  private async notePayload(note: LifeNote, old?: LifeNote): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {
      title: note.title, content: note.content,
      groupId: this.id(note.groupId), goalId: this.id(note.goalId), pinned: note.pinned,
    };
    if (!old || old.imageDataUrl !== note.imageDataUrl) {
      result.imageFileId = await this.imageFileId(note.imageDataUrl);
    }
    return result;
  }

  private milestonePath(goal: string, id: string): string {
    return '/goals/' + this.require(goal) + '/milestones/' + this.require(id);
  }
  private taskPath(goal: string, id: string): string {
    return '/goals/' + this.require(goal) + '/tasks/' + this.require(id);
  }

  private async write(event: SyncEvent): Promise<void> {
    const { name, args, before, after } = event;
    const argId = String(args[0] ?? '');
    const goal = after.goals.find(g => g.id === argId);
    switch (name) {
      case 'addCategory': {
        const added = this.findNew(before.categories ?? [], after.categories ?? []);
        if (added) this.track(added.id, await api.post<BackendId>('/areas', { name: added.name, accent: added.accent }));
        return;
      }
      case 'deleteCategory': await api.delete('/areas/' + this.require(argId)); return;
      case 'addGoal': {
        const added = this.findNew(before.goals, after.goals);
        if (added) this.track(added.id, await api.post<BackendId>('/goals', this.goalPayload(added)));
        return;
      }
      case 'updateGoal': {
        if (goal) await api.patch('/goals/' + this.require(argId), this.goalPayload(goal));
        return;
      }
      case 'setGoalParent': {
        if (goal) await api.patch('/goals/' + this.require(argId), { parentId: this.id(goal.parentId) });
        return;
      }
      case 'setGoalStatus': {
        if (goal) await api.patch('/goals/' + this.require(argId) + '/status', { status: goal.status });
        return;
      }
      case 'deleteGoal': await api.delete('/goals/' + this.require(argId)); return;
      case 'toggleFocus':
        await api.put('/goals/focus', { goalIds: (after.focusGoalIds ?? []).map(id => this.require(id)) });
        return;
      case 'recordGoalMetric': {
        const added = this.findNew(before.goalMetricEntries ?? [], after.goalMetricEntries ?? []);
        if (added) this.track(added.id, await api.post<BackendId>(
          '/goals/' + this.require(added.goalId) + '/metrics',
          { date: added.date, value: added.value, note: added.note }));
        return;
      }
      case 'deleteGoalMetric': {
        const removed = (before.goalMetricEntries ?? []).find(item => item.id === argId);
        if (removed) await api.delete('/goals/' + this.require(removed.goalId) + '/metrics/' + this.require(argId));
        return;
      }
      case 'completeGoalCheckin': {
        await api.post('/goals/' + this.require(argId) + '/checkins', {
          dueDate: args[1], status: args[2],
          ...(args[3] !== undefined ? { value: args[3] } : {}),
          ...(args[4] ? { note: args[4] } : {}),
        });
        return;
      }
      case 'addMilestone': {
        const added = this.findNew(before.milestones ?? [], after.milestones ?? []);
        if (added) this.track(added.id, await api.post<BackendId>(
          '/goals/' + this.require(added.goalId) + '/milestones', {
            title: added.title, description: added.description, dueDate: added.dueDate ?? null, order: added.order,
          }));
        return;
      }
      case 'updateMilestone': {
        const item = (after.milestones ?? []).find(x => x.id === argId);
        if (item) await api.patch(this.milestonePath(item.goalId, item.id), {
          title: item.title, description: item.description, dueDate: item.dueDate ?? null,
        });
        return;
      }
      case 'toggleMilestone': {
        const item = (after.milestones ?? []).find(x => x.id === argId);
        if (item) await api.put(this.milestonePath(item.goalId, item.id) + '/completion',
          { completed: Boolean(item.completedAt) });
        return;
      }
      case 'deleteMilestone': {
        const item = (before.milestones ?? []).find(x => x.id === argId);
        if (item) await api.delete(this.milestonePath(item.goalId, item.id));
        return;
      }
      case 'addGoalTask': {
        const added = this.findNew(before.goalTasks ?? [], after.goalTasks ?? []);
        if (added) this.track(added.id, await api.post<BackendId>(
          '/goals/' + this.require(added.goalId) + '/tasks', {
            title: added.title, description: added.description, dueDate: added.dueDate ?? null,
            milestoneId: this.id(added.milestoneId),
          }));
        return;
      }
      case 'updateGoalTask': {
        const item = (after.goalTasks ?? []).find(x => x.id === argId);
        if (item) await api.patch(this.taskPath(item.goalId, item.id), {
          title: item.title, description: item.description, dueDate: item.dueDate ?? null,
          milestoneId: this.id(item.milestoneId),
        });
        return;
      }
      case 'toggleGoalTask': {
        const item = (after.goalTasks ?? []).find(x => x.id === argId);
        if (item) await api.put(this.taskPath(item.goalId, item.id) + '/completion',
          { completed: Boolean(item.completedAt) });
        return;
      }
      case 'deleteGoalTask': {
        const item = (before.goalTasks ?? []).find(x => x.id === argId);
        if (item) await api.delete(this.taskPath(item.goalId, item.id));
        return;
      }
      case 'addRoutine': {
        const added = this.findNew(before.routines, after.routines);
        if (added) this.track(added.id, await api.post<BackendId>('/routines', {
          goalId: this.require(added.goalId), title: added.title, description: added.description,
          time: added.time, days: added.days, durationMinutes: added.durationMinutes,
        }));
        return;
      }
      case 'deleteRoutine': await api.delete('/routines/' + this.require(argId)); return;
      case 'setDone': {
        const keys = new Set([...Object.keys(before.checks), ...Object.keys(after.checks)]);
        for (const key of keys) {
          if (Boolean(before.checks[key]) === Boolean(after.checks[key])) continue;
          const separator = key.indexOf('|');
          if (separator < 0) continue;
          const date = key.slice(0, separator);
          const id = key.slice(separator + 1);
          await api.put('/routines/' + this.require(id) + '/checks/' + date,
            { done: Boolean(after.checks[key]) });
        }
        return;
      }
      case 'saveReview': {
        const added = after.reviews.find(item => {
          const old = before.reviews.find(x => x.weekStart === item.weekStart);
          return JSON.stringify(item) !== JSON.stringify(old);
        });
        if (added) await api.put('/reviews/' + added.weekStart, {
          wins: added.wins, obstacles: added.obstacles, nextStep: added.nextStep, mood: added.mood,
        });
        return;
      }
      case 'setVision': await api.put('/life/vision', { vision: after.vision }); return;
      case 'addNoteGroup': {
        const added = this.findNew(before.noteGroups ?? [], after.noteGroups ?? []);
        if (added) this.track(added.id, await api.post<BackendId>('/note-groups', {
          name: added.name, color: added.color, goalId: this.id(added.goalId),
        }));
        return;
      }
      case 'updateNoteGroup': {
        const item = (after.noteGroups ?? []).find(x => x.id === argId);
        if (item) await api.patch('/note-groups/' + this.require(argId),
          { name: item.name, color: item.color, goalId: this.id(item.goalId) });
        return;
      }
      case 'deleteNoteGroup': await api.delete('/note-groups/' + this.require(argId)); return;
      case 'addNote': {
        const added = this.findNew(before.notes ?? [], after.notes ?? []);
        if (added) this.track(added.id, await api.post<BackendId>('/notes', await this.notePayload(added)));
        return;
      }
      case 'updateNote': {
        const item = (after.notes ?? []).find(x => x.id === argId);
        const old = (before.notes ?? []).find(x => x.id === argId);
        if (item) await api.patch('/notes/' + this.require(argId), await this.notePayload(item, old));
        return;
      }
      case 'deleteNote': await api.delete('/notes/' + this.require(argId)); return;
      case 'assignQuote': {
        const placement = String(args[0]);
        if (placement !== 'dashboard' && placement !== 'review') return;
        await api.put('/quotes/assignments', {
          [placement]: after.quoteAssignments?.[placement] ?? null,
        });
        return;
      }
      default:
        // Read-only store actions and client-side calculation helpers do not write to API.
        return;
    }
  }
}

let current: LifeSync | undefined;
export function installLifeSync(store: Store): LifeSync {
  return current ??= new LifeSync(store);
}
export function lifeSync(): LifeSync {
  if (!current) throw new Error('LifeSync was not initialized');
  return current;
}
