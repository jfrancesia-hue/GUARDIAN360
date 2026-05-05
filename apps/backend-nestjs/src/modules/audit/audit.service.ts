import { Injectable } from "@nestjs/common";
import { AuditAction, Prisma } from "@prisma/client";
import { createHash } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";

export interface AuditRecordInput {
  tenantId: string;
  userId?: string;
  action: AuditAction | keyof typeof AuditAction;
  entityType: string;
  entityId?: string;
  correlationId: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Prisma.InputJsonValue;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditRecordInput): Promise<void> {
    const previous = await this.prisma.auditLog.findFirst({
      where: {
        tenantId: input.tenantId,
        deletedAt: null
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        hash: true
      }
    });

    const hash = this.createHash(input, previous?.hash ?? null);

    await this.prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId ?? null,
        action: this.toAuditAction(input.action),
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        correlationId: input.correlationId,
        metadata: input.metadata,
        previousHash: previous?.hash ?? null,
        hash
      }
    });
  }

  async recentForTenant(tenantId: string, take = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        deletedAt: null
      },
      orderBy: {
        createdAt: "desc"
      },
      take,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        correlationId: true,
        previousHash: true,
        hash: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });
  }

  private createHash(input: AuditRecordInput, previousHash: string | null): string {
    return createHash("sha256")
      .update(
        JSON.stringify({
          tenantId: input.tenantId,
          userId: input.userId ?? null,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId ?? null,
          correlationId: input.correlationId,
          metadata: input.metadata,
          previousHash
        })
      )
      .digest("hex");
  }

  private toAuditAction(action: AuditRecordInput["action"]): AuditAction {
    if (typeof action === "string") {
      return AuditAction[action as keyof typeof AuditAction];
    }

    return action;
  }
}
