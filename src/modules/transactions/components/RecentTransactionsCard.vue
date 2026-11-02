<script setup lang="ts">
import PreviewSection from '@/modules/demo/components/PreviewSection.vue';
import TransactionCard from '@/modules/demo/components/TransactionCard.vue';
import type { RecentTransactionPreview } from '@/modules/transactions/types';

defineProps<{
  title: string;
  transactions: readonly RecentTransactionPreview[];
}>();
</script>

<template>
  <div class="animate-appear-invisible-bottom">
    <PreviewSection icon="bi-clock-history" :title="title">
      <div class="space-y-3">
        <TransactionCard
          v-for="transaction in transactions"
          :key="transaction.id"
          :amount="transaction.amount"
          :category="transaction.category"
          :icon="transaction.icon"
          :name="transaction.name"
          :tone-class="transaction.toneClass"
        />
      </div>
    </PreviewSection>
  </div>
</template>
