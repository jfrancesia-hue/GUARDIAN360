import { ConflictException, Injectable } from "@nestjs/common";
import bcrypt from "bcryptjs";
import type { RequestUser } from "../../common/decorators/current-user.decorator";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async me(userId: string, tenantId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        id: userId,
        ...this.prisma.tenantWhere(tenantId),
        active: true
      },
      select: this.userSelect
    });

    return this.toResponse(user);
  }

  async list(tenantId: string): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: {
        ...this.prisma.tenantWhere(tenantId),
        active: true
      },
      orderBy: {
        fullName: "asc"
      },
      select: this.userSelect
    });

    return users.map((user) => this.toResponse(user));
  }

  async create(
    actor: RequestUser,
    dto: CreateUserDto,
    correlationId: string
  ): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: actor.tenantId,
          email: dto.email.toLowerCase()
        }
      },
      select: {
        id: true
      }
    });

    if (existing) {
      throw new ConflictException("Ya existe un usuario con ese email en este tenant.");
    }

    const user = await this.prisma.user.create({
      data: {
        tenantId: actor.tenantId,
        email: dto.email.toLowerCase(),
        fullName: dto.fullName,
        role: dto.role,
        agency: dto.agency ?? null,
        badge: dto.badge ?? null,
        passwordHash: await bcrypt.hash(dto.password, 12),
        mfaEnabled: dto.role === "SUPER_ADMIN" || dto.role === "TENANT_ADMIN"
      },
      select: this.userSelect
    });

    await this.audit.record({
      tenantId: actor.tenantId,
      userId: actor.id,
      action: "CREATE",
      entityType: "User",
      entityId: user.id,
      correlationId,
      metadata: {
        email: user.email,
        role: user.role
      }
    });

    return this.toResponse(user);
  }

  private get userSelect() {
    return {
      id: true,
      tenantId: true,
      email: true,
      fullName: true,
      role: true,
      agency: true,
      badge: true,
      active: true
    } as const;
  }

  private toResponse(user: {
    id: string;
    tenantId: string;
    email: string;
    fullName: string;
    role: string;
    agency: string | null;
    badge: string | null;
    active: boolean;
  }): UserResponseDto {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      active: user.active,
      ...(user.agency ? { agency: user.agency } : {}),
      ...(user.badge ? { badge: user.badge } : {})
    };
  }
}
