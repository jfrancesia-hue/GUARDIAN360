import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { register } from "prom-client";
import { Public } from "./common/decorators/public.decorator";

interface HealthResponse {
  status: "ok";
  service: "backend-nestjs";
  timestamp: string;
}

@ApiTags("health")
@Controller()
export class HealthController {
  @Public()
  @Get("health")
  @ApiOkResponse({ description: "Servicio disponible" })
  getHealth(): HealthResponse {
    return {
      status: "ok",
      service: "backend-nestjs",
      timestamp: new Date().toISOString()
    };
  }

  @Public()
  @Get("metrics")
  @ApiOkResponse({ description: "Metricas Prometheus" })
  getMetrics(): Promise<string> {
    return register.metrics();
  }
}
