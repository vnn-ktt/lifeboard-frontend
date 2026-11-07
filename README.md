## Lifeboard Frontend v0.16.0 — Milestones & Tasks

- Goal milestones: create, edit, complete and remove. Linked one-time tasks are preserved when a milestone is removed.
- One-time tasks: optional due date and milestone association, toggle completion once. Overdue and unscheduled tasks appear in **Today**.
- Goal lifecycle: active / paused / completed / cancelled. Status is independent of numeric outcome and routine completion.
- Goal hierarchy: switch between the familiar Garden and a compact expandable parent-child Outline.
- All new labels localized into Russian, English and German.
- Existing `lifeboard:state:v1` snapshots / v0.15.x backups remain compatible; goal statuses default to `active` and new collections default to empty.
- Weekly Check-ins from v0.15.1 are preserved. Paused/cancelled/completed goals no longer create pending check-in reminders.
- `GoalMilestone`, `GoalTask` and `GoalStatus` are additive to the existing frontend models; backend REST sync is still separate work.

# Lifeboard — frontend 0.15.1

> **Lifeboard** — личная панель для целей, повторяющихся действий, рефлексии, заметок и связанного с ними контекста. Текущая версия — **frontend-only прототип**, без NestJS, серверной БД и защищённой авторизации.

Этот README — точка входа для нового разработчика. Здесь перечислены реальные функции и ограничения текущей версии, устройство состояния и UI, маршруты, развертывание и будущие точки интеграции. Описание не подменяет работающий API проектным контрактом.

## Содержание

1. [Текущее состояние и ограничения](#1-текущее-состояние-и-ограничения)
2. [Технологический стек](#2-технологический-стек)
3. [Быстрый запуск](#3-быстрый-запуск)
4. [Архитектура и структура директорий](#4-архитектура-и-структура-директорий)
5. [Маршрутизация](#5-маршрутизация)
6. [Авторизация и пользовательский профиль](#6-авторизация-и-пользовательский-профиль)
7. [Pinia, состояние и хранение](#7-pinia-состояние-и-хранение)
8. [Цели, измеримые результаты и действия](#8-цели-и-повторяющиеся-действия)
9. [Заметки и цитаты](#9-заметки-и-цитаты)
10. [Helper: интерфейс и локальный мок](#10-jakk-интерфейс-и-локальный-мок)
11. [Overlay, scroll lock и работа фокуса](#11-overlay-scroll-lock-и-работа-фокуса)
12. [Дизайн, CSS и темы](#12-дизайн-css-и-темы)
13. [Локализация](#13-локализация)
14. [Резервные копии и миграции](#14-резервные-копии-и-миграции)
15. [Проверки и тестирование](#15-проверки-и-тестирование)
16. [Docker и деплой](#16-docker-и-деплой)
17. [План серверного API (ещё не реализован)](#17-план-серверного-api-ещё-не-реализован)
18. [Безопасность и правила разработки](#18-безопасность-и-правила-разработки)

## 1. Текущее состояние и ограничения

Работает в браузере: dashboard, список целей с иерархией и анимацией сада, повторяющиеся действия, отметки выполнения, экран «Сегодня», недельная рефлексия и аналитика, заметки с группами и сжатыми фотографиями, системные цитаты, три темы, три языка, настройки профиля и Helper.

**Не реализовано:** NestJS API, PostgreSQL, защищённые серверные сессии, OAuth Google/GitHub, реальная LLM-интеграция, серверные файлы, синхронизация между устройствами. **Нельзя использовать локальный вход как настоящую аутентификацию.** Пользователь, имеющий доступ к браузеру и localStorage, получает доступ ко всем данным в нём.

Helper — **демонстрационный локальный чат**. Сообщения и ответы не отправляются в нейросеть, опираются на локальное состояние и простые сценарии. Его UI создан по мотивам предоставленного `MessageFeed / MessageFeedTabs`, но **не содержит приватных зависимостей рабочего UI-kit**.

## 2. Технологический стек

- Vue 3, TypeScript, Vite, Vue Router, Pinia;
- PrimeVue 4, `@primeuix/themes`, Bootstrap Icons;
- `vue-i18n`, собственный словарь Lifeboard на RU/EN/DE;
- CSS, custom properties, адаптивная сетка и анимации с `prefers-reduced-motion`;
- Docker multi-stage: Node 22 для сборки, Nginx для SPA;
- Vitest и Cypress уже присутствуют в зависимостях.

См. зависимости и версии в [`package.json`](./package.json). Документация: [Vue](https://vuejs.org/), [Pinia](https://pinia.vuejs.org/), [Vue Router](https://router.vuejs.org/), [PrimeVue](https://primevue.org/), [Vite](https://vite.dev/), [Docker Compose](https://docs.docker.com/compose/).

## 3. Быстрый запуск

Node.js: ориентируйтесь на Dockerfile (`node:22-bookworm-slim`) и поддерживаемую Vite версию Node. Пакетный менеджер проекта — Yarn 1 с зафиксированным lockfile.

```bash
corepack enable
yarn install --frozen-lockfile
yarn dev
```

Адрес dev-сервера — `http://localhost:8080/`. Для проверки компиляции:

```bash
yarn build
```

`yarn lint` в этом репозитории использует флаг `--fix` и **изменяет файлы**. Не запускайте его просто как read-only проверку на чистом рабочем дереве. При необходимости используйте `yarn exec eslint .` после подготовки конфигурации ESLint.

## 4. Архитектура и структура директорий

```text
src/
├── main.ts                         # Vue, Pinia, Router, PrimeVue, guard
├── App.vue                         # выбирает layout и глобальный BrandLoader
├── index.css                       # упорядоченные импорты стилей
├── modules/
│   ├── lifeboard/
│   │   ├── router.ts
│   │   ├── types.ts                  # модели предметной области
│   │   ├── date.ts                   # календарная логика
│   │   ├── i18n.ts                   # локализация Lifeboard
│   │   ├── goalMetricsI18n.ts       # RU/EN/DE для измерений результата
│   │   ├── data/seed.ts              # начальные цели, заметки, цитаты
│   │   ├── stores/useLifeStore.ts    # Pinia: цели, привычки, отчеты, заметки
│   │   ├── composables/
│   │   │   ├── useGoalDraft.ts       # wizard/quick + валидаторы метрик
│   │   │   ├── useLifeBackup.ts
│   │   │   ├── useNotesBoard.ts
│   │   │   └── useJakkChat.ts        # логика мокового чата
│   │   ├── components/
│   │   │   ├── LifeShell.vue         # оболочка + плавающий Helper
│   │   │   ├── JakkLauncher.vue      # кнопка + модальный чат
│   │   │   ├── jakk/
│   │   │   │   ├── JakkChat.vue      # только UI
│   │   │   │   ├── translations.ts   # словари RU/EN/DE
│   │   │   │   └── types.ts          # строгие типы сообщений
│   │   │   ├── goals/GoalCreator.vue
│   │   │   ├── goals/GoalMeasurementFields.vue
│   │   │   ├── goals/GoalMetricPanel.vue
│   │   │   ├── goals/GoalProgressLabel.vue
│   │   │   ├── GoalPyramid.vue
│   │   │   ├── notes/...
│   │   │   └── review/...
│   │   ├── views/
│   │   │   ├── LifeDashboard.vue
│   │   │   ├── LifeToday.vue
│   │   │   ├── LifeGoals.vue
│   │   │   ├── LifeReview.vue
│   │   │   ├── LifeNotes.vue
│   │   │   └── LifeQuotes.vue
│   │   ├── utils/goalMetrics.ts     # измерения, календарь, история
│   │   ├── utils/goalProgress.ts    # результат vs. действия
│   │   ├── goal-metrics.css         # стили измерения целей
│   │   ├── lifeboard.css            # базовые компоненты
│   │   └── lifeboard-ui.css         # формы, мелкие UX-элементы
│   ├── profile/views/ProfileView.vue
│   └── auth/views/...               # локальный вход / регистрация
└── shared/
    ├── composables/
    │   ├── useBodyScrollLock.ts     # общий контроль фона модалок
    │   └── useStoredState.ts        # generic локальное состояние
    ├── components/
    │   ├── Overlay/AppOverlayDialog.vue
    │   ├── Brand/{LifeboardMascot,LifeboardLogo,BrandLoader}.vue
    │   ├── Calendar/HeaderCalendar.vue
    │   ├── User/{UserAvatar,UserMenu}.vue
    │   └── Breadcrumbs/AppBreadcrumbs.vue
    ├── stores/
    │   ├── useAuthStore.ts
    │   ├── useThemeStore.ts
    │   ├── useSettingsStore.ts
    │   ├── usePrivacyStore.ts
    │   ├── useUiPreferencesStore.ts
    │   └── useBrandLoaderStore.ts
    └── styles/
        ├── lifeboard-theme.css       # один консолидированный слой
        ├── lifeboard-account.css
        ├── animations/
        └── scrollbar.css
```

Модули старого Budgee (`transactions`, `dashboard`, `categories`, `goals`, `settings`, `demo`) сохранены, поскольку их маршруты ещё присутствуют в `src/main.ts`. Удалять их без отдельной миграции роутинга опасно. Удалены только невостребованные старые auth и Theme wrapper-компоненты.

## 5. Маршрутизация

| Route | Назначение |
| --- | --- |
| `/` | Overview, dashboard |
| `/today` | План на день и отметки |
| `/life-goals` | Иерархия и редактирование целей |
| `/life-review` | Недельная рефлексия |
| `/notes` | Доска заметок |
| `/quotes` | Системные цитаты и назначение |
| `/profile` | Личные данные, язык, тема, настройки Helper, резервные копии |
| `/login`, `/register` | Локальный прототип аутентификации |
| `/money` | Переход к legacy Budgee `/dashboard` |

`main.ts` включает navigation guard, основанный на `requiresAuth` и `useAuthStore`. Это **только клиентская** проверка видимости страницы и не защита от чтения данных на сервере.

## 6. Авторизация и пользовательский профиль

`useAuthStore` хранит профиль в `lifeboard:local-profile:v1` (`localStorage`), локальную сессию — в `lifeboard:local-session:v1` (`sessionStorage`). Никнейм имеет приоритет над ФИО в хедере и чате, но оригинальное имя остаётся в профиле. Фото хранится в браузере в сжатом виде.

Реализация `loginLocal(email)` **не запрашивает пароль** и не должна использоваться в публичном мультипользовательском MVP. Перед запуском с реальными данными заменить на серверные JWT+refresh или cookie-based httpOnly sessions, авторизацию запросов, CSRF/secure cookie policy и HTTPS.

## 7. Pinia, состояние и хранение

Основное состояние: `useLifeStore` → ключ `lifeboard:state:v1` в `localStorage`. `LifeState.version` пока **1** для совместимости с предыдущими JSON-бэкапами. Логика восстановления дополняет отсутствующие новые опциональные поля, а не стирает пользовательские цели.

| Данные | Место хранения | Дополнительные замечания |
| --- | --- | --- |
| Цели, рутины, чеки, обзоры, заметки, группы | `lifeboard:state:v1` | Reactivity через Pinia |
| Системные цитаты и назначения | тот же ключ | каталог системный, пользователь не редактирует |
| Архив старых пользовательских цитат | поле `archivedUserQuotes` | сохраняется для миграции, не выводится |
| Чат Helper | `lifeboard:jakk:mock:v1` | отдельная локальная история; не входит в основной бэкап |
| Профиль и фото | `lifeboard:local-profile:v1` | не защищён сервером |
| Язык | `settings:lang` | `useSettingsStore` |
| Тема | `useThemeStore` | локальная тема с тремя вариантами |
| Режим создания целей | cookie `lb_goal_entry` | `wizard` / `quick` |
| Показ Helper | cookie `lb_jakk_visible` | `true` по умолчанию; `false` скрывает кнопку полностью |

**Не помещайте access tokens, пароли и персональные записи в cookie с настройками интерфейса.** `useStoredState<T>()` помогает безопасно прочитать и записать валидируемое локальное состояние, но не делает браузерное хранилище защищённым.

## 8. Цели, измеримые результаты и повторяющиеся действия (v0.15)

**Суть изменения:** процент результата цели больше не приравнивается автоматически к проценту выполненных действий. Реальный результат может измеряться деньгами, весом, количеством или фактом достижения; действия выступают отдельной метрикой дисциплины.

### Модель

- `LifeGoal.measurement: GoalMeasurement` — `activity`, `numeric` с направлением `increase | decrease`, либо `binary`. В целях из старых бэкапов поле может отсутствовать: тогда это `activity`.
- `LifeGoal.target` по-прежнему задаёт **плановое число выполнений рутин**, даже когда сама цель измеряется деньгами или весом.
- Для числовой метрики хранятся `startValue`, `targetValue`, `unit`; текущий результат вычисляется **по последнему датированному замеру**, а не редактированием поля `currentValue`.
- `GoalMetricEntry` хранит `id`, `goalId`, `date` в формате `YYYY-MM-DD`, число `value`, необязательный `note` и `createdAt`. Все записи лежат в массиве `LifeState.goalMetricEntries` для последующего выделения в таблицу `goal_metric_entries` в PostgreSQL.
- `LifeGoal.startDate` и `dueDate` — **необязательные фиксированные даты**. При создании цель получает подсказанные даты на основании горизонта; даты можно изменить. Для старых целей, у которых нет этих полей, сохраняется первоначальный скользящий календарный период.

### Подсчёт

| Вид цели | Формула основного процента | Пример |
| --- | --- | --- |
| Действия | выполнено / план выполнений | 10 из 12 тренировок = 83% |
| Число растёт | (текущее − старт) / (цель − старт) | от $20k до $100k, сейчас $50k = 38% |
| Число уменьшается | (старт − текущее) / (старт − цель) | от 100 кг до 85 кг, сейчас 93 кг = 47% |
| Двоичная | 0% или 100% по последней отметке | Получены права категории A |

Числовой процент ограничивается интервалом 0–100%. История хранит исходные значения, даже если результат временно ухудшился. Изменение числового целевого значения пересчитывает процент без удаления истории; смена типа измерения очищает **только историю результата этой цели**, сохраняя связанные действия/заметки.

### UI и взаимодействия

- `GoalCreator.vue` использует общую форму `GoalMeasurementFields.vue` для обоих режимов (wizard/quick). Даты и метрики сохраняются через `useGoalDraft` и `useLifeStore`.
- `GoalMetricPanel.vue` показывает основной результат, прогресс действий и сроки; редактирование и историю открывают через компактный `<details>`. Для чисел доступен график датированных замеров и удаление ошибочной записи. Для бинарного результата — переключатель статуса и журнал изменений.
- На `Overview`, в списке целей, карточках сада и боковом фокусе основным процентом является **результат**, если цель его определяет. План действий показывается отдельно в карточках.
- `GoalProgressLabel.vue` централизует подписи, `utils/goalMetrics.ts` — дату, валидацию и выбор последнего замера, `utils/goalProgress.ts` — расчёты.
- Пока **нет** отдельных этапов (`milestones`) и разовых задач — они запланированы на следующую версию. UI по-прежнему работает без серверного API.

### Совместимость

Ключ `localStorage` остаётся `lifeboard:state:v1`, `LifeState.version` — `1`, поэтому переход на новую SPA **не очищает** старые данные. В `restore()` и `importState()` новые поля добавляются опционально, валидируются и не меняют исходные цели пользователя. `resetState()` очищает и журнал замеров. `exportState()` включает все наблюдения; обратный импорт их восстанавливает. Вход, заметки, категории, цитаты и рефлексия остаются прежними. Перед обновлением рекомендуется экспортировать JSON из профиля.

Путь к API: `life-goals` → composable / store → transport adapter. Для NestJS стоит спроектировать `Goal`, `GoalMeasurement` (встроенная схема/JSON поля) и отдельную `GoalMetricEntry`; не привязывать фактический результат к рутинным выполнением.

### Ежедневные и еженедельные проверки результата (v0.15.1)

У измеримых целей (`numeric` / `binary`) есть необязательная настройка `LifeGoal.checkin: GoalCheckinSchedule`:

```ts
type GoalCheckinFrequency = 'off' | 'manual' | 'daily' | 'weekly';
interface GoalCheckinSchedule {
  frequency: GoalCheckinFrequency;
  weekday?: number;  // 1=понедельник, 7=воскресенье; только weekly
  fromDate: string;   // YYYY-MM-DD, дата начала работы расписания
}
```

- Для новой измеримой цели по умолчанию включается **еженедельная проверка по воскресеньям**. Тип `activity` не создаёт проверки.
- При первом открытии старых числовых/бинарных целей без настройки расписание и дата активации добавляются автоматически. Локальное состояние сохраняется сразу, чтобы просроченная проверка не исчезла при перезагрузке.
- В `Today` показывается **самая ранняя невыполненная проверка по каждой цели** и счётчик остальных просроченных периодов. Смена недели не убирает просрочку, завершение предыдущей открывает следующую.
- `updated`: для числовой цели сохраняет новый `GoalMetricEntry` текущей датой, для бинарной — отметку `1` (достигнуто); вместе с ним создаётся `GoalCheckin`.
- `unchanged`: отмечает проверку выполненной **без** нового замера, `skipped`: сознательно пропускает период, также без замера.
- Если фактический результат достиг 100%, новые проверки не предлагаются до изменения результата. Для `manual` и `off` напоминания в Today не выводятся, но ручное изменение метрики через карточку цели остаётся доступным.
- Отметка проверки никогда напрямую не меняет основной процент достижения цели, независимо от выбранного действия. Процент меняется только при сохранении нового значения результата.

Запись проверки в состоянии — самостоятельная сущность:

```ts
interface GoalCheckin {
  id: string;
  goalId: string;
  dueDate: string;       // YYYY-MM-DD — назначенный день, в том числе просроченный
  completedAt: string;   // ISO timestamp фактической отметки
  status: 'updated' | 'unchanged' | 'skipped';
  metricEntryId?: string;
}
```

Массив `LifeState.goalCheckins` экспортируется в JSON вместе с `goalMetricEntries`; старые бэкапы без него импортируются как раньше. Уникальная бизнес-сущность — `(goalId, dueDate)`; повторная отметка периода отвергается. Новый замер и отметка проверки записываются одним атомарным обновлением локального snapshot. При смене типа измерения и при удалении цели её проверки удаляются. При смене расписания новая дата активации предотвращает создание просрочек задним числом.

Файлы: `utils/goalCheckins.ts` (расчёт дат и просрочки), `goalCheckinI18n.ts` (RU/EN/DE), `components/checkins/GoalCheckinsPanel.vue`, `goal-checkins.css`, `composables/useGoalDraft.ts`, `components/goals/GoalMeasurementFields.vue`. Тесты: `utils/goalCheckins.test.ts` и `stores/useLifeStore.test.ts`.

Для будущего NestJS API потребуется отдельная таблица `goal_checkins`, а не расширение `goal_metric_entries`: «Без изменений» не является замером.

## 9. Заметки и цитаты

**Заметки:** `LifeNote` и `LifeNoteGroup`. Карточки могут быть связаны с целью и группой. При удалении группы заметки не удаляются. Фото сжимается в браузере и сохраняется как data URL — временное решение с ограничением `localStorage`.

**Цитаты:** 11 системных записей RU/EN/DE в `data/seed.ts`, с автором, источником и переводами. Размещение цитат разрешено **только** для `dashboard` и `review`. Пользователь может выбирать существующую цитату, но не добавлять/редактировать каталог. При импорте старого бэкапа пользовательские цитаты перемещаются в `archivedUserQuotes`, не теряются молча.

## 10. Helper: интерфейс и локальный мок

Иконка Helper — **одна плавающая кнопка** на desktop и mobile. В хедере кнопки нет.

- `components/JakkLauncher.vue` — видимость кнопки и состояние диалога;
- `components/jakk/JakkChat.vue` — сообщение, аватар, действия, поле ввода;
- `components/jakk/types.ts` — `Author`, `ChatMessage`;
- `components/jakk/translations.ts` — локализация и подписи;
- `composables/useJakkChat.ts` — логика отправки, editing/reply, demo-reply, хранение и scroll-to-bottom;
- `shared/composables/useStoredState.ts` — повторно используемая типизированная запись локальных данных.

Чат **не использует AI API**. Демо-ответы формируются локально по ключевым словам и некоторым метрикам из `useLifeStore`. Видимость зависит от `useUiPreferencesStore.showJakk` и cookie `lb_jakk_visible`. При отключении в профиле текущая модалка закрывается, а launcher исчезает.

При миграции в backend отделить транспорт от UI: `send/edit/delete/subscribe` — абстрактный интерфейс, серверная авторизация и API-запросы. Не копировать без разрешения код приватного корпоративного UI-kit.

## 11. Overlay, scroll lock и работа фокуса

`shared/components/Overlay/AppOverlayDialog.vue` — Teleport-окно с `role="dialog"`, `aria-modal`, закрытием Escape/кликом по подложке, удержанием Tab и возвратом фокуса.

`shared/composables/useBodyScrollLock.ts` запрещает прокрутку фоновой страницы, **не запрещая скролл внутреннего `.lb-jakk-messages`**. При открытии фиксирует позицию страницы, восстанавливает её при закрытии, учитывает вложенные диалоги и освобождает lock при unmount.

Не применяйте `document.body.style.overflow` напрямую в других модалках, иначе эффекты будут конфликтовать. Для естественного скролла сообщения имеют `overflow-y:auto` и `overscroll-behavior:contain`.

## 12. Дизайн, CSS и темы

Порядок подключения в `src/index.css` определяет каскад:

1. `core/constants/tokens.css`, Tailwind;
2. `modules/lifeboard/lifeboard.css` — базовая сетка, карточки, навигация;
3. `modules/lifeboard/lifeboard-ui.css` — расширенные компоненты;
4. `shared/styles/lifeboard-account.css` — авторизация и профиль;
5. `shared/styles/lifeboard-theme.css` — **единый консолидированный слой** тем, responsive, Jakk и исправлений.

Прежние разрозненные файлы `lifeboard-mature.css`, `lifeboard-vibrant.css`, `lifeboard-v012.css`, `lifeboard-v013.css` удалены. Также удалены правила от старых, больше не используемых компонентов. Основные размеры в CSS переведены в `rem`, тонкие границы `1px` оставлены для чёткости.

Темы (`useThemeStore`): `forest`, `dark`, `orange`; языки: RU/EN/DE. Бренд — строгий блокнот без лица; loader использует анимацию письма и отметки задачи; анимации отключаются при `prefers-reduced-motion`.

Не вводите новые `v014.css` / `v015.css`: добавляйте стили рядом с действующим блоком, переиспользуйте custom properties, проверяйте mobile и dark-тему.

## 13. Локализация

UI Lifeboard: `src/modules/lifeboard/i18n.ts`. Чат: `components/jakk/translations.ts`. В `ProfileView` пока остаются небольшие локальные словари интерфейсных настроек. Общий язык берётся из `useSettingsStore.currentLang`.

При добавлении каждой пользовательской строки обеспечьте RU/EN/DE. Не следует подменять английским ошибки/лейблы в русской или немецкой теме.

## 14. Резервные копии и миграции

`useLifeBackup` экспортирует `LifeState` в JSON. Он включает цели, метрики, историю датированных замеров, задачи, отметки, категории, заметки с фото, рефлексию, системные цитаты и архив ранее пользовательских цитат. **Моковая история Helper и профиль не входят в JSON**.

Перед деплоем: Профиль → скачать JSON → проверить файл → обновить контейнер. Обновление SPA само по себе не трогает `localStorage`, но очистка сайта/браузера удалит локальные записи. Импорт требует подтверждения замены текущих данных.

## 15. Проверки и тестирование

```bash
yarn build
yarn test:lifeboard
yarn test:unit
```

Проверять вручную после крупного обновления:

1. Локальные вход и выход, никнейм, фото, три языка/темы.
2. Создание и редактирование цели в обоих режимах; числовое увеличение/снижение, бинарный результат, фиксированные даты, история замеров, привязка к родителю, защита от циклов.
3. Отметки задач, статистика за неделю, недельный разбор, импорт/экспорт JSON.
4. Заметки с фотографиями, группами и поиском.
5. Системные цитаты и размещение только на Overview и Reflection.
6. Helper: одна плавающая кнопка на desktop/mobile; настройка скрытия; сохранение чата, reply/edit/delete.
7. **Открыть Helper, прокрутить внутри диалога, убедиться, что фон страницы неподвижен, закрыть и проверить исходную позицию скролла.**
8. Узкие экраны (320/375/430 CSS px), обычный desktop; Safari/Chrome; `prefers-reduced-motion`.

Если видите `VM... reportAllChanges ... startTime` без кадров вашего `src/` или сборки, сперва проверьте Chrome DevTools/расширения. Это известная проблема внедрённого `web-vitals` скрипта при SPA soft navigation; не добавляйте перехватчик исключения в приложение. См. https://github.com/GoogleChrome/web-vitals/issues/792

В окружении подготовки v0.15 отсутствуют установленные Vue/Vite-зависимости. Доменная логика `goalMetrics.ts` и `goalProgress.ts` проверена TypeScript и исполняемыми тестовыми сценариями Node.js; Vue-шаблоны и полный Vite bundle необходимо дополнительно проверить через `yarn build` / Docker на целевой машине.

## 16. Docker и деплой

Файлы: `Dockerfile`, `compose.yaml`, `deploy/nginx.container.conf`. На этапе сборки ставится Yarn lockfile и запускается Vite; Nginx в runtime обслуживает SPA, включая `GET /healthz`.

```bash
docker compose build --no-cache lifeboard
docker compose up -d --no-deps --force-recreate lifeboard
docker compose ps
docker compose logs --tail=80 lifeboard
curl http://127.0.0.1:8080/healthz
```

Для текущего VPS, где фронтенд лежит в **`/opt/lifeboard`**:

```text
/opt/lifeboard/  — исходники фронтенда, Dockerfile и compose.yaml
:8080             — Lifeboard (HTTP; временный демо-порт)
:80               — Budgee (отдельный сервис)
```

Перед обновлением экспортируйте JSON через профиль. ZIP v0.15.1 содержит файлы проекта **в корне архива**, без дополнительной вложенной директории:

```bash
cd /opt/lifeboard
tar -czf /tmp/lifeboard-before-v0151.tgz --exclude=.git --exclude=node_modules --exclude=dist -C /opt/lifeboard .
unzip -o /tmp/Lifeboard-v0.15.1-weekly-checkins.zip -d /opt/lifeboard
cd /opt/lifeboard
docker compose build --no-cache lifeboard
docker compose up -d --no-deps --force-recreate lifeboard
curl http://127.0.0.1:8080/healthz
```

Если Docker сообщает о конфликте имени `/lifeboard`, убедитесь, что контейнер создан текущим Compose-проектом (`docker inspect lifeboard`); сначала согласуйте имена и project labels. Нельзя запускать `docker rm -f lifeboard` без проверки владельца и резервной копии.

Не меняйте общий Nginx/Budgee на `:80`, пока не согласована новая инфраструктура. Перед реальным приёмом паролей, OAuth, ключей и приватных данных нужен **HTTPS**.

## 17. План серверного API (ещё не реализован)

В этом репозитории нет NestJS-модуля или реальных HTTP-эндпоинтов Lifeboard. Следующее — архитектурная цель, **не обещание работающих ручек**:

| Контракт / группа | Домен | Требования |
| --- | --- | --- |
| `auth` | User / Session | Авторизация, refresh/logout, профили, OAuth |
| `goals` | Goal / GoalMeasurement / GoalMetricEntry / GoalCheckin / Category | CRUD, история измерений, расписания и факты check-in, фиксированные сроки, parentId без циклов, доступ только владельцу |
| `routines` | Routine / Completion | Повторение по дням и отдельные факты выполнения |
| `reviews` | WeeklyReview | Итоги недели, агрегаты, история |
| `notes` | Note / NoteGroup | CRUD, изображения отдельно от JSON |
| `quotes` | SystemQuote / Placement | Системный каталог и личные назначения |
| `jakk` | Chat / Message | История, лимиты, transport adapters, AI provider |

До миграции в API нужно определить DTO и схему БД, создать тесты доступа каждого пользователя к своим данным и сценарий безопасного переноса `localStorage` → PostgreSQL. Нельзя просто перенести клиентскую проверку `isAuthenticated` на сервер.

## 18. Безопасность и правила разработки

- Не хранить OpenAI API keys в `VITE_*`, `.env` фронтенда, `localStorage` или browser cookie.
- Не отправлять персональные данные в Helper API без понятного согласия пользователя и политики конфиденциальности.
- Пользовательские файлы проверять на бэкенде (тип, размер, antivirus при необходимости), а не доверять `accept=`.
- Цитаты должны иметь проверяемые ссылки на источник и корректные атрибуции.
- Хранить компактный интерфейс и доступность клавиатуры; кнопки/диалоги должны иметь aria-label.
- Новую логику помещать в store/composable/util, а не дописывать прямо в длинный Vue-файл.
- Не создавать отдельные CSS-файлы под номер версии и не дублировать почти одинаковые селекторы.
- Удалять компонент/файл только после проверки всех импортов и маршрутов.

**Ответственные за изменения:** frontend-команда Lifeboard. API и миграции — следующий этап проекта.
