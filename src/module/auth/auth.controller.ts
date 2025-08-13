import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CommunitySignUpDto, UserSignUpDto } from "./dto/signup.dto";
import { PublicAccess } from "supertokens-nestjs";
import { SignInDto } from "./dto/signin.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @PublicAccess()
  async signIn(@Body() data: SignInDto) {
    return this.authService.signIn(data);
  }

  @Post('signup/user')
  @PublicAccess()
  async signUp(@Body() data: UserSignUpDto) {
    return this.authService.createUser(data);
  }

  @Post('signup/community')
  @PublicAccess()
  async signUpCommunity(@Body() data: CommunitySignUpDto) {
    return this.authService.createCommunity(data);
  }
}
