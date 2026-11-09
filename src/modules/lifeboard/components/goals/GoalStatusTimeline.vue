<script setup lang="ts">
import { computed, ref } from 'vue';
import Popover from 'primevue/popover';
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
const historyPopover = ref<InstanceType<typeof Popover> | null>(null);
const toggleHistory = (event: Event) => historyPopover.value?.toggle(event);
const history = computed(() => store.goalStatusEvents.filter(item => item.goalId === props.goal.id)
  .slice().sort((a, b) => b.changedAt.localeCompare(a.changedAt)));
const formatDate = (iso: string) => new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
</script>

<template>
  <section class="lb-status-timeline" :aria-label="w.status">
    <div class="lb-status-inline">
      <span class="lb-status-title">{{ w.status }}</span>
      <div class="lb-status-steps" role="group" :aria-label="w.status">
        <button v-for="state in states" :key="state.id" type="button" class="lb-status-step"
          :class="[`is-${state.id}`, { 'is-selected': current === state.id }]"
          :aria-pressed="current === state.id" :title="w[state.id]"
          @click="store.setGoalStatus(goal.id, state.id)">
          <span class="lb-status-node"><i :class="['bi', state.icon]" aria-hidden="true" /></span>
          <Tag :severity="state.severity" :value="w[state.id]" rounded />
        </button>
      </div>
      <button v-if="history.length" type="button" class="lb-status-history-trigger"
        :title="w.status" :aria-label="w.status" @click="toggleHistory">
        <i class="bi bi-clock-history" aria-hidden="true" />
        <span class="lb-status-history-count">{{ history.length }}</span>
      </button>
      <Popover ref="historyPopover" class="lb-status-history-popover">
        <ol class="lb-status-history" :aria-label="w.status">
          <li v-for="event in history.slice(0, 8)" :key="event.id">
            <Tag :value="w[event.status]" :severity="states.find(item => item.id === event.status)?.severity" rounded />
            <time :datetime="event.changedAt">{{ formatDate(event.changedAt) }}</time>
          </li>
        </ol>
      </Popover>
    </div>
  </section>
</template>
