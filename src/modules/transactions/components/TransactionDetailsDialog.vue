<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import MoneyDisplay from '@/shared/components/MoneyDisplay.vue';
import CategoryBadge from '@/shared/components/CategoryBadge.vue';
import type { TransactionItem } from '@/modules/transactions/types';

interface Props {
  visible: boolean;
  transaction?: TransactionItem | null;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  transaction: null,
});

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void;
}>();

const { locale, t } = useI18n();

const kindLabel = computed(() =>
  props.transaction?.kind === 'income' ? t('common.kind.income') : t('common.kind.expense'),
);

function closeDialog() {
  emit('update:visible', false);
}

function formatDate(value?: string) {
  if (!value) return '';

  return new Intl.DateTimeFormat(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
</script>

<template>
  <Dialog
    :visible="props.visible"
    :header="t('transactions.details.title')"
    modal
    :style="{ width: 'min(42rem, 92vw)' }"
    :breakpoints="{ '640px': '92vw' }"
    :show-header="true"
    :dismissable-mask="true"
    @update:visible="emit('update:visible', $event)"
  >
    <div v-if="props.transaction" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <p class="m-0 text-sm uppercase tracking-[0.28em] text-text-muted">
            {{ kindLabel }}
          </p>
          <h2 class="mt-3 text-3xl font-bold text-text">
            <MoneyDisplay
              :amount="props.transaction.amount"
              :currency="props.transaction.currency"
              :kind="props.transaction.kind"
              show-sign
            />
          </h2>
        </div>

        <Tag
          :value="kindLabel"
          :severity="props.transaction.kind === 'income' ? 'success' : 'danger'"
          rounded
        />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-3xl border border-border bg-surface-alt p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-text-muted">
            {{ t('transactions.fields.category') }}
          </p>
          <p class="mt-2 text-sm font-semibold text-text">
            <CategoryBadge
              :color="props.transaction.categoryColor"
              :icon="props.transaction.categoryIcon"
              :kind="props.transaction.kind"
              :name="props.transaction.categoryName"
            />
          </p>
        </div>

        <div class="rounded-3xl border border-border bg-surface-alt p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-text-muted">
            {{ t('transactions.fields.date') }}
          </p>
          <p class="mt-2 text-sm font-semibold text-text">
            {{ formatDate(props.transaction.occurredAt) }}
          </p>
        </div>
      </div>

      <div class="rounded-3xl border border-border bg-surface-alt p-4">
        <p class="text-xs uppercase tracking-[0.2em] text-text-muted">
          {{ t('transactions.fields.description') }}
        </p>
        <p class="mt-2 text-sm font-semibold text-text">
          {{ props.transaction.description ?? t('transactions.details.noDescription') }}
        </p>
      </div>

      <div class="rounded-3xl border border-border bg-surface-alt p-4">
        <p class="text-xs uppercase tracking-[0.2em] text-text-muted">
          {{ t('transactions.fields.account') }}
        </p>
        <p class="mt-2 text-sm font-semibold text-text">
          {{ props.transaction.accountName }}
        </p>
      </div>
    </div>
  </Dialog>
</template>
