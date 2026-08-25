import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminIntegrationsController } from './admin-integrations.controller';
import { AuthModule } from '../auth/auth.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [AuthModule, IntegrationsModule],
  controllers: [AdminAuthController, AdminIntegrationsController],
})
export class AdminModule {}
