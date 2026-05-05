import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface RequestUser {
  id: string;
  tenantId: string;
  email: string;
  role: string;
}

interface RequestWithUser {
  user?: RequestUser;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestUser | undefined => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  }
);
