<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BalanceCard from '@/modules/demo/components/BalanceCard.vue';
import CategoryCard from '@/modules/demo/components/CategoryCard.vue';
import PreviewSection from '@/modules/demo/components/PreviewSection.vue';
import PreviewStatCard from '@/modules/demo/components/PreviewStatCard.vue';
import TransactionCard from '@/modules/demo/components/TransactionCard.vue';
import type {
  DemoCategoryPreviewItem,
  DemoPreviewStatItem,
  DemoTransactionPreview,
} from '@/modules/demo/types';

defineProps<{
  previewCategories: readonly DemoCategoryPreviewItem[];
  previewStats: readonly DemoPreviewStatItem[];
  previewTransactions: readonly DemoTransactionPreview[];
}>();

const { t } = useI18n();
</script>

<template>
  <div
    class="animate-appear-invisible-bottom rounded-lg border border-border bg-bg p-4 shadow-soft sm:p-5"
  >
    <div class="rounded-lg bg-bg p-4 sm:p-5">
      <BalanceCard
        :balance-label="t('demo.preview.balanceLabel')"
        :balance-value="t('demo.preview.balanceValue')"
        growth="+14%"
      />

      <div class="mt-6 grid gap-3 sm:grid-cols-3">
        <PreviewStatCard
          v-for="stat in previewStats"
          :key="stat.key"
          :icon="stat.icon"
          :title="t(`demo.preview.stats.${stat.key}`)"
          :value="stat.value"
        />
      </div>

      <div class="mt-5 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <PreviewSection icon="bi-tags" :title="t('demo.features.items.categorization.title')">
          <div class="space-y-4">
            <CategoryCard
              v-for="category in previewCategories"
              :key="category.key"
              :color-class="category.colorClass"
              :label="t(`demo.preview.categories.${category.key}`)"
              :value="category.value"
              :width-class="category.widthClass"
            />
          </div>
        </PreviewSection>

        <PreviewSection icon="bi-receipt" :title="t('demo.features.items.tracking.title')">
          <div class="space-y-3">
            <TransactionCard
              v-for="transaction in previewTransactions"
              :key="transaction.key"
              :amount="t(`demo.preview.transactions.${transaction.key}.amount`)"
              :category="t(`demo.preview.transactions.${transaction.key}.category`)"
              :icon="transaction.icon"
              :name="t(`demo.preview.transactions.${transaction.key}.name`)"
              :tone-class="transaction.toneClass"
            />
          </div>
        </PreviewSection>
      </div>
    </div>
  </div>
</template>
