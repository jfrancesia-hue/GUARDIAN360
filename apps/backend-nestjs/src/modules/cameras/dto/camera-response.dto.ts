import { ApiProperty } from "@nestjs/swagger";

export class CameraResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  externalId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  zone!: string | null;

  @ApiProperty()
  address!: string | null;

  @ApiProperty({ type: [String] })
  capabilities!: string[];

  @ApiProperty()
  status!: string;

  @ApiProperty()
  latitude!: number;

  @ApiProperty()
  longitude!: number;

  @ApiProperty()
  health!: number;

  @ApiProperty()
  lastFrameAt!: string | null;
}
