import { AuditAction } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "./audit.service";

describe("AuditService", () => {
  it("encadena hashes de auditoria por tenant", async () => {
    const prisma = {
      auditLog: {
        findFirst: jest.fn().mockResolvedValue({ hash: "previous-hash" }),
        create: jest.fn()
      }
    } as unknown as PrismaService;
    const service = new AuditService(prisma);

    await service.record({
      tenantId: "tenant-1",
      userId: "user-1",
      action: AuditAction.CREATE,
      entityType: "User",
      entityId: "user-2",
      correlationId: "corr-1",
      metadata: { email: "operador@catamarca.gob.ar" }
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        previousHash: "previous-hash",
        hash: expect.any(String),
        tenantId: "tenant-1",
        action: AuditAction.CREATE
      })
    });
  });
});
