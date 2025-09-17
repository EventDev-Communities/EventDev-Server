import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CommunitySignUpDto /*, UserSignUpDto */ } from './dto/signup.dto'
import { PublicAccess /*, VerifySession */ } from 'supertokens-nestjs'
import { SignInDto } from './dto/signin.dto'
import { Session } from 'supertokens-nestjs'
import { SessionContainer } from 'supertokens-node/recipe/session'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import { ResetPasswordDto } from './dto/reset-password.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @PublicAccess()
  async signIn(@Body() data: SignInDto) {
    return this.authService.signIn(data)
  }

  /*
  @Post('signup/user')
  @PublicAccess()
  async signUp(@Body() data: UserSignUpDto) {
    return this.authService.createUser(data);
  }
  */

  @Post('signup/community')
  @PublicAccess()
  // @VerifySession({ roles: ['admin'] })
  async signUpCommunity(@Body() data: CommunitySignUpDto) {
    return this.authService.createCommunity(data)
  }

  @Post('signout')
  async signOut(@Session() session: SessionContainer) {
    return this.authService.signOut(session);
  }

  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data.userId, data.email);
  }
}
