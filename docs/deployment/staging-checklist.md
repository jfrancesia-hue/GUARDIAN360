# Checklist staging/prod

## Requisitos previos

- Node.js 20.11.0 activo.
- pnpm 9.x.
- Docker con Compose o cluster Kubernetes con PostGIS, Redis y MinIO.
- Variables reales cargadas desde gestor de secretos, nunca desde `.env` versionado.

## Comandos de validacion

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm prod:check
```

## Base de datos

```bash
cd apps/backend-nestjs
pnpm exec prisma migrate deploy
pnpm prisma:seed
```

La migracion inicial habilita `postgis` y `pgcrypto`. En proveedores administrados, confirmar que ambas extensiones esten permitidas antes del deploy.

## Smoke test minimo

```bash
curl http://localhost:3001/health
curl http://localhost:3001/metrics
```

Luego iniciar sesion desde `/login` con el tenant `catamarca-provincia` y verificar que el dashboard cargue `/events`, `/events/summary`, `/cameras` y `/cameras/overview`.

## Bloqueos conocidos

- Docker no esta disponible en la maquina actual, por eso no se aplicaron migraciones contra PostGIS real desde este entorno.
- MFA queda como siguiente hardening antes de datos sensibles reales.
- Los modulos mobile siguen como scaffold hasta su sprint especifico.
