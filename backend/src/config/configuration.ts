export interface AppConfig {
  name: string;
  env: string;
  port: number;
  version: string;
  url: string;
  apiPrefix: string;
}

export interface DatabaseConfig {
  url: string;
  poolMin: number;
  poolMax: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  url: string;
  required: boolean;
}

export interface SecurityConfig {
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  saltRounds: number;
}

export interface CorsConfig {
  origins: string[];
}

export interface LoggingConfig {
  level: string;
  format: string;
}

export interface StorageConfig {
  driver: 'local' | 's3';
  localPath: string;
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
}

export interface RateLimitConfig {
  ttl: number;
  max: number;
}

export interface EnvironmentVariables {
  APP_NAME?: string;
  APP_ENV?: string;
  APP_PORT?: string;
  APP_VERSION?: string;
  APP_URL?: string;
  API_PREFIX?: string;

  DATABASE_URL?: string;
  DATABASE_POOL_MIN?: string;
  DATABASE_POOL_MAX?: string;

  REDIS_HOST?: string;
  REDIS_PORT?: string;
  REDIS_PASSWORD?: string;
  REDIS_URL?: string;
  REDIS_REQUIRED?: string;

  JWT_ACCESS_SECRET?: string;
  JWT_REFRESH_SECRET?: string;
  JWT_ACCESS_EXPIRES_IN?: string;
  JWT_REFRESH_EXPIRES_IN?: string;
  PASSWORD_SALT_ROUNDS?: string;

  CORS_ORIGINS?: string;
  RATE_LIMIT_TTL?: string;
  RATE_LIMIT_MAX?: string;

  LOG_LEVEL?: string;
  LOG_FORMAT?: string;

  STORAGE_DRIVER?: string;
  STORAGE_LOCAL_PATH?: string;
  STORAGE_S3_BUCKET?: string;
  STORAGE_S3_REGION?: string;
  STORAGE_S3_ACCESS_KEY?: string;
  STORAGE_S3_SECRET_KEY?: string;
}

export const configuration = () => {
  const env = process.env;

  const corsOrigins = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000', 'http://localhost:4000'];

  return {
    app: {
      name: env.APP_NAME || 'CollegeOS',
      env: env.APP_ENV || 'development',
      port: parseInt(env.APP_PORT || '4000', 10),
      version: env.APP_VERSION || '0.1.0',
      url: env.APP_URL || 'http://localhost:4000',
      apiPrefix: env.API_PREFIX || '/api/v1',
    },
    database: {
      url: env.DATABASE_URL || 'postgresql://collegeos_user:collegeos_password@localhost:5432/collegeos_db?schema=public',
      poolMin: parseInt(env.DATABASE_POOL_MIN || '2', 10),
      poolMax: parseInt(env.DATABASE_POOL_MAX || '10', 10),
    },
    redis: {
      host: env.REDIS_HOST || 'localhost',
      port: parseInt(env.REDIS_PORT || '6379', 10),
      password: env.REDIS_PASSWORD || undefined,
      url: env.REDIS_URL || 'redis://localhost:6379',
      required: env.REDIS_REQUIRED === 'true',
    },
    security: {
      jwtAccessSecret: env.JWT_ACCESS_SECRET || 'dev_fallback_insecure_jwt_key_do_not_use_in_prod',
      jwtRefreshSecret: env.JWT_REFRESH_SECRET || 'dev_fallback_insecure_refresh_key_do_not_use_in_prod',
      jwtAccessExpiresIn: env.JWT_ACCESS_EXPIRES_IN || '15m',
      jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d',
      saltRounds: parseInt(env.PASSWORD_SALT_ROUNDS || '12', 10),
    },
    cors: {
      origins: corsOrigins,
    },
    rateLimit: {
      ttl: parseInt(env.RATE_LIMIT_TTL || '60', 10),
      max: parseInt(env.RATE_LIMIT_MAX || '100', 10),
    },
    logging: {
      level: env.LOG_LEVEL || 'debug',
      format: env.LOG_FORMAT || 'json',
    },
    storage: {
      driver: (env.STORAGE_DRIVER as 'local' | 's3') || 'local',
      localPath: env.STORAGE_LOCAL_PATH || './uploads',
      s3Bucket: env.STORAGE_S3_BUCKET,
      s3Region: env.STORAGE_S3_REGION,
      s3AccessKey: env.STORAGE_S3_ACCESS_KEY,
      s3SecretKey: env.STORAGE_S3_SECRET_KEY,
    },
  };
};
