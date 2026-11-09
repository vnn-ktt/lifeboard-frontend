<script setup lang="ts" generic="T">
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import Button from 'primevue/button';
import type { AsyncState } from '@/shared/types/asyncState';

const props = defineProps<{ state: AsyncState<T>; loadingLabel?: string; idleLabel?: string }>();
const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <div v-if="props.state.status === 'idle'" class="lb-async-state" role="status">
    <slot name="idle">{{ idleLabel || 'Ничего не загружено' }}</slot>
  </div>
  <div v-else-if="props.state.status === 'loading'" class="lb-async-state" role="status" aria-busy="true">
    <slot name="loading"><Skeleton width="100%" height="2.5rem" />{{ loadingLabel || 'Загрузка…' }}</slot>
  </div>
  <div v-else-if="props.state.status === 'error'" class="lb-async-state" role="alert">
    <slot name="error" :error="props.state.error">
      <Message severity="error">{{ props.state.error }}</Message>
      <Button size="small" severity="secondary" outlined label="Повторить" @click="emit('retry')" />
    </slot>
  </div>
  <slot v-else-if="props.state.status === 'success'" :data="props.state.data" />
</template>
