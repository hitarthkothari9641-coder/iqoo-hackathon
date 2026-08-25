import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiException } from '../errors/api-error';
import { ErrorCode } from '../errors/error-codes';
import { Request } from 'express';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const tenant = request.tenant;

    // In future phases, tenant is strictly resolved from verified JWT session or validated host
    if (!tenant || (!tenant.institutionId && !tenant.slug)) {
      throw ApiException.forbidden('Tenant context could not be resolved.', ErrorCode.TENANT_NOT_FOUND);
    }

    return true;
  }
}
