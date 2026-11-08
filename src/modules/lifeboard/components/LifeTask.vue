<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import { computed } from 'vue';
import { useLifeStore } from '../stores/useLifeStore';
import type { LifeRoutine } from '../types';
import { useLifeI18n } from '../i18n';

const props = defineProps<{ task: LifeRoutine; date: Date }>();
const store = useLifeStore();
const {locale,titleFor,descriptionFor}=useLifeI18n();
const goal = computed(() => store.goals.find((item) => item.id === props.task.goalId));
const area = computed(() => store.getArea(goal.value?.areaId ?? 'other'));
const done = computed(() => store.isDone(props.task.id, props.date));
</script>

<template>
  <label class="lb-task" :class="{ 'is-complete': done }">
    <Checkbox binary :model-value="done" :aria-label="titleFor(task)" @update:model-value="store.setDone(task.id, date, !!$event)" />
    <span class="lb-task-time">{{ task.time }}</span>
    <span class="lb-task-info"><strong>{{ titleFor(task) }}</strong><small>{{ descriptionFor(task) }}</small></span>
    <span class="lb-task-category" :style="{ color: area.accent, background: area.subtle }"><i :class="['bi', area.icon]" aria-hidden="true" />{{ store.getAreaName(area.id,locale) }}</span>
  </label>
</template>
