import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from '@prisma/prisma.service'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env'
    })
  ],
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}
