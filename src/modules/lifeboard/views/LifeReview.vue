<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { dateKey, formatDay, getWeekStart, shiftDays } from '../date';
import { useLifeStore } from '../stores/useLifeStore';

const store = useLifeStore();
const selected = ref(new Date());
const weekDays = computed(() => store.weekDays(selected.value));
const week = computed(() => store.weekStats(selected.value));
const weekPercent = computed(() => week.value.total ? Math.round(100 * week.value.done / week.value.total) : 0);
const storedReview = computed(() => store.getReview(selected.value));
const form = reactive({ wins: '', obstacles: '', nextStep: '', mood: 7 });
const saved = ref(false);
const importInput = ref<HTMLInputElement | null>(null);
const importMessage = ref('');
const goalStats = computed(() => store.focusGoals.map((goal) => {
  const weekTasks = store.routines.filter((task) => task.goalId === goal.id);
  let done = 0; let total = 0;
  for (const day of weekDays.value) for (const task of weekTasks) if (task.days.includes(((day.getDay() + 6) % 7) + 1)) {
    total++;
    if (store.isDone(task.id, day)) done++;
  }
  return { goal, done, total, percent: total ? Math.round(done / total * 100) : 0 };
}));
watch(storedReview, (review) => {
  form.wins = review?.wins ?? '';
  form.obstacles = review?.obstacles ?? '';
  form.nextStep = review?.nextStep ?? '';
  form.mood = review?.mood ?? 7;
  saved.value = false;
}, { immediate: true });
const weekLabel = computed(() => `${formatDay(getWeekStart(selected.value), { day: 'numeric', month: 'short' })} — ${formatDay(shiftDays(getWeekStart(selected.value), 6), { day: 'numeric', month: 'short' })}`);
function go(offset: number) { selected.value = shiftDays(selected.value, offset); }
function save() { store.saveReview(selected.value, { ...form }); saved.value = true; }
function exportData() {
  const blob = new Blob([store.exportState()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `lifeboard-backup-${dateKey(new Date())}.json`;
  anchor.click(); URL.revokeObjectURL(url);
}
async function importData(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (!confirm('Заменить текущие данные Lifeboard содержимым резервной копии?')) { input.value = ''; return; }
  if (file.size > 5_000_000) { importMessage.value = 'Файл слишком большой (максимум 5 МБ).'; input.value = ''; return; }
  const ok = store.importState(await file.text());
  importMessage.value = ok ? 'Резервная копия загружена.' : 'Не удалось прочитать файл Lifeboard.';
  input.value = '';
}
</script>

<template>
  <div class="lb-screen"><div class="lb-page-top"><div><p class="lb-overline">ВРЕМЯ ОГЛЯНУТЬСЯ</p><h1>Недельная рефлексия</h1><p class="lb-muted">Не отчёт начальнику. Способ понять, что работает лично для тебя.</p></div><div class="lb-stepper"><button aria-label="Предыдущая неделя" @click="go(-7)"><i class="bi bi-chevron-left" /></button><span>{{ weekLabel }}</span><button aria-label="Следующая неделя" @click="go(7)"><i class="bi bi-chevron-right" /></button></div></div>
    <section class="lb-review-summary"><div class="lb-review-score"><p class="lb-overline">РЕЗУЛЬТАТ НЕДЕЛИ</p><strong>{{ weekPercent }}<span>%</span></strong><p>{{ week.done }} из {{ week.total }} запланированных действий</p><div class="lb-progress-track"><div :style="{ width: `${weekPercent}%` }" /></div></div><div class="lb-review-mini"><p class="lb-overline">НЕДЕЛЯ ПО ДНЯМ</p><div class="lb-review-week-dots"><div v-for="d in weekDays" :key="dateKey(d)"><span :class="{ completed: store.taskStats(d).total && store.taskStats(d).done === store.taskStats(d).total, partial: store.taskStats(d).done > 0 }">{{ d.getDate() }}</span><small>{{ formatDay(d, { weekday: 'short' }).replace('.', '') }}</small></div></div><p>Каждая отметка — небольшой шаг, который реально произошёл.</p></div></section>
    <div class="lb-review-grid"><section class="lb-panel lb-review-form"><div class="lb-panel-heading"><div><p class="lb-overline">5 МИНУТ ДЛЯ СЕБЯ</p><h3>Разбор недели</h3></div><span v-if="storedReview" class="lb-soft-badge">Сохранено</span></div><form @submit.prevent="save"><label class="lb-review-field"><span><i class="bi bi-trophy" /> Что получилось?</span><textarea v-model="form.wins" class="lb-input lb-textarea" rows="3" maxlength="1000" placeholder="Даже небольшие победы имеют значение" /></label><label class="lb-review-field"><span><i class="bi bi-chat-square-text" /> Что мешало?</span><textarea v-model="form.obstacles" class="lb-input lb-textarea" rows="3" maxlength="1000" placeholder="Что мешало в реальности? Без самообвинений" /></label><label class="lb-review-field"><span><i class="bi bi-arrow-up-right-circle" /> Что изменить на следующей неделе?</span><textarea v-model="form.nextStep" class="lb-input lb-textarea" rows="3" maxlength="1000" placeholder="Один конкретный шаг или одно упрощение" /></label><div class="lb-mood-row"><span>Как оцениваешь неделю?</span><div class="lb-mood-values"><button v-for="n in 10" :key="n" type="button" :class="{ 'is-active': form.mood === n }" @click="form.mood = n">{{ n }}</button></div></div><div class="lb-form-actions"><button class="lb-button lb-button-primary" type="submit"><i class="bi bi-floppy" /> Сохранить разбор</button><span v-if="saved" class="lb-save-message"><i class="bi bi-check-circle" /> Разбор сохранён</span></div></form></section>
      <aside class="lb-review-side"><section class="lb-panel"><p class="lb-overline">ПО НАПРАВЛЕНИЯМ</p><h3>Баланс недели</h3><div class="lb-review-area" v-for="entry in goalStats" :key="entry.goal.id"><div class="lb-review-area-head"><span><i :class="['bi', store.getArea(entry.goal.areaId).icon]" :style="{ color: store.getArea(entry.goal.areaId).accent }" /> {{ store.getArea(entry.goal.areaId).name }}</span><strong>{{ entry.done }}/{{ entry.total }}</strong></div><div class="lb-progress-track"><div :style="{ width: `${entry.percent}%`, background: store.getArea(entry.goal.areaId).accent }" /></div></div><p class="lb-fineprint">Это не оценка твоей личности. Просто данные для корректировки плана.</p></section><section class="lb-panel lb-backup"><p class="lb-overline">ТВОИ ДАННЫЕ</p><h3>Резервная копия</h3><p>Пока Lifeboard работает в браузере без сервера. Сохрани JSON, чтобы не потерять прогресс.</p><div class="lb-backup-buttons"><button class="lb-button lb-button-outline" @click="exportData"><i class="bi bi-download" /> Скачать JSON</button><button class="lb-button lb-button-outline" @click="importInput?.click()"><i class="bi bi-upload" /> Загрузить</button><input ref="importInput" type="file" accept=".json,application/json" hidden @change="importData" /></div><p v-if="importMessage" class="lb-save-message">{{ importMessage }}</p></section></aside></div>
  </div>
</template>
