import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiException } from '../errors/api-error';
import { ErrorCode } from '../errors/error-codes';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

export interface AuthenticatedUserContext {
  id: string;
  institutionId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface IAuthorizationService {
  can(user: AuthenticatedUserContext, permission: string, resource?: unknown): Promise<boolean>;
}

@Injectable()
export class AuthorizationService implements IAuthorizationService {
  async can(user: AuthenticatedUserContext, permission: string, resource?: unknown): Promise<boolean> {
    // Foundation RBAC check with future ABAC capability
    if (!user || !user.permissions) {
      return false;
    }

    // Super admin bypass
    if (user.roles.includes('SUPER_ADMIN')) {
      return true;
    }

    // Direct permission check or wildcard
    return (
      user.permissions.includes(permission) ||
      user.permissions.includes('*') ||
      user.permissions.some((p) => p.endsWith(':*') && permission.startsWith(p.replace(':*', '')))
    );
  }
}

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authzService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUserContext;

    if (!user) {
      throw ApiException.unauthorized('User not authenticated.', ErrorCode.UNAUTHORIZED);
    }

    for (const perm of requiredPermissions) {
      const allowed = await this.authzService.can(user, perm);
      if (!allowed) {
        throw ApiException.forbidden(
          `User lacks required permission: ${perm}`,
          ErrorCode.INSUFFICIENT_PERMISSIONS,
        );
      }
    }

    return true;
  }
}
