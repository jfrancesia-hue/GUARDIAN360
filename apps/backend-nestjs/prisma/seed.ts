import bcrypt from "bcryptjs";
import { PrismaClient, TenantType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash("Guardian360!2026", 12);

  const tenant = await prisma.tenant.upsert({
    where: { slug: "catamarca-provincia" },
    update: {},
    create: {
      name: "Ministerio de Seguridad de Catamarca",
      slug: "catamarca-provincia",
      type: TenantType.PROVINCE,
      modules: ["vision-ai", "comando", "satellite-patrol", "ciudadano-app"],
      settings: {
        timezone: "America/Argentina/Catamarca",
        dataResidency: "AR",
        defaultLanguage: "es-AR"
      },
      legalEntity: "30-00000000-0",
      contactEmail: "seguridad@catamarca.gob.ar"
    }
  });

  const users = [
    ["jorge@nativos.digital", "Jorge Eduardo Francesia", UserRole.SUPER_ADMIN, "Nativos"],
    ["admin@catamarca.gob.ar", "Admin Catamarca", UserRole.TENANT_ADMIN, "Ministerio"],
    ["operador1@catamarca.gob.ar", "Operador COM Norte", UserRole.OPERATOR, "COM"],
    ["oficial1@catamarca.gob.ar", "Oficial Móvil Centro", UserRole.OFFICER, "Policía"],
    ["analista1@catamarca.gob.ar", "Analista Criminal", UserRole.ANALYST, "Análisis"]
  ] as const;

  for (const [email, fullName, role, agency] of users) {
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      update: {},
      create: {
        tenantId: tenant.id,
        email,
        fullName,
        role,
        agency,
        passwordHash,
        mfaEnabled: role === UserRole.SUPER_ADMIN || role === UserRole.TENANT_ADMIN
      }
    });
  }

  for (const plate of ["AC123AB", "AD456CD", "AE789EF"]) {
    await prisma.vehicle.upsert({
      where: { tenantId_plate: { tenantId: tenant.id, plate } },
      update: {},
      create: {
        tenantId: tenant.id,
        plate,
        make: "Toyota",
        model: "Hilux",
        color: "Blanco",
        wanted: plate === "AE789EF",
        wantedCause: plate === "AE789EF" ? "Pedido de secuestro vigente" : null,
        metadata: {}
      }
    });
  }

  for (let index = 1; index <= 2; index += 1) {
    await prisma.citizen.upsert({
      where: {
        tenantId_phoneNumber: {
          tenantId: tenant.id,
          phoneNumber: `+54383400000${index}`
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        phoneNumber: `+54383400000${index}`,
        fullName: `Ciudadano Demo ${index}`,
        dni: `3000000${index}`,
        verifiedAt: new Date(),
        consentSettings: {
          panicLocation: true,
          publicAlerts: true,
          analytics: false
        }
      }
    });
  }

  for (let index = 1; index <= 10; index += 1) {
    await prisma.$executeRaw`
      INSERT INTO "Camera" (
        "id", "tenantId", "externalId", "name", "rtspUrl", "location", "address", "zone",
        "capabilities", "status", "resolution", "fps", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), ${tenant.id}, ${`COM-CAM-${index.toString().padStart(3, "0")}`},
        ${`Camara Demo ${index}`}, ${`rtsp://demo.local/camara-${index}`},
        ST_SetSRID(ST_MakePoint(${-65.785 + index * 0.002}, ${-28.469 + index * 0.002}), 4326),
        ${`San Fernando del Valle - Punto ${index}`}, ${index <= 5 ? "Centro" : "Norte"},
        ARRAY['lpr', 'weapon'], ${index <= 7 ? "ONLINE" : "OFFLINE"}::"CameraStatus",
        '1920x1080', 25, now(), now()
      )
      ON CONFLICT ("tenantId", "externalId") DO NOTHING
    `;
  }

  const demoCameras = await prisma.camera.findMany({
    where: {
      tenantId: tenant.id,
      deletedAt: null
    },
    take: 3,
    orderBy: {
      externalId: "asc"
    },
    select: {
      id: true
    }
  });

  const eventSeeds = [
    {
      cameraId: demoCameras[0]?.id ?? null,
      type: "WEAPON",
      severity: "CRITICAL",
      confidence: 0.91,
      longitude: -65.785,
      latitude: -28.469,
      metadata: { source: "vision-ai", model: "yolov10-demo" }
    },
    {
      cameraId: demoCameras[1]?.id ?? null,
      type: "LICENSE_PLATE",
      severity: "HIGH",
      confidence: 0.87,
      longitude: -65.774,
      latitude: -28.461,
      metadata: { plate: "AE789EF", source: "lpr-demo" }
    },
    {
      cameraId: demoCameras[2]?.id ?? null,
      type: "FIRE_HOTSPOT",
      severity: "MEDIUM",
      confidence: 0.78,
      longitude: -65.7,
      latitude: -28.36,
      metadata: { source: "satellite-patrol", satellite: "sentinel-2" }
    }
  ] as const;

  for (const event of eventSeeds) {
    await prisma.$executeRaw`
      INSERT INTO "Event" (
        "id", "tenantId", "cameraId", "type", "severity", "status", "confidence",
        "location", "metadata", "occurredAt", "detectedAt", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), ${tenant.id}, ${event.cameraId}, ${event.type}::"EventType",
        ${event.severity}::"Severity", 'NEW'::"EventStatus", ${event.confidence},
        ST_SetSRID(ST_MakePoint(${event.longitude}, ${event.latitude}), 4326),
        ${event.metadata}, now(), now(), now(), now()
      )
    `;
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    throw error;
  });
