# Lifeboard frontend ↔ NestJS backend 1.0.0: план интеграции

Статус: **не реализовано**. Документ основан на контроллерах из пользовательского архива `lifeboard-backend(1).zip`. Frontend 1.0.0 остаётся локальным: изменения API-клиента, endpoints, DTO, перехватчиков или backend сюда **не добавлены**.

## Источник истины

- Backend: REST `http://localhost:3000/api/v1`, Swagger `http://localhost:3000/api/docs`, JSON `http://localhost:3000/api/docs-json`.
- Сессионная cookie `lifeboard.sid`: `HttpOnly`, `SameSite=Lax`, `Path=/api/v1`, до 7 дней, `Secure=true` при HTTPS.
- Все защищённые операции используют cookie; `fetch` в будущем должен указывать `credentials: 'include'`. Нельзя считывать cookie из JS или сохранять токен в `localStorage`.
- Backend ограничивает CORS одним `WEB_ORIGIN`, проверяет `Origin` для POST/PUT/PATCH/DELETE. В production — HTTPS, `COOKIE_SECURE=true`; рекомендуется same-origin reverse proxy.
- Ответ с ошибкой backend: `{ statusCode, code, message }`; запросы могут получать 400/401/403/404/409/422/429 и другие коды. Универсальная нормализация отображения уже лежит в `shared/lib/apiErrors.ts`.
- **Не** публиковать DB/S3 access keys, сессионные cookie или другие секреты в переменных `VITE_*` (они попадают в статическую сборку).

## Контрактный маппинг

Все пути ниже даны относительно `/api/v1`, а не как готовые клиентские функции.

| UI / функциональность | Backend endpoints (основные) | Особенности |
|---|---|---|
| Регистрация / вход / выход | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` | Cookie-сессия, не локальный email-login. При 401 — перейти в login с сохранением маршрута. |
| Профиль / настройки | `GET/PATCH /users/me`, `PUT /users/me/avatar`, `PATCH /users/me/timezone`, `GET/PUT /users/me/preferences` | Сначала загрузка пользователя, затем данные; устранить расхождения текущих локальных настроек. |
| Области жизни / фокус | `GET/POST /areas`, `DELETE /areas/:id`, `GET/PUT /goals/focus` | Не путать области и категории текущего локального состояния. |
| Цели / статусы | `GET/POST /goals`, `GET/PATCH/DELETE /goals/:id`, `PATCH /goals/:goalId/status`, `GET /goals/:goalId/status-events` | Server UUID и DTO, отдельно составить маппинг типов UI и ответа. |
| Метрики, отметки | `GET/POST /goals/:goalId/metrics`, `DELETE .../metrics/:entryId`, `GET/POST /goals/:goalId/checkins`, `GET /goal-checkins/due` | Не смешивать optimistic mutation и серверный расчёт прогресса. |
| Вехи / задачи | `GET/POST/PATCH/DELETE /goals/:goalId/milestones`, `PUT .../completion`; `GET/POST/PATCH/DELETE /goals/:goalId/tasks`, `PUT .../completion`, `GET /tasks/due` | Уточнять payload по Swagger, а не угадывать форму запросов. |
| Ежедневные рутины | `GET/POST/PATCH/DELETE /routines`, `GET /routines/day`, `GET /routines/checks`, `PUT /routines/:id/checks/:date` | Сверить ISO-даты и дни недели 1–7 с тем, что UI сохраняет сейчас. |
| Заметки / группы | `GET/POST/PATCH/DELETE /notes`, `GET/POST/PATCH/DELETE /note-groups` | Привязки заметок к целям и группам, права владельца. |
| Изображения | `POST /files`, `GET /files/:id`, `GET /files/:id/content`, `DELETE /files/:id` | `multipart/form-data` поле `file`, сервер управляет приватным S3. Data URL заменить только после миграции. |
| Reflection | `GET /reviews`, `GET/PUT/DELETE /reviews/:date` | Необходима локальная временная зона для недельных диапазонов и ISO-date. |
| Цитаты | `GET /quotes`, `GET/PUT /quotes/assignments` | Системные цитаты. |
| Обзор / прогресс / видение | `GET /goals/:id/progress`, `GET /progress/week`, `GET/PUT /life/vision` | Отделить агрегаты backend от вычисляемых локально. |
| Миграция / бэкап | `POST /imports/lifeboard-v1/validate`, `POST /imports/lifeboard-v1`, `GET /exports/lifeboard-v1` | **Только после входа**. Validate → пользователь подтверждает → `X-Import-Confirmed: true` и идемпотентный ключ. |
| Health | `GET /health/live`, `GET /health/ready` | Не путать с Nginx `/healthz` frontend. |

## Подключение по этапам (будущая работа)

1. **Инфраструктура:** поднять backend 1.0.0 и TLS, определить один `apiBaseUrl`, настроить `WEB_ORIGIN`, reverse proxy (либо корректный CORS). Проверить Swagger и cookie в браузере. `VITE_API_BASE_URL` пока только **зарезервированное имя**, добавление `.env` не включает интеграцию.
2. **Auth:** заменить реализацию `src/shared/stores/useAuthStore.ts` на session-backed подход. Удалить только после миграции зависимые формы локального логина; обновить `router.beforeEach`, bootstrap `/users/me`, logout и обработку 401.
3. **Доменный слой:** API-адаптеры для goals, routines, notes, reviews, quotes, profile; все HTTP детали держать вне `.vue` и вне общих UI компонентов. Согласовать DTO, пагинацию, статусы ошибок, timezone и UUID.
4. **Store orchestration:** переделать `useLifeStore` из snapshot-источника истины в реактивный клиентский слой. Не менять схему local backup как побочный эффект.
5. **Данные пользователя:** предложить экспорт JSON, server dry-run и только после явного подтверждения импорт. Backend не перезаписывает непустой аккаунт. Обязательно тест на повторный импорт.
6. **Файлы:** заменить inline `imageDataUrl` на private file IDs, загружать и скачивать изображения через backend; обработать удаление и недоступность файлов.
7. **QA:** unit/contract/E2E для login→reload→CRUD→logout→restore с отдельной тестовой БД и S3; мобильные сценарии, недоступность сети и 429.

## Уже готовые фронтенд-элементы (не API-слой)

- `src/shared/types/asyncState.ts` — дискриминированный async-state.
- `src/shared/composables/useAsyncState.ts` — отмена и защита от гонок.
- `src/shared/composables/useApiRequest.ts` — UI-обёртка над асинхронным состоянием и PrimeVue Toast (не вызывает endpoint сама).
- `src/shared/components/Feedback/AsyncStateView.vue` — idle/loading/error/success.
- `src/shared/lib/apiErrors.ts` — нормализация ошибки для отображения.
- `src/modules/lifeboard/composables/useLifeBackup.ts` и `useLifeStore.ts` — текущая совместимость LifeState v1.

**Принцип:** не добавлять фиктивных сетевых задержек в local store и не заявлять, что auth/data находятся на сервере, пока интеграция не написана и не протестирована.
