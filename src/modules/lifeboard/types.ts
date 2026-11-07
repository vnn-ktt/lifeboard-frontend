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


/** Check-ins do not change outcome progress unless a separate metric entry is recorded. */
export type GoalCheckinFrequency = 'off' | 'manual' | 'daily' | 'weekly';

export interface GoalCheckinSchedule {
  frequency: GoalCheckinFrequency;
  /** ISO day of the week, Monday=1 through Sunday=7. Only for weekly. */
  weekday?: number;
  /** Local calendar day on which this schedule becomes active. Avoids retroactive reminders. */
  fromDate: string;
}

export type GoalCheckinStatus = 'updated' | 'unchanged' | 'skipped';

export interface GoalCheckin {
  id: string;
  goalId: string;
  /** Planned local date of the check-in, not the date the user responded. */
  dueDate: string;
  completedAt: string;
  status: GoalCheckinStatus;
  /** Reference to a separate reading, if an outcome was changed. */
  metricEntryId?: string;
}

export interface PendingGoalCheckin {
  goal: LifeGoal;
  dueDate: string;
  pendingCount: number;
  overdue: boolean;
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
  checkin?: GoalCheckinSchedule;
}

export type GoalStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface GoalMilestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  order: number;
  dueDate?: string;
  completedAt?: string | null;
  createdAt: string;
}

/** A one-off task; unlike routines, it is completed once, not for each day. */
export interface GoalTask {
  id: string;
  goalId: string;
  milestoneId: string | null;
  title: string;
  description: string;
  dueDate?: string;
  completedAt?: string | null;
  createdAt: string;
}

export interface LifeGoal {
  id: string;
  areaId: LifeAreaId;
  title: string;
  description: string;
  horizon: Horizon;
  target: number;
  createdAt: string;
  status?: GoalStatus;
  completedAt?: string | null;
  parentId?: string | null;
  /** Absent in legacy backups; the old rolling horizon remains in effect. */
  startDate?: string;
  dueDate?: string;
  /** Absent in legacy data means activity-based progress. */
  measurement?: GoalMeasurement;
  checkin?: GoalCheckinSchedule;
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
  goalCheckins?: GoalCheckin[];
  milestones?: GoalMilestone[];
  goalTasks?: GoalTask[];
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
