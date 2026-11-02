import type { OwnedEntity, TimestampedEntity } from '@/core/supabase/types';
import type { CategoryKind as SharedCategoryKind } from '@/shared/types';

export type CategoryKind = SharedCategoryKind;

export interface CategoryTemplate extends OwnedEntity, TimestampedEntity {
  color: string;
  icon: string;
  id: string;
  kind: CategoryKind;
  name: string;
}

export type CreateCategoryPayload = Pick<CategoryTemplate, 'color' | 'icon' | 'kind' | 'name'>;
export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;
