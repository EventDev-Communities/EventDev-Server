import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { SuperTokensExceptionFilter } from 'supertokens-nestjs'
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' }))

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') || [] : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })

  app.useGlobalFilters(new SuperTokensExceptionFilter())
  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix('api/v1', { exclude: ['/health', ''] })

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully')
    app
      .close()
      .then(() => process.exit(0))
      .catch((err) => {
        console.log('Error during app shutdown:', err)
        process.exit(1)
      })
  })

  await app.listen(process.env.NODE_PORT ?? 5122)
}

void bootstrap()
