<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useLifeI18n } from '../i18n';
import { dateKey, getWeekStart, shiftDays } from '../date';
import { useLifeStore } from '../stores/useLifeStore';

const store = useLifeStore();
const router=useRouter();
const {t,locale}=useLifeI18n();
const fmt=(d:Date,o:Intl.DateTimeFormatOptions={day:'numeric',month:'long'})=>new Intl.DateTimeFormat(locale.value,o).format(d);
const selectedDay=ref<Date|null>(null);
const selected = ref(new Date());
const weekDays = computed(() => store.weekDays(selected.value));
const week = computed(() => store.weekStats(selected.value));
const weekPercent = computed(() => week.value.total ? Math.round(100 * week.value.done / week.value.total) : 0);
const storedReview = computed(() => store.getReview(selected.value));
const form = reactive({ wins: '', obstacles: '', nextStep: '', mood: 7 });
const saved = ref(false);
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
const weekLabel = computed(() => `${fmt(getWeekStart(selected.value), { day: 'numeric', month: 'short' })} — ${fmt(shiftDays(getWeekStart(selected.value), 6), { day: 'numeric', month: 'short' })}`);
function go(offset: number) { selected.value = shiftDays(selected.value, offset); }
function save() { store.saveReview(selected.value, { ...form }); saved.value = true; }
const dailyValues=computed(()=>weekDays.value.map(day=>({date:day,stat:store.taskStats(day)})));
const doneTotal=computed(()=>dailyValues.value.reduce((sum,d)=>sum+d.stat.done,0));
const areaAngle=computed(()=>{
 const total=goalStats.value.reduce((sum,item)=>sum+item.done,0);
 if(!total)return 'conic-gradient(var(--life-border) 0 100%)';
 let offset=0;const parts=goalStats.value.map(item=>{
  const angle=item.done/total*100;const from=offset;offset+=angle;
  return `${store.getArea(item.goal.areaId).accent} ${from.toFixed(2)}% ${offset.toFixed(2)}%`;
 });return `conic-gradient(${parts.join(',')})`;
});
const weekday=(day:Date)=>new Intl.DateTimeFormat(locale.value,{weekday:'short'}).format(day);
function openDay(date:Date){selectedDay.value=date;}
function viewDay(date:Date){void router.push({path:'/today',query:{date:dateKey(date)}});}
</script>

<template>
  <div class="lb-screen"><div class="lb-page-top"><div><p class="lb-overline">{{ t('weeklyReview') }}</p><h1>{{ t('reviewTitle') }}</h1><p class="lb-muted">{{ t('reviewSub') }}</p></div><div class="lb-stepper"><button aria-label="Предыдущая неделя" @click="go(-7)"><i class="bi bi-chevron-left" /></button><span>{{ weekLabel }}</span><button aria-label="Следующая неделя" @click="go(7)"><i class="bi bi-chevron-right" /></button></div></div>
    <section class="lb-review-summary">
      <div class="lb-review-score"><p class="lb-overline">{{ t('weekResult') }}</p><strong>{{ weekPercent }}<span>%</span></strong><p>{{ week.done }} / {{ week.total }} {{ t('todayDone') }}</p><div class="lb-progress-track"><div :style="{width:`${weekPercent}%`}" /></div></div>
      <div class="lb-review-mini"><p class="lb-overline">{{ t('weekDays') }}</p>
        <div class="lb-review-week-dots"><button v-for="d in weekDays" :key="dateKey(d)" type="button" class="lb-review-day-button" :class="{'is-selected': selectedDay && dateKey(selectedDay)===dateKey(d)}" @click="openDay(d)"><span :class="{completed:store.taskStats(d).total&&store.taskStats(d).done===store.taskStats(d).total,partial:store.taskStats(d).done>0}">{{ d.getDate() }}</span><small>{{ weekday(d) }}</small></button></div>
        <p v-if="selectedDay" class="lb-day-detail"><strong>{{ store.taskStats(selectedDay).done }} / {{ store.taskStats(selectedDay).total }}</strong> <button type="button" class="lb-text-action" @click="viewDay(selectedDay)">{{ t('todayTitle') }} <i class="bi bi-arrow-right" /></button></p>
        <p v-else class="lb-muted">{{ t('details') }}</p>
      </div>
    </section>
    <div class="lb-analytics-grid">
      <section class="lb-panel"><div class="lb-panel-heading"><div><p class="lb-overline">{{ t('trend') }}</p><h3>{{ t('week') }}</h3></div></div><div class="lb-trend-bars">
        <button v-for="day in dailyValues" :key="dateKey(day.date)" type="button" class="lb-trend-column" :title="`${day.stat.done}/${day.stat.total}`" @click="viewDay(day.date)"><span>{{ day.stat.percent }}%</span><div class="lb-trend-well"><div :style="{height:`${Math.max(day.stat.percent,day.stat.done?8:0)}%`}" /></div><small>{{ weekday(day.date) }}</small></button>
      </div></section>
      <section class="lb-panel"><div class="lb-panel-heading"><div><p class="lb-overline">{{ t('composition') }}</p><h3>{{ t('balance') }}</h3></div></div><div class="lb-donut-layout"><div class="lb-donut-chart" :style="{background:areaAngle}"><div><strong>{{ doneTotal }}</strong><small>{{ t('done') }}</small></div></div><div class="lb-donut-legend"><div v-for="entry in goalStats" :key="entry.goal.id"><i :style="{background:store.getArea(entry.goal.areaId).accent}"/><span>{{ store.getAreaName(entry.goal.areaId,locale) }}</span><strong>{{ entry.done }}</strong></div></div></div></section>
    </div>
    <div class="lb-review-grid"><section class="lb-panel lb-review-form"><div class="lb-panel-heading"><div><p class="lb-overline">{{ t('reflect') }}</p><h3>{{ t('reflect') }}</h3></div><span v-if="storedReview" class="lb-soft-badge">{{ t('saved') }}</span></div><form @submit.prevent="save"><label class="lb-review-field"><span><i class="bi bi-trophy" /> {{ t('wins') }}</span><textarea v-model="form.wins" class="lb-input lb-textarea" rows="3" maxlength="1000" :placeholder="t('reviewWinPlaceholder')" /></label><label class="lb-review-field"><span><i class="bi bi-chat-square-text" /> {{ t('obstacles') }}</span><textarea v-model="form.obstacles" class="lb-input lb-textarea" rows="3" maxlength="1000" :placeholder="t('reviewObstaclePlaceholder')" /></label><label class="lb-review-field"><span><i class="bi bi-arrow-up-right-circle" /> {{ t('nextStep') }}</span><textarea v-model="form.nextStep" class="lb-input lb-textarea" rows="3" maxlength="1000" :placeholder="t('reviewNextPlaceholder')" /></label><div class="lb-mood-row"><span>{{ t('mood') }}</span><div class="lb-mood-values"><button v-for="n in 10" :key="n" type="button" :class="{ 'is-active': form.mood === n }" @click="form.mood = n">{{ n }}</button></div></div><div class="lb-form-actions"><button class="lb-button lb-button-primary" type="submit"><i class="bi bi-floppy" /> {{ t('saveReview') }}</button><span v-if="saved" class="lb-save-message"><i class="bi bi-check-circle" /> {{ t('saved') }}</span></div></form></section>
      <aside class="lb-review-side"><section class="lb-panel"><p class="lb-overline">{{ t('composition') }}</p><h3>{{ t('balance') }}</h3><div class="lb-review-area" v-for="entry in goalStats" :key="entry.goal.id"><div class="lb-review-area-head"><span><i :class="['bi', store.getArea(entry.goal.areaId).icon]" :style="{ color: store.getArea(entry.goal.areaId).accent }" /> {{ store.getAreaName(entry.goal.areaId,locale) }}</span><strong>{{ entry.done }}/{{ entry.total }}</strong></div><div class="lb-progress-track"><div :style="{ width: `${entry.percent}%`, background: store.getArea(entry.goal.areaId).accent }" /></div></div><p class="lb-fineprint">{{ t('weekNotScore') }}</p></section></aside></div>
  </div>
</template>
