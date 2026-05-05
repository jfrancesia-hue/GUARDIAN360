# 🛡️ PROMPT MAESTRO DEFINITIVO — GUARDIÁN360
## Plataforma Integral de Seguridad Ciudadana e Inteligencia Urbana con IA

> **Producto:** SaaS B2G multi-tenant para gobiernos provinciales y municipales
> **Cliente principal:** Nativos Consultora Digital · Catamarca · Argentina
> **Mercado objetivo:** Argentina (NOA primero) → LATAM
> **Alcance de este prompt:** MVP completo (Backend + Frontend + Mobile + Infra) con 4 módulos en orden de fases

---

## 🎯 ROL DEL AGENTE

Sos un **arquitecto de software senior fullstack** con experiencia en plataformas SaaS B2G de alto compromiso operativo, con expertise en visión computacional, sistemas de tiempo real, geo-procesamiento y compliance regulatorio LATAM.

Tu cliente es **Jorge Eduardo Francesia**, CEO de Nativos Consultora Digital. Vas a construir Guardián360 como **producto comercializable de inmediato**, no como prototipo. Cada commit debe acercarnos a tener algo vendible al Ministerio de Seguridad de Catamarca.

---

## ⚡ REGLAS OPERATIVAS INVIOLABLES

### Las 12 reglas no negociables

1. **Producción desde el día uno.** Nada de mocks hardcodeados. Nada de funciones vacías. Nada de `// TODO` sin contexto.
2. **Multi-tenant por diseño.** Toda entidad lleva `tenantId`. Toda query filtra por tenant. Todo endpoint valida tenant en JWT.
3. **Soberanía de datos.** Hosting en territorio argentino. Cumplimiento Ley 25.326. Logs inmutables auditables.
4. **Modular y desacoplado.** Cada módulo (VisionAI, Comando, SatélitePatrol, CiudadanoApp) arranca y se vende por separado.
5. **Spanish-first UI.** Strings de UI en español argentino (vos/tenés). Comments en español. Variables/funciones en inglés.
6. **Testing obligatorio.** Coverage mínimo: 80% backend, 70% frontend, 60% mobile, 70% IA.
7. **OpenAPI 3.1 obligatorio.** Cada endpoint REST documentado y validado.
8. **Logs estructurados.** Pino/structlog con correlation IDs en todos los servicios.
9. **Métricas Prometheus.** Cada servicio expone `/metrics`.
10. **Auditoría en cada acción sensible.** Tabla `AuditLog` + hash blockchain.
11. **No reinventes.** Usá librerías maduras y mantenidas.
12. **Commits atómicos** con Conventional Commits estricto.

### Anti-patrones prohibidos

- ❌ `any` en TypeScript (usar `unknown` y narrow)
- ❌ Queries Prisma sin filtro por `tenantId` (usar middleware)
- ❌ Strings UI hardcoded en inglés
- ❌ Llamadas a IA sincrónicas en HTTP (usar BullMQ)
- ❌ `console.log` en producción
- ❌ `.env` con secretos commitado (solo `.env.example`)
- ❌ Componentes React de más de 200 líneas
- ❌ Endpoints sin DTO de salida
- ❌ Endpoints públicos sin rate limit
- ❌ Tablas de base de datos sin `tenantId`, `createdAt`, `updatedAt`, `deletedAt`

---

## 🏗️ ARQUITECTURA OBJETIVO

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE INGESTA                           │
│  Cámaras IP/RTSP  │  Satélites  │  IoT/MQTT  │  Apps ciudadanas │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CAPA DE PROCESAMIENTO IA                        │
│  YOLOv10  │  DeepStream  │  OpenCV  │  Whisper  │  Modelos ML   │
│  Edge Computing en sitios remotos (NVIDIA Jetson Orin)          │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAPA DE DATOS                               │
│  PostgreSQL + PostGIS  │  TimescaleDB  │  Redis  │  MinIO       │
│  Blockchain logs (auditoría inmutable)                          │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE APLICACIÓN                            │
│  NestJS (motor tiempo real) │ Laravel 11 (admin web PHP)        │
│  WebSockets  │  GraphQL  │  MQTT  │  APIs REST + OpenAPI 3.1   │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN                           │
│  Dashboard Web (Next.js 14 + TypeScript + Tailwind)             │
│  Mobile Officer (React Native + Expo)                           │
│  Mobile Citizen (React Native + Expo)                           │
│  Centro de Comando táctico (visualización tiempo real)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 STACK TÉCNICO COMPLETO

| Capa | Tecnología | Versión mín. | Justificación |
|------|-----------|-------------|---------------|
| **Lenguaje principal** | TypeScript | 5.4+ | Type-safety en todo el stack |
| **Backend tiempo real** | NestJS | 10.x | Modular, decorators, DI, WebSocket nativo |
| **Backend admin web** | Laravel | 11.x | PHP es preferencia de Nativos para web admin |
| **ORM** | Prisma | 5.x | Type-safe, migraciones, multi-DB |
| **DB principal** | PostgreSQL + PostGIS | 16 + 3.4 | Geoespacial nativo, robusto |
| **DB series temporales** | TimescaleDB (extensión) | latest | Para métricas y eventos |
| **Cache + Queues** | Redis + BullMQ | 7 | Pub/sub, jobs, sessions |
| **Object storage** | MinIO (S3-compatible) | latest | Self-hosted, soberanía |
| **AI Service** | FastAPI + Python | 3.11+ | Ecosistema ML maduro |
| **Visión computacional** | YOLOv10 + DeepStream | latest | Detección tiempo real GPU |
| **OCR** | PaddleOCR | latest | Mejor para patentes |
| **Streaming cámaras** | GStreamer + OpenCV | 1.22+ | Estándar industrial |
| **Frontend Web** | Next.js | 14 (App Router) | SSR, RSC, performance |
| **UI Components** | shadcn/ui + Radix + Tailwind | latest | Customizable, sin lock-in |
| **State management** | Zustand + TanStack Query | latest | Simple y eficiente |
| **Mapas** | Mapbox GL JS | latest | Mejor performance que Leaflet |
| **Mobile** | React Native + Expo | SDK 51+ | Cross-platform, OTA updates |
| **Tiempo real** | Socket.io | 4.x | Reconexión automática |
| **Auth** | JWT + bcrypt + TOTP | - | Estándar industria |
| **Validación** | Zod (TS) + Pydantic v2 (Py) | latest | Schema-first |
| **Tests E2E** | Playwright | latest | Mejor que Cypress en 2026 |
| **Tests unitarios** | Jest + Vitest + pytest | latest | Por stack |
| **Logs** | Pino + structlog | latest | JSON estructurado |
| **Métricas** | Prometheus + Grafana | latest | Estándar |
| **Tracing** | OpenTelemetry + Jaeger | latest | Distributed tracing |
| **Errores** | Sentry self-hosted | latest | Soberanía datos |
| **CI/CD** | GitHub Actions | - | Integrado con repo |
| **Container** | Docker + docker-compose | latest | Estándar |
| **Orquestación** | Kubernetes + Helm | 1.29+ | Producción |
| **IaC** | Terraform | 1.7+ | Provisioning AWS/GCP |
| **Monorepo** | Turborepo + pnpm | 1.13+ / 9.x | Caching inteligente |
| **Edge computing** | NVIDIA Jetson Orin + DeepStream | JetPack 6+ | Inferencia local sin nube |
| **Pipeline satelital** | Apache Airflow | 2.9+ | Orquestación batch |
| **Procesamiento geo** | GDAL, Rasterio, GeoPandas | latest | Estándar geoespacial |
| **Blockchain logs** | Plataforma propia Nativos | - | Auditoría inmutable |

---

## 📁 ESTRUCTURA EXACTA DEL MONOREPO

```
guardian360/
├── apps/
│   ├── backend-nestjs/                  # API motor tiempo real (núcleo)
│   ├── backend-laravel/                  # Capa admin web PHP
│   ├── dashboard-web/                    # Centro de Comando (Next.js)
│   ├── mobile-officer/                   # App patrullero (RN + Expo)
│   ├── mobile-citizen/                   # CiudadanoApp (RN + Expo)
│   └── ai-services/
│       ├── vision-ai/                    # YOLOv10 sobre cámaras
│       ├── satellite-patrol/             # Procesamiento satelital
│       ├── crime-predict/                # Modelo predictivo
│       └── transit-ai/                   # Análisis tránsito
├── packages/
│   ├── shared-types/                     # Tipos TS compartidos
│   ├── shared-ui/                        # Componentes shadcn personalizados
│   ├── shared-config/                    # ESLint, Prettier, tsconfig
│   ├── api-contracts/                    # OpenAPI specs por módulo
│   └── i18n-strings/                     # Traducciones es-AR
├── infrastructure/
│   ├── docker/
│   │   ├── postgres-init/
│   │   ├── nginx/
│   │   └── grafana-dashboards/
│   ├── kubernetes/
│   │   ├── helm-charts/
│   │   └── manifests/
│   ├── terraform/
│   │   ├── modules/
│   │   └── environments/
│   │       ├── dev/
│   │       ├── staging/
│   │       └── prod-catamarca/
│   └── edge/
│       └── jetson-config/
├── docs/
│   ├── architecture/
│   ├── modules/
│   ├── api/
│   ├── deployment/
│   └── runbooks/
├── scripts/
│   ├── setup-dev.sh
│   ├── seed-dev-data.ts
│   └── deploy.sh
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd-staging.yml
│       └── cd-production.yml
├── .editorconfig
├── .gitignore
├── .nvmrc
├── docker-compose.yml
├── docker-compose.prod.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 🗄️ MODELO DE DATOS COMPLETO (Prisma Schema)

Todo el schema en `apps/backend-nestjs/prisma/schema.prisma`. Patrón obligatorio: middleware Prisma que filtra automáticamente por `tenantId` extraído del JWT.

### Entidades core

```prisma
// =========================================================================
// MULTI-TENANT
// =========================================================================
model Tenant {
  id            String   @id @default(uuid())
  name          String
  slug          String   @unique
  type          TenantType
  modules       String[]                 // ["vision-ai", "satellite-patrol", ...]
  settings      Json
  legalEntity   String                   // CUIT
  contactEmail  String
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  users         User[]
  cameras       Camera[]
  events        Event[]
  vehicles      Vehicle[]
  citizens      Citizen[]
  reports       CitizenReport[]
  aois          AreaOfInterest[]
  satelliteImages SatelliteImage[]
  fireHotspots  FireHotspot[]
  miningAlerts  MiningAlert[]
  agroIndices   AgroIndex[]
  borderAlerts  BorderAlert[]
  customsAlerts CustomsAlert[]
  riskZones     RiskZone[]
  auditLogs     AuditLog[]
}

model User {
  id            String   @id @default(uuid())
  tenantId      String
  email         String
  passwordHash  String
  fullName      String
  role          UserRole
  agency        String?                  // "Policía Provincial", "Bomberos"
  badge         String?
  phoneNumber   String?
  active        Boolean  @default(true)
  lastLoginAt   DateTime?
  mfaEnabled    Boolean  @default(false)
  mfaSecret     String?                  // encriptado
  refreshTokenHash String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  auditLogs     AuditLog[]
  acknowledgedEvents Event[] @relation("AcknowledgedBy")

  @@unique([tenantId, email])
  @@index([tenantId, role, active])
}

// =========================================================================
// MÓDULO 1: VISIONAI - CÁMARAS Y EVENTOS
// =========================================================================
model Camera {
  id            String   @id @default(uuid())
  tenantId      String
  externalId    String                   // ID en sistema COM
  name          String
  rtspUrl       String                   // encriptado en reposo
  location      Unsupported("geometry(Point, 4326)")
  address       String?
  zone          String?                  // "Centro", "Barrio Sur"
  capabilities  String[]                 // ["lpr", "weapon", "fall", "fight"]
  status        CameraStatus @default(OFFLINE)
  resolution    String?                  // "1920x1080"
  fps           Int?
  edgeDeviceId  String?                  // ID del Jetson
  installedAt   DateTime?
  lastFrameAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  events        Event[]
  detections    Detection[]

  @@index([tenantId, status])
  @@index([tenantId, location], type: Gist)
}

model Event {
  id            String   @id @default(uuid())
  tenantId      String
  cameraId      String?
  citizenReportId String?                // si vino de un ciudadano
  type          EventType
  severity      Severity
  status        EventStatus @default(NEW)
  confidence    Float?                   // null si vino de ciudadano
  location      Unsupported("geometry(Point, 4326)")?
  metadata      Json
  thumbnailUrl  String?
  videoClipUrl  String?
  occurredAt    DateTime
  detectedAt    DateTime
  acknowledgedAt DateTime?
  acknowledgedById String?
  resolvedAt    DateTime?
  resolution    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  camera        Camera?  @relation(fields: [cameraId], references: [id])
  acknowledgedBy User?   @relation("AcknowledgedBy", fields: [acknowledgedById], references: [id])
  citizenReport CitizenReport? @relation(fields: [citizenReportId], references: [id])
  dispatches    Dispatch[]

  @@index([tenantId, type, status])
  @@index([tenantId, occurredAt])
  @@index([tenantId, location], type: Gist)
}

model Detection {
  id            String   @id @default(uuid())
  tenantId      String
  cameraId      String
  modelName     String                   // "yolov10-lpr-ar-v1"
  modelVersion  String
  className     String                   // "license_plate", "weapon"
  confidence    Float
  bbox          Json                     // {x, y, w, h}
  detectedAt    DateTime
  attributes    Json                     // {plateNumber: "AB123CD"} para LPR

  camera        Camera   @relation(fields: [cameraId], references: [id])

  @@index([tenantId, modelName, detectedAt])
}

// =========================================================================
// MÓDULO 2: COMANDO UNIFICADO - DESPACHO Y MÓVILES
// =========================================================================
model Vehicle {
  id            String   @id @default(uuid())
  tenantId      String
  callSign      String                   // "Móvil 12"
  agency        String                   // "Policía", "Bomberos"
  type          VehicleType
  status        VehicleStatus @default(OFFLINE)
  location      Unsupported("geometry(Point, 4326)")?
  speed         Float?
  heading       Float?
  lastUpdateAt  DateTime?
  officersIds   String[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  dispatches    Dispatch[]

  @@index([tenantId, status])
  @@index([tenantId, location], type: Gist)
}

model Dispatch {
  id            String   @id @default(uuid())
  tenantId      String
  eventId       String
  vehicleId     String
  status        DispatchStatus @default(ASSIGNED)
  assignedAt    DateTime
  enRouteAt     DateTime?
  arrivedAt     DateTime?
  completedAt   DateTime?
  notes         String?
  outcome       String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  event         Event   @relation(fields: [eventId], references: [id])
  vehicle       Vehicle @relation(fields: [vehicleId], references: [id])

  @@index([tenantId, status])
}

// =========================================================================
// MÓDULO 3: SATÉLITEPATROL - 5 VERTICALES
// =========================================================================
model AreaOfInterest {
  id            String   @id @default(uuid())
  tenantId      String
  name          String
  type          AoiType
  geometry      Unsupported("geometry(MultiPolygon, 4326)")
  properties    Json
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())

  tenant        Tenant   @relation(fields: [tenantId], references: [id])

  @@index([tenantId, type, active])
}

model SatelliteImage {
  id            String   @id @default(uuid())
  tenantId      String
  source        SatelliteSource
  productType   String
  acquiredAt    DateTime
  cloudCover    Float?
  footprint     Unsupported("geometry(Polygon, 4326)")
  cogUrl        String                   // Cloud Optimized GeoTIFF en MinIO
  metadata      Json
  processedAt   DateTime?
  ingestedAt    DateTime @default(now())

  tenant        Tenant   @relation(fields: [tenantId], references: [id])

  @@index([tenantId, source, acquiredAt])
}

// Vertical 1: Defensa Civil
model FireHotspot {
  id            String   @id @default(uuid())
  tenantId      String
  source        SatelliteSource
  detectedAt    DateTime
  location      Unsupported("geometry(Point, 4326)")
  brightnessKelvin Float
  confidence    Float
  frpMw         Float?                   // Fire Radiative Power
  status        FireStatus @default(DETECTED)
  alertedAt     DateTime?
  metadata      Json

  tenant        Tenant   @relation(fields: [tenantId], references: [id])

  @@index([tenantId, detectedAt])
}

// Vertical 2: Minería ESG
model MiningAlert {
  id            String   @id @default(uuid())
  tenantId      String
  concessionId  String?
  type          MiningAlertType
  severity      Severity
  detectedAt    DateTime
  location      Unsupported("geometry(Point, 4326)")?
  affectedArea  Unsupported("geometry(Polygon, 4326)")?
  beforeImageId String?
  afterImageId  String?
  changeMagnitude Float?
  reportPdfUrl  String?
  acknowledged  Boolean  @default(false)

  tenant        Tenant   @relation(fields: [tenantId], references: [id])

  @@index([tenantId, type, detectedAt])
}

// Vertical 3: Agro Insurance
model AgroIndex {
  id            String   @id @default(uuid())
  tenantId      String
  aoiId         String
  date          DateTime
  ndvi          Float?
  evi           Float?
  spei          Float?
  soilMoisture  Float?
  surfaceTempC  Float?
  rasterCogUrl  String?

  tenant        Tenant   @relation(fields: [tenantId], references: [id])

  @@unique([tenantId, aoiId, date])
}

// Vertical 4: Border Defense
model BorderAlert {
  id            String   @id @default(uuid())
  tenantId      String
  type          BorderAlertType
  severity      Severity
  detectedAt    DateTime
  location      Unsupported("geometry(Point, 4326)")
  zone          String                   // "Paso Jama", "La Quiaca"
  imagePreUrl   String?
  imagePostUrl  String?
  metadata      Json
  reviewed      Boolean  @default(false)

  tenant        Tenant   @relation(fields: [tenantId], references: [id])
}

// Vertical 5: Customs & Trade
model CustomsAlert {
  id            String   @id @default(uuid())
  tenantId      String
  type          CustomsAlertType
  severity      Severity
  detectedAt    DateTime
  location      Unsupported("geometry(Point, 4326)")
  affectedArea  Unsupported("geometry(Polygon, 4326)")?
  estimatedFiscalImpactUsd Float?
  metadata      Json
  fiscalReference String?

  tenant        Tenant   @relation(fields: [tenantId], references: [id])
}

// =========================================================================
// MÓDULO 4: CIUDADANOAPP - DENUNCIAS Y PÁNICO
// =========================================================================
model Citizen {
  id            String   @id @default(uuid())
  tenantId      String
  email         String?
  phoneNumber   String
  fullName      String
  documentNumber String                   // DNI
  passwordHash  String?                   // null si auth solo por SMS
  pushToken     String?                   // FCM/APNs
  emergencyContacts Json                  // [{name, phone}]
  verified      Boolean  @default(false)
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())

  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  reports       CitizenReport[]

  @@unique([tenantId, documentNumber])
  @@index([tenantId, phoneNumber])
}

model CitizenReport {
  id            String   @id @default(uuid())
  tenantId      String
  citizenId     String?                   // null si anónimo
  type          ReportType
  description   String?
  location      Unsupported("geometry(Point, 4326)")
  address       String?
  mediaUrls     String[]
  status        ReportStatus @default(NEW)
  priority      Severity @default(MEDIUM)
  createdAt     DateTime @default(now())
  acknowledgedAt DateTime?
  resolvedAt    DateTime?

  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  citizen       Citizen? @relation(fields: [citizenId], references: [id])
  events        Event[]

  @@index([tenantId, type, status])
  @@index([tenantId, location], type: Gist)
}

// =========================================================================
// CRIMEPREDICT - MODELO PREDICTIVO
// =========================================================================
model RiskZone {
  id            String   @id @default(uuid())
  tenantId      String
  name          String
  geometry      Unsupported("geometry(Polygon, 4326)")
  riskScore     Float                    // 0.0 - 1.0
  riskLevel     RiskLevel
  factors       Json                     // contributing factors
  validFrom     DateTime
  validUntil    DateTime
  modelVersion  String
  computedAt    DateTime @default(now())

  tenant        Tenant   @relation(fields: [tenantId], references: [id])

  @@index([tenantId, validFrom, validUntil])
}

// =========================================================================
// AUDITORÍA - BLOCKCHAIN LOGS
// =========================================================================
model AuditLog {
  id            String   @id @default(uuid())
  tenantId      String
  userId        String?
  action        String
  resource      String
  resourceId    String?
  ipAddress     String
  userAgent     String?
  metadata      Json
  blockchainHash String?
  blockchainTx  String?
  createdAt     DateTime @default(now())

  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  user          User?    @relation(fields: [userId], references: [id])

  @@index([tenantId, action, createdAt])
}

// =========================================================================
// ENUMS
// =========================================================================
enum TenantType { PROVINCIA MUNICIPIO MINERA ASEGURADORA ADUANA GENDARMERIA OTRO }
enum UserRole { SUPER_ADMIN TENANT_ADMIN OPERATOR OFFICER ANALYST CITIZEN }
enum CameraStatus { ONLINE OFFLINE DEGRADED MAINTENANCE }
enum EventType {
  VEHICLE_PLATE_HIT WEAPON_DETECTED CROWD_ANOMALY FIGHT_DETECTED
  FALL_DETECTED FIRE_DETECTED SMOKE_DETECTED WRONG_WAY
  TRAFFIC_VIOLATION ACCIDENT INTRUSION LOITERING
  SATELLITE_FIRE_HOTSPOT SATELLITE_ILLEGAL_MINING SATELLITE_DEFORESTATION
  SATELLITE_BORDER_BREACH SATELLITE_CUSTOMS_ALERT
  CITIZEN_PANIC CITIZEN_REPORT CRIME_PREDICTION_HIGH_RISK
}
enum Severity { INFO LOW MEDIUM HIGH CRITICAL }
enum EventStatus { NEW ACKNOWLEDGED DISPATCHED RESOLVED FALSE_POSITIVE }
enum VehicleType { PATROL FIRE_TRUCK AMBULANCE MOTORCYCLE DRONE }
enum VehicleStatus { AVAILABLE EN_ROUTE ON_SCENE OFFLINE OUT_OF_SERVICE }
enum DispatchStatus { ASSIGNED EN_ROUTE ON_SCENE COMPLETED CANCELLED }
enum ReportType { PANIC_BUTTON INCIDENT INFRASTRUCTURE OTHER }
enum ReportStatus { NEW IN_REVIEW DISPATCHED RESOLVED CLOSED }
enum AoiType { PROVINCIAL MUNICIPAL MINING_CONCESSION BORDER_ZONE FARM_PARCEL CUSTOMS_ZONE FOREST_RESERVE }
enum SatelliteSource { SENTINEL_1 SENTINEL_2 LANDSAT_8 LANDSAT_9 MODIS_TERRA MODIS_AQUA VIIRS GOES_16 PLANET_LABS }
enum FireStatus { DETECTED CONFIRMED EXTINGUISHED FALSE_POSITIVE }
enum MiningAlertType { ILLEGAL_EXTRACTION TAILINGS_OVERFLOW SUBSIDENCE EMISSION_PEAK COMPLIANCE_BREACH }
enum BorderAlertType { UNAUTHORIZED_PATH CLANDESTINE_AIRSTRIP VEHICLE_MOVEMENT NEW_INFRASTRUCTURE }
enum CustomsAlertType { UNREGISTERED_WAREHOUSE AIS_SPOOFING SMUGGLING_ROUTE UNDECLARED_CONSTRUCTION }
enum RiskLevel { VERY_LOW LOW MEDIUM HIGH VERY_HIGH }
```

---

## 🚀 ROADMAP DE 4 MÓDULOS EN ORDEN DE FASES

### 📅 FASE 1 — VisionAI MVP (Semanas 1-12)

**Objetivo:** Plataforma operativa para piloto Catamarca con 20-50 cámaras, detección IA en tiempo real, dashboard funcional, app móvil oficial.

#### Sprint 1.1 (Semanas 1-2) — Foundation
- [ ] Monorepo Turborepo + pnpm + workspaces
- [ ] ESLint, Prettier, tsconfig compartidos en `packages/shared-config`
- [ ] `docker-compose.yml` con PostgreSQL+PostGIS, Redis, MinIO, MailHog
- [ ] Backend NestJS scaffold completo
- [ ] Backend Laravel scaffold completo
- [ ] Prisma schema completo + migración inicial + seed
- [ ] CI GitHub Actions: lint + typecheck + test
- [ ] README.md raíz con setup
- [ ] `.env.example` documentado

#### Sprint 1.2 (Semanas 3-4) — Auth + Multi-Tenant
- [ ] Módulo `auth` NestJS: register, login, refresh, logout, forgot-password
- [ ] JWT (access 15min + refresh 7d) + bcrypt + MFA TOTP
- [ ] Guards: `JwtAuthGuard`, `TenantGuard`, `RolesGuard` (CASL)
- [ ] Middleware Prisma auto-filter `tenantId`
- [ ] Módulo `users` con RBAC
- [ ] Módulo `tenants` (solo SUPER_ADMIN)
- [ ] Auditoría en cada login/logout/acción sensible
- [ ] Tests unitarios + e2e críticos

#### Sprint 1.3 (Semanas 5-6) — Cámaras + RTSP Ingest
- [ ] Módulo `cameras` con CRUD, validación URL RTSP, test handshake
- [ ] Microservicio `vision-ai` con FastAPI scaffold
- [ ] `RtspConsumer` con GStreamer + OpenCV (5fps)
- [ ] Comunicación NestJS ↔ Python via gRPC + Redis Streams
- [ ] Endpoint snapshot en vivo
- [ ] Health check cron de cámaras
- [ ] Métricas Prometheus por cámara

#### Sprint 1.4 (Semanas 7-8) — Modelo LPR (Patentes)
- [ ] YOLOv10 fine-tuned para LPR Argentina (formato MERCOSUR + viejo)
- [ ] Pipeline: frame → detección → recorte → OCR PaddleOCR
- [ ] Validación regex patente argentina
- [ ] Cruce con base buscados/robados (mock inicial)
- [ ] Creación de `Event` con thumbnail en MinIO
- [ ] Métricas: detecciones/min, latencia, FP rate
- [ ] Dataset de testing 50+ patentes etiquetadas
- [ ] Model card publicada

#### Sprint 1.5 (Semanas 9-10) — Dashboard Web
- [ ] Next.js 14 App Router + Tailwind + shadcn/ui
- [ ] Login con MFA challenge
- [ ] Layout dark mode táctico
- [ ] Pantalla `/dashboard` con KPIs (eventos hoy, cámaras online)
- [ ] Pantalla `/eventos` tiempo real con Socket.io
- [ ] Detalle de evento con video + mapa Mapbox
- [ ] Pantalla `/mapa` con todas las cámaras geolocalizadas
- [ ] Pantalla `/camaras` gestión
- [ ] Pantalla `/auditoria` (TENANT_ADMIN)
- [ ] WebSocket gateway con auth JWT
- [ ] i18n next-intl es-AR

#### Sprint 1.6 (Semanas 11-12) — Mobile Officer + Hardening
- [ ] App Expo con auth
- [ ] Eventos asignados, push notifications
- [ ] Detalle evento + navegación
- [ ] Estados: "En camino", "En el lugar", "Resuelto"
- [ ] Reporte novedad con foto/audio
- [ ] Sincronización offline `react-native-mmkv`
- [ ] Pentest OWASP ZAP
- [ ] Load test k6 (1000 cámaras)
- [ ] Backups automáticos PostgreSQL → S3
- [ ] Disaster recovery documentado
- [ ] Runbook operativo
- [ ] Manual de usuario PDF

**Definition of Done Fase 1:**
- Detección patentes precisión ≥ 92% en condiciones reales
- 50 cámaras simultáneas sin degradación
- Latencia detección → notificación ≤ 3s
- Uptime ≥ 99.5% staging por 2 semanas
- Pentest sin vulnerabilidades High/Critical
- Compliance Ley 25.326 documentada

---

### 📅 FASE 2 — Comando Unificado (Semanas 13-24)

**Objetivo:** Dashboard C4ISR Lite + integración con sistema 911 + despacho automatizado de móviles.

#### Sprint 2.1 (Semanas 13-14) — Vehículos + Tracking GPS
- [ ] Módulo `vehicles` con CRUD
- [ ] MQTT broker (Mosquitto o EMQX) para telemetría GPS
- [ ] Cliente MQTT en NestJS suscrito a topics de móviles
- [ ] Persistencia de tracking en TimescaleDB (hipertabla)
- [ ] Visualización en tiempo real en mapa Mapbox
- [ ] Heatmap de presencia móviles
- [ ] App `mobile-officer` envía GPS cada 10s

#### Sprint 2.2 (Semanas 15-16) — Despacho Automatizado
- [ ] Módulo `dispatch` con asignación al móvil más cercano
- [ ] Algoritmo de scoring: distancia + estado + agencia + ETA
- [ ] Ruta sugerida al móvil con Mapbox Directions
- [ ] Notificación push al oficial asignado
- [ ] Estados de dispatch en tiempo real al COM
- [ ] Cancelación / reasignación

#### Sprint 2.3 (Semanas 17-18) — Integración 911 Provincial
- [ ] Adaptador genérico configurable por provincia
- [ ] Implementación piloto adaptador Catamarca
- [ ] Webhook bi-direccional con sistema 911 existente
- [ ] Mapeo de tipos de llamada → EventType
- [ ] Cola con BullMQ para reintentos automáticos

#### Sprint 2.4 (Semanas 19-20) — Centro de Comando Táctico
- [ ] Pantalla `/comando` full-screen multi-monitor
- [ ] 4 paneles configurables: mapa, eventos, móviles, cámaras
- [ ] Alertas críticas con audio
- [ ] Filtros multi-agencia
- [ ] Modo "incidente mayor" (escalamiento)

#### Sprint 2.5 (Semanas 21-22) — BI Ejecutivo
- [ ] Pantalla `/reportes` con métricas de gestión
- [ ] Tiempos de respuesta por zona/horario
- [ ] Tipo de evento más frecuente
- [ ] Heatmap delitos
- [ ] Generador de reportes PDF mensuales automatizado
- [ ] Endpoint export CSV/Excel para autoridades

#### Sprint 2.6 (Semanas 23-24) — Hardening Fase 2
- [ ] Tests E2E flow completo: detección → ACK → dispatch → resolución
- [ ] Failover testing del MQTT broker
- [ ] Ajustes UX según feedback piloto Catamarca

---

### 📅 FASE 3 — SatélitePatrol Multi-Vertical (Semanas 25-44)

**Objetivo:** Microservicio de procesamiento satelital con 5 verticales operando, vendible standalone.

#### Sprint 3.1 (Semanas 25-26) — Infra Satelital Compartida
- [ ] Microservicio `satellite-patrol` FastAPI scaffold
- [ ] Apache Airflow desplegado
- [ ] Cliente Sentinel Hub (OAuth2) y Copernicus Dataspace (free)
- [ ] Cliente Landsat USGS, MODIS LANCE, GOES-16 AWS
- [ ] Pre-procesamiento: corrección atmosférica, mosaico, COG converter
- [ ] Storage de imágenes en MinIO como Cloud Optimized GeoTIFF
- [ ] Tile server TiTiler para mapas
- [ ] Schema Prisma extendido con entidades satelitales

#### Sprint 3.2 (Semanas 27-29) — Vertical 1: Defensa Civil
- [ ] DAG Airflow detección focos de calor MODIS+VIIRS hourly
- [ ] Modelo FireHotspotDetector (algoritmo Giglio 2016)
- [ ] DAG predicción FWI diaria con datos ERA5-Land
- [ ] Detección granizo GOES-16 cada 10min
- [ ] Detección inundaciones Sentinel-1 SAR
- [ ] Alertas a tenant via webhook → WebSocket dashboard
- [ ] Tests con dataset histórico incendios NOA 2020-2025

#### Sprint 3.3 (Semanas 30-32) — Vertical 2: Minería ESG
- [ ] Detector minería ilegal con change detection Sentinel-2
- [ ] Monitoreo salares de litio (NDWI temporal)
- [ ] Análisis subsidencia con Sentinel-1 InSAR (SNAP toolbox)
- [ ] Detección emisiones Sentinel-5P (NO2, CH4, aerosoles)
- [ ] Generador de reportes ESG PDF para Battery Reg UE 2027
- [ ] Pre-validación con datos Salar de Antofalla y Hombre Muerto

#### Sprint 3.4 (Semanas 33-35) — Vertical 3: Agro Insurance
- [ ] Cálculo NDVI/EVI temporal por AOI
- [ ] Modelo predicción rendimiento LightGBM (soja, maíz, trigo)
- [ ] Detección sequía SPEI con datos Copernicus
- [ ] Alertas heladas con LST nocturno Landsat
- [ ] Daño granizo pre/post evento (cálculo paramétrico)
- [ ] Endpoint para aseguradoras: `POST /insurance/parametric-payout`

#### Sprint 3.5 (Semanas 36-38) — Vertical 4: Border Defense
- [ ] Detección caminos no autorizados (segmentación U-Net)
- [ ] Detección pistas clandestinas (clasificación ResNet)
- [ ] Tracking vehicular en zonas de frontera (Sentinel-1)
- [ ] Cambio de infraestructura semanal por zona crítica
- [ ] Integración con bases Gendarmería Nacional

#### Sprint 3.6 (Semanas 39-41) — Vertical 5: Customs & Trade
- [ ] Detección depósitos no declarados (cruce con base AFIP)
- [ ] Detección AIS spoofing barcos (gap analysis)
- [ ] Mapeo rutas de contrabando con análisis temporal
- [ ] Cálculo recupero fiscal estimado
- [ ] Reportes para AFIP/Aduana

#### Sprint 3.7 (Semanas 42-44) — Integración + Hardening
- [ ] Dashboard satelital integrado en Centro de Comando
- [ ] Capa de mapa por vertical (toggleable)
- [ ] Reportes PDF consolidados
- [ ] Tests E2E pipeline completo
- [ ] Validación con clientes piloto por vertical

---

### 📅 FASE 4 — CiudadanoApp (Semanas 45-56)

**Objetivo:** App móvil ciudadana con botón de pánico, denuncias y alertas zonales.

#### Sprint 4.1 (Semanas 45-46) — Backend Citizen
- [ ] Módulo `citizens` con auth por SMS (Twilio) + opcional password
- [ ] Verificación con DNI (RENAPER API o manual)
- [ ] Módulo `citizen-reports` con CRUD
- [ ] Módulo `citizen-alerts` (zonas críticas, manifestaciones, cortes)
- [ ] Push notifications con Firebase Cloud Messaging
- [ ] Endpoint geofencing para alertas zonales

#### Sprint 4.2 (Semanas 47-49) — App Citizen Core
- [ ] Expo app con onboarding (registro + verificación SMS)
- [ ] Pantalla home con botón de pánico grande accesible
- [ ] Geolocalización contínua con consentimiento explícito
- [ ] Botón de pánico → envío inmediato + grabación audio 30s
- [ ] Confirmación al COM en menos de 5s
- [ ] Llamada automática al 911 como fallback

#### Sprint 4.3 (Semanas 50-51) — Denuncias y Reportes
- [ ] Pantalla `Denunciar` con tipo, descripción, foto, video
- [ ] Cámara nativa con metadata (ubicación, timestamp encriptado)
- [ ] Historial de denuncias propias
- [ ] Estado: Recibida, En revisión, Despachada, Resuelta
- [ ] Notificación cuando cambia estado

#### Sprint 4.4 (Semanas 52-53) — Alertas y Mapa
- [ ] Mapa con eventos públicos (curados por COM)
- [ ] Alertas zonales: cortes calles, manifestaciones, eventos masivos
- [ ] Cámaras públicas en vivo (curadas)
- [ ] Modo "Volver seguro" con seguimiento opcional
- [ ] Compartir ubicación en tiempo real con contactos de emergencia

#### Sprint 4.5 (Semanas 54-55) — Hardening + Privacidad
- [ ] Dark patterns prohibidos (no permisos engañosos)
- [ ] Política privacidad clara + consentimiento granular
- [ ] Modo anónimo para denuncias
- [ ] Cifrado E2E en comunicaciones sensibles
- [ ] Auditoría completa Ley 25.326
- [ ] Tests con usuarios reales (15+ ciudadanos)

#### Sprint 4.6 (Semana 56) — Lanzamiento Piloto
- [ ] Publicación Google Play y App Store
- [ ] Campaña comunicacional con Municipalidad Catamarca
- [ ] Documentación al usuario final
- [ ] Soporte de primer nivel configurado

---

## 🐳 DOCKER COMPOSE COMPLETO (DEV)

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: guardian360
      POSTGRES_USER: guardian
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data
      - ./infrastructure/docker/postgres-init:/docker-entrypoint-initdb.d
    ports: ["5432:5432"]
    healthcheck:
      test: pg_isready -U guardian
      interval: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes: [redis_data:/data]
    ports: ["6379:6379"]

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes: [minio_data:/data]
    ports: ["9000:9000", "9001:9001"]

  mailhog:
    image: mailhog/mailhog
    ports: ["1025:1025", "8025:8025"]

  mosquitto:
    image: eclipse-mosquitto:2
    volumes:
      - ./infrastructure/docker/mosquitto/config:/mosquitto/config
      - mosquitto_data:/mosquitto/data
    ports: ["1883:1883", "9883:9883"]

  prometheus:
    image: prom/prometheus
    volumes:
      - ./infrastructure/docker/prometheus.yml:/etc/prometheus/prometheus.yml
    ports: ["9090:9090"]

  grafana:
    image: grafana/grafana
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./infrastructure/docker/grafana-dashboards:/etc/grafana/provisioning/dashboards
    ports: ["3030:3000"]

  backend-nestjs:
    build:
      context: ./apps/backend-nestjs
      target: development
    depends_on: [postgres, redis, minio, mosquitto]
    environment:
      DATABASE_URL: postgresql://guardian:${DB_PASSWORD}@postgres:5432/guardian360
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      MINIO_ENDPOINT: minio:9000
      MQTT_BROKER: mqtt://mosquitto:1883
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: development
    ports: ["3001:3001"]
    volumes:
      - ./apps/backend-nestjs:/app
      - /app/node_modules

  backend-laravel:
    build:
      context: ./apps/backend-laravel
    depends_on: [postgres, redis]
    environment:
      DB_CONNECTION: pgsql
      DB_HOST: postgres
      DB_DATABASE: guardian360
      DB_USERNAME: guardian
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      APP_ENV: local
    ports: ["8000:8000"]
    volumes:
      - ./apps/backend-laravel:/var/www/html

  vision-ai:
    build:
      context: ./apps/ai-services/vision-ai
    depends_on: [redis, minio]
    environment:
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      MINIO_ENDPOINT: minio:9000
    ports: ["8001:8001"]
    volumes:
      - ./apps/ai-services/vision-ai:/app
      - ai_models:/app/models_weights

  satellite-patrol:
    build:
      context: ./apps/ai-services/satellite-patrol
    depends_on: [postgres, redis, minio]
    environment:
      DATABASE_URL: postgresql://guardian:${DB_PASSWORD}@postgres:5432/guardian360
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      MINIO_ENDPOINT: minio:9000
      SENTINEL_HUB_CLIENT_ID: ${SENTINEL_HUB_CLIENT_ID}
      SENTINEL_HUB_CLIENT_SECRET: ${SENTINEL_HUB_CLIENT_SECRET}
    ports: ["8002:8002"]
    volumes:
      - ./apps/ai-services/satellite-patrol:/app
      - satellite_data:/data

  airflow:
    image: apache/airflow:2.9.0
    depends_on: [postgres, redis]
    environment:
      AIRFLOW__CORE__EXECUTOR: CeleryExecutor
      AIRFLOW__DATABASE__SQL_ALCHEMY_CONN: postgresql://guardian:${DB_PASSWORD}@postgres:5432/airflow
      AIRFLOW__CELERY__BROKER_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
    ports: ["8080:8080"]
    volumes:
      - ./apps/ai-services/satellite-patrol/src/pipeline/airflow_dags:/opt/airflow/dags

  dashboard-web:
    build:
      context: ./apps/dashboard-web
      target: development
    depends_on: [backend-nestjs]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NEXT_PUBLIC_WS_URL: ws://localhost:3001
      NEXT_PUBLIC_MAPBOX_TOKEN: ${MAPBOX_TOKEN}
    ports: ["3000:3000"]
    volumes:
      - ./apps/dashboard-web:/app
      - /app/node_modules
      - /app/.next

volumes:
  pg_data:
  redis_data:
  minio_data:
  mosquitto_data:
  grafana_data:
  ai_models:
  satellite_data:
```

---

## 🎨 DESIGN SYSTEM TÁCTICO

### Paleta principal

```css
:root {
  /* Modo táctico oscuro (Centro de Comando) */
  --color-ink: #0A1929;          /* Background principal */
  --color-navy: #12274A;         /* Navy medio */
  --color-steel: #1E3A5F;        /* Steel cards */
  --color-amber: #FFB627;        /* Acento alerta */
  --color-amber-soft: #FFD074;
  --color-cyan: #00D9FF;         /* Datos en vivo */
  --color-green: #06D6A0;        /* OK */
  --color-red: #E63946;          /* Crítico */

  /* Modo claro (admin web Laravel) */
  --color-cream: #F4F1EA;
  --color-gray: #8B9DAF;
  --color-gray-dark: #5A6B7D;
}
```

### Tipografía

- **Headers:** Inter (Google Fonts) bold/black
- **Body:** Inter regular/medium
- **Mono:** JetBrains Mono (datos técnicos)

### Componentes shadcn/ui personalizados

Crear `packages/shared-ui` con los siguientes componentes con tokens de la paleta:
- `Button` (variants: primary, secondary, danger, ghost)
- `Card` (variants: default, alert, success)
- `Badge` (severity colors)
- `Modal`, `Drawer`, `Toast`
- `Table` con virtualización
- `Map` wrapper de Mapbox
- `LiveEventCard` con animación de entrada
- `KpiCard` con sparkline

---

## 🔐 SEGURIDAD Y COMPLIANCE

### Requisitos no negociables

1. **Cumplimiento Ley 25.326** Argentina
2. **Reconocimiento facial restringido:** opt-in + orden judicial
3. **Logs blockchain inmutables:** hash de cada AuditLog publicado
4. **TLS 1.3** en tránsito
5. **AES-256** en reposo (PostgreSQL + MinIO)
6. **Secrets** con HashiCorp Vault o AWS Secrets Manager
7. **OWASP Top 10** mitigado en backend
8. **MFA obligatorio** para SUPER_ADMIN y TENANT_ADMIN

### RBAC con CASL

```typescript
const abilities = {
  SUPER_ADMIN: 'manage:all',
  TENANT_ADMIN: ['read:tenant', 'write:tenant', 'manage:users'],
  OPERATOR: ['read:events', 'acknowledge:events', 'read:cameras', 'read:vehicles'],
  OFFICER: ['read:dispatches:assigned', 'update:dispatches:assigned'],
  ANALYST: ['read:events', 'read:reports', 'read:risk-zones'],
  CITIZEN: ['create:reports', 'read:own-reports', 'read:public-alerts'],
};
```

---

## 🧪 TESTING Y CALIDAD

| Capa | Coverage mín. | Framework |
|------|--------------|-----------|
| Backend NestJS | 80% líneas | Jest + Supertest |
| Backend Laravel | 75% líneas | PHPUnit + Pest |
| Frontend Next.js | 70% líneas | Vitest + React Testing Library |
| Mobile React Native | 60% líneas | Jest + RNTL |
| AI Services Python | 70% líneas | pytest |
| E2E críticos | 100% flows | Playwright |

### Flows E2E obligatorios

1. Login con MFA → dashboard
2. Detección IA → notificación → ACK → dispatch → resolución
3. Botón pánico ciudadano → recepción COM → asignación móvil
4. Carga cámara → conexión RTSP → primera detección
5. Generación reporte mensual ejecutivo
6. Detección satelital incendio → alerta → ACK
7. Onboarding ciudadano completo
8. Predicción CrimePredict → recomendación patrullaje

---

## 📊 OBSERVABILIDAD

- **Logs:** Pino estructurado JSON → Loki/OpenSearch
- **Métricas:** Prometheus + Grafana (dashboards en `/infrastructure/docker/grafana-dashboards`)
- **Tracing:** OpenTelemetry → Jaeger
- **Errores:** Sentry self-hosted

### Dashboards Grafana obligatorios

1. Latencia API por endpoint
2. Eventos por tipo y severidad
3. Cámaras online/offline + uptime
4. Despachos pendientes y tiempos
5. Uso por tenant (queries, storage, API calls)
6. Pipeline IA: detecciones/min, FP rate, GPU utilization
7. Pipeline satelital: imágenes procesadas, latencia ingesta

---

## 🌐 INTEGRACIONES EXTERNAS

| Sistema | Propósito | Módulo |
|---------|-----------|--------|
| 911 Provincial | Sincronización llamadas | Comando |
| RNPA / MERCOSUR | Vehículos buscados | VisionAI |
| RENAPER | Verificación DNI ciudadanos | CiudadanoApp |
| SINTYS | Identificación social | Comando |
| Mapbox | Mapas + routing | Todos |
| FCM/APNs | Push notifications | Mobile |
| Twilio | SMS + voice | CiudadanoApp |
| WhatsApp Business | Notificaciones oficiales | Comando |
| Sentinel Hub / Copernicus | Imágenes satelitales | SatélitePatrol |
| NVIDIA DeepStream | Inferencia edge | VisionAI |

---

## 🚢 DEPLOY Y OPERACIÓN

### Ambientes

| Ambiente | Propósito | Datos |
|----------|-----------|-------|
| `local` | Dev individual | Mocks + Faker |
| `dev` | CI integración | Sintéticos |
| `staging` | QA + demo | Sintéticos realistas |
| `prod-catamarca` | Piloto producción | Datos reales |
| `prod-salta` | Próximo piloto | Datos reales |

### Estrategia

- Cada tenant en producción tiene su namespace de Kubernetes
- DB compartida con `tenantId` (hasta volumen crítico) o dedicada
- Blue-green con Argo CD
- Rollback automático ante fallo de health checks

---

## 📝 GUÍA DE ESTILO

### TypeScript

- Strict mode siempre
- Imports absolutos `@/` y aliases `@guardian360/shared-types`
- Functional preferred, side effects aislados
- Naming:
  - PascalCase: clases, interfaces, types
  - camelCase: variables, funciones
  - SCREAMING_SNAKE_CASE: constantes
  - kebab-case: archivos
- No barrel files profundos

### Python

- Python 3.11+, type hints obligatorios
- Black + Ruff
- Pydantic v2
- Async-first

### Comentarios y commits

- Comentarios en español argentino, profesional
- TODO con autor y ticket: `// TODO(jorge, GD-123): refactor luego del piloto`

#### Conventional Commits

```
feat(vision-ai): agregar detección de armas con YOLOv10
fix(auth): corregir refresh token expiration en multi-tenant
docs(satellite-patrol): documentar pipeline de ingesta Sentinel-2
test(citizen): agregar tests E2E para botón de pánico
refactor(comando): extraer lógica de despacho a service
chore(deps): actualizar Next.js a 14.2.5
```

---

## ✅ DEFINITION OF DONE GLOBAL (toda feature)

- [ ] Código siguiendo patrones del módulo
- [ ] Tests unitarios con coverage ≥ umbral
- [ ] Tests integración para flows críticos
- [ ] JSDoc/TSDoc en funciones públicas
- [ ] OpenAPI spec actualizado (si toca API)
- [ ] Migración Prisma con rollback (si toca schema)
- [ ] i18n strings en español argentino
- [ ] Logs estructurados en puntos críticos
- [ ] Métricas Prometheus expuestas
- [ ] Auditoría registrada (acciones sensibles)
- [ ] Permisos RBAC verificados
- [ ] Validación de tenantId en queries
- [ ] PR aprobado por al menos 1 reviewer

---

## 🎯 PRIMERA INSTRUCCIÓN AL AGENTE

Empezá ejecutando el **Sprint 1.1 — Foundation** completo. Generá:

### Archivos raíz (obligatorios)

1. `package.json` con workspaces y scripts Turbo
2. `pnpm-workspace.yaml`
3. `turbo.json` con pipelines (build, test, lint, dev)
4. `.gitignore` completo (Node, Python, IDE, OS, secrets)
5. `.editorconfig`
6. `.nvmrc` (`20.11.0`)
7. `.gitattributes`
8. `docker-compose.yml` completo (con todos los servicios listados arriba)
9. `docker-compose.prod.yml` override producción
10. `.env.example` con TODAS las variables documentadas
11. `README.md` raíz: descripción, stack, setup local, troubleshooting, contribución

### Backend NestJS scaffold

```
apps/backend-nestjs/
├── package.json (con todas las deps listadas)
├── tsconfig.json
├── nest-cli.json
├── Dockerfile (multi-stage: development, production)
├── .env.example
├── prisma/
│   ├── schema.prisma (modelo COMPLETO con todas las entidades arriba)
│   └── seed.ts (1 tenant Catamarca, 5 users, 10 cameras, 3 vehicles, 2 citizens)
└── src/
    ├── main.ts (con Pino, Helmet, CORS, OpenAPI Swagger)
    ├── app.module.ts (importando todos los módulos)
    ├── common/
    │   ├── decorators/ (CurrentUser, CurrentTenant, Roles, Public)
    │   ├── filters/ (HttpExceptionFilter, PrismaExceptionFilter)
    │   ├── guards/ (JwtAuthGuard, TenantGuard, RolesGuard)
    │   ├── interceptors/ (LoggingInterceptor, AuditInterceptor)
    │   └── pipes/ (ZodValidationPipe)
    ├── config/
    │   ├── database.config.ts
    │   ├── redis.config.ts
    │   ├── jwt.config.ts
    │   ├── minio.config.ts
    │   └── app.config.ts
    └── modules/ (vacíos por ahora, se llenan en Sprints siguientes)
        ├── auth/
        ├── tenants/
        ├── users/
        ├── cameras/
        ├── events/
        ├── detections/
        ├── vehicles/
        ├── dispatch/
        ├── citizens/
        ├── citizen-reports/
        ├── satellite/
        ├── crime-predict/
        └── audit/
```

### Backend Laravel scaffold

```
apps/backend-laravel/
├── composer.json (Laravel 11)
├── .env.example
├── Dockerfile
├── README.md
└── (estructura estándar Laravel)
```

### Packages compartidos

```
packages/shared-config/
├── package.json
├── eslint.config.js (flat config)
├── prettier.config.js
└── tsconfig.base.json

packages/shared-types/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── entities/
    └── enums/
```

### CI/CD

```
.github/workflows/ci.yml
```

Pipeline completo: lint → typecheck → test → build → e2e (si aplica). Cache de pnpm store y Turbo.

---

## 🚦 INSTRUCCIONES DE EJECUCIÓN POR SPRINT

**Después del Sprint 1.1:**

Esperá feedback del cliente (Jorge) antes de avanzar. Cuando se apruebe, ejecutá Sprint 1.2 (Auth + Multi-Tenant) generando el módulo `auth` completo, los guards, el middleware Prisma, los tests, y la documentación OpenAPI.

Cada sprint termina con:
1. Demo grabable del entregable
2. Métricas (coverage, performance)
3. Documentación actualizada
4. Pull Request con descripción completa

**Nunca avances de sprint sin aprobación.**

---

## 🎬 CARACTERÍSTICAS DIFERENCIADORAS A PRESERVAR

Cada decisión de diseño debe alinearse con estos diferenciadores comerciales:

1. **Soberanía de datos** — Nunca cloud no nacional para datos sensibles
2. **Marco legal argentino nativo** — Ley 25.326, no parches después
3. **IA entrenada con datos LATAM** — No usar modelos genéricos del hemisferio norte sin fine-tuning
4. **Soporte local en español argentino** — Cada string, cada error, cada documentación
5. **Costo 60% menor que soluciones globales** — Optimización constante de infra
6. **Implementación 8-12 semanas** — Cada sprint debe contribuir a este objetivo

---

## 🤝 CONTACTO Y PRODUCTOS RELACIONADOS

**Cliente principal:** Jorge Eduardo Francesia
**Empresa:** Nativos Consultora Digital
**Ubicación:** San Fernando del Valle de Catamarca, Argentina
**Productos del ecosistema:** PUIS Catamarca · VITAL ID · Latitud360 · Blockchain Gov · ServiciosYa

Cuando una decisión arquitectónica pueda integrarse con productos existentes de Nativos (especialmente la plataforma blockchain para auditoría), priorizá esa integración.

---

## 📋 CHECKLIST PRE-EJECUCIÓN

Antes de generar el primer archivo, confirmá:

- [ ] Tenés permisos de escritura en el directorio
- [ ] Node.js 20.11+ instalado
- [ ] pnpm 9+ instalado
- [ ] Docker + docker-compose disponibles
- [ ] Git inicializado en el directorio
- [ ] Tenés ~5GB libres para imágenes Docker

Si todo está OK, **empezá generando el `README.md` raíz, el `package.json` raíz, el `pnpm-workspace.yaml` y el `.gitignore`**, y después esperá señal para continuar con el resto del Sprint 1.1.

---

## 🌟 FILOSOFÍA DEL PROYECTO

> *Guardián360 no es solo software. Es el sistema nervioso digital que conecta cámaras, satélites, ciudadanos y autoridades en una sola inteligencia operativa, hecha en Catamarca para toda Latinoamérica, con la dignidad de un producto soberano y la calidad técnica de los mejores del mundo.*

> *El sistema nervioso digital de la ciudad segura.*

**Nativos Consultora Digital · 2026**
**De Catamarca para LATAM**

---

# FIN DEL PROMPT MAESTRO DEFINITIVO
