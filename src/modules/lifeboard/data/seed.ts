import type { LifeArea, LifeGoal, LifeRoutine, LifeState, LifeNoteGroup, LifeNote } from '../types';

export const lifeAreas: LifeArea[] = [
  { id: 'dogs', name: 'Собаки', icon: 'bi-heart-pulse', accent: '#cf8b54', subtle: '#f8ebdc' },
  { id: 'career', name: 'Развитие', icon: 'bi-code-slash', accent: '#6979d1', subtle: '#e9ecfb' },
  { id: 'leadership', name: 'Лидерство', icon: 'bi-people', accent: '#438d78', subtle: '#e0f2ea' },
  { id: 'health', name: 'Здоровье', icon: 'bi-activity', accent: '#cf7779', subtle: '#fbe9ea' },
  { id: 'finance', name: 'Финансы', icon: 'bi-wallet2', accent: '#b2904d', subtle: '#faf2dc' },
  { id: 'relationships', name: 'Отношения', icon: 'bi-chat-heart', accent: '#bc739a', subtle: '#f8eaf3' },
  { id: 'learning', name: 'Языки', icon: 'bi-translate', accent: '#6082ad', subtle: '#e5effb' },
  { id: 'other', name: 'Другое', icon: 'bi-compass', accent: '#718096', subtle: '#edf0f5' },
];

const seedGoals: LifeGoal[] = [
  {
    id: 'dogs-goal', areaId: 'dogs', title: 'Воспитать двух спаниелей',
    description: 'Регулярные прогулки, спокойствие и короткая дрессировка без перегруза.',
    horizon: 'month', target: 60, createdAt: '2026-11-01T00:00:00',
  },
  {
    id: 'backend-goal', areaId: 'career', title: 'Стать сильнее в Node.js / Backend',
    description: 'Рабочая практика, разбор архитектуры и систематические занятия по 60–90 минут.',
    horizon: 'month', target: 20, createdAt: '2026-11-01T00:00:00',
  },
  {
    id: 'lead-goal', areaId: 'leadership', title: 'Развить лидерские навыки',
    description: 'Предлагать решения, обозначать риски и помогать команде.',
    horizon: 'month', target: 16, createdAt: '2026-11-01T00:00:00',
  },
];

const extraGoals: LifeGoal[] = [
  { id:'demo-vision', areaId:'other', title:'Создать жизнь с выбором', description:'Свобода перемещения, любимое дело, здоровье и близкие люди.', horizon:'five-years', target:1, createdAt:'2026-11-01T00:00:00' },
  { id:'demo-remote', areaId:'career', title:'Перейти на удалённую работу', description:'Расти как fullstack-разработчик и выбирать место для жизни.', horizon:'year', target:12, parentId:'demo-vision', createdAt:'2026-11-01T00:00:00' },
  { id:'demo-english', areaId:'learning', title:'Разговаривать на английском свободно', description:'Регулярные разговоры, чтение и практика.', horizon:'year', target:60, parentId:'demo-vision', createdAt:'2026-11-01T00:00:00' },
  { id:'demo-project', areaId:'career', title:'Собрать проект на NestJS', description:'От API до деплоя: один законченный сервис.', horizon:'quarter', target:16, parentId:'demo-remote', createdAt:'2026-11-01T00:00:00' },
  { id:'demo-cushion', areaId:'finance', title:'Создать финансовую подушку', description:'Управлять тратами и планировать накопления.', horizon:'quarter', target:12, parentId:'demo-vision', createdAt:'2026-11-01T00:00:00' },
  { id:'demo-health', areaId:'health', title:'Укрепить режим сна', description:'Следить за нагрузкой и восстановлением.', horizon:'quarter', target:30, parentId:'demo-vision', createdAt:'2026-11-01T00:00:00' },
  { id:'demo-book', areaId:'learning', title:'Прочитать две книги', description:'Находить время для чтения и сохранять интересные мысли.', horizon:'month', target:8, parentId:'demo-english', createdAt:'2026-11-01T00:00:00' },
];

export const seedNoteGroups: LifeNoteGroup[] = [
  { id:'demo-group-tech', name:'Технологии', goalId:'demo-project', color:'#87b0d0', createdAt:'2026-11-01T00:00:00' },
  { id:'demo-group-languages', name:'Языки', goalId:'demo-english', color:'#c9a8df', createdAt:'2026-11-01T00:00:00' },
  { id:'demo-group-life', name:'Личные находки', goalId:'demo-vision', color:'#dfb276', createdAt:'2026-11-01T00:00:00' },
];
export const seedNotes: LifeNote[] = [
  { id:'demo-note-1', title:'Идеи для архитектуры API', content:'Один REST API, DTO, ValidationPipe, миграции. Начинать с работающего сценария, а не с инфраструктуры.', groupId:'demo-group-tech', goalId:'demo-project', imageDataUrl:null, pinned:true, createdAt:'2026-11-01T00:00:00', updatedAt:'2026-11-01T00:00:00' },
  { id:'demo-note-2', title:'Чеклист перед релизом', content:'Проверить авторизацию, миграции, резервную копию и мобильные экраны.', groupId:'demo-group-tech', goalId:'demo-project', imageDataUrl:null, pinned:false, createdAt:'2026-11-01T00:00:00', updatedAt:'2026-11-01T00:00:00' },
  { id:'demo-note-3', title:'Слова недели', content:'Reliable — надёжный. Consistent — последовательный. To prioritize — расставлять приоритеты.', groupId:'demo-group-languages', goalId:'demo-english', imageDataUrl:null, pinned:false, createdAt:'2026-11-01T00:00:00', updatedAt:'2026-11-01T00:00:00' },
  { id:'demo-note-4', title:'Как практиковать язык', content:'15 минут разговора в день. Лучше короткая регулярная практика, чем редкие марафоны.', groupId:'demo-group-languages', goalId:'demo-english', imageDataUrl:null, pinned:false, createdAt:'2026-11-01T00:00:00', updatedAt:'2026-11-01T00:00:00' },
  { id:'demo-note-5', title:'Маленькие шаги', content:'Достаточно одного значимого действия сегодня. Можно сделать меньше, но сохранить ритм.', groupId:'demo-group-life', goalId:null, imageDataUrl:null, pinned:true, createdAt:'2026-11-01T00:00:00', updatedAt:'2026-11-01T00:00:00' },
  { id:'demo-note-6', title:'Финансовый обзор', content:'Раз в неделю проверять обязательные платежи, расходы и свободный остаток.', groupId:'demo-group-life', goalId:'demo-cushion', imageDataUrl:null, pinned:false, createdAt:'2026-11-01T00:00:00', updatedAt:'2026-11-01T00:00:00' },
  { id:'demo-note-7', title:'Вопросы к себе', content:'Что дало энергию? Что отвлекало? Как упростить следующую неделю?', groupId:'demo-group-life', goalId:null, imageDataUrl:null, pinned:false, createdAt:'2026-11-01T00:00:00', updatedAt:'2026-11-01T00:00:00' },
  { id:'demo-note-8', title:'Для чтения', content:'Записывать не только цитаты, но и собственные мысли — так заметки превращаются в знания.', groupId:null, goalId:'demo-book', imageDataUrl:null, pinned:false, createdAt:'2026-11-01T00:00:00', updatedAt:'2026-11-01T00:00:00' },
];

const seedRoutines: LifeRoutine[] = [
  { id: 'dog-am', goalId: 'dogs-goal', title: 'Утренняя прогулка + дрессировка', description: '35–40 минут, контакт и одна команда.', time: '07:25', days: [1, 2, 3, 4, 5, 6, 7], durationMinutes: 40 },
  { id: 'dog-pm', goalId: 'dogs-goal', title: 'Вечерняя прогулка + дрессировка', description: '40–45 минут, подзыв и самоконтроль.', time: '18:30', days: [1, 2, 3, 4, 5, 6, 7], durationMinutes: 45 },
  { id: 'backend-work', goalId: 'backend-goal', title: 'Node.js / NestJS — практика', description: 'Одна backend-тема или реальная техническая задача.', time: '15:00', days: [1, 2, 3, 4, 5], durationMinutes: 60 },
  { id: 'leader-work', goalId: 'lead-goal', title: 'Лидерский микро-шаг', description: 'Риск, инициатива, помощь коллеге или обратная связь.', time: '16:00', days: [1, 2, 3, 4, 5], durationMinutes: 15 },
];

export function initialState(): LifeState {
  return {
    version: 1,
    vision: 'Жить свободно: выбирать, где жить и работать, быть здоровым, иметь время для близких и своих увлечений.',
    goals: [...seedGoals, ...extraGoals].map(goal => ({ ...goal })),
    routines: seedRoutines.map(routine => ({ ...routine, days:[...routine.days] })),
    checks: {},
    reviews: [],
    categories: [],
    noteGroups: seedNoteGroups.map(group => ({ ...group })),
    notes: seedNotes.map(note => ({ ...note })),
    focusGoalIds: seedGoals.filter(goal => goal.horizon === 'month').slice(0, 3).map(goal => goal.id),
  };
}

