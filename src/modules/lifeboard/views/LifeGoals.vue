<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { lifeAreas, useLifeStore } from '../stores/useLifeStore';
import type { Horizon, LifeAreaId } from '../types';

const store = useLifeStore();
const showForm = ref(false);
const addingRoutineFor = ref<string | null>(null);
const editVision = ref(false);
const visionDraft = ref(store.vision);
const goalError = ref('');
const routineError = ref('');
const goalForm = reactive({ title: '', description: '', areaId: 'other' as LifeAreaId, horizon: 'month' as Horizon, target: 12 });
const routineForm = reactive({ title: '', description: '', time: '18:00', durationMinutes: 20, days: [1, 2, 3, 4, 5] as number[] });
const labels: Record<Horizon, string> = { month: 'Месяц', quarter: 'Квартал', year: 'Год', 'five-years': '5 лет' };
const activeGoals = computed(() => [...store.goals].sort((a, b) => (a.horizon === 'month' ? -1 : 1) - (b.horizon === 'month' ? -1 : 1)));
const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
function saveGoal() {
  if (!goalForm.title.trim() || goalForm.title.length > 90 || goalForm.target < 1 || !Number.isInteger(goalForm.target)) { goalError.value = 'Добавь название и положительную цель в действиях.'; return; }
  store.addGoal({ ...goalForm });
  Object.assign(goalForm, { title: '', description: '', areaId: 'other', horizon: 'month', target: 12 });
  goalError.value = '';
  showForm.value = false;
}
function saveRoutine(goalId: string) {
  if (!routineForm.title.trim() || !routineForm.days.length || routineForm.durationMinutes < 1 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(routineForm.time)) { routineError.value = 'Укажи название, корректное время, длительность и дни недели.'; return; }
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
  if (confirm(`Удалить цель «${title}» вместе с действиями и отметками?`)) store.deleteGoal(id);
}
function removeRoutine(id: string) {
  if (confirm('Удалить это повторяющееся действие?')) store.deleteRoutine(id);
}
function saveVision() { store.setVision(visionDraft.value); editVision.value = false; }
</script>

<template>
  <div class="lb-screen"><div class="lb-page-top"><div><p class="lb-overline">ОТ МЕЧТЫ К ДЕЙСТВИЮ</p><h1>Мои цели</h1><p class="lb-muted">Большое направление → цель на месяц → конкретные действия.</p></div><button class="lb-button lb-button-primary" @click="showForm = !showForm"><i class="bi bi-plus-lg" /> Новая цель</button></div>
    <section class="lb-vision-full"><span class="lb-vision-icon"><i class="bi bi-compass" /></span><div><p class="lb-overline">БОЛЬШОЙ ОРИЕНТИР · 5 ЛЕТ</p><h2>Ради какой жизни ты всё это делаешь?</h2><p v-if="!editVision">{{ store.vision || 'Опиши своё представление о свободной и интересной жизни.' }}</p><textarea v-else v-model="visionDraft" class="lb-input lb-textarea" rows="3" maxlength="600" placeholder="Каким ты хочешь видеть свой обычный день через 5 лет?" /></div><button v-if="!editVision" class="lb-icon-button" title="Изменить видение" aria-label="Изменить видение" @click="visionDraft = store.vision; editVision = true"><i class="bi bi-pencil" /></button><button v-else class="lb-button lb-button-primary" @click="saveVision">Сохранить</button></section>
    <form v-if="showForm" class="lb-panel lb-goal-form" @submit.prevent="saveGoal"><div class="lb-panel-heading"><h3>Новая цель</h3><button type="button" class="lb-icon-button" @click="showForm = false"><i class="bi bi-x-lg" /></button></div><div class="lb-form-grid"><label>Название<input v-model="goalForm.title" class="lb-input" maxlength="90" placeholder="Например, свободно говорить по-английски" required /></label><label>Сфера<select v-model="goalForm.areaId" class="lb-input"><option v-for="area in lifeAreas" :key="area.id" :value="area.id">{{ area.name }}</option></select></label><label>Горизонт<select v-model="goalForm.horizon" class="lb-input"><option v-for="(label, value) in labels" :key="value" :value="value">{{ label }}</option></select></label><label>Цель: действий за период<input v-model.number="goalForm.target" class="lb-input" type="number" min="1" max="10000" required /></label><label class="lb-form-wide">Зачем это тебе?<textarea v-model="goalForm.description" class="lb-input lb-textarea" rows="2" maxlength="300" placeholder="Одно предложение достаточно" /></label></div><p v-if="goalError" class="lb-error">{{ goalError }}</p><button class="lb-button lb-button-primary" type="submit">Создать цель</button></form>
    <div class="lb-section-intro"><div><p class="lb-overline">ПРИОРИТЕТЫ</p><h2>Цели и повторяющиеся действия <span class="lb-muted lb-count">{{ store.goals.length }}</span></h2></div><span class="lb-soft-badge">Совет: до 3 главных целей</span></div>
    <div class="lb-goal-list"><article v-for="goal in activeGoals" :key="goal.id" class="lb-panel lb-goal-detail"><div class="lb-goal-detail-head"><span class="lb-area-icon" :style="{ color: store.getArea(goal.areaId).accent, background: store.getArea(goal.areaId).subtle }"><i :class="['bi', store.getArea(goal.areaId).icon]" /></span><div class="lb-goal-detail-title"><span class="lb-goal-area">{{ store.getArea(goal.areaId).name }} · {{ labels[goal.horizon] }}</span><h3>{{ goal.title }}</h3><p>{{ goal.description }}</p></div><div class="lb-goal-detail-progress"><strong>{{ store.goalStats(goal).percent }}%</strong><small>{{ store.goalStats(goal).done }} / {{ goal.target }} действий</small></div><button class="lb-icon-button lb-danger-hover" :aria-label="`Удалить цель ${goal.title}`" title="Удалить цель" @click="removeGoal(goal.id, goal.title)"><i class="bi bi-trash3" /></button></div><div class="lb-progress-track"><div :style="{ width: `${store.goalStats(goal).percent}%`, background: store.getArea(goal.areaId).accent }" /></div>
      <div class="lb-routine-title"><strong>Повторяющиеся действия</strong><button class="lb-text-action" @click="addingRoutineFor = addingRoutineFor === goal.id ? null : goal.id">+ Добавить действие</button></div>
      <div class="lb-routine-list"><div v-for="routine in store.routines.filter(r => r.goalId === goal.id)" :key="routine.id" class="lb-routine-row"><i class="bi bi-repeat" /><span><strong>{{ routine.title }}</strong><small>{{ routine.time }} · {{ routine.days.map(d => dayNames[d - 1]).join(', ') }} · {{ routine.durationMinutes }} мин</small></span><button class="lb-icon-button lb-danger-hover" :aria-label="`Удалить ${routine.title}`" title="Удалить действие" @click="removeRoutine(routine.id)"><i class="bi bi-x-lg" /></button></div><p v-if="!store.routines.some(r => r.goalId === goal.id)" class="lb-muted">Пока нет действий. Добавь хотя бы одно, чтобы отслеживать прогресс.</p></div>
      <form v-if="addingRoutineFor === goal.id" class="lb-routine-form" @submit.prevent="saveRoutine(goal.id)"><div class="lb-form-grid"><label>Название<input v-model="routineForm.title" class="lb-input" maxlength="90" required placeholder="Что делать конкретно?" /></label><label>Время<input v-model="routineForm.time" class="lb-input" type="time" required /></label><label>Минут<input v-model.number="routineForm.durationMinutes" class="lb-input" type="number" min="1" max="480" required /></label><label>Подсказка<input v-model="routineForm.description" class="lb-input" maxlength="200" placeholder="Короткое пояснение" /></label></div><div class="lb-day-checks"><button v-for="(day, index) in dayNames" :key="day" type="button" :class="{ 'is-active': routineForm.days.includes(index + 1) }" @click="toggleDay(index + 1)">{{ day }}</button></div><p v-if="routineError" class="lb-error">{{ routineError }}</p><button class="lb-button lb-button-primary" type="submit">Сохранить действие</button></form>
      </article><div v-if="!store.goals.length" class="lb-panel lb-empty">Целей пока нет. Начни с одного важного направления.</div></div>
  </div>
</template>
