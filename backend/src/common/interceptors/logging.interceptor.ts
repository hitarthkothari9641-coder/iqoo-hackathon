import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class StructuredLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<Request>();
    const res = httpCtx.getResponse<Response>();

    const { method, originalUrl } = req;
    const requestId = (req.headers['x-request-id'] as string) || 'req-unknown';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;

          const logData = {
            timestamp: new Date().toISOString(),
            level: 'info',
            requestId,
            method,
            path: originalUrl,
            status: statusCode,
            durationMs: duration,
            userAgent: req.headers['user-agent'] || 'unknown',
            ip: req.ip || req.socket.remoteAddress,
          };

          this.logger.log(JSON.stringify(logData));
        },
        error: (err: Error) => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode || 500;

          const logData = {
            timestamp: new Date().toISOString(),
            level: 'error',
            requestId,
            method,
            path: originalUrl,
            status: statusCode,
            durationMs: duration,
            errorMessage: err?.message,
          };

          this.logger.error(JSON.stringify(logData));
        },
      }),
    );
  }
}
