<script lang="ts" setup>
import Card from 'primevue/card';

interface Props {
  title: string;
  amount: number;
  currency: string;
  subtitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
});

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('ru-RU', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount);
}
</script>

<template>
  <Card class="border border-border bg-surface">
    <template #content>
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="m-0 text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
            {{ props.title }}
          </p>
          <p class="mt-3 text-3xl font-bold leading-tight text-text">
            {{ formatMoney(props.amount, props.currency) }}
          </p>
        </div>
        <span
          class="rounded-2xl border border-border bg-surface-alt px-4 py-3 text-sm font-semibold text-text-muted"
        >
          {{ props.currency }}
        </span>
      </div>

      <p v-if="props.subtitle" class="mt-4 text-sm text-text-muted">
        {{ props.subtitle }}
      </p>
    </template>
  </Card>
</template>
