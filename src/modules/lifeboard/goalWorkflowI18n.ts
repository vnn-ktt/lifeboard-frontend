import { computed } from 'vue';
import { useLifeI18n } from './i18n';
import type { GoalStatus } from './types';

const translations = {
  ru: {
    hierarchy: 'Структура целей', garden: 'Сад целей', outline: 'Иерархия', expandAll: 'Раскрыть всё', collapseAll: 'Свернуть',
    milestones: 'Этапы', tasks: 'Разовые задачи', addMilestone: 'Добавить этап', addTask: 'Добавить задачу',
    title: 'Название', details: 'Описание', optional: 'необязательно', dueDate: 'Срок', status: 'Статус цели',
    active: 'Активна', paused: 'На паузе', completed: 'Достигнута', cancelled: 'Отменена',
    noMilestones: 'Этапов пока нет — добавь значимые результаты на пути к цели.',
    noTasks: 'Нет разовых задач. Добавь конкретное действие с датой или без неё.',
    milestone: 'Этап', milestonePlaceholder: 'Например, закончить прототип',
    taskPlaceholder: 'Например, отправить заявку', linkMilestone: 'Привязать к этапу', noMilestone: 'Без этапа',
    save: 'Сохранить', cancel: 'Отмена', remove: 'Удалить', edit: 'Изменить',
    newTask: 'Новая задача', openTasks: 'Разовые задачи', taskOverdue: 'Просрочено', taskNoDate: 'Без срока',
    taskCount: 'задач', milestoneCount: 'этапов', goalTitle: 'Цель',
    invalidInput: 'Проверь название (2–90 символов), описание и дату.',
    deleteMilestoneConfirm: 'Удалить этап? Связанные задачи сохранятся без привязки к этапу.',
    deleteTaskConfirm: 'Удалить разовую задачу?', completedNote: 'Статус цели меняется отдельно от замеров и выполненных действий.',
  },
  en: {
    hierarchy: 'Goal structure', garden: 'Goal garden', outline: 'Hierarchy', expandAll: 'Expand all', collapseAll: 'Collapse',
    milestones: 'Milestones', tasks: 'One-time tasks', addMilestone: 'Add milestone', addTask: 'Add task',
    title: 'Title', details: 'Description', optional: 'optional', dueDate: 'Due date', status: 'Goal status',
    active: 'Active', paused: 'Paused', completed: 'Completed', cancelled: 'Cancelled',
    noMilestones: 'No milestones yet. Add the results that matter along the way.',
    noTasks: 'No one-time tasks. Add a concrete step with or without a date.',
    milestone: 'Milestone', milestonePlaceholder: 'e.g. finish the prototype',
    taskPlaceholder: 'e.g. submit an application', linkMilestone: 'Link to milestone', noMilestone: 'No milestone',
    save: 'Save', cancel: 'Cancel', remove: 'Delete', edit: 'Edit',
    newTask: 'New task', openTasks: 'One-time tasks', taskOverdue: 'Overdue', taskNoDate: 'Unscheduled',
    taskCount: 'tasks', milestoneCount: 'milestones', goalTitle: 'Goal',
    invalidInput: 'Check title (2–90 chars), description and date.',
    deleteMilestoneConfirm: 'Delete milestone? Linked tasks will remain without a milestone.',
    deleteTaskConfirm: 'Delete one-time task?', completedNote: 'Goal status is separate from metrics and completed activities.',
  },
  de: {
    hierarchy: 'Zielstruktur', garden: 'Zielgarten', outline: 'Hierarchie', expandAll: 'Alle öffnen', collapseAll: 'Einklappen',
    milestones: 'Meilensteine', tasks: 'Einmalige Aufgaben', addMilestone: 'Meilenstein hinzufügen', addTask: 'Aufgabe hinzufügen',
    title: 'Titel', details: 'Beschreibung', optional: 'optional', dueDate: 'Fällig am', status: 'Zielstatus',
    active: 'Aktiv', paused: 'Pausiert', completed: 'Abgeschlossen', cancelled: 'Abgebrochen',
    noMilestones: 'Noch keine Meilensteine. Ergänze wichtige Zwischenergebnisse.',
    noTasks: 'Keine einmaligen Aufgaben. Füge einen konkreten Schritt hinzu.',
    milestone: 'Meilenstein', milestonePlaceholder: 'z. B. Prototyp fertigstellen',
    taskPlaceholder: 'z. B. Bewerbung abschicken', linkMilestone: 'Meilenstein zuordnen', noMilestone: 'Kein Meilenstein',
    save: 'Speichern', cancel: 'Abbrechen', remove: 'Löschen', edit: 'Bearbeiten',
    newTask: 'Neue Aufgabe', openTasks: 'Einmalige Aufgaben', taskOverdue: 'Überfällig', taskNoDate: 'Ohne Termin',
    taskCount: 'Aufgaben', milestoneCount: 'Meilensteine', goalTitle: 'Ziel',
    invalidInput: 'Titel (2–90 Zeichen), Beschreibung und Datum prüfen.',
    deleteMilestoneConfirm: 'Meilenstein löschen? Zugehörige Aufgaben bleiben ohne Zuordnung.',
    deleteTaskConfirm: 'Einmalige Aufgabe löschen?', completedNote: 'Der Zielstatus ist unabhängig von Messwerten und Aktivitäten.',
  },
} as const;

export function useGoalWorkflowI18n() {
  const { lang } = useLifeI18n();
  const words = computed(() => translations[lang.value]);
  const statusLabel = (status: GoalStatus) => words.value[status];
  return { words, statusLabel };
}
