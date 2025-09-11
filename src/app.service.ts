import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  getApiStats(): { status: string; api: string; version: string } {
    return { status: 'online', api: 'eventdev-api', version: 'v1' }
  }

  async getHealth() {
    return this.prismaService
      .$connect()
      .then(() => ({ status: 'database ok' }))
      .catch(() => ({ status: 'database error' }))
      .finally(() => {
        void this.prismaService.$disconnect()
      })
  }
}
