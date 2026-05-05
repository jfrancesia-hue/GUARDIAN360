import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "catamarca-provincia" })
  @IsString()
  tenantSlug!: string;

  @ApiProperty({ example: "admin@catamarca.gob.ar" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Guardian360!2026", minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
