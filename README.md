# Lifeboard — frontend 0.14.3

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
8. [Цели и повторяющиеся действия](#8-цели-и-повторяющиеся-действия)
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
│   │   ├── data/seed.ts              # начальные цели, заметки, цитаты
│   │   ├── stores/useLifeStore.ts    # Pinia: цели, привычки, отчеты, заметки
│   │   ├── composables/
│   │   │   ├── useGoalDraft.ts
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

## 8. Цели и повторяющиеся действия

Данные: `LifeGoal`, `LifeRoutine`, `LifeArea`, `WeeklyReview` в `src/modules/lifeboard/types.ts`.

- У цели есть `id`, `areaId`, `title`, `description`, `horizon`, `target`, `parentId`.
- Цели могут ссылаться на родительскую; store не допускает циклических связей.
- Визуальная карта — `GoalPyramid.vue`; большие уровни раскрываются прогрессивно.
- `GoalCreator.vue` поддерживает wizard и quick-режим, настройка в профиле.
- Отметки хранит `checks` в виде `YYYY-MM-DD|routineId → boolean`.
- `useGoalDraft` отвечает за form-state/валидацию, store — за мутации.
- `getGoalProgress` вычисляет прогресс, не создавая по объекту `Date` на каждый день пятилетнего периода.

Путь к API: `life-goals` → composable / store → transport adapter. Смешивать сетевой код и большие Vue-шаблоны не нужно.

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

`useLifeBackup` экспортирует `LifeState` в JSON. Он включает цели, задачи, отметки, категории, заметки с фото, рефлексию, системные цитаты и архив ранее пользовательских цитат. **Моковая история Helper и профиль не входят в JSON**.

Перед деплоем: Профиль → скачать JSON → проверить файл → обновить контейнер. Обновление SPA само по себе не трогает `localStorage`, но очистка сайта/браузера удалит локальные записи. Импорт требует подтверждения замены текущих данных.

## 15. Проверки и тестирование

```bash
yarn build
yarn test:lifeboard
yarn test:unit
```

Проверять вручную после крупного обновления:

1. Локальные вход и выход, никнейм, фото, три языка/темы.
2. Создание и редактирование цели в обоих режимах; привязка к родителю, проверка защиты от циклов.
3. Отметки задач, статистика за неделю, недельный разбор, импорт/экспорт JSON.
4. Заметки с фотографиями, группами и поиском.
5. Системные цитаты и размещение только на Overview и Reflection.
6. Helper: одна плавающая кнопка на desktop/mobile; настройка скрытия; сохранение чата, reply/edit/delete.
7. **Открыть Helper, прокрутить внутри диалога, убедиться, что фон страницы неподвижен, закрыть и проверить исходную позицию скролла.**
8. Узкие экраны (320/375/430 CSS px), обычный desktop; Safari/Chrome; `prefers-reduced-motion`.

Если видите `VM... reportAllChanges ... startTime` без кадров вашего `src/` или сборки, сперва проверьте Chrome DevTools/расширения. Это известная проблема внедрённого `web-vitals` скрипта при SPA soft navigation; не добавляйте перехватчик исключения в приложение. См. https://github.com/GoogleChrome/web-vitals/issues/792

В среде подготовки этого архива зависимости npm получить не удалось (`EAI_AGAIN`), поэтому **проверен синтаксис TS/Vue, CSS, SVG и локальные импорты, но не подтверждена реальная Vite-сборка и визуальная работа в браузере**. Проверить на целевой машине через `yarn build` или Docker обязательно.

## 16. Docker и деплой

Файлы: `Dockerfile`, `compose.yaml`, `deploy/nginx.container.conf`. На этапе сборки ставится Yarn lockfile и запускается Vite; Nginx в runtime обслуживает SPA, включая `GET /healthz`.

```bash
docker compose build --no-cache lifeboard
docker compose up -d --no-deps --force-recreate lifeboard
docker compose ps
docker compose logs --tail=80 lifeboard
curl http://127.0.0.1:8080/healthz
```

Для текущего VPS:

```text
/opt/lifeboard/budgee-lifeboard-src  — Lifeboard source
:8080                                 — Lifeboard (HTTP; временный демо-порт)
:80                                   — Budgee (отдельный сервис)
```

При загрузке полного архива ZIP в `/tmp`:

```bash
cd /opt/lifeboard
cp -a budgee-lifeboard-src "backup-before-v014-$(date +%Y%m%d-%H%M%S)"
unzip -o /tmp/Lifeboard-v0.14.3-cactus-quote-dnd.zip -d /opt/lifeboard
cd /opt/lifeboard/budgee-lifeboard-src
docker compose build --no-cache lifeboard
docker compose up -d --no-deps --force-recreate lifeboard
```

Не меняйте общий Nginx/Budgee на `:80`, пока не согласована новая инфраструктура. Перед реальным приёмом паролей, OAuth, ключей и приватных данных нужен **HTTPS**.

## 17. План серверного API (ещё не реализован)

В этом репозитории нет NestJS-модуля или реальных HTTP-эндпоинтов Lifeboard. Следующее — архитектурная цель, **не обещание работающих ручек**:

| Контракт / группа | Домен | Требования |
| --- | --- | --- |
| `auth` | User / Session | Авторизация, refresh/logout, профили, OAuth |
| `goals` | Goal / Category | CRUD, фильтр по владельцу, parentId без циклов |
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


## Mobile navigation and featured reflection quote (0.14.2)

The bottom mobile navigation has five destinations: Overview, Today, Goals, Notes, and Reflection. The curated Quotes archive remains reachable via the quote cards on Overview and Reflection, and in the desktop sidebar. Helper continues to be available via its floating launch button when enabled in profile settings.

`LifeReview.vue` renders a single `QuoteSpot` immediately below the reflection page header for both mobile and desktop. `lb-review-featured-quote` in `src/shared/styles/lifeboard-theme.css` controls compact mobile presentation. On screens under 760px the quote is clamped to three lines; the archive link remains accessible for reading the full quote.


## Lifeboard v0.14.3 — Cactus & Quote Studio

- Визуальная идентичность: сдержанный кактус без глаз и лица. Один знак в логотипе, саду, Helper, BrandLoader, `/public/lifeboard-mascot.svg` и `/public/favicon.svg`. Кактус без лица, глаз и мимики.
- Типографика: Inter для интерфейса, Manrope для заголовков. Спокойная минерально-зелёная палитра, мягкие границы, меньше декоративных теней и градиентов. `forest`, `dark`, `orange` сохранены.
- `lb-hero`: компактная статусная полоса с прогрессом; дублирующие метрики удалены (они остаются ниже в KPI). На узких экранах декоративный маскот внутри hero скрыт, чтобы обеспечить доступ к действиям без длинной прокрутки.
- Sidebar: разделители после бренда, перед аналитическими разделами и перед блоком фокуса; Reflection находится выше Quotes. Мобильная нижняя панель по-прежнему состоит из пяти разделов без Quotes.
- `/quotes`: две полноценные зоны Drag & Drop (Overview и Reflection), занимающие всю ширину контента; выбранную цитату можно перетащить из каталога, удалить из зоны или заменить. На телефоне поддерживается перетаскивание за кнопку «Выбрать» и запасной сценарий «выбрать карточку → нажать на зону». Подписи и пустые состояния на RU/EN/DE. Исправлены недостающие импорты валидаторов `isQuotePlacement`/`isSystemQuoteId` в store — именно из-за них назначение ранее не менялось. `quoteFor` и `quoteAssignments` реактивны; назначения хранятся в `lifeboard:state:v1` и входят в JSON-бэкап.
- Пользовательское название ассистента **Helper** — в диалоге, кнопке и переводах RU/EN/DE. Для сохранности данных оставлены старые внутренние идентификаторы (`JakkChat`, `useJakkChat`, `showJakk`, `lifeboard:jakk:mock:v1`): это технические ключи, а не отображаемое имя.
- Убраны подсказки `nickname` внутри полей регистрации и профиля. Обязательные поля помечены красной `*` в формах аккаунта, целей, категорий, действий и заметок.
- Удалены устаревшие CSS-файлы, не подключённые в `index.css`, без изменения контрактов компонентов.

**Проверка на локальной машине:** `yarn install --frozen-lockfile`, `yarn build`, `yarn test:lifeboard`. Серверная сборка: `docker compose build --no-cache lifeboard`. Перед обновлением сделай экспорт JSON в профиле и сохрани старые исходники. Vue-сборка не была полностью выполнена в окружении подготовки архива, поэтому обязательна локальная проверка.


### UI заметки v0.14.3

- Символ Lifeboard — кактус в горшке **без глаз, рта и других элементов лица**. `LifeboardMascot.vue` — общий источник SVG для header, Helper, hero, сада и авторизации. Отдельные синхронизированные статические файлы: `public/lifeboard-mascot.svg` и `public/favicon.svg`.
- `BrandLoader.vue` использует общий кактус и сцену с лейкой: капли падают, растение едва заметно растёт. Все анимации выключаются при `prefers-reduced-motion`.
- `LifeQuotes.vue` использует native HTML5 DnD на desktop, Pointer Events на touch/pen и доступный клавиатурой сценарий выбора цитаты с последующим нажатием зоны назначения. Изменения сохраняются через `useLifeStore.assignQuote()` без изменения схемы `LifeState`.
- Логотипу `Lifeboard` добавлено небольшое межбуквенное расстояние через `.lb-logo-copy strong` во всех темах.
