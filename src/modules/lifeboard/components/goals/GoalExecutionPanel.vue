<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import EmptyState from '../LifeEmptyState.vue';
import LifeDatePicker from '../LifeDatePicker.vue';
import GoalStatusTimeline from './GoalStatusTimeline.vue';
import { computed, reactive, ref, watch } from 'vue';
import { useLifeStore } from '../../stores/useLifeStore';
import { useGoalWorkflowI18n } from '../../goalWorkflowI18n';
import type { GoalMilestone, GoalTask, LifeGoal } from '../../types';

const props = defineProps<{ goal: LifeGoal }>();
const store = useLifeStore();
const { words: w } = useGoalWorkflowI18n();
const milestones = computed(() => store.goalMilestones(props.goal.id));
const tasks = computed(() => store.goalOneTimeTasks(props.goal.id));
const milestoneStats = computed(() => store.milestoneStats(props.goal.id));
const taskStats = computed(() => store.oneTimeTaskStats(props.goal.id));

const editingMilestoneId = ref<string | null>(null);
const editingTaskId = ref<string | null>(null);
const creatingMilestone = ref(false);
const creatingTask = ref(false);
const error = ref('');
const milestoneForm = reactive({ title: '', description: '', dueDate: '' });
const taskForm = reactive({ title: '', description: '', dueDate: '', milestoneId: '' });

watch(() => props.goal.id, () => { creatingMilestone.value = false; creatingTask.value = false; editingMilestoneId.value = null; editingTaskId.value = null; error.value = ''; });

function startMilestone(item?: GoalMilestone) {
  Object.assign(milestoneForm, { title: item?.title ?? '', description: item?.description ?? '', dueDate: item?.dueDate ?? '' });
  editingMilestoneId.value = item?.id ?? null;
  creatingMilestone.value = true;
  creatingTask.value = false;
  error.value = '';
}
function startTask(item?: GoalTask) {
  Object.assign(taskForm, { title: item?.title ?? '', description: item?.description ?? '', dueDate: item?.dueDate ?? '', milestoneId: item?.milestoneId ?? '' });
  editingTaskId.value = item?.id ?? null;
  creatingTask.value = true;
  creatingMilestone.value = false;
  error.value = '';
}
function saveMilestone() {
  const ok = editingMilestoneId.value
    ? store.updateMilestone(editingMilestoneId.value, milestoneForm)
    : !!store.addMilestone(props.goal.id, milestoneForm);
  if (!ok) { error.value = w.value.invalidInput; return; }
  creatingMilestone.value = false;
  editingMilestoneId.value = null;
  error.value = '';
}
function saveTask() {
  const input = { ...taskForm, milestoneId: taskForm.milestoneId || null };
  const ok = editingTaskId.value
    ? store.updateGoalTask(editingTaskId.value, input)
    : !!store.addGoalTask(props.goal.id, input);
  if (!ok) { error.value = w.value.invalidInput; return; }
  creatingTask.value = false;
  editingTaskId.value = null;
  error.value = '';
}
function removeMilestone(id: string) { if (confirm(w.value.deleteMilestoneConfirm)) store.deleteMilestone(id); }
function removeTask(id: string) { if (confirm(w.value.deleteTaskConfirm)) store.deleteGoalTask(id); }
</script>

<template>
  <section class="lb-workflow" :aria-label="w.milestones">
    <GoalStatusTimeline :goal="goal" />

    <div class="lb-workflow-columns">
      <div class="lb-workflow-column">
        <header class="lb-workflow-heading">
          <div><strong>{{ w.milestones }}</strong><small>{{ milestoneStats.completed }} / {{ milestoneStats.total }}</small></div>
          <button type="button" class="lb-text-action" @click="startMilestone()"><i class="bi bi-plus-lg" /> {{ w.addMilestone }}</button>
        </header>
        <div class="lb-workflow-mini-track"><div :style="{width: milestoneStats.percent + '%'}" /></div>
        <EmptyState v-if="!milestones.length && !creatingMilestone" icon="bi-flag" :message="w.noMilestones" />
        <div v-for="milestone in milestones" :key="milestone.id" class="lb-workflow-item">
          <Checkbox binary :model-value="!!milestone.completedAt" :aria-label="milestone.title" @update:model-value="store.toggleMilestone(milestone.id)" />
          <span class="lb-workflow-item-copy">
            <strong :class="{ 'is-done': !!milestone.completedAt }">{{ milestone.title }}</strong>
            <small v-if="milestone.dueDate">{{ milestone.dueDate }}</small>
            <small v-if="milestone.description">{{ milestone.description }}</small>
          </span>
          <button type="button" class="lb-icon-button" :title="w.edit" :aria-label="w.edit" @click="startMilestone(milestone)"><i class="bi bi-pencil" /></button>
          <button type="button" class="lb-icon-button lb-danger-hover" :title="w.remove" :aria-label="w.remove" @click="removeMilestone(milestone.id)"><i class="bi bi-x-lg" /></button>
        </div>
        <form v-if="creatingMilestone" class="lb-workflow-form" @submit.prevent="saveMilestone">
          <label><span class="lb-field-caption">{{ w.title }} <span class="lb-required-mark" aria-hidden="true">*</span></span><InputText v-model="milestoneForm.title" class="lb-input" maxlength="90" required :placeholder="w.milestonePlaceholder" /></label>
          <label><span class="lb-field-caption">{{ w.details }} <small>({{ w.optional }})</small></span><Textarea v-model="milestoneForm.description" class="lb-input" rows="2" maxlength="500" /></label>
          <label><span class="lb-field-caption">{{ w.dueDate }} <small>({{ w.optional }})</small></span><LifeDatePicker v-model="milestoneForm.dueDate" /></label>
          <div class="lb-workflow-form-actions"><button type="button" class="lb-button lb-button-outline" @click="creatingMilestone = false">{{ w.cancel }}</button><button type="submit" class="lb-button lb-button-primary">{{ w.save }}</button></div>
        </form>
      </div>
      <div class="lb-workflow-column">
        <header class="lb-workflow-heading">
          <div><strong>{{ w.tasks }}</strong><small>{{ taskStats.completed }} / {{ taskStats.total }}</small></div>
          <button type="button" class="lb-text-action" @click="startTask()"><i class="bi bi-plus-lg" /> {{ w.addTask }}</button>
        </header>
        <div class="lb-workflow-mini-track"><div :style="{width: taskStats.percent + '%'}" /></div>
        <EmptyState v-if="!tasks.length && !creatingTask" icon="bi-list-check" :message="w.noTasks" />
        <div v-for="task in tasks" :key="task.id" class="lb-workflow-item">
          <Checkbox binary :model-value="!!task.completedAt" :aria-label="task.title" @update:model-value="store.toggleGoalTask(task.id)" />
          <span class="lb-workflow-item-copy">
            <strong :class="{ 'is-done': !!task.completedAt }">{{ task.title }}</strong>
            <small>{{ task.dueDate || w.taskNoDate }} <template v-if="task.milestoneId"> · {{ milestones.find(item => item.id === task.milestoneId)?.title }}</template></small>
          </span>
          <button type="button" class="lb-icon-button" :title="w.edit" :aria-label="w.edit" @click="startTask(task)"><i class="bi bi-pencil" /></button>
          <button type="button" class="lb-icon-button lb-danger-hover" :title="w.remove" :aria-label="w.remove" @click="removeTask(task.id)"><i class="bi bi-x-lg" /></button>
        </div>
        <form v-if="creatingTask" class="lb-workflow-form" @submit.prevent="saveTask">
          <label><span class="lb-field-caption">{{ w.title }} <span class="lb-required-mark" aria-hidden="true">*</span></span><InputText v-model="taskForm.title" class="lb-input" maxlength="90" required :placeholder="w.taskPlaceholder" /></label>
          <label><span class="lb-field-caption">{{ w.details }} <small>({{ w.optional }})</small></span><Textarea v-model="taskForm.description" class="lb-input" rows="2" maxlength="500" /></label>
          <label><span class="lb-field-caption">{{ w.dueDate }} <small>({{ w.optional }})</small></span><LifeDatePicker v-model="taskForm.dueDate" /></label>
          <label><span class="lb-field-caption">{{ w.linkMilestone }}</span>
            <Select v-model="taskForm.milestoneId" :options="[{ label: w.noMilestone, value: '' }, ...milestones.map(item => ({ label: item.title, value: item.id }))]" option-label="label" option-value="value" class="lb-goal-prime-select" />
          </label>
          <div class="lb-workflow-form-actions"><button type="button" class="lb-button lb-button-outline" @click="creatingTask = false">{{ w.cancel }}</button><button type="submit" class="lb-button lb-button-primary">{{ w.save }}</button></div>
        </form>
      </div>
    </div>
    <p v-if="error" class="lb-error" role="alert">{{ error }}</p>
  </section>
</template>
