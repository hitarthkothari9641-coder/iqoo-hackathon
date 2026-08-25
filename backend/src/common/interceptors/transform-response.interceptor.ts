import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ApiSuccessResponse } from '../errors/error-codes';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiSuccessResponse<T>> {
    const req = context.switchToHttp().getRequest<Request>();
    const requestId = (req.headers['x-request-id'] as string) || undefined;

    return next.handle().pipe(
      map((data) => {
        // If data is already structured with success flag (e.g. custom endpoints), return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data as ApiSuccessResponse<T>;
        }

        return {
          success: true,
          data,
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}
