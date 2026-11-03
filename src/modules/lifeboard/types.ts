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
  /** Up to three explicitly selected priority goals. Absent in v0.4 backups. */
  focusGoalIds?: string[];
}
