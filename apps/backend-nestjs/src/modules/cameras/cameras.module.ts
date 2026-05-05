import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { CamerasController } from "./cameras.controller";
import { CamerasService } from "./cameras.service";

@Module({
  imports: [AuditModule],
  controllers: [CamerasController],
  providers: [CamerasService],
  exports: [CamerasService]
})
export class CamerasModule {}
