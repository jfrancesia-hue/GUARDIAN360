import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { RequestUser } from "./current-user.decorator";

interface RequestWithTenant {
  user?: RequestUser;
  headers: Record<string, string | string[] | undefined>;
}

export const CurrentTenant = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | undefined => {
    const request = context.switchToHttp().getRequest<RequestWithTenant>();
    const headerTenant = request.headers["x-tenant-id"];
    return request.user?.tenantId ?? (Array.isArray(headerTenant) ? headerTenant[0] : headerTenant);
  }
);
