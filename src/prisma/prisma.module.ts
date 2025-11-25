import { PrismaService } from '@db/prisma.service'
import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

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
