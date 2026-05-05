import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  const userRecord = {
    id: "user-1",
    tenantId: "tenant-1",
    email: "admin@catamarca.gob.ar",
    fullName: "Admin Catamarca",
    role: UserRole.TENANT_ADMIN,
    agency: "Ministerio",
    passwordHash: "",
    tenant: {
      id: "tenant-1",
      name: "Ministerio de Seguridad de Catamarca",
      slug: "catamarca-provincia"
    }
  };

  const buildService = () => {
    const prismaMock = {
      user: {
        findFirst: jest.fn(),
        update: jest.fn()
      }
    };
    const jwtMock = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn()
    };
    const config = {
      get: jest.fn((key: string, fallback?: string | number) => {
        const values: Record<string, string | number> = {
          "jwt.expiresIn": "15m",
          "jwt.refreshExpiresIn": "7d",
          BCRYPT_ROUNDS: 4
        };

        return values[key] ?? fallback;
      }),
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string> = {
          "jwt.secret": "access-secret-min-32-characters",
          "jwt.refreshSecret": "refresh-secret-min-32-characters"
        };

        return values[key];
      })
    } as unknown as ConfigService;
    const auditMock = {
      record: jest.fn()
    };

    return {
      service: new AuthService(
        prismaMock as unknown as PrismaService,
        jwtMock as unknown as JwtService,
        config,
        auditMock as unknown as AuditService
      ),
      prisma: prismaMock,
      jwt: jwtMock,
      audit: auditMock
    };
  };

  it("emite tokens y registra auditoria cuando las credenciales son validas", async () => {
    const { service, prisma, jwt, audit } = buildService();
    const passwordHash = await bcrypt.hash("Guardian360!2026", 4);
    prisma.user.findFirst.mockResolvedValue({ ...userRecord, passwordHash });
    prisma.user.update.mockResolvedValue({ ...userRecord, passwordHash });
    jwt.signAsync.mockResolvedValueOnce("access-token").mockResolvedValueOnce("refresh-token");

    const response = await service.login(
      {
        tenantSlug: "catamarca-provincia",
        email: "ADMIN@catamarca.gob.ar",
        password: "Guardian360!2026"
      },
      "corr-1"
    );

    expect(response.accessToken).toBe("access-token");
    expect(response.refreshToken).toBe("refresh-token");
    expect(response.user.email).toBe("admin@catamarca.gob.ar");
    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          email: "admin@catamarca.gob.ar"
        })
      })
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "LOGIN",
        correlationId: "corr-1",
        tenantId: "tenant-1"
      })
    );
  });

  it("rechaza credenciales invalidas sin emitir tokens", async () => {
    const { service, prisma, jwt } = buildService();
    const passwordHash = await bcrypt.hash("Guardian360!2026", 4);
    prisma.user.findFirst.mockResolvedValue({ ...userRecord, passwordHash });

    await expect(
      service.login(
        {
          tenantSlug: "catamarca-provincia",
          email: "admin@catamarca.gob.ar",
          password: "OtraPassword!2026"
        },
        "corr-2"
      )
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});
