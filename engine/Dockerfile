# syntax=docker/dockerfile:1.7
# Per P01-T05 container hardening pattern

FROM node:25-alpine AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
RUN --mount=type=cache,target=/root/.pnpm-store \
    npm install -g pnpm@9 && \
    pnpm install --frozen-lockfile --prod

FROM node:25-alpine AS build
WORKDIR /app
COPY . .
RUN npm install -g pnpm@9 && \
    pnpm install --frozen-lockfile && \
    pnpm turbo run build --filter=@cyberskill/shinhan-engine

FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/engine/dist ./dist
COPY --from=build /app/engine/package.json ./package.json
USER nonroot
EXPOSE 4000
CMD ["dist/index.js"]
