import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { RequestUser } from "../decorators/current-user.decorator";

interface RequestWithTenant {
  user?: RequestUser;
  headers: Record<string, string | string[] | undefined>;
}

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithTenant>();
    const headerTenant = request.headers["x-tenant-id"];
    const tenantId = Array.isArray(headerTenant) ? headerTenant[0] : headerTenant;

    if (!request.user?.tenantId) {
      throw new ForbiddenException("No pudimos validar el tenant de la sesion.");
    }

    if (tenantId && tenantId !== request.user.tenantId) {
      throw new ForbiddenException("No tenes permisos para operar sobre ese tenant.");
    }

    return true;
  }
}
