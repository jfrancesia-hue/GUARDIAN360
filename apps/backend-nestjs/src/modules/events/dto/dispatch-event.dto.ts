import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class DispatchEventDto {
  @ApiProperty({ required: false, example: "M-12" })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  unitCode?: string;

  @ApiProperty({ required: false, example: "Despacho desde Centro de Comando" })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  notes?: string;
}
