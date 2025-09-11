import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { PublicAccess } from 'supertokens-nestjs'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @PublicAccess()
  getApiStats(): { status: string; api: string; version: string } {
    return this.appService.getApiStats()
  }

  @Get('health')
  @PublicAccess()
  getHealth() {
    return this.appService.getHealth()
  }
}
