import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super()
    // eslint-disable-next-line no-console
    console.log('[PrismaService] constructor invoked')
  }

  async onModuleInit() {
    // eslint-disable-next-line no-console
    console.log('[PrismaService] onModuleInit start')
    this.logger.log('Connecting to database...')
    await this.$connect()
    this.logger.log('Database connection established')
    // eslint-disable-next-line no-console
    console.log('[PrismaService] onModuleInit end')
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
