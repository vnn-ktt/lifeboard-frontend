<script setup lang="ts">
import AmountInput from '@/shared/components/Form/AmountInput.vue';
import DatePicker from '@/shared/components/Form/DatePicker.vue';
import DescriptionInput from '@/shared/components/Form/DescriptionInput.vue';
import SaveButton from '@/shared/components/Form/SaveButton.vue';
import TypeSwitcher from '@/shared/components/Form/TypeSwitcher.vue';
import type { CategoryTemplate } from '@/modules/categories/types';
import type { TransactionForm, TransactionKind } from '@/modules/transactions/types';

defineProps<{
  amountError?: string;
  amountLabel: string;
  amountPlaceholder: string;
  categories: CategoryTemplate[];
  categoryLabel: string;
  currency: string;
  dateLabel: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  expenseLabel: string;
  form: TransactionForm;
  incomeLabel: string;
  saveDisabled?: boolean;
  saveLabel: string;
}>();

const emit = defineEmits<{
  (event: 'save'): void;
  (event: 'update:amount', value: number | null): void;
  (event: 'update:category', value: string | null): void;
  (event: 'update:date', value: Date): void;
  (event: 'update:description', value: string): void;
  (event: 'update:type', value: TransactionKind): void;
}>();

function selectCategory(categoryId: string) {
  emit('update:category', categoryId);
}
</script>

<template>
  <form
    class="animate-appear-invisible-bottom rounded-lg border border-border bg-surface p-5 shadow-soft sm:p-6"
    @submit.prevent="emit('save')"
  >
    <div class="grid gap-6">
      <TypeSwitcher
        :expense-label="expenseLabel"
        :income-label="incomeLabel"
        :model-value="form.type"
        @update:model-value="emit('update:type', $event)"
      />

      <AmountInput
        :currency="currency"
        :error="amountError"
        :label="amountLabel"
        :model-value="form.amount"
        :placeholder="amountPlaceholder"
        @update:model-value="emit('update:amount', $event)"
      />

      <!-- Category Selector -->
      <section>
        <p class="mb-3 text-sm font-bold text-text">
          {{ categoryLabel }}
        </p>
        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="category in categories"
            :key="category.id"
            type="button"
            :class="[
              'flex items-center gap-3 rounded-lg border bg-bg p-3 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-soft',
              form.categoryId === category.id ? 'border-primary bg-primary-muted' : 'border-border',
            ]"
            @click="selectCategory(category.id)"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              :style="{ backgroundColor: category.color + '20', color: category.color }"
            >
              <i :class="category.icon" />
            </span>
            <span class="min-w-0 truncate text-sm font-bold text-text">
              {{ category.name }}
            </span>
          </button>
        </div>
      </section>

      <DatePicker
        :label="dateLabel"
        :model-value="form.date"
        @update:model-value="emit('update:date', $event)"
      />

      <DescriptionInput
        :label="descriptionLabel"
        :model-value="form.description"
        :placeholder="descriptionPlaceholder"
        @update:model-value="emit('update:description', $event)"
      />

      <SaveButton :disabled="saveDisabled" :label="saveLabel" />
    </div>
  </form>
</template>
