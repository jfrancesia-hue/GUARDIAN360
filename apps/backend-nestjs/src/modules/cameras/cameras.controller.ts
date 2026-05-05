import { Body, Controller, Get, Headers, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { randomUUID } from "node:crypto";
import { CurrentUser, RequestUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CameraResponseDto } from "./dto/camera-response.dto";
import { CreateCameraDto } from "./dto/create-camera.dto";
import { UpdateCameraStatusDto } from "./dto/update-camera-status.dto";
import { CamerasService } from "./cameras.service";

@ApiTags("cameras")
@ApiBearerAuth()
@Controller("cameras")
export class CamerasController {
  constructor(private readonly cameras: CamerasService) {}

  @Get()
  @ApiOkResponse({ type: CameraResponseDto, isArray: true })
  list(@CurrentUser() user: RequestUser): Promise<CameraResponseDto[]> {
    return this.cameras.list(user.tenantId);
  }

  @Get("overview")
  @ApiOkResponse({ description: "Resumen de estado de camaras del tenant" })
  overview(@CurrentUser() user: RequestUser) {
    return this.cameras.overview(user.tenantId);
  }

  @Get(":id")
  @ApiOkResponse({ type: CameraResponseDto })
  findOne(@CurrentUser() user: RequestUser, @Param("id") id: string): Promise<CameraResponseDto> {
    return this.cameras.findOne(user.tenantId, id);
  }

  @Post()
  @Roles("SUPER_ADMIN", "TENANT_ADMIN")
  @ApiCreatedResponse({ type: CameraResponseDto })
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateCameraDto,
    @Headers("x-correlation-id") correlationId = randomUUID()
  ): Promise<CameraResponseDto> {
    return this.cameras.create(user, dto, correlationId);
  }

  @Patch(":id/status")
  @Roles("SUPER_ADMIN", "TENANT_ADMIN", "OPERATOR")
  @ApiOkResponse({ type: CameraResponseDto })
  updateStatus(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() dto: UpdateCameraStatusDto,
    @Headers("x-correlation-id") correlationId = randomUUID()
  ): Promise<CameraResponseDto> {
    return this.cameras.updateStatus(user, id, dto.status, correlationId);
  }
}
