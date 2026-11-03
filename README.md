# Lifeboard v0.7 — Engineering Handoff / Передача проекта новой команде

> **Статус версии 0.7 (03.11.2026):** работающий **frontend-only прототип**. **НЕ production SaaS.**
>
> **В этом репозитории нет работающего Lifeboard API, NestJS или PostgreSQL.** Разделы 14–17 задают **планируемый контракт** API для следующей команды, а не документируют реализованные endpoint'ы. Никаких реальных платежей, OAuth-привязок и AI-запросов сейчас нет.
>
> **Первое действие нового разработчика:** прочитайте разделы **1, 4, 5, 8, 10, 12 и 18**; затем запустите `yarn install --frozen-lockfile && yarn dev`.

## Содержание

1. [Продукт и философия](#1-продукт-и-философия)
2. [Статус поставки и границы MVP](#2-статус-поставки-и-границы-mvp)
3. [Карта пользовательских сценариев](#3-карта-пользовательских-сценариев)
4. [Стек и системные требования](#4-стек-и-системные-требования)
5. [Запуск локально](#5-запуск-локально)
6. [Структура репозитория](#6-структура-репозитория)
7. [Маршрутизация и guard](#7-маршрутизация-и-guard)
8. [Состояние и браузерное хранение](#8-состояние-и-браузерное-хранение)
9. [Доменная модель](#9-доменная-модель)
10. [Логика целей, связей и фокуса месяца](#10-логика-целей-связей-и-фокуса-месяца)
11. [Дизайн-система, темы, языки и доступность](#11-дизайн-система-темы-языки-и-доступность)
12. [Резервные копии и миграция пользовательских данных](#12-резервные-копии-и-миграция-пользовательских-данных)
13. [Docker и эксплуатация](#13-docker-и-эксплуатация)
14. [API: принципы и формат](#14-api-принципы-и-формат)
15. [API: ожидаемые ресурсы и эндпоинты](#15-api-ожидаемые-ресурсы-и-эндпоинты)
16. [API: примеры запросов и ответов](#16-api-примеры-запросов-и-ответов)
17. [AI-Консалт: будущая интеграция](#17-ai-консалт-будущая-интеграция)
18. [Тестирование, QA и критерии приёмки](#18-тестирование-qa-и-критерии-приёмки)
19. [Ограничения, риски и технический долг](#19-ограничения-риски-и-технический-долг)
20. [Ссылки и onboarding](#20-ссылки-и-onboarding)
21. [Заметки: функционал, хранение и ограничения](#21-заметки-функционал-хранение-и-ограничения)
22. [Notes API: предлагаемая серверная спецификация](#22-notes-api-предлагаемая-серверная-спецификация)
23. [QA-регрессия версии 0.6](#23-qa-регрессия-версии-06)
24. [Обновление 0.7: UX и ограничение длинного сада](#24-обновление-07-ux-и-ограничение-длинного-сада)
25. [Рефакторинг и организация модулей](#25-рефакторинг-и-организация-модулей)
26. [Регрессия и восстановление после деплоя](#26-регрессия-и-восстановление-после-деплоя)

---

## 1. Продукт и философия

**Lifeboard** — личная операционная система для управляемого развития: цели → этапы → регулярные действия → отметки → недельная рефлексия → новые решения. Визуальная метафора — **растущий кактус**: хорошо организованная жизнь растёт постепенно; «сад целей» связывает долгосрочную мечту с конкретными маленькими шагами.

Ценность продукта: помочь человеку **удерживать ясный фокус**, видеть реальный прогресс и менять план без чувства вины за пропуски. Он не должен превращаться в трудоёмкий таск-менеджер или механизм давления на пользователя.

### 1.1 Ключевые продуктовые принципы

1. Пользователь контролирует собственные данные и решения.
2. Доступный интерфейс важнее декоративной анимации; никакого навязчивого глобального параллакса.
3. В фокусе не более **трёх** целей одновременно; остальные цели сохраняются.
4. Связи целей — **ориентированный граф без циклов**, в текущей модели у каждой цели не более одного родителя.
5. AI-консультант в будущем **предлагает**, а не тайно применяет изменения.
6. Полный реальный backend и OAuth должны появиться **до** публичного хранения личных данных.

## 2. Статус поставки и границы MVP

| Фича | Статус 0.7 | Где находится |
| --- | --- | --- |
| Dashboard, цели, рутины, календарь | Работает локально | `src/modules/lifeboard/` |
| Недельная рефлексия, графики | Работает локально | `views/LifeReview.vue` |
| Категории и связи родитель/потомок | Работает локально | `useLifeStore.ts` |
| «Сад целей» — интерактивная извилистая тропа | Работает локально | `components/GoalPyramid.vue` |
| Заметки: карточки, группы, фото, связь с целями | Работает локально | `views/LifeNotes.vue`, `components/notes/`, `useLifeStore.ts` |
| «Фокус месяца», вручную до 3 целей | Работает локально | `components/FocusManager.vue` |
| Сохранение через localStorage | Работает локально | `useLifeStore.ts` |
| Профиль, загрузка фото | Работает локально | `modules/profile/` |
| Импорт/экспорт JSON, настройки приватности | Работает локально | `modules/profile/`, `usePrivacyStore.ts` |
| RU / EN / DE | Реализовано для нового Lifeboard; часть legacy может переводиться отдельно | `lifeboard/i18n.ts` |
| Базовая/тёмная/оранжевая темы | Реализованы | `useThemeStore.ts`, CSS tokens |
| AI-Консалт в хедере | **Диалог-заглушка** | `components/AiConsultDialog.vue` |
| Google/GitHub OAuth | **Нет; UI-заглушки** | `modules/profile/` |
| Серверная авторизация/автосессии | **Нет** | Требуется backend |
| NestJS, PostgreSQL, AI LLM API | **Нет** | Предлагается в §14–17 |

### 2.1 Что нельзя обещать пользователю

- Что email-вход означает безопасную аутентификацию: **не означает**.
- Что приватные настройки обеспечивают криптографическую защиту: они меняют **отображение**.
- Что localStorage синхронизируется между браузерами/устройствами: **нет**.
- Что AI-Консалт уже отвечает на вопросы: **не отвечает**.
- Что «настоящие» OAuth-связи подключены: **нет**.

## 3. Карта пользовательских сценариев

### 3.1 Первый вход

1. Пользователь открывает `/` → router guard отправляет на `/login`.
2. При отсутствии локального профиля создаёт профиль на `/register`.
3. Возвращается на `/` и видит seeded-демоданные Lifeboard.
4. Переходит в `/life-goals`, редактирует долгосрочное видение, добавляет цель.
5. Выбирает до трёх приоритетов через кнопку редактирования фокуса в боковом меню (или на странице целей).

### 3.2 Ежедневный цикл

1. Перейти в `/today`.
2. Выбрать дату → увидеть повторяющиеся действия.
3. Отметить чекбокс → состояние сохраняется по ключу «дата + ID действия».
4. На `/` и `/life-review` обновляется статистика.

### 3.3 Работа с иерархией

1. Создать цель (кнопка прокручивает к форме).
2. Указать горизонт, категорию, родителя через `PrimeVue <Select filter>`.
3. На «Саде целей» выбрать карточку: подсвечиваются её связи.
4. С правой панели перейти к полным деталям цели или добавить цель нового уровня.
5. Изменить родителя в карточке цели; циклы запрещены.

### 3.4 Конфигурация

- Хедер → иконка темы/языка → компактный popover.
- Хедер → `ИИ-Консалт` → `Dialog` с `<InDevelop />`.
- User menu → `/profile` → фото, профиль, privacy, экспорт/импорт.

## 4. Стек и системные требования

| Слой | Технология |
| --- | --- |
| SPA | Vue 3, TypeScript |
| Build | Vite 8 |
| Router | Vue Router |
| Local state | Pinia |
| UI | PrimeVue 4, Bootstrap Icons, Tailwind CSS 4 |
| Локализация | `src/modules/lifeboard/i18n.ts`, `useSettingsStore`, Vue I18n (legacy) |
| PWA | `vite-plugin-pwa` (service worker может кэшировать старую версию) |
| QA | Vitest, Cypress (уже имеются зависимости и часть тестов) |
| Static hosting | Nginx в Docker |

- Рекомендуемая Node.js **22.12+**; конкретная совместимость зависит от актуальных версий Vite и lockfile.
- Пакетный менеджер: **Yarn 1.22.22**, зафиксирован в `package.json`.
- Основной исходник: `src/`; alias `@` указывает на `src/`.

## 5. Запуск локально

### 5.1 Клонирование и зависимости

```bash
git clone <repository-url>
cd budgee-lifeboard-src
corepack enable
corepack prepare yarn@1.22.22 --activate
yarn install --frozen-lockfile
```

> `<repository-url>` должен предоставить владелец: в поставке ZIP нет настроенного Git remote.

### 5.2 Development

```bash
yarn dev
# открывается http://localhost:8080
```

### 5.3 Production build

```bash
yarn build
# проверка файлов в dist/
```

### 5.4 Тесты

```bash
yarn test:lifeboard
# или
yarn test:unit
```

Запуск `test:unit` с `--coverage` требует полноценной установки devDependencies. Исправления кода не должны опираться только на отсутствие TypeScript parser errors — нужна реальная сборка и проверка UI в браузере.

### 5.5 Env

Текущему frontend-only приложению не нужен секретный `.env`. **Не добавляйте OPENAI_API_KEY, DATABASE_URL, JWT_SECRET в `VITE_*`** — значения `VITE_*` встраиваются в публичный фронтенд.

## 6. Структура репозитория

```text
budgee-lifeboard-src/
├── Dockerfile                # multistage frontend build → nginx
├── compose.yaml             # только сервис lifeboard, host 8080 → container 80
├── deploy/nginx.container.conf
├── vite.config.ts           # alias @, PWA, Vitest
├── package.json / yarn.lock
├── public/                  # favicon и статические файлы
├── src/
│   ├── main.ts              # createApp, Pinia, router guard, PrimeVue
│   ├── App.vue              # выбирает life/auth/legacy layout
│   ├── index.css            # tokens + global styles
│   ├── core/                # i18n и тема PrimeVue
│   ├── modules/
│   │   ├── lifeboard/
│   │   │   ├── components/
│   │   │   │   ├── LifeShell.vue         # sidebar/header/mobile nav
│   │   │   │   ├── GoalPyramid.vue       # «Сад целей»
│   │   │   │   ├── FocusManager.vue      # редактирование приоритетов
│   │   │   │   ├── AiConsultDialog.vue   # AI-заглушка
│   │   │   │   └── LifeTask.vue          # отметка выполнения
│   │   │   ├── stores/useLifeStore.ts    # доменная логика + localStorage
│   │   │   ├── views/                  # Dashboard/Today/Goals/Review
│   │   │   ├── date.ts / date.test.ts
│   │   │   ├── types.ts / router.ts / i18n.ts
│   │   │   └── lifeboard.css
│   │   ├── profile/views/ProfileView.vue
│   │   ├── auth/                     # локальная регистрация/вход
│   │   └── ...                       # унаследованные finance-модули Budgee
│   └── shared/
│       ├── components/
│       │   ├── Brand/                 # логотип и кактус SVG
│       │   ├── Theme/                 # LifePreferences
│       │   ├── Auth/ / User/ / Breadcrumbs/
│       │   └── InDevelop.vue
│       ├── stores/                    # auth/theme/settings/privacy
│       └── styles/
└── README.md
```

**Разделение ответственности:**

1. `shared/` — универсальные UI-примитивы, общие stores и стили.
2. `modules/lifeboard/` — бизнес-логика Lifeboard и его экраны.
3. `modules/profile/` — управление локальным профилем и резервными копиями.
4. `modules/auth/` — временная локальная заглушка.
5. Legacy Budgee — не трогать при небольших улучшениях Lifeboard.

## 7. Маршрутизация и guard

| URL | Экран | Layout | Доступ |
| --- | --- | --- | --- |
| `/` | LifeDashboard | `life` | локальная «сессия» |
| `/today` | LifeToday | `life` | локальная «сессия» |
| `/life-goals` | LifeGoals | `life` | локальная «сессия» |
| `/life-review` | LifeReview | `life` | локальная «сессия» |
| `/profile` | ProfileView | `life` | локальная «сессия» |
| `/login` | LoginView | `auth` | без локальной сессии |
| `/register` | RegisterView | `auth` | без локальной сессии |
| `/money` | redirect → `/dashboard` (legacy) | legacy | зависит от legacy guard |

Маршруты Lifeboard описаны в `src/modules/lifeboard/router.ts`. `main.ts` регистрирует все маршруты и проверяет `to.meta.requiresAuth`. **Это только client-side guard, не механизм безопасности.** Хлебные крошки берут метаинформацию из `route.matched`; переводы для life-маршрутов выполняет `AppBreadcrumbs.vue`.

## 8. Состояние и браузерное хранение

### 8.1 Единственный источник истины для целей

`src/modules/lifeboard/stores/useLifeStore.ts`:

```ts
const STORAGE_KEY = 'lifeboard:state:v1';
```

Store содержит `goals`, `routines`, `checks`, `reviews`, `vision`, `categories`, `focusGoalIds`. Изменения синхронно сериализуются в `localStorage` через deep `watch`.

> `version: 1` — **версия JSON-схемы**, а не версия продукта. Номер ключа не меняли ради совместимости с экспортами v0.4.

### 8.2 Другие ключи

| Ключ | Что хранит | Где |
| --- | --- | --- |
| `lifeboard:state:v1` | JSON целей, привычек, обзоров, фокуса | localStorage |
| `lifeboard:local-profile:v1` | Имя/email/bio/аватар | localStorage |
| `lifeboard:local-session:v1` | Локальный идентификатор сеанса | sessionStorage |
| `theme:<userId>` | Выбранная тема | localStorage |

Для privacy и settings см. `usePrivacyStore.ts`, `useSettingsStore.ts`: ключи объявлены непосредственно в stores. Не меняйте их без миграции.

### 8.3 Последствия

- Данные остаются только в **этом браузере + origin** (`http://IP:8080` != `https://domain`).
- Очистка данных сайта удаляет цели и локальный профиль.
- Устройство/другой браузер не увидит старые записи.
- Окно инкогнито и другой пользователь на том же компьютере — отдельные сценарии; настоящего multi-user isolation нет.
- Несколько вкладок могут перезаписать локальный state — **нет синхронизации по BroadcastChannel**.

## 9. Доменная модель

Типы: `src/modules/lifeboard/types.ts`.

### 9.1 `LifeGoal`

| Поле | Тип | Назначение |
| --- | --- | --- |
| `id` | `string` | UUID |
| `areaId` | `string` | Категория |
| `title` | `string` | Название цели |
| `description` | `string` | Причина/описание |
| `horizon` | `'month' \| 'quarter' \| 'year' \| 'five-years'` | Горизонт |
| `target` | `number` | Плановое число действий за период |
| `parentId?` | `string \| null` | Родительская цель |
| `createdAt` | `string` | ISO timestamp |

### 9.2 `LifeRoutine`

`id`, `goalId`, `title`, `description`, `time` (`HH:mm`), `durationMinutes`, `days` (ISO-порядок: понедельник **1**, воскресенье **7**).

### 9.3 `Completion` / `checks`

```json
{
  "2026-11-03|routine-uuid": true
}
```

Отсутствующее значение означает «не сделано». Key уникален по календарной дате пользователя и routineId. При переходе на API **обязателен уникальный индекс** `(user_id, routine_id, date)`.

### 9.4 `WeeklyReview`

`weekStart` (`YYYY-MM-DD`, понедельник), `wins`, `obstacles`, `nextStep`, `mood` (1–10), `updatedAt`.

### 9.5 `LifeArea` / категория

`id`, `name`, `icon`, `accent`, `subtle`. Встроенные категории в `lifeAreas`, пользовательские — в `state.categories`. Встроенные нельзя удалить; пользовательскую нельзя удалить, пока на неё ссылается цель.

### 9.6 `focusGoalIds`

Массив не более **трёх** идентификаторов существующих целей. В версии 0.5 впервые сохраняется явно; в ранее созданных бэкапах поле отсутствует и инициализируется из первых трёх месячных целей.

## 10. Логика целей, связей и фокуса месяца

### 10.1 Декомпозиция

1. Цель может иметь одного `parentId`.
2. `canSetParent(goalId, parentId)` не допускает ссылку на себя и цикл, поднимаясь по предкам.
3. `setGoalParent` возвращает `false` для недопустимой связи.
4. Удаление родительской цели **не удаляет дочерние**: они отсоединяются (`parentId = null`).
5. Визуализация `GoalPyramid.vue` показывает горизонты (5 лет / год / квартал / месяц) и выделяет **реальных** предков/прямых детей выбранной цели. Совпадение по горизонту само по себе **не означает** связь.
6. Нажатие на карточку меняет выделение и путь справа; `Открыть карточку` прокручивает страницу к соответствующей цели. Кнопка `+` на уровне открывает форму с предварительно выбранным горизонтом, а выбранная цель становится родителем **только если она выше по горизонту**.

### 10.2 Фокус месяца

1. Отредактировать: иконка карандаша в боковой панели рядом с «Фокус месяца» или отдельная кнопка на странице целей.
2. `FocusManager.vue` показывает список целей и выделенные приоритеты.
3. `toggleFocus` добавляет/удаляет цель; больше трёх выбрать нельзя.
4. Фокусные цели появляются в сайдбаре, Dashboard и недельной аналитике.
5. При удалении цели она удаляется из фокуса.
6. Пустой фокус допустим и обрабатывается интерфейсом.

### 10.3 Расчёт прогресса

`goalStats(goal)` подсчитывает количество выполненных чеков **только по собственным routineId цели** за период `horizon`, делит на `target`, обрезает сверху до 100%. `taskStats(date)` учитывает активные по дню недели действия. `weekStats` суммирует 7 дат текущей выбранной недели. **Прогресс родительской цели пока не агрегирует прогресс детей** — это продуктовый вопрос для будущей версии.

## 11. Дизайн-система, темы, языки и доступность

### 11.1 Файлы

- `src/core/constants/tokens.css` — CSS semantic tokens для forest/dark/orange.
- `src/modules/lifeboard/lifeboard.css` — стили Lifeboard, «сада», AI и focus modal.
- `src/shared/styles/lifeboard-account.css` — brand/auth/preferences/profile.
- `src/shared/components/Brand/LifeboardMascot.vue` — SVG кактус.
- `src/shared/components/Theme/LifePreferences.vue` — компактный popover, общий для устройств.

### 11.2 Темы

1. `forest` — базовая зелёная.
2. `dark` — тёмная с корректной контрастностью.
3. `orange` — спокойная тёплая.

Текущую тему сохраняет `useThemeStore`. Не задавайте хардкод `background:#fff` для блоков Lifeboard: используйте `var(--life-surface)`, `var(--life-text)`, `var(--life-border)`, `var(--life-primary)` и соответствующие `--color-*` для PrimeVue.

### 11.3 Локализация

`useLifeI18n()` предоставляет:

```ts
const { t, lang, locale, titleFor, descriptionFor, setLanguage } = useLifeI18n();
```

Языки: `ru`, `en`, `de`. Для всех новых UI-строк обязательно добавьте ключи в три ветки `dictionary` в `src/modules/lifeboard/i18n.ts`. Legacy-модули используют Vue I18n; при миграции языка лучше консолидировать словари.

### 11.4 Доступность/анимации

- Интерактивные элементы — `<button>`, `<Select>`, `<Dialog>` с подписями.
- Для критичных действий — подтверждение пользователя.
- Предпочтение `prefers-reduced-motion: reduce` уважается CSS.
- Нет полного параллакса: приоритет — читаемость, плавный мобильный скролл и доступность.
- После изменения UI проверяйте клавиатуру, focus visible, экран 320–390 px и Safari.

## 12. Резервные копии и миграция пользовательских данных

### 12.1 Экспорт

1. Откройте `/profile`.
2. Найдите раздел «Резервная копия».
3. Нажмите **«Скачать JSON»**.
4. Файл содержит **состояние целей**, а **не** аватар, email, браузерные preference-секреты и legacy Budgee.

### 12.2 Импорт

1. Создайте backup текущего состояния.
2. Выберите JSON в `/profile`.
3. Подтвердите замену.
4. `importState` проверяет базовую структуру и импортирует `state.version === 1`.
5. При отсутствии `focusGoalIds` список восстанавливается из месячных целей.

### 12.3 Миграция v0.4 → v0.5

- Ключ `lifeboard:state:v1` **не меняется**.
- Категории и `parentId` сохраняются.
- Новое поле `focusGoalIds` необязательно и восстанавливается при загрузке старых данных.
- Не очищайте `localStorage` и service worker cache одновременно — очистка хранилища удаляет цели.

## 13. Docker и эксплуатация

### 13.1 Текущая схема

```text
Internet → http://VPS_IP:8080 → Docker lifeboard:0.5 → Nginx:80 → dist/
                                      ↑
                           отдельный контейнер Budgee на host :80 не затрагивается
```

`compose.yaml` содержит только сервис `lifeboard`:

```yaml
services:
  lifeboard:
    build:
      context: .
      dockerfile: Dockerfile
    image: lifeboard:0.5
    container_name: lifeboard
    restart: unless-stopped
    ports:
      - "8080:80"
```

### 13.2 Запуск/пересборка на VPS

Распаковывать ZIP **в `/opt/lifeboard`**: внутри ZIP должна быть папка `budgee-lifeboard-src/`.

```bash
# Перед деплоем экспортируйте JSON на устройстве!
cd /opt/lifeboard
sudo cp -a budgee-lifeboard-src backup-before-v05
sudo unzip -o /tmp/Lifeboard-v0.5-ui.zip -d /opt/lifeboard
cd /opt/lifeboard/budgee-lifeboard-src
sudo docker compose build --no-cache lifeboard
sudo docker compose up -d --no-deps --force-recreate lifeboard
sudo docker compose ps
curl http://127.0.0.1:8080/healthz
```

Ожидаемый health-check: текст `ok`.

### 13.3 Диагностика

```bash
sudo docker compose logs --tail=100 lifeboard
sudo docker ps --filter name=lifeboard
sudo docker exec lifeboard ls -la /usr/share/nginx/html
sudo docker image ls lifeboard
```

Если видите **старую версию**:

1. `grep -n 'lb-growth' src/modules/lifeboard/lifeboard.css` — проверка новых исходников.
2. `unzip -l /tmp/Lifeboard-v0.5-ui.zip | head -30` — проверка содержимого ZIP.
3. `sudo docker compose build --no-cache lifeboard` — отмена cache образа.
4. `sudo docker compose up -d --no-deps --force-recreate lifeboard`.
5. Приложение PWA: **Application → Service Workers → Unregister** и очистка **только Cache Storage** (не Local Storage с целями).

### 13.4 Rollback

```bash
cd /opt/lifeboard
# СНАЧАЛА проверьте бэкап и не удаляйте данные пользователя
sudo cp -a backup-before-v05/. budgee-lifeboard-src/
cd budgee-lifeboard-src
sudo docker compose up -d --build --force-recreate lifeboard
```

### 13.5 Безопасность деплоя

При реальном пользовательском auth **обязателен HTTPS**; нынешний HTTP по IP пригоден только для тестового frontend-прототипа без секретов. После появления API/Postgres не открывать порты базы и NestJS наружу; маршрутизировать `/api` через HTTPS reverse proxy.

## 14. API: принципы и формат

> **СПЕЦИФИКАЦИЯ БУДУЩЕГО БЭКЕНДА — НЕ РЕАЛИЗОВАНО В v0.5.**

### 14.1 Рекомендуемая архитектура

- `apps/web` — существующий Vue 3.
- `apps/api` — NestJS; auth, users, goals, routines, checkins, reviews, ai.
- PostgreSQL + миграции TypeORM.
- REST JSON под `/api/v1`.
- После появления backend список endpoints ниже необходимо утвердить OpenAPI-файлом и синхронизировать с клиентом.

### 14.2 Правила API

1. Все запросы JSON; HTTPS; UTF-8.
2. ID — UUID; дата без времени — `YYYY-MM-DD` по **часовому поясу пользователя**.
3. Аутентификация через защищённую `HttpOnly; Secure; SameSite` cookie server session (или другой согласованный безопасный механизм).
4. Никогда не принимать `userId` от клиента для доступа к приватным ресурсам — брать из сессии.
5. Валидация входных DTO на сервере, запрет лишних полей.
6. `POST` — создание; `GET` — чтение; `PATCH` — частичное изменение; `DELETE` — удаление.
7. Клиент не должен хранить секретные API-ключи.
8. `429` на rate limiting; `401` для отсутствующего входа; `403` для запрета действия; `404` без утечки данных другого пользователя; `409` при конфликте; `422`/`400` при неверном DTO.

### 14.3 Предлагаемый формат ошибки

```json
{
  "error": {
    "code": "INVALID_PARENT_GOAL",
    "message": "Parent relationship would create a cycle",
    "details": { "field": "parentId" },
    "requestId": "trace-id"
  }
}
```

### 14.4 Рекомендуемая авторизация

- Пароли хешировать через `argon2id` или безопасную актуальную альтернативу.
- Сессии/refresh cookies по HTTPS; CSRF-защита по выбранной cookie-стратегии.
- Строгое ограничение количества попыток логина и AI-запросов.
- OAuth Google/GitHub только с серверной обработкой `state`, PKCE где применимо и подтверждением принадлежности аккаунтов.
- Журналы не должны содержать raw password, AI key, cookie и полные персональные тексты.

## 15. API: ожидаемые ресурсы и эндпоинты

> Это **предлагаемый план интеграции**, его ещё нужно реализовать и покрыть контрактными тестами.

| Группа | Метод | Путь | Назначение |
| --- | --- | --- | --- |
| Auth | POST | `/api/v1/auth/register` | Создать пользователя |
| Auth | POST | `/api/v1/auth/login` | Войти, создать сессию |
| Auth | POST | `/api/v1/auth/logout` | Закрыть сессию |
| Auth | GET | `/api/v1/auth/session` | Проверить сессию |
| User | GET | `/api/v1/me` | Получить свой профиль |
| User | PATCH | `/api/v1/me` | Обновить имя/bio/locale/timezone |
| User | POST | `/api/v1/me/avatar` | Загрузить фото с серверной проверкой |
| User | DELETE | `/api/v1/me/avatar` | Удалить фото |
| Categories | GET | `/api/v1/categories` | Список базовых + пользовательских категорий |
| Categories | POST | `/api/v1/categories` | Добавить свою категорию |
| Categories | DELETE | `/api/v1/categories/:id` | Удалить пустую custom-категорию |
| Goals | GET | `/api/v1/goals` | Список своих целей |
| Goals | POST | `/api/v1/goals` | Создать цель |
| Goals | GET | `/api/v1/goals/:id` | Детали одной цели |
| Goals | PATCH | `/api/v1/goals/:id` | Изменить цель/parentId |
| Goals | DELETE | `/api/v1/goals/:id` | Удалить цель, отвязать детей |
| Focus | GET | `/api/v1/focus` | До трёх приоритетов |
| Focus | PUT | `/api/v1/focus` | Атомарно заменить `goalIds[]` |
| Routines | GET | `/api/v1/routines?goalId=...` | Повторяющиеся действия |
| Routines | POST | `/api/v1/routines` | Создать действие |
| Routines | PATCH | `/api/v1/routines/:id` | Изменить параметры |
| Routines | DELETE | `/api/v1/routines/:id` | Удалить действие и отметки |
| Checkins | GET | `/api/v1/checkins?from=YYYY-MM-DD&to=YYYY-MM-DD` | Состояние отметок |
| Checkins | PUT | `/api/v1/checkins/:routineId/:date` | Установить `done` на дату |
| Review | GET | `/api/v1/reviews?weekStart=YYYY-MM-DD` | Данные недели |
| Review | PUT | `/api/v1/reviews/:weekStart` | Создать или обновить weekly review |
| Dashboard | GET | `/api/v1/dashboard?date=YYYY-MM-DD` | Сводка в одной ручке |
| Backups | GET | `/api/v1/me/export` | Экспорт личных данных |
| Backups | POST | `/api/v1/me/import/preview` | Валидировать импорт, показать изменения |
| Backups | POST | `/api/v1/me/import/commit` | Применить подтверждённый импорт |
| AI | POST | `/api/v1/ai/weekly-plan` | Генерация **черновика** недели |
| AI | POST | `/api/v1/ai/weekly-plan/:id/apply` | Применение после подтверждения |
| AI Chat | POST | `/api/v1/ai/conversations` | **Фаза 2**: чат |
| AI Chat | POST | `/api/v1/ai/conversations/:id/messages` | **Фаза 2**: сообщения |

### 15.1 Обязательные правила связей и фокуса

- Parent ID обязан указывать на существующую **собственную** цель пользователя.
- Не допускаются циклические ссылки.
- Можно сделать транзакционный `PATCH /goals/:id {parentId}`.
- `PUT /focus` содержит **0–3 уникальных** goalIds, каждый из которых принадлежит текущему пользователю.
- Нельзя скрывать записи другого пользователя простым фильтром на фронте; проверка обязательно в БД и сервисе.

### 15.2 Предполагаемая схема БД

```text
users(id, email UNIQUE, password_hash, name, bio, locale, timezone, created_at)
user_sessions(id, user_id, expires_at, ...)
areas(id, owner_id NULLABLE, name, icon, accent)
goals(id, user_id, area_id, parent_id NULLABLE, title, description, horizon, target, created_at)
focus_goals(user_id, goal_id, position)     -- не более 3 на user_id
routines(id, user_id, goal_id, title, time, duration_minutes, days JSONB)
checkins(id, user_id, routine_id, date, done, UNIQUE(user_id,routine_id,date))
weekly_reviews(id, user_id, week_start, wins, obstacles, next_step, mood,
               UNIQUE(user_id,week_start))
ai_plan_drafts(id, user_id, state, model, plan JSONB, created_at, applied_at NULLABLE)
```

Нужны индексы `(user_id, created_at)` и `(user_id, goal_id)` по критичным таблицам. В `goals.parent_id` проверка «тот же пользователь» должна быть обеспечена сервисом и, по возможности, ограничениями БД. Рассмотреть `ON DELETE SET NULL` для родителя и каскад/транзакцию для собственных рутин.

## 16. API: примеры запросов и ответов

> **Контракт-пример, не запросы к текущему `:8080`**.

### 16.1 Создать цель

```http
POST /api/v1/goals
Content-Type: application/json
Cookie: session=... 
```

```json
{
  "title": "Свободно говорить по-немецки",
  "description": "Подготовиться к языковой среде",
  "areaId": "area-languages-uuid",
  "horizon": "year",
  "target": 120,
  "parentId": null
}
```

Ответ `201 Created`:

```json
{
  "id": "8a0e33db-17ad-4944-9f1d-e644ec31fdcb",
  "title": "Свободно говорить по-немецки",
  "description": "Подготовиться к языковой среде",
  "areaId": "area-languages-uuid",
  "horizon": "year",
  "target": 120,
  "parentId": null,
  "createdAt": "2026-11-03T19:00:00.000Z"
}
```

### 16.2 Выбрать фокус месяца

```http
PUT /api/v1/focus
Content-Type: application/json
```

```json
{"goalIds": ["8a0e33db-17ad-4944-9f1d-e644ec31fdcb"]}
```

Ответ `200 OK`:

```json
{"goalIds": ["8a0e33db-17ad-4944-9f1d-e644ec31fdcb"], "maxItems": 3}
```

`> 3` → `422` `FOCUS_LIMIT_EXCEEDED`; повтор/чужой ID → `422`/`404`.

### 16.3 Отметить действие

```http
PUT /api/v1/checkins/123e4567-e89b-12d3-a456-426614174000/2026-11-03
Content-Type: application/json
```

```json
{"done": true}
```

Ответ `200 OK`:

```json
{"routineId":"123e4567-e89b-12d3-a456-426614174000","date":"2026-11-03","done":true}
```

Операция должна быть идемпотентной: повтор `PUT done=true` не создаёт второй checkin.

### 16.4 Недельная рефлексия

```http
PUT /api/v1/reviews/2026-11-02
Content-Type: application/json
```

```json
{
  "wins": "Четыре занятия backend",
  "obstacles": "Перегруженный четверг",
  "nextStep": "Перенести упражнение на пятницу",
  "mood": 7
}
```

### 16.5 Генерация черновика AI-недели

```http
POST /api/v1/ai/weekly-plan
Content-Type: application/json
```

```json
{"weekStart":"2026-11-09", "constraints": {"maxAdditionalMinutesPerDay":45}}
```

Предполагаемый ответ `200 OK`:

```json
{
  "id":"draft-uuid",
  "status":"draft",
  "summary":"Снизить нагрузку в четверг",
  "recommendations":["Перенести занятия на пятницу"],
  "actions":[{"goalId":"goal-uuid", "title":"Практика NestJS", "dayOfWeek":5, "time":"19:00", "durationMinutes":45}]
}
```

**Никогда не применять `actions` автоматически.** Сначала экран preview → edit → отдельное подтверждение → `apply`.

### 16.6 Последовательность при миграции frontend → API

1. Добавить `ApiClient` / typed DTO в `shared/api` и session adapter.
2. Добавить backend endpoints для auth и user.
3. Подключить goals/categories/routines/checkins.
4. Реализовать безопасный preview импорта текущего `localStorage`.
5. Только после **успешного** импортирования и подтверждения пользователем переключить источник истины в Pinia.
6. Покрыть контрактные тесты и сценарии двух пользователей.

## 17. AI-Консалт: будущая интеграция

### 17.1 Сейчас

В хедере работает `AiConsultDialog.vue`, открывающий модальное окно с `<InDevelop />`. **Чат пока не функционирует**; никаких ключей/запросов к провайдеру нет.

### 17.2 Целевой сценарий MVP

1. Пользователь просит «Предложи неделю».
2. Backend выбирает **минимально необходимые** цели, rutines, check-ins и weekly review за выбранный период.
3. Формирует структурированный JSON prompt без лишних личных данных.
4. Обращается к OpenAI Responses API с [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).
5. Валидирует ответ, сохраняет черновик, отдаёт preview.
6. Пользователь редактирует и подтверждает перед сохранением.

### 17.3 Необходимые safeguards

- OpenAI API key только на сервере; нельзя помещать его в `VITE_*`.
- Лимиты расходов и запросов на пользователя.
- Защита от prompt injection в пользовательских заметках.
- Чёткое объяснение, какая информация отправляется AI-провайдеру.
- В будущем opt-in для AI; реальное удаление AI-контекста и сохранённых черновиков.
- Не давать модели бесконтрольно выполнять mutations над БД.

## 18. Тестирование, QA и критерии приёмки

### 18.1 Unit-тесты

- `src/modules/lifeboard/stores/useLifeStore.test.ts`
- `src/modules/lifeboard/date.test.ts`
- `src/shared/...` — существующие тесты auth, breadcrumb и проч.

Дополнить сценариями:

1. `focusGoalIds` выбирается и сохраняется; четвёртую цель добавить нельзя.
2. Удаление фокусной цели очищает ссылку.
3. Старый backup v0.4 без `focusGoalIds` корректно импортируется.
4. `canSetParent` защищает от прямых и транзитивных циклов.
5. Настройка языков и тем восстанавливается после обновления.

### 18.2 Smoke-test перед релизом

1. Открыть `/register` и создать локальный профиль.
2. Проверить `/`, `/today`, `/life-goals`, `/life-review`, `/profile`.
3. «Новая цель» → плавный скролл → форма → сохранение.
4. «Сад целей» → выбрать goal → родительская цепочка → переход к карточке → добавить дочернюю цель.
5. Изменить фокус до трёх → UI синхронизирован в сайдбаре/Dashboard → reload.
6. Theme popover в лесной, тёмной и оранжевой теме (360px, 768px, 1440px).
7. Изменить язык RU/EN/DE и перезагрузить страницу.
8. AI кнопка → диалог → закрыть по Esc.
9. Экспорт JSON → сохранение файла → импорт → данные сохранились.
10. Проверить клавиатуру и Reduced Motion.
11. В мобильной версии активная вкладка — не квадрат с фоновой заливкой.
12. Проверить отсутствие overflow-x в Chrome/Firefox/Safari.

### 18.3 Definition of Done для новой фичи

- TypeScript компилируется, Vite build проходит.
- UI отображается в трёх темах и трёх языках.
- Проверены телефон и десктоп.
- Бизнес-логика имеет тесты.
- Записи не теряются после перезагрузки и при импорте старого backup.
- README/API-документация обновлены.

## 19. Ограничения, риски и технический долг

| Приоритет | Проблема | Действие |
| --- | --- | --- |
| **P0** | Не защищённый frontend-local login | NestJS auth + HTTPS до реальных пользователей |
| **P0** | Нет серверного хранения | PostgreSQL + migration + backup/restore |
| **P0** | Данные принадлежат origin/браузеру | Явная миграция и экспорт |
| P1 | Состояние между вкладками может расходиться | BroadcastChannel до backend или централизованный источник истины |
| P1 | `importState` делает базовую, не полную проверку бизнес-инвариантов | Схема zod/JSON schema, валидация всех связей |
| P1 | `goalStats` учитывает только свои routines | Решить политику прогресса родителей |
| P1 | Большой CSS-файл и legacy-стили | Постепенный вынос компонентных стилей, не блокировать MVP |
| P1 | Частичный legacy Budgee (не полностью локализован) | Отделить как модуль после приоритета MVP |
| P2 | Favicon/маскот и brand | Свести цветовые токены и версии SVG |
| P2 | PWA cache | Контролировать update prompt и service-worker lifecycle |

## 20. Ссылки и onboarding

### 20.1 Официальные источники

1. [Vue 3 Guide](https://vuejs.org/guide/introduction.html)
2. [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
3. [Vite — Guide](https://vite.dev/guide/)
4. [Pinia — Introduction](https://pinia.vuejs.org/introduction.html)
5. [Vue Router — Guide](https://router.vuejs.org/guide/)
6. [PrimeVue Select, `filter`, `optionLabel`, `optionValue`](https://v4.primevue.org/select/)
7. [PrimeVue Dialog](https://v4.primevue.org/dialog/)
8. [Tailwind CSS](https://tailwindcss.com/docs/installation)
9. [NestJS fundamentals](https://docs.nestjs.com/first-steps)
10. [NestJS validation](https://docs.nestjs.com/techniques/validation)
11. [NestJS configuration](https://docs.nestjs.com/techniques/configuration)
12. [NestJS TypeORM integration](https://docs.nestjs.com/techniques/database)
13. [PostgreSQL](https://www.postgresql.org/docs/)
14. [Docker Compose](https://docs.docker.com/compose/)
15. [OpenAI Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create)
16. [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
17. [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
18. [Web Content Accessibility Guidelines WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)

### 20.2 План первого дня для нового разработчика

1. Прочитать §1–3: смысл продукта и границы обещаний.
2. Пройти запуск §5.
3. Изучить `LifeShell.vue`, `LifeGoals.vue`, `GoalPyramid.vue`.
4. Пройти store `useLifeStore.ts` и понять модель `checks`.
5. Пройти smoke-тест §18.
6. Сделать личный JSON backup из UI.
7. Создать техническую задачу и ветку; приложить скриншоты RU/EN/DE в 3 темах.
8. Для API-команды: изучить §14–17, согласовать OpenAPI спецификацию **до** написания серверных DTO.

### 20.3 Правила PR

- Одна смысловая задача → один PR.
- Не включать сгенерированные `dist/`, `node_modules/`, `.env` и секреты.
- Обязательно: описание, затронутые маршруты, тест-кейсы, скриншоты мобильный/desktop, миграция данных (если есть), обратная совместимость backup.
- Не удалять старый `lifeboard:state:v1` без явной процедуры импорта.
- Все переводы для новой life-фичи — RU/EN/DE.
- Для новых интерактивных компонентов — клавиатура, aria-label и reduced motion.

---

**Лицензия:** этот проект наследует [AGPL-3.0](LICENSE) исходного Budgee. До открытия коммерческой версии проверить соблюдение условий и авторство внешних ассетов.

**Документ:** Lifeboard Engineering Handoff v0.5 / 2026-11-03. При изменении API пересматривайте §14–17 и обновляйте спецификацию/OpenAPI, а не копируйте таблицы в код без обсуждения.


---

## 21. Заметки: функционал, хранение и ограничения

### 21.1 Пользовательский сценарий

1. Открой `/notes` через левое меню или пятый пункт мобильной навигации.
2. Выбери **«Создать группу»**, укажи название, цвет и при необходимости связанную цель.
3. Нажми **«Новая заметка»**: название, текст, фильтруемая группа, фильтруемая цель, необязательное фото и закрепление.
4. Карточка появится на доске. Нажатие на неё открывает редактор. Иконка булавки закрепляет её в начале списка.
5. Слева выбирается группа; в верхней панели можно искать по названию, тексту или названию группы и отдельно фильтровать по цели.
6. Карточка **без явно указанной цели** наследует отображаемую цель своей группы. Явная цель карточки имеет приоритет.
7. Удаление группы **не удаляет карточки**: они остаются в «Без группы». Удаление цели не уничтожает заметки и группы, а сбрасывает ссылки на неё.
8. Резервное копирование осуществляется через **Профиль → Backup → Download JSON**.

### 21.2 Файлы и ответственность

| Файл | Задача |
| --- | --- |
| `src/modules/lifeboard/views/LifeNotes.vue` | Состояние UI, поиск, фильтры, события, управление диалогами |
| `src/modules/lifeboard/components/notes/NoteCard.vue` | Визуальное представление карточки |
| `src/modules/lifeboard/components/notes/NoteEditor.vue` | Создание и редактирование; `PrimeVue Select filter` |
| `src/modules/lifeboard/components/notes/NoteGroupEditor.vue` | Создание, редактирование, удаление группы, выбор цвета |
| `src/modules/lifeboard/components/notes/useNoteImage.ts` | Проверка типа/размера, компрессия изображений |
| `src/modules/lifeboard/types.ts` | `LifeNote`, `LifeNoteGroup` и `LifeState` |
| `src/modules/lifeboard/stores/useLifeStore.ts` | CRUD, валидации, связи, JSON-экспорт/импорт |
| `src/modules/lifeboard/lifeboard-ui.css` | Адаптивность, компактный UI, сад, заметки и wizard |
| `src/modules/lifeboard/i18n.ts` | Все надписи RU/EN/DE |

### 21.3 Структуры данных

```ts
interface LifeNoteGroup {
  id: string;           // UUID
  name: string;         // 2..55, уникальное имя
  goalId: string | null;// nullable FK на LifeGoal.id
  color: string;        // #RRGGBB
  createdAt: string;    // ISO-8601 UTC
}

interface LifeNote {
  id: string;
  title: string;            // 1..100
  content: string;          // 0..12 000, обычный текст
  groupId: string | null;
  goalId: string | null;    // явная связь; иначе отображается group.goalId
  imageDataUrl: string | null;
  pinned: boolean;
  createdAt: string;        // ISO-8601 UTC
  updatedAt: string;        // ISO-8601 UTC
}
```

`LifeState.version` **не меняется** и остаётся `1`. Поля `noteGroups?: LifeNoteGroup[]` и `notes?: LifeNote[]` необязательны, поэтому резервные копии 0.5 и более ранние корректно импортируются с пустыми массивами заметок.

### 21.4 Фотографии и безопасность локального хранения

- Поддерживаемые типы: JPEG, PNG, WebP. Максимальный исходный файл — 5 МБ.
- Файл сжимается через `<canvas>` в браузере и превращается в JPEG (до 1100 px, снижение качества/разрешения при необходимости).
- Лимит строки результата — 450 000 символов. Это **не** серверный storage: десятки фото быстро исчерпают квоту браузера.
- Сохраняем изображение как `data:image/jpeg;base64,…` в JSON; SVG и произвольные URL в импорте отвергаются.
- Перед `addNote`, `updateNote` и `importState` проверяется фактическая возможность записи полного состояния в `localStorage`. При нехватке памяти операция возвращает `false`/`null`; UI показывает ошибку.
- Бэкап JSON с фотографиями может быть большим, но позволяет перенести заметки между устройствами вручную.
- **Не храните личные секреты в этой версии**: профиль и данные браузера не защищены реальной авторизацией. Выход из локального аккаунта не шифрует заметки.
- Рекомендуемая миграция: исходные изображения в приватный S3-compatible object storage, превью в CDN/прокси, метаданные в PostgreSQL, доступ через авторизованный endpoint или подписанные URL.

### 21.5 Что не реализовано

- Свободное перетаскивание карточек по доске, совместная работа, rich-text/Markdown редактор, теги, история версий, полнотекстовый серверный поиск.
- Отдельная синхронизация заметок и хранилище файлов.
- Автоматическая привязка заметок к целям через AI.

Эти функции не нужны для первого релиза; текущая доска реализует достаточное количество прикладных CRUD-сценариев.

## 22. Notes API: предлагаемая серверная спецификация

> **Внимание:** Ни один из перечисленных endpoint'ов пока не работает. Ниже — контракт для будущего NestJS API, который не должен автоматически считаться реализованной частью v0.6.

### 22.1 Ресурсы и изоляция пользователей

Рекомендованные ресурсы `notes` и `note-groups`, каждый привязан к `userId`. Во всех запросах `userId` определяется из серверной сессии, **не передаётся как доверенное поле клиента**. Проверять принадлежность группы, заметки и цели текущему пользователю при каждом чтении и изменении.

| HTTP | Endpoint | Цель | HTTP-статус |
| --- | --- | --- | --- |
| `GET` | `/api/v1/note-groups` | Список собственных групп | 200 |
| `POST` | `/api/v1/note-groups` | Создать группу | 201 |
| `PATCH` | `/api/v1/note-groups/:id` | Переименовать/перепривязать группу | 200 |
| `DELETE` | `/api/v1/note-groups/:id` | Удалить группу, отвязать карточки | 204 |
| `GET` | `/api/v1/notes?groupId=&goalId=&q=&pinned=&cursor=&limit=` | Фильтрация и пагинация | 200 |
| `GET` | `/api/v1/notes/:id` | Получить заметку | 200 |
| `POST` | `/api/v1/notes` | Создать заметку | 201 |
| `PATCH` | `/api/v1/notes/:id` | Изменить/закрепить/отвязать заметку | 200 |
| `DELETE` | `/api/v1/notes/:id` | Удалить заметку | 204 |
| `POST` | `/api/v1/notes/:id/attachments` | Загрузить фото (multipart) | 201 |
| `DELETE` | `/api/v1/notes/:id/attachments/:attachmentId` | Удалить вложение | 204 |

### 22.2 Рекомендуемый DTO создания заметки

```json
{
  "title": "Книга о NestJS",
  "content": "Изучить dependency injection и guards",
  "groupId": "d59a....",
  "goalId": "backend-goal-id",
  "pinned": false
}
```

Отдельные вложения рекомендуется загружать после создания заметки, **не отправляя base64 в JSON**. При этом backend должен валидировать фактический MIME type, размер, права доступа и хранение, а не доверять filename клиента.

### 22.3 Рекомендуемые таблицы PostgreSQL

```text
note_group
  id UUID PK
  user_id UUID FK -> user.id ON DELETE CASCADE
  goal_id UUID NULL FK -> goal.id ON DELETE SET NULL
  name VARCHAR(55)
  color CHAR(7)
  created_at TIMESTAMPTZ
  UNIQUE(user_id, LOWER(name)) -- через функциональный уникальный индекс

note
  id UUID PK
  user_id UUID FK -> user.id ON DELETE CASCADE
  group_id UUID NULL FK -> note_group.id ON DELETE SET NULL
  goal_id UUID NULL FK -> goal.id ON DELETE SET NULL
  title VARCHAR(100)
  content TEXT
  pinned BOOLEAN DEFAULT FALSE
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ
  INDEX(user_id, updated_at DESC)

note_attachment
  id UUID PK
  note_id UUID FK -> note.id ON DELETE CASCADE
  object_key TEXT
  media_type VARCHAR(40)
  size_bytes INT
  created_at TIMESTAMPTZ
```

Проверки доступа должны гарантировать, что ссылки на `goalId` и `groupId` принадлежат тому же владельцу. Удаление группы/цели **не должно удалять заметки**.

### 22.4 Ответ пагинации (предложение)

```json
{
  "items": [
    {
      "id": "f825...",
      "title": "Интересная мысль",
      "content": "...",
      "groupId": null,
      "goalId": null,
      "pinned": true,
      "attachments": [],
      "createdAt": "2026-11-03T00:00:00Z",
      "updatedAt": "2026-11-03T00:00:00Z"
    }
  ],
  "nextCursor": null
}
```

## 23. QA-регрессия версии 0.6

### 23.1 Обязательная проверка desktop

- Открыть приложение в браузере (1366×768, 1440×900) и проверить три цветовые темы.
- Вызвать ИИ-Консалт на длинной странице: не должно быть горизонтального скачка из-за скроллбара.
- Dashboard: круг процента, кактус и мини-показатели не перекрывают друг друга.
- Garden: S-образная дорожка и выбранные цели читаемы; анимация не мешает кликам.
- Notes: добавить группу, связать с существующей целью, добавить заметку с текстом и фото, закрепить, отредактировать, удалить.
- Сменить язык RU → EN → DE: название меню, формы, ошибки и пустые состояния меняются.

### 23.2 Обязательная проверка mobile

- Проверить ширину 320, 375, 390 и 430 px. Нет горизонтального скролла.
- Внизу видно 5 навигационных пунктов, активная вкладка отличается от остальных.
- Dashboard: круг прогресса и статистика не перекрываются на узких экранах.
- Garden: уровень роста + карточки отображаются вертикально, без обрезания.
- Notes: переключение групп пальцем, поиск, редактор и прикрепление фото доступны.
- Запрос `prefers-reduced-motion: reduce`: дорожка и эффекты карточек останавливаются.

### 23.3 Хранение и восстановление

1. Экспортировать JSON в профиле.
2. Создать заметки/группы, сменить фокус, выполнить действия.
3. Перезагрузить страницу и проверить сохранность.
4. Экспортировать и импортировать состояние на чистый браузер. Убедиться, что текст и фото восстановлены.
5. Удалить группу/цель и убедиться, что заметки не исчезли.
6. Импортировать бэкап v0.5 без полей `notes`/`noteGroups`; приложение продолжает работать.
7. Попробовать слишком большой файл и убедиться, что ошибка показывается, а данные не исчезают.

Сборка: `yarn build`. Unit-тесты: `yarn test:lifeboard`.

> **Исправление упаковки v0.6:** `yarn.lock` включён в архив. Dockerfile с `COPY package.json yarn.lock ./` теперь собирается и в чистой директории, а не только при наложении на ранее развернутый проект.


---

## 24. Обновление 0.7: UX и ограничение длинного сада

### 24.1 Поведение при 30–50 целях

Сад по-прежнему отображает 4 горизонта (5 лет, год, квартал, месяц), но внутри одного горизонта теперь показывается **не более четырёх целей в свернутом состоянии**. Если выбранная цель не попала в первую четвёрку, она замещает последнюю карточку в превью. Раскрытый уровень ограничен по высоте и прокручивается внутри своего контейнера. Человек всегда может увидеть **все** цели в обычном списке ниже сада.

Основные места:

- `src/modules/lifeboard/components/GoalPyramid.vue` — UI, состояние раскрытия уровня.
- `src/modules/lifeboard/utils/gardenPreview.ts` — чистая функция ограничения списка; тесты в `gardenPreview.test.ts`.
- `src/modules/lifeboard/lifeboard-ui.css` — адаптивность 360–1440 px.

Текст о «тропе роста» удалён из UI, физически используемые SVG-линии остались.

### 24.2 Два режима создания цели

**Режим по умолчанию:** wizard из 3 шагов — идея и смысл → горизонт и категория → измеримый результат и родитель.

**Быстрый ввод:** все поля сразу. Переключатель находится в **Профиле → Создание новых целей**.

UI-предпочтение сохраняется в cookie `lb_goal_entry` (`wizard|quick`, 180 дней, `SameSite=Lax`, `Path=/`). Это **только настройка отображения**: в cookies НЕ хранятся ID пользователя, пароли или контент целей.

- `src/modules/lifeboard/components/goals/GoalCreator.vue` — один компонент, оба режима.
- `src/modules/lifeboard/composables/useGoalDraft.ts` — модель формы, валидация, шаги.
- `src/shared/stores/useUiPreferencesStore.ts` — Pinia-store настройки ввода.
- `src/modules/lifeboard/views/LifeGoals.vue` — лишь открывает компонент и передаёт пресеты из сада; скроллит к форме.

### 24.3 HTTP и `crypto.randomUUID`

На `http://SERVER_IP:8080` браузер может не считать origin безопасным, поэтому `crypto.randomUUID()` недоступен. Нельзя напрямую вызывать его в UI или сторах. Вместо этого **везде использовать**:

```ts
import { createId } from '@/shared/utils/createId';
const id = createId();
```

`createId` отдаёт native UUID при наличии; иначе UUID v4 через `crypto.getRandomValues`, а если Web Crypto недоступен полностью — локальный ID с timestamp/counter/random. Последний вариант подходит **только для локальных записей**, но **не для токенов, сессий или криптографии**.

### 24.4 Модалка ИИ-консультанта

`AiConsultDialog.vue` использует общий `shared/components/Overlay/AppOverlayDialog.vue` (Teleport с Escape/закрытием по подложке и возвратом фокуса) вместо PrimeVue Dialog, чтобы избежать компенсации ширины скроллбара через `--p-scrollbar-width` на `body`. **AI остаётся заглушкой**, никакого подключения к LLM нет.

### 24.5 Заметки и JSON

Удалён декоративный постоянный баннер. Фильтр по группе, поиск, сортировка по изменению/названию, привязка к цели и действия по созданию теперь сгруппированы непосредственно в **хедере доски**. Мобильный редактор ограничен высотой viewport; поля и кнопки уплотнены.

В `exportState()` всегда входят `notes` и `noteGroups`, включая `imageDataUrl` из сжатых изображений. Импорт старых `version:1` бэкапов без этих ключей сохраняет совместимость. UI экспорта/импорта — **Профиль**; логика скачивания/чтения вынесена в `useLifeBackup.ts`.

### 24.6 Начальные примеры

Новый локальный профиль: **10 целей, 8 заметок, 3 группы**, **0 выполненных действий**. При обновлении существующего локального профиля **никакие примеры не добавляются**. Чтобы получить образцы, пользователь может нажать «Добавить примеры» в профиле. Операция идемпотентна по идентификаторам, не удаляет существующее содержимое. Стартовые данные вынесены из Pinia в `src/modules/lifeboard/data/seed.ts`.

## 25. Рефакторинг и организация модулей

### 25.1 Что рефакторили

| Было | Стало | Причина |
| --- | --- | --- |
| Прямой вызов `crypto.randomUUID()` в нескольких методах | `shared/utils/createId.ts` | HTTP-совместимость, единый контракт идентификаторов |
| Seed-цели внутри огромного `useLifeStore` | `lifeboard/data/seed.ts` | Стор содержит действия и состояние, а не контент демо |
| Фильтрация/сортировка/CRUD UI в `LifeNotes.vue` | `lifeboard/composables/useNotesBoard.ts` | View отвечает за разметку, composable — за взаимодействия |
| Форма создания цели внутри `LifeGoals.vue` | `components/goals/GoalCreator.vue` + `composables/useGoalDraft.ts` | Единый reusable creator, 2 режима |
| Компенсация прокрутки в PrimeVue AI Dialog | `shared/components/Overlay/AppOverlayDialog.vue` | Глобальный reusable оверлей без блокировки ширины body |
| Код экспорта/импорта в `ProfileView.vue` | `composables/useLifeBackup.ts` | Разделение ответственности |
| Два каскадных отдельных CSS v0.6/v0.7 | `lifeboard-ui.css` | Меньше пересечений, удалено 47 устаревших CSS-правил/селекторов |
| Мёртвые `AuthForm`, `AuthLayout`, `useAuth`, `FormField` | Удалены | Не использовались в актуальном маршрутизаторе; содержали старый mock-auth |

### 25.2 Где хранится состояние

- **Pinia:** `useLifeStore` (доменные данные), `useAuthStore` (пока локальный демо-профиль), `usePrivacyStore` (визуальная приватность), `useThemeStore`, `useSettingsStore`, `useUiPreferencesStore`.
- **localStorage:** данные Lifeboard, настройки темы и языков. Данные заметок и фото требуют аккуратной работы с лимитом браузера.
- **sessionStorage:** только демо-сессия старого прототипа. **Это не защищённая авторизация.**
- **Cookie:** `lb_goal_entry`, только предпочтение отображения wizard/quick. **Никаких паролей или токенов в JS cookie.**

### 25.3 Что намеренно не удалено

В репозитории есть legacy Budgee (`modules/transactions`, `modules/dashboard`, `modules/categories`, `modules/settings`, `modules/demo`). Это **живые маршруты** текущего приложения; удаление их компонентов без замены финансового функционала может сломать `/money` и родственные страницы. Рефакторинг 0.7 сознательно ориентирован на **актуальные модули Lifeboard**. Полный перевод legacy-финансов на новые модели — отдельная задача, требующая продуктового решения и регрессионных тестов.

### 25.4 Дизайн

Новые кнопки используют единый compact-scale: ~32px высота, 11px текст. Wizard живёт в выделенной карточке, не создаёт блокирующей фон модалки. Постоянный параллакс не используется. При `prefers-reduced-motion` переходы отключаются. Базовая/тёмная/оранжевая темы работают через существующие CSS-токены.

### 25.4 Быстрый расчёт прогресса при 30–50 целях

`utils/goalProgress.ts` подсчитывает фактически завершённые действия по ключам `YYYY-MM-DD|routineId` с учётом горизонта цели (месяц, квартал, год, 5 лет). В отличие от исходной реализации, функция **не создаёт календарный массив на несколько лет при каждом рендере карточки**. Доменные тесты: `utils/goalProgress.test.ts`.

## 26. Регрессия и восстановление после деплоя

Полный чеклист: [`docs/QA-v0.7.md`](docs/QA-v0.7.md).

После извлечения ZIP в `/opt/lifeboard`:

```bash
cd /opt/lifeboard/budgee-lifeboard-src
sudo docker compose build --no-cache lifeboard
sudo docker compose up -d --no-deps --force-recreate lifeboard
sudo docker compose ps
curl -fsS http://127.0.0.1:8080/healthz
```

Данные в браузере не удаляются при пересоздании контейнера, **если не менять origin** (протокол/IP/порт) и не очищать `localStorage`. Перед обновлением обязательно экспортировать JSON в профиле. Статический frontend доступен по HTTP для тестирования, но пока не должен использоваться для чувствительных данных.

**Проверка сборки:** разработчик обязан выполнить `yarn install --frozen-lockfile && yarn build` и smoke-test `/notes`, `/life-goals` и ИИ-оверлея в браузере. При ошибке сборки исправить до деплоя; один успешный `/healthz` не подтверждает корректность бизнес-логики.
