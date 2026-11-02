export type CategoryKind = 'expense' | 'income';
import type { OwnedEntity, TimestampedEntity } from '@/core/supabase/types';

export interface CategoryTemplate extends OwnedEntity, TimestampedEntity {
  color: string;
  icon: string;
  id: string;
  kind: CategoryKind;
  name: string;
}
