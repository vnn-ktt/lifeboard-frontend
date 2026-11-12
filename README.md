<div align="center">

# 🌵 Lifeboard

### Твои цели. Твой ритм. Твой прогресс.

**Frontend 1.0.0 · Vue 3 · TypeScript · Pinia · PrimeVue · Vite · Bun**

</div>

> **Backend integration PR:** Lifeboard теперь работает с [NestJS backend v1](https://github.com/vnn-ktt/lifeboard-backend/tree/main). Авторизация — серверные cookie-сессии, данные — PostgreSQL/S3 через backend. Публичное развёртывание требует **HTTPS и работающего API**. Локальный деморежим без backend больше не используется.

![Экран входа Lifeboard, desktop](docs/screenshots/auth-desktop.png)

## 📸 Интерфейс

| Дерево целей | Сад целей |
|:--:|:--:|
| ![Дерево целей](docs/screenshots/goals-tree.png) | ![Сад целей](docs/screenshots/goals-garden.png) |

| Заметки — светлая тема | Заметки — тёмная тема |
|:--:|:--:|
| ![Заметки в светлой теме](docs/screenshots/notes-light.png) | ![Заметки в тёмной теме](docs/screenshots/notes-dark.png) |

| Еженедельная рефлексия, desktop | Рефлексия, mobile |
|:--:|:--:|
| ![Weekly Reflection](docs/screenshots/review-desktop.png) | ![Weekly Reflection mobile](docs/screenshots/review-mobile.png) |

<p align="center"><img src="docs/screenshots/notes-mobile.png" width="320" alt="Заметки на мобильном экране" /></p>

Скриншоты сделаны на демоданных **до** перехода к серверным аккаунтам; визуальный интерфейс сохранён.

## Возможности

- Регистрация и вход с паролем (12+ символов при регистрации), авторизация через `lifeboard.sid` (`HttpOnly`, `SameSite=Lax`).
- Цели и статусы, дерево/сад, фокус, метрики, check-ins, вехи, разовые задачи и регулярные действия.
- Заметки, группы, привязка к целям, фотографии в приватном S3 через backend.
- Еженедельная рефлексия, системные цитаты и видение жизни.
- Профиль, аватар, язык/тема, приватность и UI-настройки — с сохранением в аккаунте.
- RU / EN / DE, адаптивные экраны, Jakk с локальными демонстрационными ответами (в backend v1 нет Helper API).
- JSON-экспорт с сервера; безопасный импорт `LifeState v1` в пустой аккаунт с dry-run и явным подтверждением.
- Информационное RU/EN/DE уведомление об обязательных cookie.

## Быстрый старт

**Нужно:** Bun 1.4.4, Node.js 22+, запущенный `lifeboard-backend` v1 + PostgreSQL, S3.

```bash
cp .env.example .env.local
bun install --frozen-lockfile
bun run dev
```

SPA: <http://localhost:8080>. По умолчанию `/api/v1` проксируется Vite на `http://localhost:3000` (`VITE_DEV_API_TARGET` в `.env.local`).

Backend для **локальной** разработки: `WEB_ORIGIN=http://localhost:8080` и `COOKIE_SECURE=false`. Это не production-настройки. Не размещай пароли, cookie, DB или S3-ключи в переменных `VITE_*`.

### Проверки

```bash
bun run check:release
bun run build
bun run test:all
bun run build-storybook
bunx playwright install chromium
bun run test:browser
```

E2E использует mock API, чтобы проверять формы, навигацию и контрактные вызовы без настоящей БД. Для production требуется **дополнительная staging-проверка** с настоящим NestJS + PostgreSQL + S3 (см. [чек-лист](docs/RELEASE_CHECKLIST.md)).

## Архитектура

```text
src/
  shared/api/
    client.ts                       # HTTP adapter + credentials: include
    preferencesSync.ts              # серверные настройки
  shared/stores/useAuthStore.ts     # серверная сессия /users/me
  modules/lifeboard/
    stores/useLifeStore.ts          # реактивная UI-модель, без localStorage
    api/lifeSync.ts                 # REST-мутаторы + синхронизация с сервером
    composables/useLifeBackup.ts    # защищённый экспорт / импорт
    views/                          # существующие экраны
  modules/profile/views/           # профиль / аватар / перенос данных
  shared/components/Privacy/       # CookieNotice
  shared/components/Feedback/      # SyncErrorNotice, AsyncStateView
  core/                             # темы, i18n, PrimeVue
```

Новый клиент использует `GET /exports/lifeboard-v1` для начальной загрузки и консолидации UI-состояния после изменений. Синхронные действия Pinia превращаются в последовательные REST-операции. На 401 очищается состояние авторизации. Сетевая ошибка показывается пользователю; нет обещания офлайн-синхронизации. Подробности: [BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md).

## Деплой

**Рекомендуется один HTTPS-origin.** Маршрутизируйте `/api/v1/*` внешним reverse proxy к NestJS (порт 3000), а остальные URL — к фронтенду Nginx (порт 8080 на сервере). В контейнере SPA нет собственного API-proxy. Для backend выставить `WEB_ORIGIN` в публичный HTTPS URL и `COOKIE_SECURE=true`.

```bash
docker compose build --no-cache lifeboard
docker compose up -d --no-deps --force-recreate lifeboard
docker compose ps
curl -fsS http://127.0.0.1:8080/healthz
```

**Healthcheck выше проверяет только SPA**, не доступность API. Подробная инструкция с TLS/proxy и rollback: [DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Безопасность cookie и переход со старой версии

Сервер выдаёт `lifeboard.sid` как обязательный `HttpOnly` cookie, доступный браузеру, но не JavaScript; `credentials: 'include'` отправляет cookie автоматически. Отдельные обычные cookie сохраняют визуальные настройки. На всех страницах есть уведомление, которое можно закрыть. Это **информирование об обязательных cookie**, не механизм рекламного согласия.

Прежний `lifeboard:state:v1` **не импортируется сам** и не удаляется. Войди в новый серверный аккаунт → Профиль → импорт локальных данных, просмотри результаты dry-run и подтверди импорт. Backend не позволяет перезаписывать непустой аккаунт. Перед деплоем рекомендуется сохранить старый JSON-файл.

## Scope / Out of scope

**В этом PR:** полный переход существующих экранов на backend v1 REST, cookie auth, загрузка и серверное сохранение данных, изображения, профиль, настройки, экспорт/импорт, предупреждение о cookie, документация и тесты на mock API.

**Не входит:** AI/Helper API (не предоставляется backend v1), Google/GitHub OAuth (нет контрактов), гарантированная офлайн-работа и независимый от backend деморежим. Миграция данных не выполняется без подтверждения.

## Лицензия

[AGPL-3.0](LICENSE)
