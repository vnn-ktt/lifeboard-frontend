# Testing Lifeboard frontend 1.0.0

## Автоматические проверки

```bash
bun install --frozen-lockfile
bun run check:release
bun run build
bun run test:all
bun run build-storybook
bunx playwright install chromium
bun run test:browser
```

- `check:release` — проверка локальных импортов, Docker/Bun версии и lockfile, сохранности ключей `LifeState v1`, файлов README. **Не** проверяет поведение браузера или компиляцию Vue.
- `build` — Vite SPA.
- `test:all` — Vitest, включая магазины, цели/отметки, async-state, ошибки.
- `build-storybook` — сборка визуального каталога.
- `test:browser` — Playwright E2E в desktop/mobile Chromium; `webServer` сам запускает Vite dev server локально.

Для снимков из README: `bun run screenshots` после установки браузера. Скрипт создаёт локальный демонстрационный профиль и не должен выполняться на реальном пользовательском аккаунте.

## Ручная приемка

- Desktop и mobile, в том числе 320/390px; контроль горизонтального скролла.
- RU/EN/DE и forest/dark/orange, сохранение настроек между перезагрузками.
- Локальная регистрация → выход → вход, создание/редактирование целей, routine/notes, backup export/import.
- JakkLauncher открывает **только** `InDevelop` и не инициирует сетевых запросов.
- Лоадер кактуса: анимируются только зрачки; при `prefers-reduced-motion` движения отключены.
- Service worker/PWA: новая сборка не удаляет локальные данные.

Текущий релиз **не** содержит backend integration tests, т.к. API-слой ещё не написан. Полный acceptance checklist: [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).
