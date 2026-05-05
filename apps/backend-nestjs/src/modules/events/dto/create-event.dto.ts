import { ApiProperty } from "@nestjs/swagger";
import { EventType, Severity } from "@prisma/client";
import { IsEnum, IsISO8601, IsNumber, IsObject, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateEventDto {
  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  type!: EventType;

  @ApiProperty({ enum: Severity })
  @IsEnum(Severity)
  severity!: Severity;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cameraId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiProperty({ required: false, example: "2026-05-05T15:00:00.000Z" })
  @IsOptional()
  @IsISO8601()
  occurredAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
