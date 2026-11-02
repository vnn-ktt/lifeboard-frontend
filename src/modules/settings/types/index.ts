import type { TimestampedEntity } from '@/core/supabase/types';

// ─── Profile ────────────────────────────────────────────
export interface ProfileTemplate extends TimestampedEntity {
  avatarUrl: string | null;
  displayName: string;
  id: string;
  locale: string;
}

export type UpdateProfilePayload = Partial<
  Pick<ProfileTemplate, 'avatarUrl' | 'displayName' | 'locale'>
>;

// ─── Security ───────────────────────────────────────────
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  pinCode: string | null;
  socialLogins: SocialProvider[];
}

export interface SocialProvider {
  id: string;
  name: 'google' | 'apple' | 'github';
  connected: boolean;
  connectedAt: string | null;
}

// ─── Currency & Localization ────────────────────────────
export interface LocalizationSettings {
  primaryCurrency: string;
  numberFormat: 'dot' | 'comma';
  dateFormat: string;
  locale: string;
  timezone: string;
}

// ─── Accounts ───────────────────────────────────────────
export interface AccountSettings {
  defaultCategoryId: string | null;
  hideInactiveAccounts: boolean;
}

// ─── Budgets ────────────────────────────────────────────
export interface BudgetSettings {
  carryOverRemaining: boolean;
  notificationThreshold: number; // 0-100, e.g. 80 means notify at 80%
}

// ─── Notifications ──────────────────────────────────────
export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  largeTransactionThreshold: number | null;
  recurringReminderDays: number; // days before
  digest: 'none' | 'weekly' | 'monthly';
}

// ─── Recurring Transactions ─────────────────────────────
export interface RecurringTransactionTemplate {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  dayOfMonth: number;
  dayOfWeek: number;
  nextDate: string;
  autoCreate: boolean;
  remindBeforeDays: number;
  active: boolean;
}

// ─── Appearance ─────────────────────────────────────────
export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  chartStyle: 'categories' | 'timeline';
  accountOrder: string[];
  categoryOrder: string[];
}

// ─── Privacy ────────────────────────────────────────────
export interface PrivacySettings {
  hideBalances: boolean;
  sharedAccess: SharedAccess[];
}

export interface SharedAccess {
  userId: string;
  email: string;
  role: 'viewer' | 'editor';
}

// ─── Root settings bag ──────────────────────────────────
export interface UserSettings {
  profile: ProfileTemplate;
  security: SecuritySettings;
  localization: LocalizationSettings;
  accounts: AccountSettings;
  budgets: BudgetSettings;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  privacy: PrivacySettings;
}
