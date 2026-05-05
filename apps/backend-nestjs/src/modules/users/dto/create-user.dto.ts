import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "operador2@catamarca.gob.ar" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Operador COM Sur" })
  @IsString()
  fullName!: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  agency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  badge?: string;
}
