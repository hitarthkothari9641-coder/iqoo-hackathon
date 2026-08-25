import { Module } from '@nestjs/common';
import { CommunitiesController } from './communities.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CommunitiesController],
})
export class CommunitiesModule {}
