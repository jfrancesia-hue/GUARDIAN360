import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { TenantGuard } from "./common/guards/tenant.guard";
import { appConfig } from "./config/app.config";
import { databaseConfig } from "./config/database.config";
import { jwtConfig } from "./config/jwt.config";
import { minioConfig } from "./config/minio.config";
import { redisConfig } from "./config/redis.config";
import { HealthController } from "./health.controller";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CamerasModule } from "./modules/cameras/cameras.module";
import { CitizenReportsModule } from "./modules/citizen-reports/citizen-reports.module";
import { CitizensModule } from "./modules/citizens/citizens.module";
import { CrimePredictModule } from "./modules/crime-predict/crime-predict.module";
import { DetectionsModule } from "./modules/detections/detections.module";
import { DispatchModule } from "./modules/dispatch/dispatch.module";
import { EventsModule } from "./modules/events/events.module";
import { SatelliteModule } from "./modules/satellite/satellite.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { UsersModule } from "./modules/users/users.module";
import { VehiclesModule } from "./modules/vehicles/vehicles.module";
import { PrismaModule } from "./modules/prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig, minioConfig]
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? "info",
        redact: ["req.headers.authorization", "req.headers.cookie"]
      }
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120
      }
    ]),
    PrismaModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    CamerasModule,
    EventsModule,
    DetectionsModule,
    VehiclesModule,
    DispatchModule,
    CitizensModule,
    CitizenReportsModule,
    SatelliteModule,
    CrimePredictModule,
    AuditModule
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule {}
