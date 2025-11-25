import { PrismaService } from '@db/prisma.service'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  getApiStats(): { status: string, api: string, version: string } {
    return { status: 'online', api: 'eventdev-api', version: 'v1' }
  }

  async getHealth() {
    return await this.prismaService
      .$connect()
      .then(() => ({ status: 'database ok' }))
      .catch(() => ({ status: 'database error' }))
  }
}
