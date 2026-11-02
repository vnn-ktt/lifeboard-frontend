<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ColorPicker from 'primevue/colorpicker';
import Select from 'primevue/select';
import Button from 'primevue/button';
import type { CategoryTemplate, CategoryKind } from '@/shared/types';

interface Props {
  visible: boolean;
  category?: CategoryTemplate | null;
}

const props = withDefaults(defineProps<Props>(), {
  category: null,
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  save: [category: Partial<CategoryTemplate>];
}>();

const { t } = useI18n();

const iconOptions = computed(() => [
  { label: t('category.icons.cash'), value: 'bi bi-cash-stack' },
  { label: t('category.icons.laptop'), value: 'bi bi-laptop' },
  { label: t('category.icons.cart'), value: 'bi bi-cart' },
  { label: t('category.icons.car'), value: 'bi bi-car-front' },
  { label: t('category.icons.coffee'), value: 'bi bi-cup-hot' },
  { label: t('category.icons.lightning'), value: 'bi bi-lightning' },
  { label: t('category.icons.film'), value: 'bi bi-film' },
  { label: t('category.icons.bag'), value: 'bi bi-bag' },
  { label: t('category.icons.heart'), value: 'bi bi-heart-pulse' },
  { label: t('category.icons.house'), value: 'bi bi-house' },
  { label: t('category.icons.gift'), value: 'bi bi-gift' },
  { label: t('category.icons.book'), value: 'bi bi-book' },
  { label: t('category.icons.basket'), value: 'bi bi-basket' },
  { label: t('category.icons.bus'), value: 'bi bi-bus-front' },
  { label: t('category.icons.briefcase'), value: 'bi bi-briefcase' },
]);

const kindOptions = computed(() => [
  { label: t('common.kind.expense'), value: 'expense' },
  { label: t('common.kind.income'), value: 'income' },
]);

const form = ref<{
  name: string;
  color: string;
  icon: string;
  kind: CategoryKind;
}>({
  name: '',
  color: '#6366f1',
  icon: 'bi bi-tag',
  kind: 'expense',
});

const isEditing = ref(false);

function onShow() {
  if (props.category) {
    isEditing.value = true;
    form.value = {
      name: props.category.name,
      color: props.category.color,
      icon: props.category.icon,
      kind: props.category.kind,
    };
  } else {
    isEditing.value = false;
    form.value = {
      name: '',
      color: '#6366f1',
      icon: 'bi bi-tag',
      kind: 'expense',
    };
  }
}

function onHide() {
  emit('update:visible', false);
}

function onSubmit() {
  if (!form.value.name.trim()) return;
  emit('save', { ...form.value });
  onHide();
}
</script>

<template>
  <Dialog
    :visible="props.visible"
    :header="isEditing ? t('category.edit') : t('category.add')"
    :modal="true"
    :closable="true"
    :dismissable-mask="true"
    :style="{ width: 'min(32rem, 92vw)' }"
    :breakpoints="{ '640px': '92vw' }"
    @update:visible="emit('update:visible', $event)"
    @show="onShow"
    @hide="onHide"
  >
    <div class="flex flex-col gap-4 py-2">
      <!-- Name -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {{ t('category.fields.name') }}
        </label>
        <InputText
          v-model="form.name"
          :placeholder="t('category.namePlaceholder')"
          class="w-full"
          autofocus
        />
      </div>

      <!-- Color -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {{ t('category.fields.color') }}
        </label>
        <div class="flex items-center gap-3">
          <ColorPicker v-model="form.color" />
          <span
            class="h-8 w-8 rounded-full border border-border"
            :style="{ backgroundColor: form.color }"
          />
          <span class="text-xs text-text-muted font-mono">{{ form.color }}</span>
        </div>
      </div>

      <!-- Icon -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {{ t('category.fields.icon') }}
        </label>
        <Select
          v-model="form.icon"
          :options="iconOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        >
          <template #value="{ value }">
            <div class="flex items-center gap-2">
              <i :class="value" />
              <span class="text-sm">{{ iconOptions.find((o) => o.value === value)?.label }}</span>
            </div>
          </template>
          <template #option="{ option }">
            <div class="flex items-center gap-2">
              <i :class="option.value" />
              <span>{{ option.label }}</span>
            </div>
          </template>
        </Select>
      </div>

      <!-- Kind -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {{ t('category.fields.type') }}
        </label>
        <Select
          v-model="form.kind"
          :options="kindOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        >
          <template #value="{ value }">
            <span
              class="text-sm font-medium"
              :class="value === 'income' ? 'text-emerald-500' : 'text-red-500'"
            >
              {{ value === 'income' ? t('common.kind.income') : t('common.kind.expense') }}
            </span>
          </template>
        </Select>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <Button :label="t('common.actions.cancel')" severity="secondary" text @click="onHide" />
        <Button
          :label="t('common.actions.save')"
          severity="primary"
          :disabled="!form.name.trim()"
          @click="onSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>
