import { CustomSuperTokensAuthGuard } from '@common/guards/supertokens-auth.guard'
import { UserContextInterceptor } from '@common/interceptors/user-context.interceptor'
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
import { OrderModule } from '@module/order/order.module'
import { TicketModule } from '@module/ticket/ticket.module'
import { Injectable, MiddlewareConsumer, Module, NestModule, OnModuleInit } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { SuperTokensExceptionFilter } from 'supertokens-nestjs'
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
    AddressModule,
    OrderModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RateLimitMiddleware,
    AuthContextMiddleware,
    BootstrapProbeService,
    {
      provide: APP_GUARD,
      useClass: CustomSuperTokensAuthGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: UserContextInterceptor
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
