import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { CommunityService } from '../community/community.service'
import { PrismaService } from '../../prisma/prisma.service'
import { signUp, signIn, Error as STError } from 'supertokens-node/recipe/emailpassword'
import UserRoles from 'supertokens-node/recipe/userroles'
import { CommunitySignUpDto, UserSignUpDto } from './dto/signup.dto'
import { SignInDto } from './dto/signin.dto'
import { SessionContainer } from 'supertokens-node/recipe/session'

@Injectable()
export class AuthService {
  constructor(
    private readonly communityService: CommunityService,
    private readonly prismaService: PrismaService
  ) {}

  async signIn(signInDto: SignInDto) {
    try {
      const response = await signIn('public', signInDto.email, signInDto.password)

      if (response.status === 'OK') {
        // Buscar o papel do usuário
        const userRoles = await UserRoles.getRolesForUser('public', response.user.id)

        return {
          status: 'OK',
          user: {
            id: response.user.id,
            email: response.user.emails[0],
            roles: userRoles.roles
          }
        }
      } else if (response.status === 'WRONG_CREDENTIALS_ERROR') {
        throw new ConflictException('Email ou senha incorretos.')
      } else {
        throw new ConflictException('Erro no login.')
      }
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err
      }
      if (err instanceof STError) {
        throw new ConflictException('Credenciais inválidas.')
      }
      throw new InternalServerErrorException('Erro inesperado no login.')
    }
  }

  async signOut() {
    return { status: 'OK', message: 'Logout realizado com sucesso.' }
  }

  async getCurrentUser(session: SessionContainer) {
    // Este método é chamado apenas em rotas protegidas
    // O SuperTokens já validou a sessão
    const userId = session.getUserId()

    try {
      // Buscar o papel do usuário
      const userRoles = await UserRoles.getRolesForUser('public', userId)
      let communityId: number | null = null
      if (userRoles.roles.includes('community')) {
        const community = await this.communityService.getByUserId(userId)
        communityId = community?.id ?? null
      }

      return {
        status: 'OK',
        user: {
          id: userId,
          email: session.getUserId(), // O SuperTokens não expõe email diretamente na sessão
          roles: userRoles.roles,
          communityId
        }
      }
    } catch {
      throw new InternalServerErrorException('Erro ao buscar dados do usuário.')
    }
  }

  async createCommunity(data: CommunitySignUpDto) {
    try {
      const superTokenUser = await signUp('public', data.email, data.password)

      if (superTokenUser.status !== 'OK') {
        throw new ConflictException('Este email já está em uso.')
      }

      const userId = superTokenUser.user.id
      await UserRoles.addRoleToUser('public', userId, 'community')

      const communityData = {
        name: data.name,
        logo_url: data.logo_url,
        description: data.description,
        is_active: data.is_active,
        link_github: data.link_github,
        link_instagram: data.link_instagram,
        link_linkedin: data.link_linkedin,
        link_website: data.link_website,
        phone_number: data.phone_number
      }

      const communityProfile = await this.communityService.create(communityData, userId)

      return { status: 'OK', user_info: communityProfile }
    } catch (err) {
      if (err instanceof STError && err.message.includes('email already exists')) {
        throw new ConflictException('Este email já está em uso.')
      }
      throw new InternalServerErrorException('Erro inesperado ao criar comunidade.')
    }
  }

  async createUser(data: UserSignUpDto, session?: SessionContainer) {
    // Verificar se o usuário logado tem permissão de admin (apenas quando há sessão)
    if (session) {
      const userRoles = await UserRoles.getRolesForUser('public', session.getUserId())
      if (!userRoles.roles.includes('admin')) {
        throw new ConflictException('Acesso negado. Apenas administradores podem criar usuários.')
      }
    }

    try {
      const superTokenUser = await signUp('public', data.email, data.password)

      if (superTokenUser.status !== 'OK') {
        throw new ConflictException('Este email já está em uso.')
      }

      const userId = superTokenUser.user.id
      await UserRoles.addRoleToUser('public', userId, data.role)

      return { status: 'OK', user_info: { id: userId, email: data.email, role: data.role } }
    } catch (err) {
      if (err instanceof STError && err.message.includes('email already exists')) {
        throw new ConflictException('Este email já está em uso.')
      }
      if (err instanceof ConflictException) {
        throw err
      }
      throw new InternalServerErrorException('Erro inesperado ao criar usuário.')
    }
  }

  async bootstrapAdmin(data: UserSignUpDto) {
    try {
      // Verificar se já existe algum admin
      const allUsersResponse = await UserRoles.getUsersThatHaveRole('public', 'admin')
      if (allUsersResponse.status === 'OK' && allUsersResponse.users.length > 0) {
        throw new ConflictException('Já existe um administrador no sistema.')
      }

      const superTokenUser = await signUp('public', data.email, data.password)

      if (superTokenUser.status !== 'OK') {
        throw new ConflictException('Este email já está em uso.')
      }

      const userId = superTokenUser.user.id
      await UserRoles.addRoleToUser('public', userId, 'admin')

      return { status: 'OK', user_info: { id: userId, email: data.email, role: 'admin' } }
    } catch (err) {
      if (err instanceof STError && err.message.includes('email already exists')) {
        throw new ConflictException('Este email já está em uso.')
      }
      if (err instanceof ConflictException) {
        throw err
      }
      throw new InternalServerErrorException('Erro inesperado ao criar administrador.')
    }
  }
}
