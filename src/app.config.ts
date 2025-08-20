/*
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV');
  }

  get appPort(): number {
    return this.config.get<number>('PORT');
  }

  get dbHost(): string {
    return this.config.get<string>('DB_HOST');
  }

  get dbPort(): number {
    return this.config.get<number>('DB_PORT');
  }

  get dbUsername(): string {
    return this.config.get<string>('DB_USERNAME');
  }

  get dbPassword(): string {
    return this.config.get<string>('DB_PASSWORD');
  }

  get dbDatabase(): string {
    return this.config.get<string>('DB_DATABASE');
  }

  get dbDatabaseTest(): string {
    return this.config.get<string>('DB_DATABASE_TEST');
  }

  get emailHost(): string {
    return this.config.get<string>('EMAIL_HOST');
  }

  get emailUser(): string {
    return this.config.get<string>('EMAIL_USER');
  }

  get emailPass(): string {
    return this.config.get<string>('EMAIL_PASS');
  }

  get jwtExpiresIn(): number {
    return this.config.get<number>('JWT_EXPIRES_IN');
  }

  get jwtSecret(): string {
    return this.config.get<string>('JWT_SECRET');
  }
}
*/
