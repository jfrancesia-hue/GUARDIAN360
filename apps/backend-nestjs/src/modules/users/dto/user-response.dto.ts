import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty({ required: false })
  agency?: string;

  @ApiProperty({ required: false })
  badge?: string;

  @ApiProperty()
  active!: boolean;
}
