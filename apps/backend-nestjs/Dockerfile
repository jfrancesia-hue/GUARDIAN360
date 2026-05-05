FROM node:20.11-alpine AS base
WORKDIR /repo
RUN corepack enable

FROM base AS development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/backend-nestjs ./apps/backend-nestjs
RUN pnpm install --filter @guardian360/backend-nestjs... --frozen-lockfile
WORKDIR /repo/apps/backend-nestjs
EXPOSE 3001
CMD ["pnpm", "dev"]

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/backend-nestjs ./apps/backend-nestjs
RUN pnpm install --filter @guardian360/backend-nestjs... --frozen-lockfile
WORKDIR /repo/apps/backend-nestjs
RUN pnpm prisma:generate && pnpm build

FROM node:20.11-alpine AS production
WORKDIR /repo
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /repo ./
EXPOSE 3001
CMD ["pnpm", "--filter", "@guardian360/backend-nestjs", "start"]
