import type { Request, Response } from 'express';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';

export class ApiResponseBuilder {
  private req: Request;
  private res: Response;
  private requestId: string;

  constructor(req: Request, res: Response) {
    this.req = req;
    this.res = res;
    this.requestId = uuidv4();
  }

  success<T>(data: T, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.requestId,
        version: '1.0.0'
      }
    };

    return this.res.status(statusCode).json(response);
  }

  error(code: string, message: string, statusCode: number = 400, details?: any): Response {
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code,
        message,
        details
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.requestId,
        version: '1.0.0'
      }
    };

    return this.res.status(statusCode).json(response);
  }

  paginated<T>(
    data: T[], 
    pagination: PaginationParams, 
    totalItems: number,
    statusCode: number = 200
  ): Response {
    const totalPages = Math.ceil(totalItems / pagination.limit);
    const currentPage = pagination.page;

    const paginatedResponse: PaginatedResponse<T> = {
      data,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: pagination.limit,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    };

    return this.success(paginatedResponse, statusCode);
  }

  notFound(resource: string = 'Resource'): Response {
    return this.error('NOT_FOUND', `${resource} not found`, 404);
  }

  unauthorized(message: string = 'Unauthorized access'): Response {
    return this.error('UNAUTHORIZED', message, 401);
  }

  forbidden(message: string = 'Access forbidden'): Response {
    return this.error('FORBIDDEN', message, 403);
  }

  validationError(details: any): Response {
    return this.error('VALIDATION_ERROR', 'Validation failed', 422, details);
  }

  rateLimit(): Response {
    return this.error('RATE_LIMIT_EXCEEDED', 'Too many requests', 429);
  }

  serverError(message: string = 'Internal server error'): Response {
    return this.error('INTERNAL_ERROR', message, 500);
  }
}

export function createApiResponse(req: Request, res: Response): ApiResponseBuilder {
  return new ApiResponseBuilder(req, res);
}

// Error codes for consistency
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',

  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',

  // File Operations
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',

  // Business Logic
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',

  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CACHE_ERROR: 'CACHE_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR'
} as const;