FROM node:20.11-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS development
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --ignore-scripts || true
COPY . .
EXPOSE 3001
CMD ["pnpm", "dev"]

FROM base AS build
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma:generate && pnpm build

FROM node:20.11-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/src/main.js"]
