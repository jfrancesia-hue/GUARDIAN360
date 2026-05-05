import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CloseEventDto {
  @ApiProperty({ required: false, example: "Intervencion finalizada con evidencia preservada" })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  resolutionNote?: string;
}
