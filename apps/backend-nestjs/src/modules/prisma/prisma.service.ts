import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

export interface TenantScopedWhere {
  tenantId: string;
  deletedAt: null;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  tenantWhere(tenantId: string): TenantScopedWhere {
    return {
      tenantId,
      deletedAt: null
    };
  }
}
