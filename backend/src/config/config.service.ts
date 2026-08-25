import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import {
  AppConfig,
  DatabaseConfig,
  RedisConfig,
  SecurityConfig,
  CorsConfig,
  LoggingConfig,
  StorageConfig,
  RateLimitConfig,
} from './configuration';

@Injectable()
export class AppConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  get app(): AppConfig {
    return this.nestConfigService.get<AppConfig>('app')!;
  }

  get database(): DatabaseConfig {
    return this.nestConfigService.get<DatabaseConfig>('database')!;
  }

  get redis(): RedisConfig {
    return this.nestConfigService.get<RedisConfig>('redis')!;
  }

  get security(): SecurityConfig {
    return this.nestConfigService.get<SecurityConfig>('security')!;
  }

  get cors(): CorsConfig {
    return this.nestConfigService.get<CorsConfig>('cors')!;
  }

  get logging(): LoggingConfig {
    return this.nestConfigService.get<LoggingConfig>('logging')!;
  }

  get storage(): StorageConfig {
    return this.nestConfigService.get<StorageConfig>('storage')!;
  }

  get rateLimit(): RateLimitConfig {
    return this.nestConfigService.get<RateLimitConfig>('rateLimit')!;
  }

  get isProduction(): boolean {
    return this.app.env === 'production';
  }

  get isDevelopment(): boolean {
    return this.app.env === 'development';
  }
}
