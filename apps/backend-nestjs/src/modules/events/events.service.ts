import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DispatchStatus, EventStatus, Prisma } from "@prisma/client";
import type { RequestUser } from "../../common/decorators/current-user.decorator";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { CloseEventDto } from "./dto/close-event.dto";
import { CreateEventDto } from "./dto/create-event.dto";
import { DispatchEventDto } from "./dto/dispatch-event.dto";
import { EventResponseDto } from "./dto/event-response.dto";

interface EventRow {
  id: string;
  tenantId: string;
  type: string;
  severity: string;
  status: string;
  cameraId: string | null;
  cameraName: string | null;
  confidence: number | null;
  latitude: number | null;
  longitude: number | null;
  occurredAt: Date;
  detectedAt: Date;
}

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async list(tenantId: string, take = 25): Promise<EventResponseDto[]> {
    const rows = await this.prisma.$queryRaw<EventRow[]>`
      SELECT
        e."id", e."tenantId", e."type", e."severity", e."status", e."cameraId",
        c."name" AS "cameraName", e."confidence",
        CASE WHEN e."location" IS NULL THEN NULL ELSE ST_Y(e."location"::geometry) END AS "latitude",
        CASE WHEN e."location" IS NULL THEN NULL ELSE ST_X(e."location"::geometry) END AS "longitude",
        e."occurredAt", e."detectedAt"
      FROM "Event" e
      LEFT JOIN "Camera" c ON c."id" = e."cameraId" AND c."tenantId" = e."tenantId"
      WHERE e."tenantId" = ${tenantId} AND e."deletedAt" IS NULL
      ORDER BY e."detectedAt" DESC
      LIMIT ${take}
    `;

    return rows.map((row) => this.toResponse(row));
  }

  async findOne(tenantId: string, id: string): Promise<EventResponseDto> {
    const rows = await this.prisma.$queryRaw<EventRow[]>`
      SELECT
        e."id", e."tenantId", e."type", e."severity", e."status", e."cameraId",
        c."name" AS "cameraName", e."confidence",
        CASE WHEN e."location" IS NULL THEN NULL ELSE ST_Y(e."location"::geometry) END AS "latitude",
        CASE WHEN e."location" IS NULL THEN NULL ELSE ST_X(e."location"::geometry) END AS "longitude",
        e."occurredAt", e."detectedAt"
      FROM "Event" e
      LEFT JOIN "Camera" c ON c."id" = e."cameraId" AND c."tenantId" = e."tenantId"
      WHERE e."tenantId" = ${tenantId} AND e."id" = ${id} AND e."deletedAt" IS NULL
      LIMIT 1
    `;

    const [event] = rows;
    if (!event) {
      throw new NotFoundException("No encontramos el evento solicitado.");
    }

    return this.toResponse(event);
  }

  async create(
    actor: RequestUser,
    dto: CreateEventDto,
    correlationId: string
  ): Promise<EventResponseDto> {
    if ((dto.latitude === undefined) !== (dto.longitude === undefined)) {
      throw new BadRequestException("Tenes que enviar latitud y longitud juntas.");
    }

    const locationSql =
      dto.latitude !== undefined && dto.longitude !== undefined
        ? Prisma.sql`ST_SetSRID(ST_MakePoint(${dto.longitude}, ${dto.latitude}), 4326)`
        : Prisma.sql`NULL`;

    const rows = await this.prisma.$queryRaw<EventRow[]>`
      INSERT INTO "Event" (
        "id", "tenantId", "cameraId", "type", "severity", "status", "confidence",
        "location", "metadata", "occurredAt", "detectedAt", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), ${actor.tenantId}, ${dto.cameraId ?? null},
        ${dto.type}::"EventType", ${dto.severity}::"Severity", ${EventStatus.NEW}::"EventStatus",
        ${dto.confidence ?? null}, ${locationSql},
        ${(dto.metadata ?? {}) as Prisma.InputJsonObject},
        ${dto.occurredAt ? new Date(dto.occurredAt) : new Date()}, now(), now(), now()
      )
      RETURNING
        "id", "tenantId", "type", "severity", "status", "cameraId", NULL::text AS "cameraName",
        "confidence",
        CASE WHEN "location" IS NULL THEN NULL ELSE ST_Y("location"::geometry) END AS "latitude",
        CASE WHEN "location" IS NULL THEN NULL ELSE ST_X("location"::geometry) END AS "longitude",
        "occurredAt", "detectedAt"
    `;

    const event = this.toResponse(rows[0]);
    await this.audit.record({
      tenantId: actor.tenantId,
      userId: actor.id,
      action: "CREATE",
      entityType: "Event",
      entityId: event.id,
      correlationId,
      metadata: {
        type: event.type,
        severity: event.severity,
        cameraId: event.cameraId
      } satisfies Prisma.InputJsonObject
    });

    return this.findOne(actor.tenantId, event.id);
  }

  async acknowledge(
    actor: RequestUser,
    id: string,
    correlationId: string
  ): Promise<EventResponseDto> {
    const result = await this.prisma.event.updateMany({
      where: {
        id,
        ...this.prisma.tenantWhere(actor.tenantId),
        status: EventStatus.NEW
      },
      data: {
        status: EventStatus.ACKNOWLEDGED,
        acknowledgedAt: new Date(),
        acknowledgedById: actor.id
      }
    });

    if (result.count === 0) {
      await this.findOne(actor.tenantId, id);
    }

    await this.audit.record({
      tenantId: actor.tenantId,
      userId: actor.id,
      action: "ACKNOWLEDGE",
      entityType: "Event",
      entityId: id,
      correlationId,
      metadata: { status: EventStatus.ACKNOWLEDGED } satisfies Prisma.InputJsonObject
    });

    return this.findOne(actor.tenantId, id);
  }

  async dispatch(
    actor: RequestUser,
    id: string,
    dto: DispatchEventDto,
    correlationId: string
  ): Promise<EventResponseDto> {
    await this.findOne(actor.tenantId, id);

    await this.prisma.$transaction(async (tx) => {
      await tx.event.updateMany({
        where: {
          id,
          ...this.prisma.tenantWhere(actor.tenantId),
          status: { in: [EventStatus.NEW, EventStatus.ACKNOWLEDGED, EventStatus.DISPATCHED] }
        },
        data: {
          status: EventStatus.DISPATCHED
        }
      });

      await tx.dispatch.create({
        data: {
          tenantId: actor.tenantId,
          eventId: id,
          status: DispatchStatus.ASSIGNED,
          priority: "HIGH",
          assignedAt: new Date(),
          notes: [dto.unitCode ? `Unidad ${dto.unitCode}` : null, dto.notes].filter(Boolean).join(" - ") || null
        }
      });
    });

    await this.audit.record({
      tenantId: actor.tenantId,
      userId: actor.id,
      action: "DISPATCH",
      entityType: "Event",
      entityId: id,
      correlationId,
      metadata: {
        status: EventStatus.DISPATCHED,
        unitCode: dto.unitCode ?? null
      } satisfies Prisma.InputJsonObject
    });

    return this.findOne(actor.tenantId, id);
  }

  async close(
    actor: RequestUser,
    id: string,
    dto: CloseEventDto,
    correlationId: string
  ): Promise<EventResponseDto> {
    await this.updateStatus(actor, id, EventStatus.RESOLVED, correlationId);

    await this.prisma.dispatch.updateMany({
      where: {
        eventId: id,
        ...this.prisma.tenantWhere(actor.tenantId),
        status: { not: DispatchStatus.CLOSED }
      },
      data: {
        status: DispatchStatus.CLOSED,
        closedAt: new Date(),
        ...(dto.resolutionNote ? { notes: dto.resolutionNote } : {})
      }
    });

    await this.audit.record({
      tenantId: actor.tenantId,
      userId: actor.id,
      action: "UPDATE",
      entityType: "Event",
      entityId: id,
      correlationId,
      metadata: {
        status: EventStatus.RESOLVED,
        resolutionNote: dto.resolutionNote ?? null
      } satisfies Prisma.InputJsonObject
    });

    return this.findOne(actor.tenantId, id);
  }

  async updateStatus(
    actor: RequestUser,
    id: string,
    status: EventStatus,
    correlationId: string
  ): Promise<EventResponseDto> {
    const result = await this.prisma.event.updateMany({
      where: {
        id,
        ...this.prisma.tenantWhere(actor.tenantId)
      },
      data: {
        status,
        ...(status === EventStatus.RESOLVED ? { resolvedAt: new Date() } : {})
      }
    });

    if (result.count === 0) {
      await this.findOne(actor.tenantId, id);
    }

    await this.audit.record({
      tenantId: actor.tenantId,
      userId: actor.id,
      action: "UPDATE",
      entityType: "Event",
      entityId: id,
      correlationId,
      metadata: { status } satisfies Prisma.InputJsonObject
    });

    return this.findOne(actor.tenantId, id);
  }

  async summary(tenantId: string) {
    const [active, critical, acknowledged, resolvedToday] = await Promise.all([
      this.prisma.event.count({
        where: {
          ...this.prisma.tenantWhere(tenantId),
          status: { in: [EventStatus.NEW, EventStatus.ACKNOWLEDGED, EventStatus.DISPATCHED] }
        }
      }),
      this.prisma.event.count({
        where: {
          ...this.prisma.tenantWhere(tenantId),
          severity: "CRITICAL",
          status: { not: EventStatus.RESOLVED }
        }
      }),
      this.prisma.event.count({
        where: {
          ...this.prisma.tenantWhere(tenantId),
          status: EventStatus.ACKNOWLEDGED
        }
      }),
      this.prisma.event.count({
        where: {
          ...this.prisma.tenantWhere(tenantId),
          status: EventStatus.RESOLVED,
          resolvedAt: {
            gte: new Date(new Date().toDateString())
          }
        }
      })
    ]);

    return { active, critical, acknowledged, resolvedToday };
  }

  private toResponse(row: EventRow | undefined): EventResponseDto {
    if (!row) {
      throw new NotFoundException("No encontramos el evento solicitado.");
    }

    return {
      id: row.id,
      tenantId: row.tenantId,
      type: row.type,
      severity: row.severity,
      status: row.status,
      cameraId: row.cameraId,
      cameraName: row.cameraName,
      confidence: row.confidence === null ? null : Number(row.confidence),
      latitude: row.latitude === null ? null : Number(row.latitude),
      longitude: row.longitude === null ? null : Number(row.longitude),
      occurredAt: row.occurredAt.toISOString(),
      detectedAt: row.detectedAt.toISOString()
    };
  }
}
