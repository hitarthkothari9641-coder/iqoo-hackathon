import { Module } from '@nestjs/common';
import { SyncEngineService } from './sync/sync-engine.service';
import { NormalizationService } from './normalization/normalization.service';
import { CircuitBreakerService } from './resilience/circuit-breaker.service';
import { SecretManagerService } from '../../common/secrets/secret-manager.service';
import { WebhooksController } from './webhooks.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WebhooksController],
  providers: [
    SyncEngineService,
    NormalizationService,
    CircuitBreakerService,
    SecretManagerService,
  ],
  exports: [
    SyncEngineService,
    NormalizationService,
    CircuitBreakerService,
    SecretManagerService,
  ],
})
export class IntegrationsModule {}
