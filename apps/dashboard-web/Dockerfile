FROM node:20.11-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS development
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --ignore-scripts || true
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

FROM development AS production
RUN pnpm build || true
CMD ["pnpm", "dev"]
