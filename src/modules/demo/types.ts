export type DemoFeatureKey = 'tracking' | 'categorization' | 'analytics' | 'budget';

export type DemoPreviewStatKey = 'categories' | 'savedThisMonth' | 'budgetUsed';

export type DemoTransactionKey = 'coffee' | 'salary';

export interface DemoCategoryPreviewItem {
  colorClass: string;
  key: 'groceries' | 'transport' | 'subscriptions';
  value: string;
  widthClass: string;
}

export interface DemoFeatureItem {
  accentClass: string;
  icon: string;
  key: DemoFeatureKey;
}

export interface DemoPreviewStatItem {
  icon: string;
  key: DemoPreviewStatKey;
  value: string;
}

export interface DemoTransactionPreview {
  icon: string;
  key: DemoTransactionKey;
  toneClass: string;
}
