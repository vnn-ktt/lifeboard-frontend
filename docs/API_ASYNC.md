# Асинхронный UI: соглашения (Frontend 1.0.0)

> Это **готовые UI-примитивы**, а не HTTP-клиент и не реализация интеграции с backend. В релизе frontend 1.0.0 запросы NestJS не выполняются, все пользовательские данные пока локальны.

## Структуры

`src/shared/types/asyncState.ts`: `idle | loading | success<T> | error`. Состояния должны быть взаимоисключающими; серверный payload доступен только в `success`.

`src/shared/composables/useAsyncState.ts`: отмена с `AbortController`, игнорирование устаревших результатов, `reset`, error normalization.

`src/shared/composables/useApiRequest.ts`: обёртка над async-state + top-right PrimeVue Toast для ошибок и подтверждённых успешных мутаций; **не содержит URL, fetch, DTO, cookies или репозиториев**.

`src/shared/components/Feedback/AsyncStateView.vue`: все 4 состояния, retry slot, PrimeVue loading/error presentation.

`src/shared/lib/apiErrors.ts`: безопасный текст ошибки REST, ограниченный для отображения, и обработчик ошибочного ответа (использовать только когда появится реальный API-слой).

## Соглашения при будущей интеграции

1. REST-адаптеры — только внутри соответствующего домена, отдельно от Vue UI.
2. Использовать `credentials: 'include'` с серверными сессиями. Не читать HttpOnly-cookie из JS.
3. Read-операции: в UI показывать idle → loading → success/error, при новом запросе отменять предыдущий.
4. Мутации: явно отображать сохранение/ошибку; не дублировать Toast из компонента и composable.
5. `204 No Content` — корректный успешный ответ без тела; `401` — завершается пользовательская сессия, `429` — возможно повторение после задержки.
6. Локальный store и локальные бэкапы не объявлять сетевыми операциями и не показывать фальшивые лоадеры.

Реальные endpoints, порядок подключения, миграция данных и cookie security: [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md).
