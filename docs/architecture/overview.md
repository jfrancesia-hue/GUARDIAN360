# Arquitectura Guardian360

Guardian360 se organiza como monorepo modular. Cada app o servicio puede evolucionar y desplegarse de forma independiente, manteniendo contratos compartidos y reglas comunes de calidad.

## Capas

- Ingesta: camaras RTSP, apps ciudadanas, IoT/MQTT y fuentes satelitales.
- Procesamiento: servicios IA con FastAPI, jobs asincronicos y edge computing.
- Datos: PostgreSQL/PostGIS, Redis, MinIO y auditoria inmutable.
- Aplicacion: NestJS como nucleo operativo y Laravel como admin complementario.
- Presentacion: dashboard web y apps mobile.

## Regla multi-tenant

Toda entidad operativa incluye `tenantId`. En Sprint 1.2 se agrega el middleware Prisma y los guards finales para forzar el filtro de tenant desde el JWT.
