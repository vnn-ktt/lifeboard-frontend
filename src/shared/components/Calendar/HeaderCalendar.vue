<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import DatePicker from 'primevue/datepicker';
import { usePrimeVue } from 'primevue/config';
import { useLifeI18n } from '@/modules/lifeboard/i18n';
import { dateKey } from '@/modules/lifeboard/date';

const router = useRouter();
const primevue = usePrimeVue();
const { lang, locale } = useLifeI18n();
const root = ref<HTMLElement | null>(null);
const open = ref(false);
const now = ref(new Date());
const selectedDate = ref<Date>(new Date());
let interval: number | undefined;

const dateText = computed(() => new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }).format(now.value));
const timeText = computed(() => new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit', hour12: false }).format(now.value));
const handStyle = computed(() => {
  const minutes = now.value.getMinutes();
  const hours = now.value.getHours() % 12;
  return { '--lb-hour-rotation': `${hours * 30 + minutes * 0.5}deg`, '--lb-minute-rotation': `${minutes * 6}deg` };
});

// DatePicker is controlled by PrimeVue's shared locale. Keep calendar labels in sync with Lifeboard's three languages.
watch(lang, (current) => {
  const localeTag = current === 'en' ? 'en-US' : current === 'de' ? 'de-DE' : 'ru-RU';
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2026, 10, 1 + i)); // Sunday first
  const months = Array.from({ length: 12 }, (_, i) => new Date(2026, i, 1));
  const weekdaysText = (weekday: 'long' | 'short' | 'narrow') => weekdays.map((date) =>
    new Intl.DateTimeFormat(localeTag, { weekday }).format(date));
  const monthsText = (month: 'long' | 'short') => months.map((date) =>
    new Intl.DateTimeFormat(localeTag, { month }).format(date));
  Object.assign(primevue.config.locale, {
    dayNames: weekdaysText('long'), dayNamesShort: weekdaysText('short'), dayNamesMin: weekdaysText('narrow'),
    monthNames: monthsText('long'), monthNamesShort: monthsText('short'),
    firstDayOfWeek: current === 'en' ? 0 : 1,
    dateFormat: current === 'en' ? 'mm/dd/yy' : 'dd.mm.yy',
    today: current === 'ru' ? 'Сегодня' : current === 'de' ? 'Heute' : 'Today',
    clear: current === 'ru' ? 'Очистить' : current === 'de' ? 'Löschen' : 'Clear',
  });
}, { immediate: true });

const copy = computed(() => ({
  ru: { label: 'Открыть календарь', jump: 'Перейти к выбранному дню' },
  en: { label: 'Open calendar', jump: 'View selected day' },
  de: { label: 'Kalender öffnen', jump: 'Gewählten Tag anzeigen' },
}[lang.value]));

function toggle() {
  if (!open.value) selectedDate.value = new Date(now.value);
  open.value = !open.value;
}
function onPointerDown(event: PointerEvent) {
  if (open.value && !root.value?.contains(event.target as Node)) open.value = false;
}
function onKeydown(event: KeyboardEvent) { if (event.key === 'Escape') open.value = false; }
function jumpToDay() {
  const date = selectedDate.value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return;
  open.value = false;
  void router.push({ path: '/today', query: { date: dateKey(date) } });
}
onMounted(() => {
  interval = window.setInterval(() => { now.value = new Date(); }, 30_000);
  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
  if (interval) window.clearInterval(interval);
  document.removeEventListener('pointerdown', onPointerDown);
  document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <div ref="root" class="lb-header-calendar">
    <button type="button" class="lb-header-calendar__trigger" :aria-label="copy.label" aria-haspopup="dialog" :aria-expanded="open" @click="toggle">
      <span class="lb-header-clock" :style="handStyle" aria-hidden="true">
        <span class="lb-header-clock__dot"></span>
        <span class="lb-header-clock__hand lb-header-clock__hand--hour"></span>
        <span class="lb-header-clock__hand lb-header-clock__hand--minute"></span>
      </span>
      <span class="lb-header-date-wrap">
        <strong class="lb-header-time">{{ timeText }}</strong>
        <span class="lb-header-date">{{ dateText }}</span>
      </span>
      <i class="bi bi-chevron-down lb-header-calendar__chevron" aria-hidden="true" />
    </button>
    <Transition name="lb-overlay-transition">
      <div v-if="open" class="lb-header-calendar__popover" role="dialog" :aria-label="copy.label">
        <DatePicker v-model="selectedDate" inline class="lb-header-calendar__picker" />
        <button class="lb-button lb-button-primary lb-header-calendar__go" type="button" @click="jumpToDay">
          {{ copy.jump }} <i class="bi bi-arrow-right" aria-hidden="true" />
        </button>
      </div>
    </Transition>
  </div>
</template>
