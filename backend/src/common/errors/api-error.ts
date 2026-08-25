import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

export class ApiException extends HttpException {
  public readonly code: ErrorCode | string;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: ErrorCode | string = ErrorCode.INTERNAL_SERVER_ERROR,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: unknown,
  ) {
    super(message, status);
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, code: ErrorCode = ErrorCode.BAD_REQUEST, details?: unknown) {
    return new ApiException(message, code, HttpStatus.BAD_REQUEST, details);
  }

  static unauthorized(message = 'Unauthorized access', code: ErrorCode = ErrorCode.UNAUTHORIZED) {
    return new ApiException(message, code, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(message = 'Forbidden action', code: ErrorCode = ErrorCode.FORBIDDEN) {
    return new ApiException(message, code, HttpStatus.FORBIDDEN);
  }

  static notFound(message = 'Resource not found', code: ErrorCode = ErrorCode.NOT_FOUND) {
    return new ApiException(message, code, HttpStatus.NOT_FOUND);
  }

  static conflict(message = 'Resource conflict', code: ErrorCode = ErrorCode.CONFLICT) {
    return new ApiException(message, code, HttpStatus.CONFLICT);
  }

  static internal(message = 'Internal server error occurred', code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR) {
    return new ApiException(message, code, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable', code: ErrorCode = ErrorCode.SERVICE_UNAVAILABLE) {
    return new ApiException(message, code, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
