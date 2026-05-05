CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('PROVINCE', 'MUNICIPALITY', 'AGENCY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN', 'OPERATOR', 'OFFICER', 'ANALYST', 'CITIZEN');

-- CreateEnum
CREATE TYPE "CameraStatus" AS ENUM ('ONLINE', 'OFFLINE', 'DEGRADED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WEAPON', 'FIGHT', 'FALL', 'LICENSE_PLATE', 'PANIC_BUTTON', 'FIRE_HOTSPOT', 'MINING_ACTIVITY', 'BORDER_ALERT', 'CUSTOMS_ALERT', 'TRAFFIC_INCIDENT');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('NEW', 'ACKNOWLEDGED', 'DISPATCHED', 'RESOLVED', 'FALSE_POSITIVE');

-- CreateEnum
CREATE TYPE "DetectionType" AS ENUM ('PERSON', 'VEHICLE', 'LICENSE_PLATE', 'WEAPON', 'SMOKE', 'FIRE', 'CROWD');

-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('PENDING', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CitizenReportStatus" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'DISPATCHED', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACKNOWLEDGE', 'DISPATCH', 'EXPORT');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "TenantType" NOT NULL,
    "modules" TEXT[],
    "settings" JSONB NOT NULL,
    "legalEntity" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "agency" TEXT,
    "badge" TEXT,
    "phoneNumber" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "refreshTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Camera" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rtspUrl" TEXT NOT NULL,
    "location" geometry(Point, 4326) NOT NULL,
    "address" TEXT,
    "zone" TEXT,
    "capabilities" TEXT[],
    "status" "CameraStatus" NOT NULL DEFAULT 'OFFLINE',
    "resolution" TEXT,
    "fps" INTEGER,
    "edgeDeviceId" TEXT,
    "installedAt" TIMESTAMP(3),
    "lastFrameAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Camera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cameraId" TEXT,
    "citizenReportId" TEXT,
    "type" "EventType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'NEW',
    "confidence" DOUBLE PRECISION,
    "location" geometry(Point, 4326),
    "metadata" JSONB NOT NULL,
    "thumbnailUrl" TEXT,
    "videoClipUrl" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Detection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cameraId" TEXT NOT NULL,
    "eventId" TEXT,
    "type" "DetectionType" NOT NULL,
    "label" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "boundingBox" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "frameUrl" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Detection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "color" TEXT,
    "wanted" BOOLEAN NOT NULL DEFAULT false,
    "wantedCause" TEXT,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispatch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "assignedOfficerId" TEXT,
    "status" "DispatchStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "Severity" NOT NULL,
    "notes" TEXT,
    "assignedAt" TIMESTAMP(3),
    "arrivedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Dispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citizen" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dni" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "fullName" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "consentSettings" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Citizen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CitizenReport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "citizenId" TEXT,
    "type" "EventType" NOT NULL,
    "status" "CitizenReportStatus" NOT NULL DEFAULT 'RECEIVED',
    "description" TEXT NOT NULL,
    "location" geometry(Point, 4326),
    "mediaUrls" TEXT[],
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CitizenReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaOfInterest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "geometry" geometry(Polygon, 4326) NOT NULL,
    "metadata" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AreaOfInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SatelliteImage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "footprint" geometry(Polygon, 4326),
    "bands" TEXT[],
    "assetUrl" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SatelliteImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FireHotspot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "location" geometry(Point, 4326) NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION,
    "source" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FireHotspot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MiningAlert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "area" geometry(Polygon, 4326) NOT NULL,
    "severity" "Severity" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'NEW',
    "metadata" JSONB NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MiningAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgroIndex" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "area" geometry(Polygon, 4326) NOT NULL,
    "indexName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AgroIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BorderAlert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "location" geometry(Point, 4326) NOT NULL,
    "severity" "Severity" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'NEW',
    "metadata" JSONB NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BorderAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomsAlert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "shipmentId" TEXT,
    "severity" "Severity" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'NEW',
    "metadata" JSONB NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CustomsAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskZone" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "geometry" geometry(Polygon, 4326) NOT NULL,
    "metadata" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RiskZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "correlationId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "previousHash" TEXT,
    "hash" TEXT NOT NULL,
    "blockchainTxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "User_tenantId_role_active_idx" ON "User"("tenantId", "role", "active");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- CreateIndex
CREATE INDEX "Camera_tenantId_status_idx" ON "Camera"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Camera_tenantId_externalId_key" ON "Camera"("tenantId", "externalId");

-- CreateIndex
CREATE INDEX "Event_tenantId_status_severity_idx" ON "Event"("tenantId", "status", "severity");

-- CreateIndex
CREATE INDEX "Event_tenantId_occurredAt_idx" ON "Event"("tenantId", "occurredAt");

-- CreateIndex
CREATE INDEX "Detection_tenantId_cameraId_detectedAt_idx" ON "Detection"("tenantId", "cameraId", "detectedAt");

-- CreateIndex
CREATE INDEX "Vehicle_tenantId_wanted_idx" ON "Vehicle"("tenantId", "wanted");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_tenantId_plate_key" ON "Vehicle"("tenantId", "plate");

-- CreateIndex
CREATE INDEX "Dispatch_tenantId_status_priority_idx" ON "Dispatch"("tenantId", "status", "priority");

-- CreateIndex
CREATE INDEX "Citizen_tenantId_active_idx" ON "Citizen"("tenantId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Citizen_tenantId_phoneNumber_key" ON "Citizen"("tenantId", "phoneNumber");

-- CreateIndex
CREATE INDEX "CitizenReport_tenantId_status_createdAt_idx" ON "CitizenReport"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "AreaOfInterest_tenantId_active_idx" ON "AreaOfInterest"("tenantId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "SatelliteImage_tenantId_sceneId_key" ON "SatelliteImage"("tenantId", "sceneId");

-- CreateIndex
CREATE INDEX "FireHotspot_tenantId_detectedAt_idx" ON "FireHotspot"("tenantId", "detectedAt");

-- CreateIndex
CREATE INDEX "MiningAlert_tenantId_status_severity_idx" ON "MiningAlert"("tenantId", "status", "severity");

-- CreateIndex
CREATE INDEX "AgroIndex_tenantId_indexName_measuredAt_idx" ON "AgroIndex"("tenantId", "indexName", "measuredAt");

-- CreateIndex
CREATE INDEX "BorderAlert_tenantId_status_detectedAt_idx" ON "BorderAlert"("tenantId", "status", "detectedAt");

-- CreateIndex
CREATE INDEX "CustomsAlert_tenantId_status_detectedAt_idx" ON "CustomsAlert"("tenantId", "status", "detectedAt");

-- CreateIndex
CREATE INDEX "RiskZone_tenantId_active_severity_idx" ON "RiskZone"("tenantId", "active", "severity");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_action_createdAt_idx" ON "AuditLog"("tenantId", "action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_correlationId_idx" ON "AuditLog"("correlationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Camera" ADD CONSTRAINT "Camera_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_citizenReportId_fkey" FOREIGN KEY ("citizenReportId") REFERENCES "CitizenReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detection" ADD CONSTRAINT "Detection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detection" ADD CONSTRAINT "Detection_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detection" ADD CONSTRAINT "Detection_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_assignedOfficerId_fkey" FOREIGN KEY ("assignedOfficerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citizen" ADD CONSTRAINT "Citizen_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenReport" ADD CONSTRAINT "CitizenReport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenReport" ADD CONSTRAINT "CitizenReport_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaOfInterest" ADD CONSTRAINT "AreaOfInterest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SatelliteImage" ADD CONSTRAINT "SatelliteImage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FireHotspot" ADD CONSTRAINT "FireHotspot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MiningAlert" ADD CONSTRAINT "MiningAlert_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgroIndex" ADD CONSTRAINT "AgroIndex_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorderAlert" ADD CONSTRAINT "BorderAlert_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomsAlert" ADD CONSTRAINT "CustomsAlert_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskZone" ADD CONSTRAINT "RiskZone_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

