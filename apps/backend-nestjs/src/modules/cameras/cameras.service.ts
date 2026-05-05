import { Injectable, NotFoundException } from "@nestjs/common";
import { CameraStatus, Prisma } from "@prisma/client";
import type { RequestUser } from "../../common/decorators/current-user.decorator";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { CameraResponseDto } from "./dto/camera-response.dto";
import { CreateCameraDto } from "./dto/create-camera.dto";

interface CameraRow {
  id: string;
  tenantId: string;
  externalId: string;
  name: string;
  zone: string | null;
  address: string | null;
  capabilities: string[];
  status: string;
  latitude: number;
  longitude: number;
  lastFrameAt: Date | null;
}

@Injectable()
export class CamerasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async list(tenantId: string): Promise<CameraResponseDto[]> {
    const rows = await this.prisma.$queryRaw<CameraRow[]>`
      SELECT
        "id", "tenantId", "externalId", "name", "zone", "address", "capabilities", "status",
        ST_Y("location"::geometry) AS "latitude",
        ST_X("location"::geometry) AS "longitude",
        "lastFrameAt"
      FROM "Camera"
      WHERE "tenantId" = ${tenantId} AND "deletedAt" IS NULL
      ORDER BY "status" ASC, "name" ASC
    `;

    return rows.map((row) => this.toResponse(row));
  }

  async findOne(tenantId: string, id: string): Promise<CameraResponseDto> {
    const rows = await this.prisma.$queryRaw<CameraRow[]>`
      SELECT
        "id", "tenantId", "externalId", "name", "zone", "address", "capabilities", "status",
        ST_Y("location"::geometry) AS "latitude",
        ST_X("location"::geometry) AS "longitude",
        "lastFrameAt"
      FROM "Camera"
      WHERE "tenantId" = ${tenantId} AND "id" = ${id} AND "deletedAt" IS NULL
      LIMIT 1
    `;

    const [camera] = rows;
    if (!camera) {
      throw new NotFoundException("No encontramos la camara solicitada.");
    }

    return this.toResponse(camera);
  }

  async create(
    actor: RequestUser,
    dto: CreateCameraDto,
    correlationId: string
  ): Promise<CameraResponseDto> {
    const rows = await this.prisma.$queryRaw<CameraRow[]>`
      INSERT INTO "Camera" (
        "id", "tenantId", "externalId", "name", "rtspUrl", "location", "address", "zone",
        "capabilities", "status", "resolution", "fps", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), ${actor.tenantId}, ${dto.externalId}, ${dto.name}, ${dto.rtspUrl},
        ST_SetSRID(ST_MakePoint(${dto.longitude}, ${dto.latitude}), 4326),
        ${dto.address ?? null}, ${dto.zone ?? null}, ${dto.capabilities},
        ${CameraStatus.OFFLINE}::"CameraStatus", ${dto.resolution ?? null}, ${dto.fps ?? null},
        now(), now()
      )
      RETURNING
        "id", "tenantId", "externalId", "name", "zone", "address", "capabilities", "status",
        ST_Y("location"::geometry) AS "latitude",
        ST_X("location"::geometry) AS "longitude",
        "lastFrameAt"
    `;

    const camera = this.toResponse(rows[0]);
    await this.audit.record({
      tenantId: actor.tenantId,
      userId: actor.id,
      action: "CREATE",
      entityType: "Camera",
      entityId: camera.id,
      correlationId,
      metadata: {
        externalId: camera.externalId,
        name: camera.name,
        zone: camera.zone
      } satisfies Prisma.InputJsonObject
    });

    return camera;
  }

  async updateStatus(
    actor: RequestUser,
    id: string,
    status: CameraStatus,
    correlationId: string
  ): Promise<CameraResponseDto> {
    await this.prisma.camera.updateMany({
      where: {
        id,
        ...this.prisma.tenantWhere(actor.tenantId)
      },
      data: {
        status,
        ...(status === CameraStatus.ONLINE ? { lastFrameAt: new Date() } : {})
      }
    });

    const camera = await this.findOne(actor.tenantId, id);
    await this.audit.record({
      tenantId: actor.tenantId,
      userId: actor.id,
      action: "UPDATE",
      entityType: "Camera",
      entityId: id,
      correlationId,
      metadata: { status } satisfies Prisma.InputJsonObject
    });

    return camera;
  }

  async overview(tenantId: string): Promise<{ total: number; online: number; degraded: number }> {
    const [total, online, degraded] = await Promise.all([
      this.prisma.camera.count({ where: this.prisma.tenantWhere(tenantId) }),
      this.prisma.camera.count({
        where: { ...this.prisma.tenantWhere(tenantId), status: CameraStatus.ONLINE }
      }),
      this.prisma.camera.count({
        where: { ...this.prisma.tenantWhere(tenantId), status: CameraStatus.DEGRADED }
      })
    ]);

    return { total, online, degraded };
  }

  private toResponse(row: CameraRow | undefined): CameraResponseDto {
    if (!row) {
      throw new NotFoundException("No encontramos la camara solicitada.");
    }

    return {
      id: row.id,
      tenantId: row.tenantId,
      externalId: row.externalId,
      name: row.name,
      zone: row.zone,
      address: row.address,
      capabilities: row.capabilities,
      status: row.status,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      health: this.calculateHealth(row.status, row.lastFrameAt),
      lastFrameAt: row.lastFrameAt?.toISOString() ?? null
    };
  }

  private calculateHealth(status: string, lastFrameAt: Date | null): number {
    if (status === CameraStatus.OFFLINE) {
      return 0;
    }

    if (status === CameraStatus.DEGRADED) {
      return 72;
    }

    if (!lastFrameAt) {
      return 88;
    }

    const ageSeconds = Math.floor((Date.now() - lastFrameAt.getTime()) / 1000);
    return Math.max(70, Math.min(99, 99 - Math.floor(ageSeconds / 30)));
  }
}
