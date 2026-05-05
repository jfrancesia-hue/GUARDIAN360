import { ApiProperty } from "@nestjs/swagger";

export class EventResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  severity!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ required: false })
  cameraId!: string | null;

  @ApiProperty({ required: false })
  cameraName!: string | null;

  @ApiProperty({ required: false })
  confidence!: number | null;

  @ApiProperty({ required: false })
  latitude!: number | null;

  @ApiProperty({ required: false })
  longitude!: number | null;

  @ApiProperty()
  occurredAt!: string;

  @ApiProperty()
  detectedAt!: string;
}
