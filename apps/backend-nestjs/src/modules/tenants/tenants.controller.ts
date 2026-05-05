import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser, RequestUser } from "../../common/decorators/current-user.decorator";
import { TenantResponseDto } from "./dto/tenant-response.dto";
import { TenantsService } from "./tenants.service";

@ApiTags("tenants")
@ApiBearerAuth()
@Controller("tenants")
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  @Get("current")
  @ApiOkResponse({ type: TenantResponseDto })
  current(@CurrentUser() user: RequestUser): Promise<TenantResponseDto> {
    return this.tenants.current(user.tenantId);
  }
}
