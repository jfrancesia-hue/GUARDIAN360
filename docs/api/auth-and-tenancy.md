# Auth y multi-tenant

Sprint 1.2 agrega la primera capa operativa de seguridad para Guardian360.

## Endpoints

- `POST /auth/login`: login por `tenantSlug`, `email` y `password`.
- `POST /auth/refresh`: rota refresh token y emite nuevo access token.
- `POST /auth/logout`: revoca refresh token del usuario actual.
- `GET /users/me`: devuelve el usuario autenticado dentro del tenant.
- `GET /users`: lista usuarios activos del tenant. Requiere `SUPER_ADMIN` o `TENANT_ADMIN`.
- `POST /users`: crea usuario dentro del tenant actual. Requiere `SUPER_ADMIN` o `TENANT_ADMIN`.
- `GET /tenants/current`: devuelve datos del tenant actual.
- `GET /audit/recent`: muestra auditoria reciente del tenant. Requiere rol admin.
- `GET /cameras`: lista camaras del tenant autenticado.
- `POST /cameras`: registra camara con ubicacion PostGIS. Requiere rol admin.
- `PATCH /cameras/:id/status`: cambia estado de camara. Requiere rol admin u operador.
- `GET /events`: lista eventos recientes del tenant.
- `POST /events`: crea evento operativo. Requiere rol admin u operador.
- `PATCH /events/:id/ack`: confirma recepcion del evento y audita el ACK.
- `PATCH /events/:id/status`: cambia el estado operativo del evento.

## Decisiones

- El JWT incluye `sub`, `tenantId`, `email` y `role`.
- Los guards globales fuerzan autenticacion, tenant y roles salvo rutas `@Public`.
- Los servicios operativos usan `tenantId` desde el usuario autenticado.
- Cada login, logout y alta de usuario registra `AuditLog` con hash encadenado.
- Cada alta o actualizacion sensible de camaras y eventos registra `AuditLog`.
- Los refresh tokens se guardan hasheados con bcrypt y rotan en cada uso.

## Pendiente para endurecimiento final

- Activar MFA obligatorio para roles admin.
- Agregar migraciones versionadas y pruebas de integracion contra PostGIS real.
- Publicar hash de auditoria en la plataforma blockchain de Nativos.
- Completar rate limits por endpoint critico y por tenant.
