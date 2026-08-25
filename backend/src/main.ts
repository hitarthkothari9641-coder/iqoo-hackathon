import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { StructuredLoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(AppConfigService);

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: configService.isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS Configuration
  app.enableCors({
    origin: configService.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Institution-Id', 'X-Institution-Slug'],
  });

  // Global Versioned API Prefix
  app.setGlobalPrefix('api/v1');

  // Global Interceptors
  app.useGlobalInterceptors(
    new StructuredLoggingInterceptor(),
    new TransformResponseInterceptor(),
  );

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global Request Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // OpenAPI / Swagger Documentation
  if (!configService.isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('College OS API')
      .setDescription('Production-grade Academic & Campus Operating System API Foundation')
      .setVersion(configService.app.version)
      .addBearerAuth()
      .addTag('health', 'System health, liveness, and dependency readiness probes')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`OpenAPI Documentation initialized at: http://localhost:${configService.app.port}/api/docs`);
  }

  await app.listen(configService.app.port);
  logger.log(
    `🚀 College OS API Service running on http://localhost:${configService.app.port}/api/v1 (Env: ${configService.app.env})`,
  );
}

bootstrap();
