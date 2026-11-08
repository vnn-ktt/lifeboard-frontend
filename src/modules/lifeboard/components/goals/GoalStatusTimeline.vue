<script setup lang="ts">
import { computed } from 'vue';
import Tag from 'primevue/tag';
import { useLifeStore } from '../../stores/useLifeStore';
import { useGoalWorkflowI18n } from '../../goalWorkflowI18n';
import { goalStatus } from '../../utils/goalWorkflow';
import type { GoalStatus, LifeGoal } from '../../types';

const props = defineProps<{ goal: LifeGoal }>();
const store = useLifeStore();
const { words: w } = useGoalWorkflowI18n();
const states: Array<{ id: GoalStatus; icon: string; severity: 'success' | 'warn' | 'info' | 'danger' }> = [
  { id: 'active', icon: 'bi-play-circle', severity: 'info' },
  { id: 'paused', icon: 'bi-pause-circle', severity: 'warn' },
  { id: 'completed', icon: 'bi-check-circle', severity: 'success' },
  { id: 'cancelled', icon: 'bi-x-circle', severity: 'danger' },
];
const current = computed(() => goalStatus(props.goal));
const history = computed(() => store.goalStatusEvents.filter(item => item.goalId === props.goal.id)
  .slice().sort((a, b) => b.changedAt.localeCompare(a.changedAt)));
const formatDate = (iso: string) => new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
</script>

<template>
  <section class="lb-status-timeline" :aria-label="w.status">
    <header class="lb-status-heading">
      <span class="lb-status-title">{{ w.status }}</span>
      <Tag :severity="states.find(item => item.id === current)?.severity" :value="w[current]" rounded />
    </header>
    <div class="lb-status-steps" role="group" :aria-label="w.status">
      <button v-for="(state, index) in states" :key="state.id" type="button" class="lb-status-step"
        :class="[`is-${state.id}`, { 'is-selected': current === state.id }]" :aria-pressed="current === state.id"
        @click="store.setGoalStatus(goal.id, state.id)">
        <span class="lb-status-node"><i :class="['bi', state.icon]" aria-hidden="true" /></span>
        <Tag :severity="state.severity" :value="w[state.id]" rounded />
        <span v-if="index < states.length - 1" class="lb-status-connector" aria-hidden="true" />
      </button>
    </div>
    <small class="lb-status-note">{{ w.completedNote }}</small>
    <ol v-if="history.length" class="lb-status-history" :aria-label="w.status">
      <li v-for="event in history.slice(0, 5)" :key="event.id">
        <span class="lb-status-history-dot" :class="`is-${event.status}`" />
        <Tag :value="w[event.status]" :severity="states.find(item => item.id === event.status)?.severity" rounded />
        <time :datetime="event.changedAt">{{ formatDate(event.changedAt) }}</time>
      </li>
    </ol>
  </section>
</template>
