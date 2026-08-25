import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TokenService } from '../../modules/auth/token.service';
import {
  AuthorizationService,
  AuthenticatedUserContext,
} from './authorization.service';
import { PrismaService } from '../../database/prisma.service';

export const PERMISSION_KEY = 'required_permissions';
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSION_KEY, permissions);

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUserContext;
  sessionId: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authorizationService: AuthorizationService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        code: 'AUTH_MISSING_TOKEN',
        message: 'Authorization token required',
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = await this.tokenService.verifyAccessToken(token);

    // Validate active session
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: 'AUTH_SESSION_EXPIRED',
        message: 'Session has been revoked or expired',
      });
    }

    // Check account locking & status
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status === 'SUSPENDED' || user.status === 'LOCKED') {
      throw new ForbiddenException({
        code:
          user?.status === 'LOCKED'
            ? 'AUTH_ACCOUNT_LOCKED'
            : 'AUTH_ACCOUNT_SUSPENDED',
        message: `Account is currently ${user?.status || 'inactive'}`,
      });
    }

    // Resolve requested tenant context from header or token claim
    const requestedTenantHeader = request.headers['x-institution-id'] as string;
    const requestedTenant = requestedTenantHeader || payload.institutionId;

    const userContext = await this.authorizationService.getEffectiveUserContext(
      user.id,
      requestedTenant,
    );

    request.user = userContext;
    request.sessionId = session.id;

    // Check decorator required permissions if present
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredPermissions && requiredPermissions.length > 0) {
      for (const perm of requiredPermissions) {
        const allowed = await this.authorizationService.can(userContext, perm);
        if (!allowed) {
          throw new ForbiddenException({
            code: 'PERMISSION_DENIED',
            message: `Missing required permission: ${perm}`,
          });
        }
      }
    }

    return true;
  }
}
