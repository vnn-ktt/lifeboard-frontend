<script setup lang="ts">
import { computed } from 'vue';
import { useLifeStore } from '../stores/useLifeStore';
import type { LifeRoutine } from '../types';

const props = defineProps<{ task: LifeRoutine; date: Date }>();
const store = useLifeStore();
const goal = computed(() => store.goals.find((item) => item.id === props.task.goalId));
const area = computed(() => store.getArea(goal.value?.areaId ?? 'other'));
const done = computed(() => store.isDone(props.task.id, props.date));
</script>

<template>
  <label class="lb-task" :class="{ 'is-complete': done }">
    <input type="checkbox" :checked="done" :aria-label="task.title" @change="store.setDone(task.id, date, !done)" />
    <span class="lb-task-checkbox"><i class="bi bi-check-lg" aria-hidden="true" /></span>
    <span class="lb-task-time">{{ task.time }}</span>
    <span class="lb-task-info"><strong>{{ task.title }}</strong><small>{{ task.description }}</small></span>
    <span class="lb-task-category" :style="{ color: area.accent, background: area.subtle }"><i :class="['bi', area.icon]" aria-hidden="true" />{{ area.name }}</span>
  </label>
</template>
