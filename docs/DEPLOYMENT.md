# Deploy Lifeboard frontend 1.0.0

> Пока доступен только локальный деморежим. Без backend-auth это **не сервис с серверным хранением данных**. Обязательно включите HTTPS перед реальной публикацией и не распространяйте сборку как защищённую учётную систему.

## 1. Подготовка

Сохраните JSON-бэкап в браузере **до** обновления (браузерные данные не лежат в Docker). На сервере сохраните исходный проект и compose-конфигурацию:

```bash
cd /opt
sudo tar -czf "lifeboard-source-backup-$(date +%Y%m%d-%H%M%S).tar.gz" lifeboard
```

Убедитесь, что новый ZIP содержит `package.json`, `bun.lock`, `Dockerfile`, `compose.yaml`, `src/`, `public/`, `deploy/` **в корне архива**.

## 2. Обновление исходников

Пример загрузки с ПК:

```powershell
scp .\lifeboard-frontend-v1.0.0-release.zip root@YOUR_SERVER:/tmp/
```

На сервере (после загрузки):

```bash
cd /opt/lifeboard
unzip -o /tmp/lifeboard-frontend-v1.0.0-release.zip -d /opt/lifeboard
# ВАЖНО: unzip не удаляет файлы, удалённые из новой версии.
# Перед продакшен-деплоем предпочтителен чистый каталог или синхронизация с удалением лишнего.
```

Если в каталоге остались неиспользуемые файлы от предыдущей версии, они **не влияют** на сборку при корректных импортах, но желательно их удалить после проверки; **не** удаляйте вручную чужие сервисы/данные.

## 3. Сборка и запуск

```bash
cd /opt/lifeboard
# В Dockerfile используются oven/bun:1.4.4 и bun.lock, не yarn.lock
docker compose build --no-cache lifeboard
docker compose up -d --no-deps --force-recreate lifeboard
docker compose ps
docker compose logs --tail=100 lifeboard
curl -fsS http://127.0.0.1:8080/healthz
```

При стандартном `compose.yaml` контейнер `lifeboard` доступен на `8080` хоста; команда `--no-deps` не перезапускает другие Compose-сервисы. Если порт или сетевое имя на сервере отличаются — проверить фактический `compose.yaml`.

После обновления PWA браузер может показывать закешированную версию: жесткая перезагрузка, проверка Service Worker и `Application > Storage` в DevTools. **Не очищайте Storage**, пока данные браузера не экспортированы.

## 4. Откат

Если сборка не проходит, **не** выполняйте `up` — работающий контейнер обычно остаётся прежним. Для отката верните исходники из архива бэкапа и соберите их заново. Браузерный `LifeState v1` не изменён этим релизом. При откате не пытайтесь восстанавливать данные из контейнера: профили хранятся локально в браузере.

## 5. Будущее подключение backend

Nginx этого SPA **не** проксирует `/api/v1`. Для backend 1.0.0 потребуется отдельный reverse proxy/TLS, который маршрутизирует SPA и API в одной схеме origin, или валидная CORS-конфигурация `WEB_ORIGIN`. При двух доменах проверьте поведение `SameSite=Lax` и HTTPS cookie. Не открывайте PostgreSQL/S3 наружу. Подробности: [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md).
