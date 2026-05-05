# Guardian360

Guardian360 es una plataforma SaaS B2G multi-tenant para seguridad ciudadana e inteligencia urbana con IA. El foco inicial es Argentina, empezando por el NOA, con soberania de datos, trazabilidad auditable y una experiencia operativa en espanol argentino.

## Stack base

- Monorepo con pnpm workspaces y Turborepo.
- Backend principal: NestJS, Prisma, PostgreSQL + PostGIS, Redis, BullMQ, OpenAPI 3.1.
- Admin complementario: Laravel 11.
- Frontend: Next.js, TypeScript, Tailwind, shadcn/ui.
- IA: servicios FastAPI para vision computacional, satelital, prediccion y transito.
- Observabilidad: Pino, Prometheus, Grafana, OpenTelemetry y Jaeger.
- Infra local: Docker Compose con PostGIS, Redis, MinIO, Mosquitto, Prometheus, Grafana y servicios de aplicacion.

## Requisitos locales

- Node.js 20.11.0. El archivo `.nvmrc` fija la version del proyecto.
- pnpm 9+.
- Git.
- Docker Desktop o Docker Engine con Compose para levantar dependencias locales.

En esta maquina se detecto Node `v24.14.1` y pnpm `10.33.0`. Conviene usar Node 20.11.0 antes de instalar dependencias para evitar diferencias con produccion.

## Setup

```bash
pnpm install
cp .env.example .env
docker compose up -d postgres redis minio mosquitto prometheus grafana
pnpm db:generate
pnpm db:seed
pnpm dev
```

Servicios esperados:

- Dashboard web: `http://localhost:3000`
- API NestJS: `http://localhost:3001`
- Swagger/OpenAPI: `http://localhost:3001/docs`
- Login operativo: `http://localhost:3000/login`
- Grafana: `http://localhost:3030`
- MinIO Console: `http://localhost:9001`

## Scripts principales

- `pnpm dev`: ejecuta los servicios de desarrollo del monorepo.
- `pnpm --filter @guardian360/dashboard-web dev:3002`: levanta el Centro de Comando en `http://localhost:3002` si el puerto 3000 esta ocupado.
- `pnpm build`: compila todos los paquetes y apps.
- `pnpm lint`: corre reglas de calidad.
- `pnpm typecheck`: valida TypeScript en modo estricto.
- `pnpm test`: corre tests unitarios.
- `pnpm prod:check`: lint, typecheck, test y build.
- `pnpm --filter @guardian360/backend-nestjs exec prisma migrate deploy`: aplica migraciones versionadas.

## Principios de arquitectura

- Toda entidad sensible lleva `tenantId` y las queries deben filtrar por tenant.
- No se commitean secretos. Usar `.env.example` como contrato de configuracion.
- Las acciones sensibles registran auditoria.
- Los servicios exponen health checks, logs estructurados y metricas.
- La UI y documentacion funcional se escriben primero para operadores argentinos.

## Troubleshooting

- Si `docker` no existe en la terminal, instalar Docker Desktop y reiniciar la sesion.
- Si Prisma falla con PostGIS local, confirmar que se esta usando la imagen `postgis/postgis:16-3.4`.
- Si pnpm advierte por version de Node, activar Node 20.11.0 con nvm o fnm.
- Si un puerto esta ocupado, ajustar el puerto correspondiente en `.env`.

## Contribucion

Usamos Conventional Commits:

```text
feat(vision-ai): agregar deteccion de armas
fix(auth): corregir expiracion de refresh token
docs(api): actualizar contrato OpenAPI
test(events): cubrir ack de evento critico
```

Cada cambio debe dejar al menos lint y typecheck en verde. Las features con API deben actualizar DTOs, OpenAPI y tests.
