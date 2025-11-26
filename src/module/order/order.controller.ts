import { CurrentUser } from '@common/decorators/current-user.decorator'
import { IAuthUser } from '@common/interfaces/auth-user.interface'
import { LoggerService } from '@common/logger/logger.service'
import { PrismaService } from '@db/prisma.service'
import { CreateOrderDto } from '@module/order/dto/create-order.dto'
import { OrderService } from '@module/order/order.service'
import { Body, Controller, HttpStatus, Inject, NotFoundException, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { VerifySession } from 'supertokens-nestjs'

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(
    @Inject(OrderService) private readonly orderService: OrderService,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(PrismaService) private readonly prismaService: PrismaService
  ) {}

  @Post()
  @VerifySession()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar pedido (Checkout)',
    description: 'Cria um pedido e processa o pagamento via Mercado Pago (Checkout Transparente)'
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Pedido criado e pagamento processado' })
  async createOrder(@Body() data: CreateOrderDto, @CurrentUser() user: IAuthUser) {
    const dbUser = await this.prismaService.user.findUnique({ where: { supertokensId: user.id } })
    if (!dbUser) {
      throw new NotFoundException('User not found')
    }
    return await this.orderService.createOrder(dbUser.id, data)
  }
}
