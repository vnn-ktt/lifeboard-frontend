export type Horizon = 'month' | 'quarter' | 'year' | 'five-years';
export type LifeAreaId = string;

export interface LifeArea {
  id: LifeAreaId;
  name: string;
  icon: string;
  accent: string;
  subtle: string;
}

/** Every goal has one primary result metric, independent of planned actions. */
export type GoalMeasurement =
  | { kind: 'activity' }
  | { kind: 'numeric'; direction: 'increase' | 'decrease'; startValue: number; targetValue: number; unit: string }
  | { kind: 'binary' };

/** A dated observation for numeric or binary goals. Last observation of a date wins. */
export interface GoalMetricEntry {
  id: string;
  goalId: string;
  date: string; // YYYY-MM-DD in user's local calendar
  value: number; // numeric result or 0/1 for binary result
  note: string;
  createdAt: string;
}

export interface GoalInput {
  areaId: LifeAreaId;
  title: string;
  description: string;
  horizon: Horizon;
  /** Planned routine completions (secondary for non-activity goals). */
  target: number;
  parentId?: string | null;
  startDate?: string;
  dueDate?: string;
  measurement: GoalMeasurement;
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
  /** Absent in legacy backups; the old rolling horizon remains in effect. */
  startDate?: string;
  dueDate?: string;
  /** Absent in legacy data means activity-based progress. */
  measurement?: GoalMeasurement;
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


export interface LifeQuoteText {
  ru: string;
  en: string;
  de: string;
}

export type QuotePlacement = 'dashboard' | 'review';

export interface LifeQuote {
  id: string;
  text: LifeQuoteText;
  author: LifeQuoteText;
  sourceTitle: LifeQuoteText;
  sourceUrl: string;
  reference: string;
  createdAt: string;
  createdBy: 'seed';
}

export interface ArchivedUserQuote {
  id: string;
  text: LifeQuoteText;
  author: string;
  createdAt?: string;
}

export interface LifeState {
  version: 1;
  vision: string;
  goals: LifeGoal[];
  goalMetricEntries?: GoalMetricEntry[];
  routines: LifeRoutine[];
  checks: Record<string, boolean>;
  reviews: WeeklyReview[];
  categories?: LifeArea[];
  /** Up to three explicitly selected priority goals. Absent in v0.4 backups. */
  focusGoalIds?: string[];
  /** Optional to preserve imports of old v1 backups. */
  noteGroups?: LifeNoteGroup[];
  notes?: LifeNote[];
  quotes?: LifeQuote[];
  /** Historical custom quotes retained only in JSON backups, never shown in the UI. */
  archivedUserQuotes?: ArchivedUserQuote[];
  quoteAssignments?: Partial<Record<QuotePlacement, string>>;
}
