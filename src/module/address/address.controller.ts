import { LoggerService } from '@common/logger/logger.service'
import { AddressService } from '@module/address/address.service'
import { AddressDto } from '@module/address/dto/address.dto'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { PublicAccess, Session, VerifySession } from 'supertokens-nestjs'
import { SessionContainer } from 'supertokens-node/recipe/session'

@ApiTags('address')
@Controller('address')
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
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
