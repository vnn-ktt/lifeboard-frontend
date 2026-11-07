<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { LifeGoal } from '../../types';
import { useGoalWorkflowI18n } from '../../goalWorkflowI18n';
import { useLifeStore } from '../../stores/useLifeStore';
import { goalOutline, goalStatus } from '../../utils/goalWorkflow';
import { useLifeI18n } from '../../i18n';

const props = defineProps<{ goals: LifeGoal[] }>();
const emit = defineEmits<{ select: [id: string] }>();
const store = useLifeStore();
const { titleFor } = useLifeI18n();
const { words: w } = useGoalWorkflowI18n();
const expanded = ref<Set<string>>(new Set(props.goals.map(g => g.id)));
watch(() => props.goals.map(g => g.id).join('|'), () => {
  // Newly created goals are visible immediately without reopening the outline.
  const next = new Set(expanded.value);
  props.goals.forEach(goal => next.add(goal.id));
  expanded.value = next;
});
const rows = computed(() => goalOutline(props.goals, expanded.value));
function toggle(id: string) {
  const next = new Set(expanded.value);
  if (next.has(id)) next.delete(id); else next.add(id);
  expanded.value = next;
}
function expandAll() { expanded.value = new Set(props.goals.map(goal => goal.id)); }
function collapseAll() { expanded.value = new Set(); }
</script>

<template>
  <section class="lb-panel lb-goal-outline" :aria-label="w.hierarchy">
    <div class="lb-goal-outline-toolbar">
      <strong>{{ w.hierarchy }} <small>{{ goals.length }}</small></strong>
      <div><button class="lb-text-action" @click="expandAll">{{ w.expandAll }}</button><button class="lb-text-action" @click="collapseAll">{{ w.collapseAll }}</button></div>
    </div>
    <div class="lb-goal-outline-list" role="tree">
      <div v-for="row in rows" :key="row.goal.id" class="lb-goal-outline-row" role="treeitem" :aria-level="row.depth + 1" :style="{ paddingInlineStart: `${12 + Math.min(row.depth, 6) * 22}px` }">
        <button v-if="row.children" type="button" class="lb-outline-toggle" :aria-expanded="expanded.has(row.goal.id)" :aria-label="titleFor(row.goal)" @click="toggle(row.goal.id)"><i :class="['bi', expanded.has(row.goal.id) ? 'bi-chevron-down' : 'bi-chevron-right']" /></button>
        <span v-else class="lb-outline-spacer" />
        <button type="button" class="lb-goal-outline-goal" @click="emit('select', row.goal.id)">
          <span class="lb-outline-title">{{ titleFor(row.goal) }}</span>
          <span class="lb-outline-meta">{{ w[goalStatus(row.goal)] }} · {{ store.milestoneStats(row.goal.id).completed }}/{{ store.milestoneStats(row.goal.id).total }} {{ w.milestoneCount }}</span>
        </button>
        <span class="lb-outline-progress">{{ store.goalStats(row.goal).percent }}%</span>
      </div>
    </div>
  </section>
</template>
