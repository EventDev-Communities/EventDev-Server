import { AuthService } from '@module/auth/auth.service'
import { SignInDto } from '@module/auth/dto/signin.dto'
import { CommunitySignUpDto, UserSignUpDto } from '@module/auth/dto/signup.dto'
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { PublicAccess, Session, VerifySession } from 'supertokens-nestjs'
import { SessionContainer } from 'supertokens-node/recipe/session'

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @PublicAccess()
  @ApiOperation({
    summary: 'Autenticar usuário',
    description: 'Realiza login com email e senha. Retorna dados do usuário e seus papéis'
  })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async signIn(
    @Body() data: SignInDto,
    @Req() req: Request
  ) {
    return await this.authService.signInWithSession(data, req)
  }

  @Post('signout')
  @VerifySession()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Encerrar sessão',
    description: 'Realiza logout do usuário autenticado'
  })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  async signOut(@Session() session: SessionContainer) {
    return await this.authService.signOut(session)
  }

  @Get('me')
  @VerifySession()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter perfil do usuário logado',
    description: 'Retorna dados completos do usuário autenticado incluindo papéis e permissões'
  })
  @ApiResponse({ status: 200, description: 'Dados do usuário retornados com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getCurrentUser(@Session() session: SessionContainer) {
    return await this.authService.getCurrentUser(session)
  }

  @Post('admin/users')
  @VerifySession()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[ADMIN] Criar novo usuário',
    description: 'Permite que administradores criem novos usuários com papéis específicos'
  })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  async createUser(@Body() data: UserSignUpDto, @Session() session: SessionContainer) {
    return await this.authService.createUser(data, session)
  }

  @Post('admin/communities')
  @VerifySession()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[ADMIN] Criar nova comunidade',
    description: 'Permite que administradores criem comunidades'
  })
  @ApiResponse({ status: 201, description: 'Comunidade criada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas administradores' })
  async createCommunity(@Body() data: CommunitySignUpDto) {
    return await this.authService.createCommunityWithoutSession(data)
  }

  @Post('bootstrap/admin')
  @PublicAccess()
  @ApiOperation({
    summary: 'Criar primeiro administrador do sistema',
    description: 'Rota de inicialização para criar o primeiro admin. Bloqueada após primeiro uso'
  })
  @ApiResponse({ status: 201, description: 'Administrador criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Já existe um administrador no sistema' })
  async bootstrapAdmin(@Body() data: UserSignUpDto) {
    return await this.authService.bootstrapAdmin(data)
  }

  @Post('signup/community')
  @PublicAccess()
  @ApiOperation({
    summary: 'Cadastro público de comunidade',
    description: 'Permite que comunidades se registrem diretamente na plataforma'
  })
  @ApiResponse({ status: 201, description: 'Comunidade cadastrada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  async signUpCommunity(
    @Body() data: CommunitySignUpDto,
    @Req() req: Request
  ) {
    return await this.authService.createCommunityWithSession(data, req)
  }
}
