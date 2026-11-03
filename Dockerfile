# Build stage: Node is required only inside Docker for Vite.
FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV CYPRESS_INSTALL_BINARY=0
COPY package.json yarn.lock ./
RUN corepack enable \
    && yarn install --frozen-lockfile --non-interactive --network-timeout 120000
COPY . .
RUN yarn build

# Runtime: static assets served by Nginx (no Node process).
FROM nginx:stable-alpine
COPY deploy/nginx.container.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
