import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const mockHealthService = {
      getHealth: jest.fn().mockReturnValue({
        status: 'ok',
        service: 'CollegeOS',
        version: '0.1.0',
        environment: 'development',
        timestamp: '2026-08-25T22:00:00.000Z',
      }),
      getLiveness: jest.fn().mockReturnValue({
        status: 'alive',
        uptimeSeconds: 120,
      }),
      getReadiness: jest.fn().mockResolvedValue({
        status: 'ready',
        checks: {
          database: 'healthy',
          cache: 'healthy',
        },
        timestamp: '2026-08-25T22:00:00.000Z',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health info', () => {
      const result = controller.getHealth();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('CollegeOS');
      expect(service.getHealth).toHaveBeenCalled();
    });
  });

  describe('getLive', () => {
    it('should return liveness info', () => {
      const result = controller.getLive();
      expect(result.status).toBe('alive');
      expect(service.getLiveness).toHaveBeenCalled();
    });
  });

  describe('getReady', () => {
    it('should return readiness info when ready', async () => {
      const result = await controller.getReady();
      expect(result.status).toBe('ready');
      expect(service.getReadiness).toHaveBeenCalled();
    });
  });
});
