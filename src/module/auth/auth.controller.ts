import { Body, Controller, Post, Get } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CommunitySignUpDto, UserSignUpDto } from './dto/signup.dto'
import { PublicAccess, VerifySession, Session } from 'supertokens-nestjs'
import { SignInDto } from './dto/signin.dto'
import { SessionContainer } from 'supertokens-node/recipe/session'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @PublicAccess()
  async signIn(@Body() data: SignInDto) {
    return this.authService.signIn(data)
  }

  @Post('signout')
  @VerifySession()
  async signOut() {
    return this.authService.signOut()
  }

  @Get('me')
  @VerifySession()
  async getCurrentUser(@Session() session: SessionContainer) {
    return this.authService.getCurrentUser(session)
  }

  @Post('admin/create-user')
  @VerifySession()
  async createUser(@Body() data: UserSignUpDto, @Session() session: SessionContainer) {
    return this.authService.createUser(data, session)
  }

  @Post('bootstrap/admin')
  @PublicAccess()
  async bootstrapAdmin(@Body() data: UserSignUpDto) {
    // Só permite criar admin se não existir nenhum admin ainda
    return this.authService.bootstrapAdmin(data)
  }

  @Post('admin/create-community')
  @VerifySession()
  async createCommunity(@Body() data: CommunitySignUpDto) {
    return this.authService.createCommunity(data)
  }

  // Rota pública para permitir comunidades se registrarem diretamente (caso necessário)
  @Post('signup/community')
  @PublicAccess()
  async signUpCommunity(@Body() data: CommunitySignUpDto) {
    return this.authService.createCommunity(data)
  }
}
