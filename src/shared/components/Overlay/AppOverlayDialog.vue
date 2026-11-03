<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch, toRef } from 'vue';
import { useBodyScrollLock } from '@/shared/composables/useBodyScrollLock';

const props = withDefaults(defineProps<{
  open: boolean;
  title: string;
  labelledBy?: string;
  panelClass?: string;
}>(), { labelledBy: 'lb-overlay-title' });
const emit = defineEmits<{ close: [] }>();
useBodyScrollLock(toRef(props, 'open'));
const root = ref<HTMLElement | null>(null);
let previousFocus: HTMLElement | null = null;
function close() { emit('close'); }
function onKeydown(event: KeyboardEvent) {
  if (!props.open) return;
  if (event.key === 'Escape') { event.preventDefault(); close(); }
  if (event.key !== 'Tab' || !root.value) return;
  const candidates = [...root.value.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
  if (!candidates.length) { event.preventDefault(); root.value.focus(); return; }
  const first = candidates[0], last = candidates[candidates.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
watch(() => props.open, async open => {
  if (open) {
    previousFocus = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', onKeydown);
    await nextTick();
    root.value?.querySelector<HTMLElement>('button:not([disabled])')?.focus();
  } else {
    document.removeEventListener('keydown', onKeydown);
    previousFocus?.focus();
  }
}, { immediate: true });
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition name="lb-overlay-transition">
      <div v-if="open" class="lb-overlay-backdrop" @pointerdown.self="close">
        <section ref="root" role="dialog" aria-modal="true" :aria-labelledby="labelledBy" class="lb-overlay-panel" :class="panelClass" tabindex="-1">
          <header class="lb-overlay-head">
            <h2 :id="labelledBy">{{ title }}</h2>
            <button type="button" class="lb-overlay-close" aria-label="Закрыть" @click="close"><i class="bi bi-x-lg" /></button>
          </header>
          <div class="lb-overlay-content"><slot /></div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
