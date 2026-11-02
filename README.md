# Lifeboard — personal operating system MVP

Lifeboard построен на базе исходного **Budgee frontend**. Это Vue 3 SPA для управления жизненными сферами: фокусами месяца, ежедневными действиями, недельной рефлексией и личным кабинетом.

Текущая версия: **0.3**

Что нового в 0.3:
- новый бренд **Lifeboard**;
- новый SVG-маскот и логотип;
- 3 темы: **базовая**, **тёмная**, **спокойная оранжевая**;
- переработанный visual style для key screens;
- мягкие анимации и более цельный shell;
- локальная авторизация и профиль;
- живые breadcrumbs и reusable shared-компоненты.

---

## Технологии

- Vue 3
- TypeScript
- Pinia
- Vue Router
- PrimeVue
- Tailwind CSS
- Docker / Nginx для деплоя

---

## Быстрый запуск локально

Нужен Node.js (рекомендуется 22+) и npm.

```bash
npm install
npm run dev
```

Приложение откроется на:

```text
http://localhost:8080
```

Сборка production:

```bash
npm run build
```

---

## Что уже есть

### Основные страницы

| Страница | URL | Что умеет |
| --- | --- | --- |
| Обзор | `/` | hero-блок, прогресс за день/неделю, фокусы месяца, 5-летний ориентир |
| Сегодня | `/today` | план недели, переключение дня, повторяющиеся действия |
| Мои цели | `/life-goals` | цели, рутины, 5-летнее видение |
| Рефлексия | `/life-review` | weekly review, экспорт/импорт данных |
| Личный кабинет | `/profile` | редактирование локального профиля |
| Старый Budgee | `/money` | legacy-финансовый раздел |

### Shared-компоненты

```text
src/shared/components/
├── Auth/
├── Breadcrumbs/
├── Brand/
│   ├── LifeboardLogo.vue
│   └── LifeboardMascot.vue
├── Theme/
│   └── LifeThemeSwitcher.vue
└── User/
```

### Локальная авторизация

Пока без backend:
- вход — по локальному профилю;
- регистрация — создаёт профиль в браузере;
- данные хранятся в `localStorage`;
- это **не безопасная серверная авторизация**.

### Хранение данных

Основное состояние хранится в браузере.

Примерно так:
- профиль / сессия — локально;
- цели и действия — локально;
- тема — локально и отдельно по пользователю;
- старые данные Budgee не ломаются.

---

## Темы

Доступны 3 темы:

1. **Базовая** — мягкая зелёная Lifeboard-тема.
2. **Тёмная** — для вечерней работы.
3. **Оранжевая** — спокойная тёплая тема.

Тему можно переключать:
- в шапке Lifeboard;
- на auth-экранах;
- в разделе настроек.

---

## Docker-деплой на VPS

Ниже инструкция под твой текущий сценарий:
- **Budgee уже живёт на `80` порту**;
- Lifeboard будет жить отдельно на **`8080`**;
- домен и HTTPS пока не нужны.

### 1. Подготовка

На сервере должны быть установлены:
- Docker
- Docker Compose plugin
- unzip

Если нужно:

```bash
sudo apt update
sudo apt install -y unzip
```

### 2. Загрузка проекта на сервер

С компьютера:

```bash
scp ./Lifeboard-v0.3-design.zip USER@SERVER_IP:/tmp/
```

По SSH на сервере:

```bash
sudo mkdir -p /opt/lifeboard
sudo unzip -o /tmp/Lifeboard-v0.3-design.zip -d /opt/lifeboard
cd /opt/lifeboard/budgee-lifeboard-src
```

### 3. Запуск контейнера

```bash
sudo docker compose up -d --build
```

### 4. Проверка

```bash
sudo docker compose ps
curl http://127.0.0.1:8080/healthz
```

Ожидаемый ответ:

```text
ok
```

### 5. Открытие наружу

Если `compose.yaml` уже содержит:

```yaml
ports:
  - "8080:80"
```

то приложение будет доступно по адресу:

```text
http://SERVER_IP:8080
```

Если используешь UFW:

```bash
sudo ufw allow 8080/tcp
```

---

## Обновление уже развернутого Lifeboard

Когда будешь выкладывать новую версию:

```bash
sudo unzip -o /tmp/Lifeboard-v0.3-design.zip -d /opt/lifeboard
cd /opt/lifeboard/budgee-lifeboard-src
sudo docker compose up -d --build
```

### Полезные команды

Логи:

```bash
sudo docker compose logs --tail=100
```

Остановка:

```bash
sudo docker compose down
```

Перезапуск:

```bash
sudo docker compose up -d --build
```

---

## Ограничения текущей версии

Сейчас это **frontend-first MVP**.

Пока нет:
- NestJS API;
- PostgreSQL;
- реальной многопользовательской авторизации;
- HTTPS;
- серверного хранения прогресса.

То есть Lifeboard уже можно использовать как личную систему, но данные пока привязаны к браузеру и origin.

---

## Следующий логичный этап

После этой версии стоит делать:

1. NestJS backend;
2. PostgreSQL;
3. нормальный auth-flow;
4. раздельные данные по пользователям;
5. синхронизацию между устройствами.

---

## Примечание

Для SPA с `createWebHistory` нужен fallback маршрутов на `index.html`. Он уже учтён в `nginx.conf` внутри проекта.
