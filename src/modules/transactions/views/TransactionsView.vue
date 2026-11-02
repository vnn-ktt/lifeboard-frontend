<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import PageHeader from '@/shared/components/PageHeader.vue';
import TransactionSummaryCard from '@/modules/transactions/components/TransactionSummaryCard.vue';
import TransactionGroupCard from '@/modules/transactions/components/TransactionGroupCard.vue';
import TransactionDetailsDialog from '@/modules/transactions/components/TransactionDetailsDialog.vue';
import TransactionFormCard from '@/modules/transactions/components/TransactionFormCard.vue';
import { useTransactionForm } from '@/modules/transactions/composables/useTransactionForm';
import { useCategories } from '@/shared/composables/useCategories';
import { useFinanceStore } from '@/shared/stores/useFinanceStore';
import type { TransactionItem, TransactionGroup } from '@/modules/transactions/types';

const { locale, t } = useI18n();

type TransactionFilter = TransactionItem['kind'] | 'all';

const {
  form,
  canSave,
  resetForm,
  updateAmount,
  updateCategory,
  updateDate,
  updateDescription,
  updateType,
} = useTransactionForm();
const { getCategoriesByKind, getCategoryById } = useCategories();
const financeStore = useFinanceStore();
const { transactions } = storeToRefs(financeStore);

const selectedTransaction = ref<TransactionItem | null>(null);
const isDetailsOpen = ref(false);
const isCreateOpen = ref(false);
const activeFilter = ref<TransactionFilter>('all');
const searchQuery = ref('');

const localizedTransactions = computed<TransactionItem[]>(() =>
  transactions.value.map((transaction) => {
    const category = getCategoryById(transaction.categoryId);

    if (!category) {
      return transaction;
    }

    return {
      ...transaction,
      categoryColor: category.color,
      categoryIcon: category.icon,
      categoryName: category.name,
      description: transaction.description ?? category.name,
    };
  }),
);

const incomeTotal = computed(() =>
  transactions.value
    .filter((transaction) => transaction.kind === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0),
);

const spendTotal = computed(() =>
  transactions.value
    .filter((transaction) => transaction.kind === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0),
);

const netTotal = computed(() => incomeTotal.value - spendTotal.value);

const dateLocale = computed(() => (locale.value === 'ru' ? 'ru-RU' : 'en-US'));

const filterOptions = computed<{ label: string; value: TransactionFilter }[]>(() => [
  { label: t('transactions.filters.all'), value: 'all' },
  { label: t('common.kind.income'), value: 'income' },
  { label: t('common.kind.expense'), value: 'expense' },
]);

const filteredTransactions = computed<TransactionItem[]>(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase();

  return localizedTransactions.value.filter((transaction) => {
    const matchesKind = activeFilter.value === 'all' || transaction.kind === activeFilter.value;

    if (!matchesKind) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [transaction.description, transaction.categoryName, transaction.accountName]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalizedQuery));
  });
});

const transactionGroups = computed<TransactionGroup[]>(() => {
  const groups = new Map<string, TransactionGroup & { transactions: TransactionItem[] }>();
  const sortedTransactions = [...filteredTransactions.value].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  for (const transaction of sortedTransactions) {
    const date = new Date(transaction.occurredAt);
    const id = date.toISOString().slice(0, 10);
    const currentGroup = groups.get(id);

    if (currentGroup) {
      currentGroup.totalAmount += transaction.amount;
      currentGroup.transactions.push(transaction);
      continue;
    }

    groups.set(id, {
      id,
      label: new Intl.DateTimeFormat(dateLocale.value, {
        day: '2-digit',
        weekday: 'long',
      }).format(date),
      subtitle: new Intl.DateTimeFormat(dateLocale.value, {
        month: 'long',
        year: 'numeric',
      }).format(date),
      totalAmount: transaction.amount,
      currency: transaction.currency,
      transactions: [transaction],
    });
  }

  return [...groups.values()];
});

function openTransaction(transaction: TransactionItem) {
  selectedTransaction.value = transaction;
  isDetailsOpen.value = true;
}

function openCreateDialog() {
  resetForm();
  isCreateOpen.value = true;
}

function closeCreateDialog() {
  isCreateOpen.value = false;
  resetForm();
}

// Get categories filtered by current transaction type
const currentCategories = computed(() => getCategoriesByKind(form.type));

function handleSave() {
  if (!canSave.value || form.amount === null) {
    return;
  }

  const category = getCategoryById(form.categoryId);

  if (!category) {
    return;
  }

  const occurredAt = form.date.toISOString();
  const description = form.description.trim() || category.name;

  financeStore.addTransaction({
    id: `tx-${Date.now()}`,
    amount: form.amount,
    currency: 'RUB',
    categoryId: category.id,
    categoryName: category.name,
    categoryIcon: category.icon,
    categoryColor: category.color,
    description,
    kind: form.type,
    occurredAt,
    accountName: t('transactions.demo.accounts.tinkoff'),
    ownerId: '',
    createdAt: occurredAt,
    updatedAt: occurredAt,
  });

  resetForm();
  isCreateOpen.value = false;
}
</script>

<template>
  <div class="grid min-h-full gap-5 md:gap-6">
    <section class="hidden items-end justify-between gap-6 md:flex">
      <PageHeader
        :title="t('transactions.title')"
        :description="t('transactions.description')"
        icon="bi-arrow-left-right"
      />

      <Button
        :label="t('transactions.actions.add')"
        icon="bi bi-plus-lg"
        class="shrink-0"
        @click="openCreateDialog"
      />
    </section>

    <section class="grid gap-3 sm:grid-cols-3">
      <TransactionSummaryCard
        :title="t('transactions.summary.net')"
        :amount="netTotal"
        currency="RUB"
        :subtitle="t('transactions.summary.netSubtitle')"
      />
    </section>

    <section class="rounded-xl border border-border bg-surface/80 p-4 shadow-soft sm:p-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="m-0 text-xl font-bold text-text">
            {{ t('transactions.list.title') }}
          </h2>
          <p class="mb-0 mt-1 text-sm text-text-muted">
            {{ t('transactions.list.subtitle') }}
          </p>
        </div>
      </div>

      <div class="mt-5 mb-5 grid gap-3 lg:grid-cols-[auto_1fr] lg:items-center">
        <div class="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            type="button"
            :class="[
              'shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold transition',
              activeFilter === option.value
                ? 'border-primary bg-primary text-primary-contrast'
                : 'border-border bg-bg text-text-muted hover:border-primary hover:text-text',
            ]"
            @click="activeFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
        <Button
          :label="t('transactions.actions.add')"
          icon="bi bi-plus-lg"
          class="md:hidden! shrink-0"
          @click="openCreateDialog"
        />
        <span class="relative block">
          <InputText
            v-model="searchQuery"
            :placeholder="t('transactions.searchPlaceholder')"
            class="w-full pl-10"
          />
        </span>
      </div>
      <div v-if="transactionGroups.length" class="grid gap-4">
        <TransactionGroupCard
          v-for="group in transactionGroups"
          :key="group.id"
          :group-label="group.label"
          :group-subtitle="group.subtitle"
          :total-amount="group.totalAmount"
          :currency="group.currency"
          :transactions="group.transactions"
          @open="openTransaction"
        />
      </div>
    </section>

    <section
      v-if="!transactionGroups.length"
      class="grid min-h-64 place-items-center rounded-xl border border-dashed border-border bg-surface/60 p-8 text-center"
    >
      <div class="max-w-md">
        <span
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-muted text-xl text-primary"
        >
          <i class="bi bi-receipt" aria-hidden="true" />
        </span>
        <h2 class="mb-0 mt-4 text-xl font-bold text-text">
          {{ t('transactions.empty.title') }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-text-muted">
          {{ t('transactions.empty.description') }}
        </p>
        <Button
          :label="t('transactions.actions.add')"
          icon="bi bi-plus-lg"
          class="mt-4"
          @click="openCreateDialog"
        />
      </div>
    </section>

    <Dialog
      :visible="isCreateOpen"
      :header="t('transactions.form.title')"
      modal
      :dismissable-mask="true"
      :style="{ width: 'min(42rem, 92vw)' }"
      :breakpoints="{ '640px': '92vw' }"
      @update:visible="$event ? (isCreateOpen = true) : closeCreateDialog()"
      @hide="closeCreateDialog"
    >
      <TransactionFormCard
        :amount-label="t('transactions.fields.amount')"
        :amount-placeholder="'0.00'"
        :categories="currentCategories"
        :category-label="t('transactions.fields.category')"
        :currency="'RUB'"
        :date-label="t('transactions.fields.date')"
        :description-label="t('transactions.fields.description')"
        :description-placeholder="t('transactions.form.descriptionPlaceholder')"
        :expense-label="t('common.kind.expense')"
        :form="form"
        :income-label="t('common.kind.income')"
        :save-disabled="!canSave"
        :save-label="t('common.actions.save')"
        class="border-0 bg-transparent p-0 shadow-none"
        @save="handleSave"
        @update:amount="updateAmount"
        @update:category="updateCategory"
        @update:date="updateDate"
        @update:description="updateDescription"
        @update:type="updateType"
      />
    </Dialog>

    <TransactionDetailsDialog v-model:visible="isDetailsOpen" :transaction="selectedTransaction" />
  </div>
</template>
