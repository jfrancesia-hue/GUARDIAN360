import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { randomUUID } from "node:crypto";
import { CurrentUser, RequestUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CreateEventDto } from "./dto/create-event.dto";
import { EventResponseDto } from "./dto/event-response.dto";
import { UpdateEventStatusDto } from "./dto/update-event-status.dto";
import { EventsService } from "./events.service";

@ApiTags("events")
@ApiBearerAuth()
@Controller("events")
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  @ApiOkResponse({ type: EventResponseDto, isArray: true })
  list(
    @CurrentUser() user: RequestUser,
    @Query("take") take?: string
  ): Promise<EventResponseDto[]> {
    return this.events.list(user.tenantId, take ? Number(take) : 25);
  }

  @Get("summary")
  @ApiOkResponse({ description: "Resumen operativo de eventos" })
  summary(@CurrentUser() user: RequestUser) {
    return this.events.summary(user.tenantId);
  }

  @Get(":id")
  @ApiOkResponse({ type: EventResponseDto })
  findOne(@CurrentUser() user: RequestUser, @Param("id") id: string): Promise<EventResponseDto> {
    return this.events.findOne(user.tenantId, id);
  }

  @Post()
  @Roles("SUPER_ADMIN", "TENANT_ADMIN", "OPERATOR")
  @ApiCreatedResponse({ type: EventResponseDto })
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateEventDto,
    @Headers("x-correlation-id") correlationId = randomUUID()
  ): Promise<EventResponseDto> {
    return this.events.create(user, dto, correlationId);
  }

  @Patch(":id/ack")
  @Roles("SUPER_ADMIN", "TENANT_ADMIN", "OPERATOR", "ANALYST")
  @ApiOkResponse({ type: EventResponseDto })
  acknowledge(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Headers("x-correlation-id") correlationId = randomUUID()
  ): Promise<EventResponseDto> {
    return this.events.acknowledge(user, id, correlationId);
  }

  @Patch(":id/status")
  @Roles("SUPER_ADMIN", "TENANT_ADMIN", "OPERATOR")
  @ApiOkResponse({ type: EventResponseDto })
  updateStatus(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() dto: UpdateEventStatusDto,
    @Headers("x-correlation-id") correlationId = randomUUID()
  ): Promise<EventResponseDto> {
    return this.events.updateStatus(user, id, dto.status, correlationId);
  }
}
