<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Select from 'primevue/select';
import FocusManager from '../components/FocusManager.vue';
import GoalCreator from '../components/goals/GoalCreator.vue';
import GoalMetricPanel from '../components/goals/GoalMetricPanel.vue';
import GoalProgressLabel from '../components/goals/GoalProgressLabel.vue';
import { useLifeStore } from '../stores/useLifeStore';
import { useLifeI18n } from '../i18n';
import GoalPyramid from '../components/GoalPyramid.vue';
import GoalHierarchyOutline from '../components/goals/GoalHierarchyOutline.vue';
import GoalExecutionPanel from '../components/goals/GoalExecutionPanel.vue';
import { useGoalWorkflowI18n } from '../goalWorkflowI18n';
import type { Horizon, LifeGoal } from '../types';

const store = useLifeStore();
const route = useRoute();
const { words: workflowText } = useGoalWorkflowI18n();
const hierarchyView = ref<'garden' | 'outline'>('garden');
const { t, locale, titleFor, descriptionFor } = useLifeI18n();
const showCategories = ref(false);
const newCategory = reactive({ name: '', accent: '#659b7c' });
const categoryMessage = ref('');
const selectedGoalId = ref<string|null>(null);
const categoryOptions = computed(() => store.categories);
const editParentOptions = (goalId: string) => [
  { label: t('unlinked'), value: null },
  ...store.goals.filter(g => g.id !== goalId && store.canSetParent(goalId, g.id)).map(g => ({ label: titleFor(g), value: g.id })),
];
function createCategory() {
  categoryMessage.value = store.addCategory(newCategory.name, newCategory.accent) ? '' : 'Check category name (2–35 chars, unique).';
  if (!categoryMessage.value) newCategory.name = '';
}
function removeCategory(id: string) {
  categoryMessage.value = store.deleteCategory(id) ? '' : 'Category is used by a goal or is built-in.';
}
function setParent(goalId:string, value:string | null) {
  if (!store.setGoalParent(goalId, value || null)) goalError.value = 'Cannot create a circular goal relationship.';
}
function selectGoal(id: string) { selectedGoalId.value = id; }
function scrollToHash() {
  const goalId = typeof route.hash === 'string' && route.hash.startsWith('#goal-') ? route.hash.slice(6) : '';
  if (goalId && store.goals.some(item => item.id === goalId)) void nextTick(() => scrollToGoal(goalId));
}
onMounted(scrollToHash);
watch(() => route.hash, scrollToHash);
function onGardenCreate(horizon: Horizon, parentId: string | null) { void openCreateForm(horizon, parentId); }
function scrollToGoal(id:string) {
  selectedGoalId.value=id;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  document.getElementById(`goal-${id}`)?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'center'});
}

const showForm = ref(false);
const creatorHorizon = ref<Horizon>('month');
const creatorParentId = ref<string | null>(null);
const editingGoal = ref<LifeGoal | null>(null);
const createdNotice = ref('');
async function openCreateForm(horizon?: Horizon, parentId?: string | null) {
  creatorHorizon.value = horizon ?? 'month';
  creatorParentId.value = parentId ?? null;
  editingGoal.value = null;
  showForm.value = true;
  createdNotice.value = '';
  await nextTick();
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  document.getElementById('lb-goal-creator')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}
function toggleNewGoal() { void openCreateForm(); }
function onGoalSaved(id: string) {
  showForm.value = false;
  selectedGoalId.value = id;
  createdNotice.value = editingGoal.value ? t('saved') : t('goalCreated');
  editingGoal.value = null;
}
function editGoal(goal: LifeGoal) {
  editingGoal.value = goal;
  creatorHorizon.value = goal.horizon;
  creatorParentId.value = goal.parentId ?? null;
  showForm.value = true;
  createdNotice.value = '';
  nextTick(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    document.getElementById('lb-goal-creator')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
}
const addingRoutineFor = ref<string | null>(null);
const editVision = ref(false);
const visionDraft = ref(store.vision);
const goalError = ref('');
const routineError = ref('');
const routineForm = reactive({ title: '', description: '', time: '18:00', durationMinutes: 20, days: [1, 2, 3, 4, 5] as number[] });
const labels = computed<Record<Horizon,string>>(() => ({ month:t('horizonMonth'),quarter:t('horizonQuarter'),year:t('horizonYear'),'five-years':t('horizonFive') }));
const activeGoals = computed(() => [...store.goals].sort((a, b) => (a.horizon === 'month' ? -1 : 1) - (b.horizon === 'month' ? -1 : 1)));
const dayNames = computed(() => Array.from({length:7},(_,index)=>new Intl.DateTimeFormat(locale.value,{weekday:'short'}).format(new Date(2026,10,2+index))));
function saveRoutine(goalId: string) {
  if (!routineForm.title.trim() || !routineForm.days.length || routineForm.durationMinutes < 1 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(routineForm.time)) { routineError.value = t('invalidRoutine'); return; }
  store.addRoutine({ goalId, title: routineForm.title.trim(), description: routineForm.description.trim(), time: routineForm.time, durationMinutes: Number(routineForm.durationMinutes), days: [...routineForm.days] });
  Object.assign(routineForm, { title: '', description: '', time: '18:00', durationMinutes: 20, days: [1,2,3,4,5] });
  addingRoutineFor.value = null;
  routineError.value = '';
}
function toggleDay(day: number) {
  if (routineForm.days.includes(day)) routineForm.days = routineForm.days.filter((item) => item !== day);
  else routineForm.days = [...routineForm.days, day].sort();
}
function removeGoal(id: string, title: string) {
  if (confirm(`${t('deleteGoalConfirm')} ${title}`)) store.deleteGoal(id);
}
function removeRoutine(id: string) {
  if (confirm(t('deleteRoutineConfirm'))) store.deleteRoutine(id);
}
function saveVision() { store.setVision(visionDraft.value); editVision.value = false; }
function closeGoalForm() { showForm.value = false; editingGoal.value = null; }
</script>

<template>
  <div class="lb-screen"><div class="lb-page-top"><div><p class="lb-overline">{{ t('priorities') }}</p><h1>{{ t('goalTitle') }}</h1><p class="lb-muted">{{ t('goalSubtitle') }}</p></div><button class="lb-button lb-button-primary" @click="toggleNewGoal"><i class="bi bi-plus-lg" /> {{ t('newGoal') }}</button></div>
    <section class="lb-vision-full"><span class="lb-vision-icon"><i class="bi bi-compass" /></span><div><p class="lb-overline">{{ t('fiveYear') }}</p><h2>{{ t('visionQuestion') }}</h2><p v-if="!editVision">{{ store.vision || t('defaultVision') }}</p><textarea v-else v-model="visionDraft" class="lb-input lb-textarea" rows="3" maxlength="600" :placeholder="t('whyPlaceholder')" /></div><button v-if="!editVision" class="lb-icon-button" title="Изменить видение" aria-label="Изменить видение" @click="visionDraft = store.vision; editVision = true"><i class="bi bi-pencil" /></button><button v-else class="lb-button lb-button-primary" @click="saveVision">{{ t('save') }}</button></section>
    <div class="lb-workflow-switch" role="group" :aria-label="workflowText.hierarchy">
      <button type="button" :class="{ 'is-active': hierarchyView === 'garden' }" :aria-pressed="hierarchyView === 'garden'" @click="hierarchyView = 'garden'">{{ workflowText.garden }}</button>
      <button type="button" :class="{ 'is-active': hierarchyView === 'outline' }" :aria-pressed="hierarchyView === 'outline'" @click="hierarchyView = 'outline'">{{ workflowText.outline }}</button>
    </div>
    <GoalPyramid v-if="hierarchyView === 'garden'" :goals="store.goals" @select="selectGoal" @navigate="scrollToGoal" @create="onGardenCreate" />
    <GoalHierarchyOutline v-else :goals="store.goals" @select="scrollToGoal" />
    <section class="lb-panel lb-categories">
      <div class="lb-panel-heading"><div><p class="lb-overline">{{ t('categoryManage') }}</p><h3>{{ t('categoryManage') }} · {{ categoryOptions.length }}</h3></div><button type="button" class="lb-button lb-button-outline" @click="showCategories=!showCategories"><i class="bi bi-plus-lg" /> {{ t('addCategory') }}</button></div>
      <div class="lb-category-chips">
        <span v-for="area in categoryOptions" :key="area.id" class="lb-category-chip"><i :class="['bi',area.icon]" :style="{color:area.accent}" />{{ store.getAreaName(area.id,locale) }}
          <button v-if="!['dogs','career','leadership','health','finance','relationships','learning','other'].includes(area.id)" type="button" :aria-label="t('deleteCategory')" @click="removeCategory(area.id)"><i class="bi bi-x" /></button>
        </span>
      </div>
      <form v-if="showCategories" class="lb-category-form" @submit.prevent="createCategory">
        <label class="lb-category-required-field">
          <span>{{ t('categoryName') }} <span class="lb-required-mark" aria-hidden="true">*</span></span>
          <input v-model="newCategory.name" maxlength="35" class="lb-input" :placeholder="t('categoryName')" required />
        </label>
        <input v-model="newCategory.accent" type="color" :aria-label="t('category')" />
        <button class="lb-button lb-button-primary" type="submit">{{ t('createCategory') }}</button>
      </form>
      <p v-if="categoryMessage" class="lb-error">{{ categoryMessage }}</p>
    </section>
    <GoalCreator v-if="showForm" :horizon="creatorHorizon" :parent-id="creatorParentId" :goal="editingGoal" @saved="onGoalSaved" @close="closeGoalForm" />
    <p v-if="createdNotice" class="lb-goal-created-notice" role="status"><i class="bi bi-check2-circle" /> {{ createdNotice }}</p>
    <div class="lb-section-intro"><div><p class="lb-overline">{{ t('priorities') }}</p><h2>{{ t('routines') }} <span class="lb-muted lb-count">{{ store.goals.length }}</span></h2></div><FocusManager /></div>
    <p v-if="goalError" class="lb-error" role="alert">{{ goalError }}</p>
    <div class="lb-goal-list"><article v-for="goal in activeGoals" :key="goal.id" :id="`goal-${goal.id}`" class="lb-panel lb-goal-detail" :class="{ 'is-linked-selected': selectedGoalId===goal.id }"><div class="lb-goal-detail-head"><span class="lb-area-icon" :style="{ color: store.getArea(goal.areaId).accent, background: store.getArea(goal.areaId).subtle }"><i :class="['bi', store.getArea(goal.areaId).icon]" /></span><div class="lb-goal-detail-title"><span class="lb-goal-area">{{ store.getAreaName(goal.areaId,locale) }} · {{ labels[goal.horizon] }}</span><h3>{{ titleFor(goal) }}</h3><p>{{ descriptionFor(goal) }}</p></div><div class="lb-goal-detail-progress"><strong>{{ store.goalStats(goal).percent }}%</strong><GoalProgressLabel :goal="goal" /></div><div class="lb-goal-detail-actions"><button class="lb-icon-button" :aria-label="`Изменить цель ${goal.title}`" title="Изменить цель" @click="editGoal(goal)"><i class="bi bi-pencil-square" /></button><button class="lb-icon-button lb-danger-hover" :aria-label="`Удалить цель ${goal.title}`" title="Удалить цель" @click="removeGoal(goal.id, goal.title)"><i class="bi bi-trash3" /></button></div></div><div class="lb-progress-track"><div :style="{ width: `${store.goalStats(goal).percent}%`, background: store.getArea(goal.areaId).accent }" /></div>
      <GoalExecutionPanel :goal="goal" />
      <GoalMetricPanel v-if="goal.measurement?.kind === 'numeric' || goal.measurement?.kind === 'binary' || goal.startDate || goal.dueDate" :goal="goal" />
      <div class="lb-goal-link-edit"><i class="bi bi-diagram-3" aria-hidden="true" /><label>{{ t('parent') }} <Select :model-value="goal.parentId ?? null" :options="editParentOptions(goal.id)" option-label="label" option-value="value" filter class="lb-goal-prime-select" @update:model-value="setParent(goal.id, $event)" /></label></div><div class="lb-routine-title"><strong>{{ t('routines') }}</strong><button class="lb-text-action" @click="addingRoutineFor = addingRoutineFor === goal.id ? null : goal.id">{{ t('addAction') }}</button></div>
      <div class="lb-routine-list"><div v-for="routine in store.routines.filter(r => r.goalId === goal.id)" :key="routine.id" class="lb-routine-row"><i class="bi bi-repeat" /><span><strong>{{ routine.title }}</strong><small>{{ routine.time }} · {{ routine.days.map(d => dayNames[d - 1]).join(', ') }} · {{ routine.durationMinutes }} мин</small></span><button class="lb-icon-button lb-danger-hover" :aria-label="`Удалить ${routine.title}`" title="Удалить действие" @click="removeRoutine(routine.id)"><i class="bi bi-x-lg" /></button></div><p v-if="!store.routines.some(r => r.goalId === goal.id)" class="lb-muted">{{ t('goalEmpty') }}</p></div>
      <form v-if="addingRoutineFor === goal.id" class="lb-routine-form" @submit.prevent="saveRoutine(goal.id)"><div class="lb-form-grid"><label>{{ t('goalName') }} <span class="lb-required-mark" aria-hidden="true">*</span><input v-model="routineForm.title" class="lb-input" maxlength="90" required :placeholder="t('actionPlaceholder')" /></label><label>{{ t('actionTime') }} <span class="lb-required-mark" aria-hidden="true">*</span><input v-model="routineForm.time" class="lb-input" type="time" required /></label><label>{{ t('duration') }} <span class="lb-required-mark" aria-hidden="true">*</span><input v-model.number="routineForm.durationMinutes" class="lb-input" type="number" min="1" max="480" required /></label><label>{{ t('description') }}<input v-model="routineForm.description" class="lb-input" maxlength="200" placeholder="Короткое пояснение" /></label></div><p class="lb-routine-required-title">{{ t('daySelection') }} <span class="lb-required-mark" aria-hidden="true">*</span></p><div class="lb-day-checks"><button v-for="(day, index) in dayNames" :key="day" type="button" :class="{ 'is-active': routineForm.days.includes(index + 1) }" @click="toggleDay(index + 1)">{{ day }}</button></div><p v-if="routineError" class="lb-error">{{ routineError }}</p><button class="lb-button lb-button-primary" type="submit">{{ t('saveAction') }}</button></form>
      </article><div v-if="!store.goals.length" class="lb-panel lb-empty">Целей пока нет. Начни с одного важного направления.</div></div>
  </div>
</template>
