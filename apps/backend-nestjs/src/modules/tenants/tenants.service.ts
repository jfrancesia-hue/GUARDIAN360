import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TenantResponseDto } from "./dto/tenant-response.dto";

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async current(tenantId: string): Promise<TenantResponseDto> {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        id: tenantId,
        active: true,
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        modules: true,
        legalEntity: true,
        contactEmail: true
      }
    });

    if (!tenant) {
      throw new NotFoundException("No encontramos el tenant solicitado.");
    }

    return tenant;
  }
}
