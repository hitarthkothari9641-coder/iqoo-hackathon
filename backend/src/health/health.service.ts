import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { PrismaService } from '../database/prisma.service';
import { CacheService } from '../cache/cache.service';

export interface HealthStatusResponse {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface ReadinessStatusResponse {
  status: 'ready' | 'not_ready';
  checks: {
    database: 'healthy' | 'unhealthy';
    cache: 'healthy' | 'unhealthy' | 'fallback';
  };
  timestamp: string;
}

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: AppConfigService,
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  getHealth(): HealthStatusResponse {
    return {
      status: 'ok',
      service: this.configService.app.name,
      version: this.configService.app.version,
      environment: this.configService.app.env,
      timestamp: new Date().toISOString(),
    };
  }

  getLiveness(): { status: string; uptimeSeconds: number } {
    return {
      status: 'alive',
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }

  async getReadiness(): Promise<ReadinessStatusResponse> {
    let dbStatus: 'healthy' | 'unhealthy' = 'healthy';
    try {
      // Safe ping query on database
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unhealthy';
    }

    let cacheStatus: 'healthy' | 'unhealthy' | 'fallback' = 'healthy';
    const isRedisHealthy = await this.cache.isHealthy();
    if (!isRedisHealthy) {
      cacheStatus = this.configService.redis.required
        ? 'unhealthy'
        : 'fallback';
    }

    const isReady = dbStatus === 'healthy' && cacheStatus !== 'unhealthy';

    return {
      status: isReady ? 'ready' : 'not_ready',
      checks: {
        database: dbStatus,
        cache: cacheStatus,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
