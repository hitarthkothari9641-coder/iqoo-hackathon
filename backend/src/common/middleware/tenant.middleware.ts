import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantContext {
  institutionId: string | null;
  slug?: string;
  source: 'host' | 'header' | 'authenticated_user' | 'default';
  isResolved: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenant?: TenantContext;
      requestId?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const host = req.headers.host || '';
    const headerTenantId = req.headers['x-institution-id'] as string;
    const headerTenantSlug = req.headers['x-institution-slug'] as string;

    // Subdomain resolution (e.g. stanford.collegeos.edu)
    let slug: string | undefined = undefined;
    const hostParts = host.split('.');
    if (hostParts.length > 2 && hostParts[0] !== 'api' && hostParts[0] !== 'admin' && hostParts[0] !== 'localhost') {
      slug = hostParts[0];
    } else if (headerTenantSlug) {
      slug = headerTenantSlug;
    }

    req.tenant = {
      institutionId: headerTenantId || null,
      slug: slug || undefined,
      source: headerTenantId ? 'header' : (slug ? 'host' : 'default'),
      isResolved: !!(headerTenantId || slug),
    };

    next();
  }
}
