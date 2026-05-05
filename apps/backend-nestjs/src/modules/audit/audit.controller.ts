import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser, RequestUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { AuditService } from "./audit.service";

@ApiTags("audit")
@ApiBearerAuth()
@Controller("audit")
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get("recent")
  @Roles("SUPER_ADMIN", "TENANT_ADMIN")
  @ApiOkResponse({ description: "Ultimos registros auditables del tenant actual" })
  recent(@CurrentUser() user: RequestUser) {
    return this.audit.recentForTenant(user.tenantId);
  }
}
