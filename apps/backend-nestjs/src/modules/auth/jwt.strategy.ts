import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { RequestUser } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../prisma/prisma.service";

interface JwtPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("jwt.secret") ?? "missing-secret"
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        tenantId: payload.tenantId,
        email: payload.email,
        active: true,
        deletedAt: null,
        tenant: {
          active: true,
          deletedAt: null
        }
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      throw new UnauthorizedException("La sesion no es valida o fue revocada.");
    }

    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role
    };
  }
}
