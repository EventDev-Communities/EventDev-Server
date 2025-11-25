import type { SessionContainer } from 'supertokens-node/recipe/session'
import { LoggerService } from '@common/logger/logger.service'
import { AddressService } from '@module/address/address.service'
import { AddressDto } from '@module/address/dto/address.dto'
import { Body, Controller, Get, Inject, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { PublicAccess, Session, VerifySession } from 'supertokens-nestjs'

@ApiTags('address')
@Controller('address')
export class AddressController {
  constructor(
    @Inject(AddressService)
    private readonly addressService: AddressService,
    @Inject(LoggerService)
    private readonly logger: LoggerService
  ) {}

  @Get()
  @PublicAccess()
  @ApiOperation({ summary: 'Listar todos os endereços' })
  @ApiResponse({ status: 200, description: 'Lista de endereços' })
  async getAll() {
    return await this.addressService.getAll()
  }

  @Post()
  @VerifySession()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo endereço' })
  @ApiResponse({ status: 201, description: 'Endereço criado com sucesso' })
  async create(@Body() data: AddressDto, @Session() session: SessionContainer) {
    this.logger.debug('Creating address', { userId: session.getUserId() })
    return await this.addressService.create(data)
  }
}
