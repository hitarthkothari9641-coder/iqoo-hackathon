import { Module } from '@nestjs/common';
import { ClubsController } from './clubs.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ClubsController],
})
export class ClubsModule {}
