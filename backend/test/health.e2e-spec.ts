import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';

describe('Health & Foundation (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /api/v1/health returns valid system status contract', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('status', 'ok');
        expect(res.body.data).toHaveProperty('service', 'CollegeOS');
        expect(res.body.data).toHaveProperty('version', '0.1.0');
        expect(res.body.data).toHaveProperty('environment');
      });
  });

  it('GET /api/v1/health/live returns process responsiveness', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/live')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('status', 'alive');
        expect(typeof res.body.data.uptimeSeconds).toBe('number');
      });
  });

  it('GET /api/v1/health/ready returns readiness check response', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect((res) => {
        expect([200, 503]).toContain(res.status);
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('checks');
      });
  });

  it('Non-existent route returns sanitized 404 error contract with requestId', () => {
    return request(app.getHttpServer())
      .get('/api/v1/non-existent-route')
      .expect(404)
      .expect((res) => {
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
        expect(res.body).toHaveProperty('meta');
      });
  });
});
