import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import Redis from 'ioredis';

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  isHealthy(): Promise<boolean>;
}

@Injectable()
export class CacheService
  implements ICacheService, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(CacheService.name);
  private client: Redis | null = null;
  private inMemoryFallback = new Map<
    string,
    { value: string; expiresAt?: number }
  >();
  private isConnected = false;

  constructor(private readonly configService: AppConfigService) {}

  async onModuleInit() {
    const redisConfig = this.configService.redis;
    try {
      this.client = new Redis(redisConfig.url, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        retryStrategy: (times) => {
          if (times > 3) {
            return null; // Stop retrying if redis is unavailable in dev
          }
          return Math.min(times * 100, 2000);
        },
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('Connected to Redis server.');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        if (redisConfig.required) {
          this.logger.error(
            `Redis connection error (REQUIRED): ${err.message}`,
          );
        } else {
          this.logger.warn(
            `Redis unavailable (OPTIONAL in development, using in-memory fallback): ${err.message}`,
          );
        }
      });

      await this.client.connect().catch((err) => {
        if (redisConfig.required) {
          throw err;
        }
        this.logger.warn(
          `Redis connection failed (OPTIONAL mode enabled): ${err.message}`,
        );
      });
    } catch (err) {
      if (redisConfig.required) {
        throw err;
      }
      this.logger.warn(
        'Operating CacheService in in-memory fallback mode for local development.',
      );
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isConnected && this.client) {
      try {
        const data = await this.client.get(key);
        return data ? (JSON.parse(data) as T) : null;
      } catch (err) {
        this.logger.warn(
          `Redis get failed for key ${key}: ${(err as Error).message}`,
        );
      }
    }

    // In-memory fallback
    const item = this.inMemoryFallback.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.inMemoryFallback.delete(key);
      return null;
    }
    return JSON.parse(item.value) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.setex(key, ttlSeconds, serialized);
        } else {
          await this.client.set(key, serialized);
        }
        return;
      } catch (err) {
        this.logger.warn(
          `Redis set failed for key ${key}: ${(err as Error).message}`,
        );
      }
    }

    // In-memory fallback
    this.inMemoryFallback.set(key, {
      value: serialized,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async delete(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
      } catch (err) {
        this.logger.warn(
          `Redis del failed for key ${key}: ${(err as Error).message}`,
        );
      }
    }
    this.inMemoryFallback.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    if (this.isConnected && this.client) {
      try {
        const count = await this.client.exists(key);
        return count === 1;
      } catch {
        // fallback
      }
    }
    return this.inMemoryFallback.has(key);
  }

  async isHealthy(): Promise<boolean> {
    if (this.isConnected && this.client) {
      try {
        const res = await this.client.ping();
        return res === 'PONG';
      } catch {
        return false;
      }
    }
    // If not required, considered healthy in dev fallback mode
    return !this.configService.redis.required;
  }
}
