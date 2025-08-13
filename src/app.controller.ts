import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApiStats(): { status: string; api: string; version: string } {
    return this.appService.getApiStats()
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth()
  }
}
