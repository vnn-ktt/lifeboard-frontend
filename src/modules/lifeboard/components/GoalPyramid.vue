<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Horizon, LifeGoal } from '../types';
import { useLifeStore } from '../stores/useLifeStore';
import { useLifeI18n } from '../i18n';
import { gardenPreview, GARDEN_PREVIEW_LIMIT } from '../utils/gardenPreview';
import LifeboardMascot from '@/shared/components/Brand/LifeboardMascot.vue';
import GoalProgressLabel from './goals/GoalProgressLabel.vue';

const props = defineProps<{ goals: LifeGoal[] }>();
const emit = defineEmits<{
  select: [id: string];
  navigate: [id: string];
  create: [horizon: Horizon, parentId: string | null];
}>();
const store = useLifeStore();
const { t, locale, titleFor } = useLifeI18n();
const selectedId = ref<string | null>(props.goals[0]?.id ?? null);
const expanded = ref<Record<Horizon, boolean>>({ 'five-years':false, year:false, quarter:false, month:false });
const visibleLimit = GARDEN_PREVIEW_LIMIT;
function visibleGoals(stage: { horizon:Horizon; goals:LifeGoal[] }): LifeGoal[] {
  return gardenPreview(stage.goals, selectedId.value, expanded.value[stage.horizon]);
}
function toggleStage(horizon:Horizon) { expanded.value[horizon] = !expanded.value[horizon]; }

watch(() => props.goals, (goals) => {
  if (!goals.some(g => g.id === selectedId.value)) selectedId.value = goals[0]?.id ?? null;
});

const stages = computed(() => [
  { horizon: 'five-years' as Horizon, name: t('horizonFive'), icon: 'bi-stars', glyph: '✦', className: 'vision' },
  { horizon: 'year' as Horizon, name: t('horizonYear'), icon: 'bi-compass', glyph: '✧', className: 'direction' },
  { horizon: 'quarter' as Horizon, name: t('horizonQuarter'), icon: 'bi-calendar3', glyph: '◇', className: 'milestone' },
  { horizon: 'month' as Horizon, name: t('horizonMonth'), icon: 'bi-check2-circle', glyph: '●', className: 'action' },
].map((stage) => ({
  ...stage,
  goals: props.goals.filter(goal => goal.horizon === stage.horizon),
})));

const selected = computed(() => props.goals.find(g => g.id === selectedId.value) ?? null);
const ancestors = computed(() => selected.value ? store.goalAncestors(selected.value.id) : []);
const directChildren = computed(() => props.goals.filter(g => g.parentId === selectedId.value));
const relatedIds = computed(() => new Set([selectedId.value, ...ancestors.value.map(g => g.id), ...directChildren.value.map(g => g.id)]));
const relationTrail = computed(() => [...ancestors.value, ...(selected.value ? [selected.value] : [])]);
function choose(goalId: string) { selectedId.value = goalId; emit('select', goalId); }
function addToStage(horizon: Horizon) {
  const ranks: Record<Horizon, number> = { 'five-years': 0, year: 1, quarter: 2, month: 3 };
  const parent = selected.value && ranks[selected.value.horizon] < ranks[horizon] ? selected.value.id : null;
  emit('create', horizon, parent);
}
</script>

<template>
  <section class="lb-panel lb-growth" :aria-label="t('growthMap')">
    <div class="lb-growth-header">
      <div>
        <p class="lb-overline">{{ t('growthStages') }}</p>
        <h3>{{ t('growthMap') }} <span class="lb-growth-flower" aria-hidden="true">✳</span></h3>
        <p class="lb-muted">{{ t('growthHint') }}</p>
      </div>
      <div class="lb-growth-counter" :title="t('growthMap')"><span>{{ goals.length }}</span><small>{{ t('goals') }}</small></div>
    </div>

    <div class="lb-growth-scene">
      <div class="lb-growth-dust" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div>
      <div class="lb-growth-garden lb-growth-garden--winding">
        <svg class="lb-growth-winding-trail" viewBox="0 0 170 1000" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="lbGardenTrail" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--life-primary-2)" /><stop offset="50%" stop-color="var(--life-primary)" /><stop offset="100%" stop-color="var(--life-primary-2)" /></linearGradient>
          </defs>
          <path d="M77 0 C13 85 20 165 98 255 S166 428 67 515 S11 710 100 765 S148 932 74 1000" stroke="var(--life-border)" stroke-width="31" stroke-linecap="round" fill="none" opacity=".46" />
          <path class="lb-growth-trail-dash" d="M77 0 C13 85 20 165 98 255 S166 428 67 515 S11 710 100 765 S148 932 74 1000" stroke="url(#lbGardenTrail)" stroke-width="4" stroke-linecap="round" stroke-dasharray="10 14" fill="none" />
        </svg>
        <div class="lb-growth-top"><i class="bi bi-stars" /> <span>{{ t('fiveYear') }}</span></div>
        <div class="lb-growth-stages">
          <div v-for="(stage, index) in stages" :key="stage.horizon" class="lb-growth-stage" :class="`lb-growth-stage--${stage.className}`" :style="{ '--growth-step': index }">
            <div class="lb-growth-connector" aria-hidden="true"><i :class="['bi', stage.icon]" /></div>
            <div class="lb-growth-stage-content">
              <div class="lb-growth-stage-heading">
                <div class="lb-growth-stage-title"><span class="lb-growth-stage-number">0{{ index + 1 }}</span><span>{{ stage.name }}</span><small>{{ stage.goals.length }}</small></div>
                <button type="button" class="lb-growth-add" :title="t('growthCreate')" :aria-label="t('growthCreate')" @click="addToStage(stage.horizon)"><i class="bi bi-plus-lg" /></button>
              </div>
              <div :class="['lb-growth-branches', { 'is-expanded': expanded[stage.horizon] }]">
                <button
                  v-for="goal in visibleGoals(stage)" :key="goal.id" type="button"
                  :class="['lb-growth-goal', { 'is-selected': selectedId === goal.id, 'is-related': relatedIds.has(goal.id) }]"
                  :aria-pressed="selectedId === goal.id"
                  @click="choose(goal.id)"
                >
                  <span class="lb-growth-goal-icon" :style="{ '--goal-accent': store.getArea(goal.areaId).accent }"><i :class="['bi', store.getArea(goal.areaId).icon]" /></span>
                  <span class="lb-growth-goal-body"><strong>{{ titleFor(goal) }}</strong><small>{{ store.getAreaName(goal.areaId, locale) }}</small></span>
                  <span class="lb-growth-goal-percent">{{ store.goalStats(goal).percent }}%</span>
                </button>
                <button v-if="stage.goals.length > visibleLimit" type="button" class="lb-growth-expand" :aria-expanded="expanded[stage.horizon]" @click="toggleStage(stage.horizon)">
                  <i :class="['bi', expanded[stage.horizon] ? 'bi-chevron-up' : 'bi-collection']" />
                  {{ expanded[stage.horizon] ? t('growthShowLess') : `${t('growthShowMore')} ${stage.goals.length - visibleLimit}` }}
                </button>
                <div v-if="stage.goals.length === 0" class="lb-growth-placeholder"><i class="bi bi-plus-circle-dotted" /> {{ t('growthNone') }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="lb-growth-ground"><span aria-hidden="true">◉</span><span>{{ t('growthRoot') }}</span><i class="bi bi-arrow-up-short" /></div>
      </div>

      <aside class="lb-growth-detail" :aria-label="t('growthBranch')">
        <div class="lb-growth-detail-label"><i class="bi bi-diagram-3" /> {{ t('growthChain') }}</div>
        <template v-if="selected">
          <div class="lb-growth-detail-head"><div class="lb-growth-detail-emblem" :style="{ color: store.getArea(selected.areaId).accent }"><i :class="['bi', store.getArea(selected.areaId).icon]" /></div><div><strong>{{ titleFor(selected) }}</strong><small>{{ store.getAreaName(selected.areaId, locale) }}</small></div></div>
          <div class="lb-growth-detail-progress"><span>{{ store.goalStats(selected).percent }}%</span><div class="lb-progress-track"><div :style="{ width: `${store.goalStats(selected).percent}%` }" /></div></div>
          <GoalProgressLabel :goal="selected" />
          <div class="lb-growth-path">
            <button v-for="item in relationTrail" :key="item.id" type="button" :class="{ 'is-current': item.id === selected.id }" @click="choose(item.id)"><span class="lb-growth-path-dot" /><span>{{ titleFor(item) }}</span><i v-if="item.id === selected.id" class="bi bi-check-circle" /></button>
          </div>
          <div v-if="directChildren.length" class="lb-growth-children"><p>{{ t('growthBranch') }}</p><button v-for="goal in directChildren" :key="goal.id" type="button" @click="choose(goal.id)"><i class="bi bi-arrow-return-right" />{{ titleFor(goal) }}</button></div>
          <p v-else class="lb-growth-nochildren">{{ t('growthRoot') }}</p>
          <button type="button" class="lb-button lb-button-primary lb-growth-open" @click="emit('navigate', selected.id)">{{ t('growthNavigate') }} <i class="bi bi-arrow-up-right" /></button>
        </template>
        <div v-else class="lb-growth-placeholder">{{ t('noGoals') }}</div>
        <div class="lb-growth-tip"><i class="bi bi-lightbulb" /><span>{{ t('hierarchyHint') }}</span></div>
      </aside>
    </div>
  </section>
</template>
