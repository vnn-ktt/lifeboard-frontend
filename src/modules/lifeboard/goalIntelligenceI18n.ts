import { computed } from 'vue';
import { useLifeI18n } from './i18n';

export const goalIntelligenceTranslations = {
  ru: {
    intelligence: 'Аналитика результата', outcomeTrend: 'Динамика результата', forecast: 'Прогноз достижения',
    latest: 'Последнее значение', pace: 'Средний темп', paceUnit: 'в день', estimated: 'Ориентировочно',
    onTrack: 'В графике', atRisk: 'Риск не успеть', overdue: 'Срок прошёл', achieved: 'Целевой результат достигнут',
    movingAway: 'Результат удаляется от цели', stale: 'Обнови замер для прогноза', insufficient: 'Недостаточно замеров', noDeadline: 'Нет срока для сравнения',
    noData: 'Добавь хотя бы два замера с разницей от 7 дней, чтобы появился прогноз.',
    forecastDisclaimer: 'Линейная оценка по первым и последним замерам, а не гарантия. Скорость может измениться.',
    target: 'Цель', observations: 'Замеры', observed: 'Фактические значения', predicted: 'Прогноз',
    weekOutcomes: 'Результаты целей за неделю', weekOutcomesHint: 'Результаты и выполненные действия показаны отдельно.',
    noFocus: 'Добавь цели в фокус, чтобы видеть их динамику здесь.',
    noUpdate: 'На этой неделе результат не обновлялся', initialReading: 'Первый замер на этой неделе',
    noMetric: 'Цель измеряется по действиям', change: 'Изменение результата', unchanged: 'Без движения',
    improving: 'Приближение к цели', regressing: 'Удаление от цели', activities: 'Выполнение действий',
    noPlannedActivities: 'Нет запланированных действий на неделе',
    divergence: 'Действия выполнялись, но результат пока не вырос. Возможно, стоит изменить подход.',
    milestoneDone: 'Этапов завершено', tasksDone: 'Разовых задач выполнено',
    noMeasurement: 'Нет новых замеров — оценить изменение результата нельзя.',
    directionPositive: 'Ближе к цели', directionNegative: 'Дальше от цели',
  },
  en: {
    intelligence: 'Outcome intelligence', outcomeTrend: 'Outcome trend', forecast: 'Goal forecast',
    latest: 'Latest reading', pace: 'Average pace', paceUnit: 'per day', estimated: 'Estimated',
    onTrack: 'On track', atRisk: 'At risk', overdue: 'Past due', achieved: 'Target achieved',
    movingAway: 'Moving away from target', stale: 'Update your reading to forecast', insufficient: 'Not enough readings', noDeadline: 'No deadline to compare',
    noData: 'Record at least two readings seven or more days apart to see a forecast.',
    forecastDisclaimer: 'Linear estimate from first and last reading, not a guarantee. Your pace may change.',
    target: 'Target', observations: 'Readings', observed: 'Recorded values', predicted: 'Projection',
    weekOutcomes: 'Weekly goal outcomes', weekOutcomesHint: 'Results and completed actions are shown separately.',
    noFocus: 'Add goals to focus to see their movement here.',
    noUpdate: 'No outcome updates this week', initialReading: 'First reading this week',
    noMetric: 'This goal is measured by actions', change: 'Outcome change', unchanged: 'No movement',
    improving: 'Moving towards target', regressing: 'Moving away from target', activities: 'Activity completion',
    noPlannedActivities: 'No activities planned this week',
    divergence: 'Actions were completed but the outcome did not improve yet. Consider adjusting the approach.',
    milestoneDone: 'Milestones completed', tasksDone: 'One-time tasks completed',
    noMeasurement: 'Without a new reading, the outcome change cannot be assessed.',
    directionPositive: 'Closer to target', directionNegative: 'Further from target',
  },
  de: {
    intelligence: 'Ergebnisanalyse', outcomeTrend: 'Ergebnisentwicklung', forecast: 'Zielprognose',
    latest: 'Letzter Messwert', pace: 'Durchschnittliches Tempo', paceUnit: 'pro Tag', estimated: 'Voraussichtlich',
    onTrack: 'Im Zeitplan', atRisk: 'Zeitplan gefährdet', overdue: 'Frist abgelaufen', achieved: 'Zielwert erreicht',
    movingAway: 'Vom Ziel entfernt', stale: 'Für Prognose erneut messen', insufficient: 'Zu wenige Messwerte', noDeadline: 'Kein Zieldatum zum Vergleich',
    noData: 'Für eine Prognose mindestens zwei Messungen im Abstand von sieben Tagen erfassen.',
    forecastDisclaimer: 'Lineare Schätzung auf Basis des ersten und letzten Messwerts, keine Garantie.',
    target: 'Zielwert', observations: 'Messwerte', observed: 'Erfasste Werte', predicted: 'Prognose',
    weekOutcomes: 'Wöchentliche Zielergebnisse', weekOutcomesHint: 'Ergebnisse und erledigte Aktivitäten werden getrennt dargestellt.',
    noFocus: 'Füge Ziele zum Fokus hinzu, um ihre Entwicklung hier zu sehen.',
    noUpdate: 'Diese Woche keine neuen Messwerte', initialReading: 'Erster Messwert dieser Woche',
    noMetric: 'Dieses Ziel wird durch Aktivitäten gemessen', change: 'Ergebnisänderung', unchanged: 'Keine Änderung',
    improving: 'Annäherung an das Ziel', regressing: 'Entfernung vom Ziel', activities: 'Aktivitäten erledigt',
    noPlannedActivities: 'Keine Aktivitäten für diese Woche geplant',
    divergence: 'Aktivitäten wurden erledigt, das Ergebnis verbesserte sich jedoch nicht. Ansatz prüfen.',
    milestoneDone: 'Meilensteine erreicht', tasksDone: 'Einmalige Aufgaben erledigt',
    noMeasurement: 'Ohne neue Messung lässt sich die Ergebnisänderung nicht beurteilen.',
    directionPositive: 'Näher am Ziel', directionNegative: 'Weiter vom Ziel entfernt',
  },
} as const;

export function useGoalIntelligenceI18n() {
  const { lang, locale } = useLifeI18n();
  const words = computed(() => goalIntelligenceTranslations[lang.value]);
  return { words, locale };
}
