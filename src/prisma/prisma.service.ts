import { LoggerService } from '@common/logger/logger.service'
import { env } from '@configs/env'
import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { Prisma, PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool

  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {
    const connectionString = env().DATABASE_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)

    super({ adapter } as Prisma.PrismaClientOptions)
    this.pool = pool
    this.logger.log('[PrismaService] constructor invoked')
  }

  async onModuleInit() {
    this.logger.log('[PrismaService] onModuleInit start')
    this.logger.log('Connecting to database...')
    await this.$connect()
    this.logger.log('Database connection established')
    this.logger.log('[PrismaService] onModuleInit end')
  }

  async onModuleDestroy() {
    await this.$disconnect()
    await this.pool.end().catch((err) => {
      this.logger.error('Error closing pool', err instanceof Error ? err.stack : String(err))
    })
  }
}
