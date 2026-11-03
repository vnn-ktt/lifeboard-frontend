export type Horizon = 'month' | 'quarter' | 'year' | 'five-years';
export type LifeAreaId = string;

export interface LifeArea {
  id: LifeAreaId;
  name: string;
  icon: string;
  accent: string;
  subtle: string;
}

export interface LifeGoal {
  id: string;
  areaId: LifeAreaId;
  title: string;
  description: string;
  horizon: Horizon;
  target: number;
  createdAt: string;
  parentId?: string | null;
}

export interface LifeRoutine {
  id: string;
  goalId: string;
  title: string;
  description: string;
  time: string;
  // Monday = 1, Sunday = 7
  days: number[];
  durationMinutes: number;
}

export interface WeeklyReview {
  weekStart: string;
  wins: string;
  obstacles: string;
  nextStep: string;
  mood: number;
  updatedAt: string;
}

/** A notebook group may be attached to one existing goal. */
export interface LifeNoteGroup {
  id: string;
  name: string;
  goalId: string | null;
  color: string;
  createdAt: string;
}

/** Notes store plain text; uploaded images are compressed and stored as local data URLs. */
export interface LifeNote {
  id: string;
  title: string;
  content: string;
  groupId: string | null;
  goalId: string | null;
  imageDataUrl: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LifeState {
  version: 1;
  vision: string;
  goals: LifeGoal[];
  routines: LifeRoutine[];
  checks: Record<string, boolean>;
  reviews: WeeklyReview[];
  categories?: LifeArea[];
  /** Up to three explicitly selected priority goals. Absent in v0.4 backups. */
  focusGoalIds?: string[];
  /** Optional to preserve imports of old v1 backups. */
  noteGroups?: LifeNoteGroup[];
  notes?: LifeNote[];
}
