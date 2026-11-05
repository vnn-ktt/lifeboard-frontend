<script setup lang="ts">
import { computed } from 'vue';
import type { LifeGoal } from '../../types';
import { useLifeStore } from '../../stores/useLifeStore';
import { useLifeI18n } from '../../i18n';
import { useGoalMetricsI18n } from '../../goalMetricsI18n';
import { formatGoalValue } from '../../utils/goalMetrics';

const props = defineProps<{ goal: LifeGoal; date?: Date }>();
const store = useLifeStore();
const { t } = useLifeI18n();
const { mt, locale } = useGoalMetricsI18n();
const stats = computed(() => store.goalStats(props.goal, props.date));
const current = computed(() => stats.value.outcome);
const primary = computed(() => {
  if (!current.value) return `${stats.value.activity.done} / ${stats.value.activity.target} ${t('allActions')}`;
  if (current.value.kind === 'binary') return current.value.complete ? mt('achieved') : mt('notAchieved');
  return `${formatGoalValue(current.value.current, current.value.unit, locale.value)} / ${formatGoalValue(current.value.target, current.value.unit, locale.value)}`;
});
</script>

<template>
  <div class="lb-goal-progress-label">
    <span>{{ primary }}</span>
    <small v-if="current">{{ mt('activity') }}: {{ stats.activity.done }} / {{ stats.activity.target }}</small>
  </div>
</template>
