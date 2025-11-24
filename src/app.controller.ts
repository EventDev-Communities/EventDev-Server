import { Controller, Get, Inject } from '@nestjs/common'
import { PublicAccess } from 'supertokens-nestjs'
import { AppService } from '@/app.service'

@Controller()
export class AppController {
  constructor(@Inject(AppService) private readonly appService: AppService) {}
  @Get()
  @PublicAccess()
  getApiStats(): { status: string, api: string, version: string } {
    return this.appService.getApiStats()
  }

  @Get('health')
  @PublicAccess()
  async getHealth() {
    return await this.appService.getHealth()
  }
}
