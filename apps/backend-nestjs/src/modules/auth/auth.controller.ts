import { Body, Controller, Headers, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { randomUUID } from "node:crypto";
import { CurrentUser, RequestUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("login")
  @ApiOkResponse({ type: AuthResponseDto })
  login(
    @Body() dto: LoginDto,
    @Headers("x-correlation-id") correlationId = randomUUID()
  ): Promise<AuthResponseDto> {
    return this.auth.login(dto, correlationId);
  }

  @Public()
  @Post("refresh")
  @ApiOkResponse({ type: AuthResponseDto })
  refresh(
    @Body() dto: RefreshTokenDto,
    @Headers("x-correlation-id") correlationId = randomUUID()
  ): Promise<AuthResponseDto> {
    return this.auth.refresh(dto.refreshToken, correlationId);
  }

  @Post("logout")
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Sesion cerrada" })
  logout(
    @CurrentUser() user: RequestUser,
    @Headers("x-correlation-id") correlationId = randomUUID()
  ): Promise<{ message: string }> {
    return this.auth.logout(user, correlationId);
  }
}
