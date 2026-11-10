# Builder is pinned to the same Bun version declared in package.json.
FROM oven/bun:1.4.4 AS builder
WORKDIR /app
ENV CYPRESS_INSTALL_BINARY=0

# Keep dependency layers reusable while still enforcing the committed lockfile.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run check:release && bun run build

# Static SPA served by Nginx. No runtime Node.js or Bun process.
FROM nginx:stable-alpine
COPY deploy/nginx.container.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/ /usr/share/nginx/html/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
