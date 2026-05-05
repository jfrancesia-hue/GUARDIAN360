import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateCameraDto {
  @ApiProperty({ example: "COM-014" })
  @IsString()
  externalId!: string;

  @ApiProperty({ example: "Camara Plaza 25 de Mayo" })
  @IsString()
  name!: string;

  @ApiProperty({ example: "rtsp://edge.local/camera-014" })
  @IsString()
  rtspUrl!: string;

  @ApiProperty({ example: -28.4696 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({ example: -65.7795 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zone?: string;

  @ApiProperty({ type: [String], example: ["lpr", "weapon"] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  capabilities!: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  fps?: number;
}
