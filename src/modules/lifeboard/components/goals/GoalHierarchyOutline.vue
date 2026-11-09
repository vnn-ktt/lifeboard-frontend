<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Tree from 'primevue/tree';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import Button from 'primevue/button';
import type { LifeGoal } from '../../types';
import { useGoalWorkflowI18n } from '../../goalWorkflowI18n';
import { useLifeStore } from '../../stores/useLifeStore';
import { goalStatus } from '../../utils/goalWorkflow';
import { goalsToTree } from '../../utils/goalTree';
import { useLifeI18n } from '../../i18n';

const props = defineProps<{ goals: LifeGoal[] }>();
const emit = defineEmits<{ select: [id: string] }>();
const store = useLifeStore();
const { titleFor, locale } = useLifeI18n();
const { words: w } = useGoalWorkflowI18n();
const nodes = computed(() => goalsToTree(props.goals, titleFor));
const expandedKeys = ref<Record<string, boolean>>(Object.fromEntries(props.goals.map(goal => [goal.id, true])));
const selectedKeys = ref<Record<string, boolean>>({});
watch(() => props.goals.map(g => g.id).join('|'), () => {
  const next = { ...expandedKeys.value };
  props.goals.forEach(goal => { if (!(goal.id in next)) next[goal.id] = true; });
  expandedKeys.value = next;
});
function expandAll() { expandedKeys.value = Object.fromEntries(props.goals.map(goal => [goal.id, true])); }
function collapseAll() { expandedKeys.value = {}; }
function select(id: string) { selectedKeys.value = { [id]: true }; emit('select', id); }
const statuses = { active: 'success', paused: 'warn', completed: 'info', cancelled: 'secondary' } as const;
</script>

<template>
  <section class="lb-panel lb-goal-outline lb-goal-tree" :aria-label="w.hierarchy">
    <div class="lb-goal-outline-toolbar">
      <strong>{{ w.hierarchy }} <small>{{ goals.length }}</small></strong>
      <div class="lb-goal-tree-actions">
        <Button text size="small" severity="secondary" icon="bi bi-arrows-expand" :label="w.expandAll" @click="expandAll" />
        <Button text size="small" severity="secondary" icon="bi bi-arrows-collapse" :label="w.collapseAll" @click="collapseAll" />
      </div>
    </div>
    <Tree v-model:expanded-keys="expandedKeys" v-model:selection-keys="selectedKeys" :value="nodes"
      selection-mode="single" class="lb-goal-tree-widget" :aria-label="w.hierarchy" @node-select="node => select(String(node.key))">
      <template #default="{ node }">
        <div class="lb-goal-tree-node" :class="{ 'is-done': goalStatus(node.data.goal) === 'completed' }">
          <span class="lb-goal-tree-icon" :style="{ '--goal-accent': store.getArea(node.data.goal.areaId).accent }" aria-hidden="true">
            <i :class="['bi', store.getArea(node.data.goal.areaId).icon]" />
          </span>
          <span class="lb-goal-tree-details">
            <strong>{{ node.label }}</strong>
            <small>{{ store.getAreaName(node.data.goal.areaId, locale) }} · {{ store.milestoneStats(node.key).completed }}/{{ store.milestoneStats(node.key).total }} {{ w.milestoneCount }}</small>
          </span>
          <span class="lb-goal-tree-trailing">
            <Tag :severity="statuses[goalStatus(node.data.goal)]" :value="w[goalStatus(node.data.goal)]" rounded class="lb-goal-tree-tag" />
            <span class="lb-goal-tree-progress"><b>{{ store.goalStats(node.data.goal).percent }}%</b><ProgressBar :value="store.goalStats(node.data.goal).percent" :show-value="false" /></span>
          </span>
        </div>
      </template>
      <template #empty><p class="lb-muted">{{ w.hierarchy }}</p></template>
    </Tree>
  </section>
</template>
