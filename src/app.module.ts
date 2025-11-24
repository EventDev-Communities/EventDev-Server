import { LoggerModule } from '@common/logger/logger.module'
import { AuthContextMiddleware } from '@common/middleware/auth-context.middleware'
import { RateLimitMiddleware } from '@common/middleware/rate-limit.middleware'
import { RateLimiterModule } from '@common/rate-limiter/rate-limiter.module'
import { AddressModule } from '@module/address/address.module'
import { AuthModule } from '@module/auth/auth.module'
import { CommunityModule } from '@module/community/community.module'
import { EventModule } from '@module/event/event.module'
import { TicketModule } from '@module/ticket/ticket.module'
import { Injectable, MiddlewareConsumer, Module, NestModule, OnModuleInit } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { PrismaModule } from '@prisma/prisma.module'
import { SuperTokensAuthGuard, SuperTokensExceptionFilter } from 'supertokens-nestjs'
import { middleware } from 'supertokens-node/framework/express'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'

@Injectable()
class BootstrapProbeService implements OnModuleInit {
  onModuleInit() {
    // eslint-disable-next-line no-console
    console.log('[BootstrapProbeService] onModuleInit called')
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    LoggerModule,
    PrismaModule,
    RateLimiterModule,
    CommunityModule,
    AuthModule,
    EventModule,
    TicketModule,
    AddressModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RateLimitMiddleware,
    AuthContextMiddleware,
    BootstrapProbeService,
    {
      provide: APP_GUARD,
      useClass: SuperTokensAuthGuard
    },
    {
      provide: APP_FILTER,
      useClass: SuperTokensExceptionFilter
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // eslint-disable-next-line no-console
    console.log('[AppModule] configure start')
    consumer.apply(middleware(), RateLimitMiddleware, AuthContextMiddleware).forRoutes('*')
    // eslint-disable-next-line no-console
    console.log('[AppModule] configure end')
  }
}
