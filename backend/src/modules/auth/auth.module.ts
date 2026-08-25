import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { AuthController } from './auth.controller';
import { MeController } from './me.controller';
import { AuthorizationService } from '../../common/guards/authorization.service';
import { SecurityEventService } from '../../common/logging/security-event.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController, MeController],
  providers: [
    AuthService,
    TokenService,
    SessionService,
    AuthorizationService,
    SecurityEventService,
    AuthGuard,
  ],
  exports: [
    AuthService,
    TokenService,
    SessionService,
    AuthorizationService,
    SecurityEventService,
    AuthGuard,
  ],
})
export class AuthModule {}
