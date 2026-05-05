FROM node:20.11-alpine AS base
WORKDIR /repo
RUN corepack enable

FROM base AS development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/dashboard-web ./apps/dashboard-web
RUN pnpm install --filter @guardian360/dashboard-web... --frozen-lockfile
WORKDIR /repo/apps/dashboard-web
EXPOSE 3000
CMD ["pnpm", "dev"]

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/dashboard-web ./apps/dashboard-web
RUN pnpm install --filter @guardian360/dashboard-web... --frozen-lockfile
WORKDIR /repo/apps/dashboard-web
RUN pnpm build

FROM node:20.11-alpine AS production
WORKDIR /repo
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /repo ./
EXPOSE 3000
CMD ["pnpm", "--filter", "@guardian360/dashboard-web", "start"]
