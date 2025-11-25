import { LoggerModule } from '@common/logger/logger.module'
import { AuthContextMiddleware } from '@common/middleware/auth-context.middleware'
import { RateLimitMiddleware } from '@common/middleware/rate-limit.middleware'
import { RateLimiterModule } from '@common/rate-limiter/rate-limiter.module'
import { validate } from '@configs/env'
import { PrismaModule } from '@db/prisma.module'
import { AddressModule } from '@module/address/address.module'
import { AppController } from '@module/app/app.controller'
import { AppService } from '@module/app/app.service'
import { AuthModule } from '@module/auth/auth.module'
import { CommunityModule } from '@module/community/community.module'
import { EventModule } from '@module/event/event.module'
import { TicketModule } from '@module/ticket/ticket.module'
import { Injectable, MiddlewareConsumer, Module, NestModule, OnModuleInit } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { SuperTokensAuthGuard, SuperTokensExceptionFilter } from 'supertokens-nestjs'
import { middleware } from 'supertokens-node/framework/express'

@Injectable()
class BootstrapProbeService implements OnModuleInit {
  onModuleInit() {
    // Probe initialized
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate
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
    consumer.apply(middleware(), RateLimitMiddleware, AuthContextMiddleware).forRoutes('*')
  }
}
