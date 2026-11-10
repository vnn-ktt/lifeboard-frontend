# Frontend 1.0.0 — release checklist

## Входит в этот архив

- [x] Версия `package.json`, Docker image — `1.0.0`.
- [x] Сборка Docker переведена с Yarn на закреплённый Bun `1.4.4` + frozen `bun.lock`.
- [x] Сохранены ключи и структура `LifeState v1` / локального профиля.
- [x] Удалён неиспользуемый сетевой transport Helper и устаревший UI-код прежнего продукта.
- [x] Сохранён `JakkLauncher` с заглушкой `InDevelop`.
- [x] README переписан с демо-скриншотами, статусом и quick start.
- [x] Документация по backend 1.0.0 сверена с контроллерами архива backend.
- [x] CI читает репозиторий, не пушит lockfile/screenshots, проверяет frozen install.
- [x] `check:release` проверяет локальные импорты, соответствие lockfile и Docker, наличие ассетов.

## Требуется перед заявлением о готовности production

- [ ] `bun install --frozen-lockfile` на рабочей машине или CI.
- [ ] `bun run build` + `bun run test:all` + `bun run build-storybook`.
- [ ] `bun run test:browser` в desktop + mobile Chromium.
- [ ] Отдельно проверить кейсы Goals/Today/Notes/Reflection на RU/EN/DE и всех темах.
- [ ] Скриншоты сравнить с текущим UI (при необходимости `bun run screenshots`).
- [ ] Провести проверку PWA cache и обновления Service Worker.
- [ ] Настроить HTTPS, домен, заголовки безопасности, реальные бэкапы и наблюдаемость.
- [ ] Реализовать backend-auth, API adapters, миграцию браузерных данных по подтверждению пользователя и серверную синхронизацию.
- [ ] Contract + интеграционные + security tests нового API-клиента.

**Это frontend release package в local demo mode, а не подтверждённый production-готовый fullstack релиз.**
