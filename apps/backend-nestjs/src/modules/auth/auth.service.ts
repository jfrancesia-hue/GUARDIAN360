import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import type { RequestUser } from "../../common/decorators/current-user.decorator";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";

interface TokenPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService
  ) {}

  async login(dto: LoginDto, correlationId: string): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        active: true,
        deletedAt: null,
        tenant: {
          slug: dto.tenantSlug,
          active: true,
          deletedAt: null
        }
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Email, contrasena o tenant incorrectos.");
    }

    const response = await this.issueTokens({
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        refreshTokenHash: await bcrypt.hash(response.refreshToken, this.bcryptRounds)
      }
    });

    await this.audit.record({
      tenantId: user.tenantId,
      userId: user.id,
      action: "LOGIN",
      entityType: "User",
      entityId: user.id,
      correlationId,
      metadata: { email: user.email }
    });

    return {
      ...response,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        ...(user.agency ? { agency: user.agency } : {})
      },
      tenant: user.tenant
    };
  }

  async refresh(refreshToken: string, correlationId: string): Promise<AuthResponseDto> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        tenantId: payload.tenantId,
        active: true,
        deletedAt: null,
        tenant: {
          active: true,
          deletedAt: null
        }
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!user?.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
      throw new UnauthorizedException("El refresh token no es valido.");
    }

    const response = await this.issueTokens({
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: await bcrypt.hash(response.refreshToken, this.bcryptRounds)
      }
    });

    await this.audit.record({
      tenantId: user.tenantId,
      userId: user.id,
      action: "LOGIN",
      entityType: "RefreshToken",
      entityId: user.id,
      correlationId,
      metadata: { rotated: true }
    });

    return {
      ...response,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        ...(user.agency ? { agency: user.agency } : {})
      },
      tenant: user.tenant
    };
  }

  async logout(user: RequestUser, correlationId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: null }
    });

    await this.audit.record({
      tenantId: user.tenantId,
      userId: user.id,
      action: "LOGOUT",
      entityType: "User",
      entityId: user.id,
      correlationId,
      metadata: {}
    });

    return { message: "Sesion cerrada correctamente." };
  }

  private async issueTokens(payload: TokenPayload): Promise<
    Pick<AuthResponseDto, "accessToken" | "refreshToken" | "expiresIn">
  > {
    const expiresIn = 900;
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>("jwt.secret"),
      expiresIn: this.config.get<string>("jwt.expiresIn", "15m")
    });
    const refreshToken = await this.jwt.signAsync(
      { ...payload, tokenType: "refresh" },
      {
        secret: this.config.getOrThrow<string>("jwt.refreshSecret"),
        expiresIn: this.config.get<string>("jwt.refreshExpiresIn", "7d")
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<TokenPayload> {
    try {
      return await this.jwt.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>("jwt.refreshSecret")
      });
    } catch {
      throw new UnauthorizedException("El refresh token expiro o no es valido.");
    }
  }

  private get bcryptRounds(): number {
    return Number(this.config.get<number>("BCRYPT_ROUNDS", 12));
  }
}
