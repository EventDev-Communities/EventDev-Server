import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { LoggerService } from '@common/logger/logger.service'
import { ensureSuperTokensInitialized } from '@configs/supertokens.config'
import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from '@/app.module'

async function bootstrap() {
  const bootstrapLogger = new Logger('Bootstrap')
  ensureSuperTokensInitialized()
  bootstrapLogger.log('Creating Nest application')
  const app = await NestFactory.create(AppModule)
  bootstrapLogger.log('Nest application created')
  // eslint-disable-next-line no-console
  console.log('[bootstrap] Nest application created (console)')

  const logger = app.get(LoggerService)

  logger.log('Configuring security middlewares')
  app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' }))

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') || [] : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'fdi-version', 'rid', 'st-auth-mode']
  })
  logger.log('CORS configured')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: false, // Permite propriedades extras sem erro
      transform: true // Transforma tipos automaticamente
    })
  )
  app.setGlobalPrefix('api/v1', { exclude: ['/health', '', '/api/v1/auth'] })

  const config = new DocumentBuilder()
    .setTitle('EventDev API')
    .setDescription('API RESTful para gerenciamento de eventos e comunidades com autorização baseada em papéis e permissões')
    .setVersion('1.0')
    .setContact('EventDev Team', 'https://eventdev.org', 'contact@eventdev.org')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer(process.env.NODE_ENV === 'production' ? 'https://api.eventdev.org' : 'http://localhost:5122', 'API Server')
    .addTag('authentication', 'Autenticação e autorização de usuários')
    .addTag('communities', 'Gerenciamento de comunidades organizadoras')
    .addTag('events', 'Gerenciamento de eventos')
    .addTag('tickets', 'Gerenciamento de ingressos e tickets')
    .addTag('addresses', 'Gerenciamento de endereços')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Token de autenticação JWT do SuperTokens',
        in: 'header'
      },
      'bearer'
    )
    .build()

  logger.log('Generating OpenAPI schema')
  const document = SwaggerModule.createDocument(app, config)
  logger.log('OpenAPI schema generated, mounting Swagger UI')
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'EventDev API Documentation',
    customfavIcon: 'https://eventdev.org/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      tryItOutEnabled: true
    }
  })

  // Exportar OpenAPI JSON para uso em Postman/Insomnia
  if (process.env.NODE_ENV !== 'production') {
    const outputPath = join(process.cwd(), 'docs', 'openapi.json')
    writeFileSync(outputPath, JSON.stringify(document, null, 2))
    logger.log(`OpenAPI spec exported to: ${outputPath}`)
    logger.log('Import this file in Postman or Insomnia to test the API')
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.warn('SIGTERM received, shutting down gracefully')
    app
      .close()
      .then(() => process.exit(0))
      .catch((err) => {
        logger.error('Error during app shutdown', err instanceof Error ? err.stack : String(err))
        process.exit(1)
      })
  })

  const port = Number(process.env.NODE_PORT ?? 5122)
  logger.log(`Starting HTTP server on port ${port}`)
  await app.listen(port)
  logger.log(`HTTP server is listening on port ${port}`)
}

void bootstrap()
