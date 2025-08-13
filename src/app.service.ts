import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  getApiStats(): { status: string; api: string; version: string } {
    return { status: 'online', api: 'Event-Dev-Api', version: 'v1' }
  }

  getHealth() {
    return this.prismaService.$connect
  }
}
