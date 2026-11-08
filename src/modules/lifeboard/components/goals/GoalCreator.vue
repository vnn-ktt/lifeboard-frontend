<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { computed, watch } from 'vue';
import Select from 'primevue/select';
import { useLifeStore } from '../../stores/useLifeStore';
import { useLifeI18n, type LifeMessageKey } from '../../i18n';
import { useUiPreferencesStore } from '@/shared/stores/useUiPreferencesStore';
import { useGoalDraft } from '../../composables/useGoalDraft';
import GoalMeasurementFields from './GoalMeasurementFields.vue';
import type { Horizon, LifeGoal } from '../../types';
import { useBrandLoaderStore } from '@/shared/stores/useBrandLoaderStore';

const props = withDefaults(defineProps<{ horizon?: Horizon; parentId?: string | null; goal?: LifeGoal | null }>(), { horizon: 'month', parentId: null, goal: null });
const emit = defineEmits<{ close: []; saved: [id: string] }>();
const life = useLifeStore();
const prefs = useUiPreferencesStore();
const loader = useBrandLoaderStore();
const { t, locale, titleFor } = useLifeI18n();
const { draft, step, error, reset, next, previous, submit } = useGoalDraft();
const horizons: { id: Horizon; icon: string; detail: LifeMessageKey }[] = [
  { id: 'five-years', icon: 'bi-stars', detail: 'wizardVision' },
  { id: 'year', icon: 'bi-compass', detail: 'wizardDirection' },
  { id: 'quarter', icon: 'bi-signpost-2', detail: 'wizardMilestone' },
  { id: 'month', icon: 'bi-calendar-check', detail: 'wizardAction' },
];
const labels = computed<Record<Horizon,string>>(() => ({ month:t('horizonMonth'),quarter:t('horizonQuarter'),year:t('horizonYear'),'five-years':t('horizonFive') }));
const areas = computed(() => life.categories.map(area => ({ label: life.getAreaName(area.id, locale.value), value:area.id, icon:area.icon, accent:area.accent })));
const editing = computed(() => Boolean(props.goal));
const parents = computed(() => [{ label:t('unlinked'), value:'' }, ...life.goals.filter(goal => goal.id !== props.goal?.id).map(goal => ({ label:titleFor(goal), value:goal.id }))]);
watch(() => [props.horizon, props.parentId, props.goal?.id], () => reset(props.horizon, props.parentId, props.goal), { immediate:true });
async function save() {
  const id = await loader.run(() => submit(props.goal?.id), {
    message: editing.value ? t('save') : t('createGoal'),
    details: editing.value ? 'Обновляем цель и связи…' : 'Сохраняем новую цель и первые связи…',
    minDuration: 680,
  });
  if (id) emit('saved', id);
}
</script>

<template>
  <section id="lb-goal-creator" class="lb-panel lb-goal-creator" :aria-label="editing ? t('save') : t('newGoal')">
    <header class="lb-goal-creator-head">
      <div class="lb-goal-creator-mark"><i :class="['bi', editing ? 'bi-pencil-square' : 'bi-sunrise']" /></div>
      <div class="lb-goal-creator-title"><p class="lb-overline">{{ prefs.goalEntryMode === 'wizard' ? t('wizardEyebrow') : t('quickEyebrow') }}</p><h3>{{ editing ? `${t('save')} · ${t('goalName')}` : (prefs.goalEntryMode === 'wizard' ? t('wizardTitle') : t('newGoal')) }}</h3></div>
      <button type="button" class="lb-icon-button" :aria-label="t('close')" @click="emit('close')"><i class="bi bi-x-lg" /></button>
    </header>

    <form v-if="prefs.goalEntryMode === 'quick'" class="lb-quick-goal-form" @submit.prevent="save">
      <label class="lb-goal-field lb-quick-title"><span>{{ t('goalName') }}<span class="lb-required-mark" aria-hidden="true">*</span></span><InputText v-model="draft.title" class="lb-input" maxlength="90" required autofocus :placeholder="t('goalPlaceholder')" /></label>
      <label class="lb-goal-field"><span>{{ t('category') }}<span class="lb-required-mark" aria-hidden="true">*</span></span><Select v-model="draft.areaId" :options="areas" option-label="label" option-value="value" filter class="lb-goal-prime-select" /></label>
      <label class="lb-goal-field"><span>{{ t('period') }}<span class="lb-required-mark" aria-hidden="true">*</span></span><Select v-model="draft.horizon" :options="horizons.map(h => ({ label:labels[h.id],value:h.id }))" option-label="label" option-value="value" class="lb-goal-prime-select" /></label>
      <label class="lb-goal-field"><span>{{ t('parent') }}</span><Select v-model="draft.parentId" :options="parents" option-label="label" option-value="value" filter class="lb-goal-prime-select" /></label>
      <label class="lb-goal-field lb-quick-wide"><span>{{ t('why') }}</span><Textarea v-model="draft.description" class="lb-input lb-textarea" rows="2" maxlength="300" :placeholder="t('descriptionPlaceholder')" /></label>
      <GoalMeasurementFields :draft="draft" compact class="lb-quick-wide" />
      <p v-if="error" class="lb-error lb-quick-wide" role="alert">{{ error }}</p>
      <div class="lb-creator-actions lb-quick-wide"><button type="button" class="lb-button lb-button-outline" @click="emit('close')">{{ t('close') }}</button><button type="submit" class="lb-button lb-button-primary"><i :class="['bi', editing ? 'bi-check2' : 'bi-plus-lg']" />{{ editing ? t('save') : t('createGoal') }}</button></div>
    </form>

    <form v-else class="lb-goal-wizard" @submit.prevent="step === 2 ? save() : next()">
      <div class="lb-wizard-progress" :aria-label="`Шаг ${step+1} из 3`">
        <div v-for="index in 3" :key="index" :class="['lb-wizard-segment', {'is-active':index-1<=step}]" /><span>0{{ step+1 }} / 03</span>
      </div>
      <Transition mode="out-in" name="lb-wizard-page">
        <div v-if="step===0" key="dream" class="lb-wizard-step">
          <div class="lb-wizard-illustration" aria-hidden="true"><i :class="['bi', editing ? 'bi-pencil' : 'bi-lightbulb']" /><span>✦</span></div>
          <h4>{{ t('wizardStart') }}</h4><p class="lb-muted">{{ t('wizardStartHelp') }}</p>
          <label class="lb-goal-field"><span>{{ t('goalName') }}<span class="lb-required-mark" aria-hidden="true">*</span></span><InputText v-model="draft.title" class="lb-input lb-wizard-main-input" maxlength="90" autofocus required :placeholder="t('goalPlaceholder')" /></label>
          <label class="lb-goal-field"><span>{{ t('why') }}</span><Textarea v-model="draft.description" class="lb-input lb-textarea" rows="3" maxlength="300" :placeholder="t('wizardWhyPlaceholder')" /></label>
        </div>
        <div v-else-if="step===1" key="direction" class="lb-wizard-step">
          <h4>{{ t('wizardChoose') }} <span class="lb-required-mark" aria-hidden="true">*</span></h4><p class="lb-muted">{{ t('wizardChooseHelp') }}</p>
          <div class="lb-wizard-horizons"><button v-for="h in horizons" :key="h.id" type="button" :class="['lb-wizard-choice', {'is-selected':draft.horizon===h.id}]" :aria-pressed="draft.horizon===h.id" @click="draft.horizon=h.id"><i :class="['bi',h.icon]" /><strong>{{ labels[h.id] }}</strong><small>{{ t(h.detail) }}</small></button></div>
          <div class="lb-wizard-areas"><button v-for="area in areas" :key="area.value" type="button" :class="['lb-wizard-area',{'is-selected':draft.areaId===area.value}]" :aria-pressed="draft.areaId===area.value" @click="draft.areaId=area.value"><i :class="['bi',area.icon]" :style="{color:area.accent}" />{{ area.label }}</button></div>
        </div>
        <div v-else key="plan" class="lb-wizard-step">
          <h4>{{ t('wizardPlan') }}</h4><p class="lb-muted">{{ t('wizardPlanHelp') }}</p>
          <GoalMeasurementFields :draft="draft" />
          <label class="lb-goal-field"><span>{{ t('parent') }} <small>· {{ t('wizardOptional') }}</small></span><Select v-model="draft.parentId" :options="parents" option-label="label" option-value="value" filter class="lb-goal-prime-select" /></label>
          <div class="lb-wizard-recap"><i class="bi bi-check2-circle" /><span><strong>{{ draft.title }}</strong><small>{{ labels[draft.horizon] }} · {{ areas.find(a=>a.value===draft.areaId)?.label }}</small></span></div>
        </div>
      </Transition>
      <p v-if="error" class="lb-error" role="alert">{{ error }}</p>
      <div class="lb-creator-actions"><button type="button" class="lb-button lb-button-outline" @click="step===0 ? emit('close') : previous()"><i class="bi bi-arrow-left" />{{ step===0?t('close'):t('wizardBack') }}</button><button type="submit" class="lb-button lb-button-primary">{{ step===2?(editing ? t('save') : t('createGoal')):t('wizardNext') }} <i :class="['bi',step===2?'bi-check2':'bi-arrow-right']" /></button></div>
    </form>
  </section>
</template>
