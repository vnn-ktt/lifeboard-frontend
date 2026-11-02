<script lang="ts" setup>
import Button from 'primevue/button';
import Message from 'primevue/message';
import type { RouteLocationRaw } from 'vue-router';

interface Props {
  title: string;
  subtitle: string;
  submitLabel: string;
  switchLabel: string;
  switchText: string;
  switchTo: RouteLocationRaw;
  errorMessage?: string;
  successMessage?: string;
  isLoading?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  submit: [];
}>();
</script>

<template>
  <form
    class="rounded-lg border border-border p-5 shadow-sm sm:p-6"
    novalidate
    @submit.prevent="emit('submit')"
  >
    <div>
      <p class="m-0 text-2xl font-bold leading-tight">
        {{ title }}
      </p>
      <p class="m-0 mt-2 text-sm leading-6 text-text-muted">
        {{ subtitle }}
      </p>
    </div>

    <Message v-if="errorMessage" class="mt-5" severity="error" size="small">
      {{ errorMessage }}
    </Message>

    <Message v-if="successMessage" class="mt-5" severity="success" size="small">
      {{ successMessage }}
    </Message>

    <div class="mt-6 grid gap-5">
      <slot />
    </div>

    <Button class="mt-6 w-full" type="submit" :label="submitLabel" :loading="isLoading" />

    <p class="m-0 mt-5 text-center text-sm text-text-muted">
      {{ switchText }}
      <RouterLink
        class="font-bold text-emerald-700 no-underline hover:text-emerald-800"
        :to="switchTo"
      >
        {{ switchLabel }}
      </RouterLink>
    </p>
  </form>
</template>
