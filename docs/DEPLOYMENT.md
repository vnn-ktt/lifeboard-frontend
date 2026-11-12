# Deploy Lifeboard Frontend with Backend v1

**Production requires an actual running NestJS backend and HTTPS.** The SPA now requires server sessions, not local mock login.

## 1. Prepare

- Backup the current frontend directory, `compose.yaml` and your PostgreSQL/S3 data.
- If upgrading from the previous local-only frontend, keep browser storage intact and save a JSON export before rollout. The new Profile screen can import legacy data into an empty server account.
- Ensure backend migrations completed, S3 bucket is configured and `/api/v1/health/ready` succeeds.

## 2. Same-origin reverse proxy (recommended)

Route `https://lifeboard.example/api/v1/*` to the backend upstream on port 3000 and other paths to frontend upstream (Docker container serving 80, host port 8080). Pass through `Host`, `Origin`, `X-Forwarded-Proto`, `Cookie`, `Set-Cookie` and request bodies unchanged; do not strip `/api/v1`. Configure TLS and trust proxy on the backend as documented there.

Frontend Nginx **only serves the SPA and does not proxy** `/api/v1` itself. Without the external reverse proxy, the app will display API errors and login will not work.

Backend must use:
- `WEB_ORIGIN=https://lifeboard.example`
- `COOKIE_SECURE=true` with HTTPS
- `COOKIE_DOMAIN` only if your backend supports and requires it; otherwise preserve host-only sessions.

Set build-time frontend environment:
```bash
VITE_API_BASE_URL=/api/v1
```
For local development, backend can be at `http://localhost:3000`; Vite dev server proxies API automatically. Set `WEB_ORIGIN=http://localhost:8080`, `COOKIE_SECURE=false` **only locally**.

## 3. Build/restart

```bash
cd /opt/lifeboard
docker compose build --no-cache lifeboard
docker compose up -d --no-deps --force-recreate lifeboard
docker compose ps
curl -fsS http://127.0.0.1:8080/healthz
```

These commands affect only the frontend service. They do not start backend, PostgreSQL or S3 automatically.

## 4. Browser smoke test

Navigate to HTTPS origin. Confirm `CookieNotice` is shown. Register with password (12+ characters) and verify `lifeboard.sid` is HttpOnly/Secure/SameSite=Lax and scoped to `/api/v1`. Refresh and confirm authentication persists. Create goal, routine, note, image; reload and confirm server persistence. Export backup. Logout and verify protected routes redirect to login. Import a legacy local backup only into an empty account and confirm that local browser data is retained.

## 5. Rollback

Restore frontend source and rebuild previous image. Do not clear browser storage or delete PostgreSQL/S3. Old local-only frontend cannot transparently read server account data: export from server before rolling back if access to account contents is needed.
