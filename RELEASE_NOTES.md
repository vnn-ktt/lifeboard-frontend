# Lifeboard frontend — 1.0.0 (local UI release)

## Изменено

- Переведён production Dockerfile на `oven/bun:1.4.4` и `bun install --frozen-lockfile`, исправлен несовместимый Yarn/Corepack build.
- Выравнены версия `package.json`, Docker image и версия в UI (`1.0.0`).
- Удалён неиспользуемый сетевой транспорт Helper с тестами/демо-чатом. Рабочий JakkLauncher показывает заглушку InDevelop.
- Удалены неиспользуемые компоненты Budgee, фрагменты Supabase-моделей, устаревшие CSS и лишние ассеты; маршруты, действующие UI и LifeState v1 сохранены.
- Обновлены CI, команды Playwright screenshots и Bun scripts; CI больше не коммитит скриншоты обратно в репозиторий.
- Добавлен `bun run check:release` без внешних зависимостей для статической проверки структуры, импортов и lockfile.
- README переписан с изображениями из `docs/screenshots/`; добавлены backend integration map, deploy guide и release checklist.

## Ограничения / нерешённые задачи

- Это **локальный режим**: нет серверной авторизации, API-адаптеров, серверного хранения или миграции данных.
- Backend 1.0.0 использован **только как источник контрактов**; код backend не изменялся.
- Сам по себе новый Dockerfile не подключает SPA к backend; нужен API слой + reverse proxy/CORS конфигурация.
- Прежде чем считать сборку production-готовой, необходимо выполнить CI, `bun run build`, unit и E2E tests. Подробности: `docs/RELEASE_CHECKLIST.md`.

## Проверено при подготовке архива

- Статическая команда `node scripts/check-release.mjs` — **успешно**.
- `node --check scripts/check-release.mjs` и `node --check scripts/capture-screenshots.mjs` — **успешно**.
- JSON manifest/Bun lock dependencies согласованы, README assets существуют.
- Отключение кода Helper не изменяет формат браузерных бэкапов.

**Не проверено в среде подготовки:** `bun install`, `vite build`, Vitest, Playwright, Docker image build — пакетный реестр был недоступен, а зависимости/CLI Bun не установлены. Не следует считать это подтверждённой сборкой.**
