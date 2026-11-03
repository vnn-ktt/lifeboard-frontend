# Lifeboard v0.4 — UI, i18n, profile and goals

This is a frontend-only, **local-first** update based on `lifeboard-frontend-main.zip`.

## Added and changed

- New mascot: **smiling cactus in a terracotta pot** as an editable SVG Vue component (`src/shared/components/Brand/LifeboardMascot.vue`). Matching `public/favicon.svg`.
- Three visual themes (forest / dark / warm orange) persisted in the browser.
- Responsive **appearance and language popover** (`src/shared/components/Theme/LifePreferences.vue`). Russian, English and German dictionaries for the main Lifeboard screens. The legacy Budgee section uses existing RU/EN strings and English fallback for DE. User-entered text is never auto-translated.
- Theme fixes: dark hover in task list, white-on-light review score, rounded goal percentage badges, mobile active-nav indicator, reduced-motion styles.
- Profile: local image upload and compression, presentation privacy preferences, backup import/export and local data deletion. Google / GitHub connection buttons are explicitly disabled until a secure backend and OAuth exist.
- Goal categories: add a colored category, delete it only if unused.
- Goal links: `parentId` relationships, cycle protection, unlinking children when parents are deleted, interactive animated pyramid of goal horizons.
- Review charts: clickable daily completion bars, donut chart of completed actions by goal, clickable day tiles linking to a selected date in Today.
- Existing `lifeboard:state:v1` localStorage data remain compatible; custom categories and parent relationships are optional additions to the same state format.

## Running locally

```bash
npm install
npm run dev
```

Dependencies from npm could not be installed in the authoring environment. TypeScript syntax and Vue template tag structure were checked, but a complete production Vite build and browser-level UI testing **were not** performed here.

## Docker update for the existing VPS

The existing Budgee runs on port `80`; Lifeboard is exposed on `8080` by `compose.yaml`. The build container uses Node 22 and Nginx serves the SPA, with a `/healthz` endpoint.

From your computer:

```powershell
scp .\Lifeboard-v0.4-frontend.zip USER@SERVER_IP:/tmp/
```

On VPS (assuming the existing project lives in `/opt/lifeboard/budgee-lifeboard-src`):

```bash
# First export a JSON backup in Profile, because the current data are browser-local.
cd /opt/lifeboard
sudo cp -a budgee-lifeboard-src "backup-before-v04-$(date +%Y%m%d-%H%M%S)"

# Archive contains project files in a root folder called budgee-lifeboard-src.
sudo unzip -o /tmp/Lifeboard-v0.4-frontend.zip -d /opt/lifeboard
cd /opt/lifeboard/budgee-lifeboard-src

# Confirm you actually extracted v0.4 sources before building.
grep -n 'lb-cactus-body' src/shared/components/Brand/LifeboardMascot.vue

sudo docker compose build --no-cache lifeboard
sudo docker compose up -d --no-deps --force-recreate lifeboard
sudo docker compose ps
curl http://127.0.0.1:8080/healthz
```

If the build fails, the existing container normally stays running until recreated; inspect build logs. After deployment, open `http://SERVER_IP:8080` and hard-refresh (Ctrl+Shift+R) if an old service-worker cached the site. Do not clear Local Storage, as that would discard Lifeboard data. If a PWA service worker is active, unregister it and clear only Cache Storage.

## Limitations

There is **no secure account authentication** yet: the local email flow is demonstrative and all personal data remain in browser localStorage. Google/GitHub OAuth is not implemented. On HTTP, avoid storing sensitive data and do not treat the privacy switches as access control. The data are not synchronized between browsers or devices.
