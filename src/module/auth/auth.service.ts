import type { IAuthAdapter } from '@infrastructure/auth/auth.adapter.interface'
import { UserRole } from '@common/enums/roles.enum'
import { LoggerService } from '@common/logger/logger.service'
import { env } from '@configs/env'
import { PrismaService } from '@db/prisma.service'
import { EmailService } from '@infrastructure/email/email.service'
import { ForgotPasswordDto } from '@module/auth/dto/forgot-password.dto'
import { ResetPasswordDto } from '@module/auth/dto/reset-password.dto'
import { SignInDto } from '@module/auth/dto/signin.dto'
import { CommunitySignUpDto, UserSignUpDto } from '@module/auth/dto/signup.dto'
import { CommunityService } from '@module/community/community.service'
import { ConflictException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { Request, Response } from 'express'
import { convertToRecipeUserId, listUsersByAccountInfo } from 'supertokens-node'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import SessionRecipe, { SessionContainer } from 'supertokens-node/recipe/session'

@Injectable()
export class AuthService {
  constructor(
    @Inject(CommunityService) private readonly communityService: CommunityService,
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    @Inject('IAuthAdapter') private readonly authAdapter: IAuthAdapter,
    @Inject(EmailService) private readonly emailService: EmailService,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {}

  async signInWithSession(signInDto: SignInDto, req: Request) {
    try {
      const res = (req as Request & { res: Response }).res

      const result = await EmailPassword.signIn('public', signInDto.email, signInDto.password, undefined, {
        req,
        res
      })

      if (result.status === 'OK') {
        const userId = result.user.id
        const roles = await this.authAdapter.getUserRoles(userId)

        return {
          status: 'OK',
          user: {
            id: userId,
            email: result.user.emails[0],
            roles
          }
        }
      }
      if (result.status === 'WRONG_CREDENTIALS_ERROR') {
        throw new ConflictException('Email ou senha incorretos.')
      } else {
        throw new ConflictException('Erro no login.')
      }
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err
      }
      throw new InternalServerErrorException('Erro inesperado no login.')
    }
  }

  async signOut(session: SessionContainer) {
    try {
      await session.revokeSession()
      return { status: 'OK', message: 'Logout realizado com sucesso.' }
    } catch {
      throw new InternalServerErrorException('Erro ao encerrar a sessão.')
    }
  }

  async sendPasswordResetToken(data: ForgotPasswordDto) {
    try {
      const users = await listUsersByAccountInfo('public', { email: data.email })

      if (users.length === 0) {
        // Por segurança, não informamos se o email existe ou não
        return { status: 'OK', message: 'Se o email existir, um link de recuperação será enviado.' }
      }

      const user = users[0]
      const tokenResult = await EmailPassword.createResetPasswordToken('public', user.id, data.email)

      if (tokenResult.status === 'OK') {
        const websiteDomain = env().WEBSITE_DOMAIN

        const resetLink = `${websiteDomain}/auth/reset-password?token=${encodeURIComponent(tokenResult.token)}`

        // Enviar email real
        await this.emailService.sendPasswordResetEmail(data.email, resetLink)

        // Log apenas em desenvolvimento
        if (env().NODE_ENV === 'development') {
          this.logger.log(`[Password Reset] Link gerado para [REDACTED]`)
        }

        return { status: 'OK', message: 'Se o email existir, um link de recuperação será enviado.' }
      }

      throw new InternalServerErrorException('Erro ao gerar token de recuperação.')
    } catch (error) {
      this.logger.error('Erro no fluxo de recuperação de senha', error instanceof Error ? error.stack : String(error))
      throw new InternalServerErrorException('Erro ao processar solicitação.')
    }
  }

  async resetPassword(data: ResetPasswordDto) {
    try {
      const result = await EmailPassword.resetPasswordUsingToken('public', data.token, data.password)

      if (result.status === 'OK') {
        return { status: 'OK', message: 'Senha alterada com sucesso.' }
      }

      if (result.status === 'RESET_PASSWORD_INVALID_TOKEN_ERROR') {
        throw new ConflictException('Token inválido ou expirado.')
      }

      throw new InternalServerErrorException('Erro ao alterar senha.')
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error
      }
      this.logger.error('Erro ao resetar senha', error instanceof Error ? error.stack : String(error))
      throw new InternalServerErrorException('Erro ao processar alteração de senha.')
    }
  }

  async getCurrentUser(session: SessionContainer) {
    try {
      const userId = session.getUserId()

      const authUser = await this.authAdapter.getUserById(userId)

      if (!authUser) {
        throw new InternalServerErrorException('Usuário não encontrado.')
      }

      const roles = authUser.roles
      let communityId: number | null = null

      if (roles.includes(UserRole.COMMUNITY)) {
        const community = await this.communityService.getByUserId(userId)
        communityId = community?.id ?? null
      }

      return {
        status: 'OK',
        user: {
          id: userId,
          email: authUser.email,
          roles,
          communityId
        }
      }
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar dados do usuário.', { cause: error })
    }
  }

  async createCommunity(data: CommunitySignUpDto, req: Request, res: Response) {
    try {
      const result = await this.authAdapter.signUp(data.email, data.password)

      if (result.status !== 'OK' || !result.user) {
        throw new ConflictException('Este email já está em uso.')
      }

      const userId = result.user.id
      await this.authAdapter.addRoleToUser(userId, UserRole.COMMUNITY)

      const communityData = {
        name: data.name,
        logoUrl: data.logoUrl,
        description: data.description,
        isActive: data.isActive,
        githubLink: data.githubLink,
        instagramLink: data.instagramLink,
        linkedinLink: data.linkedinLink,
        websiteLink: data.websiteLink,
        phoneNumber: data.phoneNumber
      }

      const communityProfile = await this.communityService.create(communityData, userId)

      // Criar sessão SuperTokens após signup bem-sucedido
      const recipeUserId = convertToRecipeUserId(userId)
      await SessionRecipe.createNewSession(req, res, 'public', recipeUserId)

      return { status: 'OK', user_info: communityProfile }
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err
      }
      throw new InternalServerErrorException('Erro inesperado ao criar comunidade.')
    }
  }

  async createCommunityWithSession(data: CommunitySignUpDto, req: Request) {
    try {
      // Get the response object from the request (Express style)
      const res = (req as Request & { res: Response }).res

      // Use SuperTokens native signUp that automatically creates session and sets cookies
      const result = await EmailPassword.signUp('public', data.email, data.password, undefined, {
        req,
        res
      })

      if (result.status !== 'OK') {
        throw new ConflictException('Este email já está em uso.')
      }

      const userId = result.user.id
      await this.authAdapter.addRoleToUser(userId, UserRole.COMMUNITY)

      const communityData = {
        name: data.name,
        logoUrl: data.logoUrl,
        description: data.description,
        isActive: data.isActive,
        githubLink: data.githubLink,
        instagramLink: data.instagramLink,
        linkedinLink: data.linkedinLink,
        websiteLink: data.websiteLink,
        phoneNumber: data.phoneNumber
      }

      const communityProfile = await this.communityService.create(communityData, userId)

      return { status: 'OK', user_info: communityProfile }
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err
      }
      throw new InternalServerErrorException('Erro inesperado ao criar comunidade.')
    }
  }

  async createCommunityWithoutSession(data: CommunitySignUpDto) {
    try {
      const result = await this.authAdapter.signUp(data.email, data.password)

      if (result.status !== 'OK' || !result.user) {
        throw new ConflictException('Este email já está em uso.')
      }

      const userId = result.user.id
      await this.authAdapter.addRoleToUser(userId, UserRole.COMMUNITY)

      const communityData = {
        name: data.name,
        logoUrl: data.logoUrl,
        description: data.description,
        isActive: data.isActive,
        githubLink: data.githubLink,
        instagramLink: data.instagramLink,
        linkedinLink: data.linkedinLink,
        websiteLink: data.websiteLink,
        phoneNumber: data.phoneNumber
      }

      const communityProfile = await this.communityService.create(communityData, userId)

      return { status: 'OK', user_info: communityProfile }
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err
      }
      throw new InternalServerErrorException('Erro inesperado ao criar comunidade.')
    }
  }

  async createUser(data: UserSignUpDto, session?: SessionContainer) {
    // Verificar se o usuário logado tem permissão de admin (apenas quando há sessão)
    if (session) {
      const roles = await this.authAdapter.getUserRoles(session.getUserId())
      if (!roles.includes(UserRole.ADMIN)) {
        throw new ConflictException('Acesso negado. Apenas administradores podem criar usuários.')
      }
    }

    try {
      const result = await this.authAdapter.signUp(data.email, data.password)

      if (result.status !== 'OK' || !result.user) {
        throw new ConflictException('Este email já está em uso.')
      }

      const userId = result.user.id
      await this.authAdapter.addRoleToUser(userId, data.role as UserRole)

      return { status: 'OK', user_info: { id: userId, email: data.email, role: data.role } }
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err
      }
      throw new InternalServerErrorException('Erro inesperado ao criar usuário.')
    }
  }

  async bootstrapAdmin(data: UserSignUpDto) {
    try {
      // Verificar se já existe algum admin
      const allAdmins = await this.authAdapter.getUsersByRole(UserRole.ADMIN)
      if (allAdmins.length > 0) {
        throw new ConflictException('Já existe um administrador no sistema.')
      }

      const result = await this.authAdapter.signUp(data.email, data.password)

      if (result.status !== 'OK' || !result.user) {
        throw new ConflictException('Este email já está em uso.')
      }

      const userId = result.user.id
      await this.authAdapter.addRoleToUser(userId, UserRole.ADMIN)

      return { status: 'OK', user_info: { id: userId, email: data.email, role: 'admin' } }
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err
      }
      throw new InternalServerErrorException('Erro inesperado ao criar administrador.')
    }
  }
}
