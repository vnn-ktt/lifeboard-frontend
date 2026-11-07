import { useLifeI18n } from './i18n';

const dictionary = {
  ru: {
    scheduleTitle: 'Проверка результата', scheduleHint: 'Напоминание в «Сегодня». Выполнение проверки не влияет на процент цели.',
    frequency: 'Периодичность', off: 'Отключена', manual: 'Вручную', daily: 'Каждый день', weekly: 'Раз в неделю',
    weekday: 'День проверки', weekdays: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
    title: 'Проверка результатов', intro: 'Отметь, что изменилось. Сама проверка не засчитывается как прогресс цели.',
    pending: 'ожидают проверки', overdue: 'Просрочено', due: 'Запланировано', more: 'Ещё непройденных проверок',
    update: 'Обновить результат', save: 'Записать и завершить', unchanged: 'Без изменений', skip: 'Пропустить',
    achieved: 'Цель достигнута', current: 'Сейчас', goal: 'Цель', value: 'Новое значение', note: 'Комментарий (необязательно)',
    cancel: 'Отмена', error: 'Не удалось сохранить проверку. Проверь значение и свободное место в браузере.',
    next: 'Следующая проверка', allDone: 'На сегодня проверок нет', completed: 'Проверено на этой неделе',
    pendingHint: 'Просроченные проверки остаются здесь, пока ты их не отметишь или не пропустишь.',
  },
  en: {
    scheduleTitle: 'Outcome check-in', scheduleHint: 'Reminder in Today. Completing a check-in does not increase goal progress.',
    frequency: 'Frequency', off: 'Disabled', manual: 'Manual only', daily: 'Every day', weekly: 'Weekly',
    weekday: 'Check-in day', weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    title: 'Outcome check-ins', intro: 'Record what changed. Checking in does not count as goal progress.',
    pending: 'pending', overdue: 'Overdue', due: 'Scheduled', more: 'Other pending check-ins',
    update: 'Update outcome', save: 'Save and complete', unchanged: 'No change', skip: 'Skip',
    achieved: 'Goal achieved', current: 'Current', goal: 'Target', value: 'New value', note: 'Note (optional)',
    cancel: 'Cancel', error: 'Could not save the check-in. Check the value and browser storage.',
    next: 'Next check-in', allDone: 'Nothing to check today', completed: 'Checked in this week',
    pendingHint: 'Overdue check-ins stay here until you complete or skip them.',
  },
  de: {
    scheduleTitle: 'Ergebnis-Check-in', scheduleHint: 'Erinnerung in „Heute“. Ein Check-in verändert den Zielfortschritt nicht.',
    frequency: 'Häufigkeit', off: 'Deaktiviert', manual: 'Nur manuell', daily: 'Täglich', weekly: 'Wöchentlich',
    weekday: 'Wochentag', weekdays: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
    title: 'Ergebnis-Check-ins', intro: 'Halte Änderungen fest. Ein Check-in zählt nicht als Zielfortschritt.',
    pending: 'offen', overdue: 'Überfällig', due: 'Geplant', more: 'Weitere offene Check-ins',
    update: 'Ergebnis aktualisieren', save: 'Speichern und abschließen', unchanged: 'Unverändert', skip: 'Überspringen',
    achieved: 'Ziel erreicht', current: 'Aktuell', goal: 'Zielwert', value: 'Neuer Wert', note: 'Notiz (optional)',
    cancel: 'Abbrechen', error: 'Check-in konnte nicht gespeichert werden. Prüfe Wert und Browserspeicher.',
    next: 'Nächster Check-in', allDone: 'Heute nichts zu prüfen', completed: 'Diese Woche geprüft',
    pendingHint: 'Überfällige Check-ins bleiben, bis du sie erledigst oder überspringst.',
  },
} as const;

export type GoalCheckinMessageKey = Exclude<keyof typeof dictionary.ru, 'weekdays'>;
export function useGoalCheckinI18n() {
  const { lang, locale } = useLifeI18n();
  const ct = (key: GoalCheckinMessageKey): string => dictionary[lang.value][key];
  const weekdays = () => dictionary[lang.value].weekdays;
  return { ct, weekdays, lang, locale };
}
