import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommunityService } from '../community/community.service';
import { signUp, signIn, Error as STError } from 'supertokens-node/recipe/emailpassword';
import UserRoles from 'supertokens-node/recipe/userroles';
import { CommunitySignUpDto, UserSignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(private readonly communityService: CommunityService) {}

  async signIn(signInDto: SignInDto) {
    try {
      const response = await signIn(
        'public',
        signInDto.email,
        signInDto.password,
      );
      if (response.status === 'OK') {
        return { status: 'OK' };
      }
    } catch (err) {
      if (err instanceof STError) {
        throw new ConflictException('Credenciais inválidas.');
      }
      throw new InternalServerErrorException('Erro inesperado no login.');
    }
  }

  async createCommunity(data: CommunitySignUpDto) {
    try {
      const superTokenUser = await signUp(
        'public',
        data.email,
        data.password,
      );

      if (superTokenUser.status !== 'OK') {
        throw new ConflictException('Este email já está em uso.');
      }

      const userId = superTokenUser.user.id;
      await UserRoles.addRoleToUser('public', userId, 'community');

      const communityData = {
        supertokens_id: userId,
        name: data.name,
        logo_url: data.logo_url,
        description: data.description,
        is_active: data.is_active,
        link_github: data.link_github,
        link_instagram: data.link_instagram,
        link_linkedin: data.link_linkedin,
        link_website: data.link_website,
        phone_number: data.phone_number,
      };

      const communityProfile = await this.communityService.create(communityData);

      return { status: 'OK', user_info: communityProfile };
    } catch (err) {
      if (err instanceof STError && err.message.includes('email already exists')) {
        throw new ConflictException('Este email já está em uso.');
      }
      throw new InternalServerErrorException('Erro inesperado ao criar comunidade.');
    }
  }

  async createUser(data: UserSignUpDto) {
    return { status: 'Ainda não implementado' };
  }
}
