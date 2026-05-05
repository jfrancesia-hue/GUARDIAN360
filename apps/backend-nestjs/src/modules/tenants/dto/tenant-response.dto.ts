import { ApiProperty } from "@nestjs/swagger";

export class TenantResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty({ type: [String] })
  modules!: string[];

  @ApiProperty()
  legalEntity!: string;

  @ApiProperty()
  contactEmail!: string;
}
