import { ApiProperty } from "@nestjs/swagger";
import { CameraStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateCameraStatusDto {
  @ApiProperty({ enum: CameraStatus })
  @IsEnum(CameraStatus)
  status!: CameraStatus;
}
