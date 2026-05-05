import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { randomUUID } from "node:crypto";
import { CurrentUser, RequestUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  @ApiOkResponse({ type: UserResponseDto })
  me(@CurrentUser() user: RequestUser): Promise<UserResponseDto> {
    return this.users.me(user.id, user.tenantId);
  }

  @Get()
  @Roles("SUPER_ADMIN", "TENANT_ADMIN")
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  list(@CurrentUser() user: RequestUser): Promise<UserResponseDto[]> {
    return this.users.list(user.tenantId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "TENANT_ADMIN")
  @ApiCreatedResponse({ type: UserResponseDto })
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateUserDto,
    @Headers("x-correlation-id") correlationId = randomUUID()
  ): Promise<UserResponseDto> {
    return this.users.create(user, dto, correlationId);
  }
}
