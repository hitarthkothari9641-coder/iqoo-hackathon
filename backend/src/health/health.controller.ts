import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'System Health & Version Information' })
  @ApiResponse({ status: 200, description: 'Application operational status' })
  getHealth() {
    return this.healthService.getHealth();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness Probe (Process Alive)' })
  @ApiResponse({ status: 200, description: 'Process is responsive' })
  getLive() {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness Probe (Dependencies Available)' })
  @ApiResponse({ status: 200, description: 'Database and Cache ready' })
  @ApiResponse({
    status: 503,
    description: 'Required dependencies unavailable',
  })
  async getReady() {
    const readiness = await this.healthService.getReadiness();
    if (readiness.status !== 'ready') {
      throw new ServiceUnavailableException(readiness);
    }
    return readiness;
  }
}
