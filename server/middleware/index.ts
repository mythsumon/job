import type { Request, Response, NextFunction } from 'express';
import type { RateLimitConfig } from '@shared/types';
import { createApiResponse, ErrorCodes } from '../utils/response';

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, url, ip, headers } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    console.log(`[${new Date().toISOString()}] ${method} ${url} ${statusCode} - ${duration}ms - ${ip}`);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request detected: ${method} ${url} took ${duration}ms`);
    }
  });
  
  next();
}

// Rate limiting middleware
export function createRateLimit(config: RateLimitConfig) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Clean old entries
    for (const [ip, data] of requests.entries()) {
      if (data.resetTime < windowStart) {
        requests.delete(ip);
      }
    }
    
    const current = requests.get(key) || { count: 0, resetTime: now + config.windowMs };
    
    if (current.resetTime < now) {
      current.count = 0;
      current.resetTime = now + config.windowMs;
    }
    
    current.count++;
    requests.set(key, current);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, config.maxRequests - current.count).toString(),
      'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
    });
    
    if (current.count > config.maxRequests) {
      return createApiResponse(req, res).rateLimit();
    }
    
    next();
  };
}

// Validation middleware factory
export function validateRequest(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return createApiResponse(req, res).validationError(result.error.errors);
      }
      req.body = result.data;
      next();
    } catch (error) {
      return createApiResponse(req, res).validationError(error);
    }
  };
}

// Pagination middleware
export function parsePagination(req: Request, res: Response, next: NextFunction) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';
  
  req.pagination = { page, limit, sortBy, sortOrder };
  next();
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  next();
}

// Error handler middleware
export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  console.error('Unhandled error:', error);
  
  const api = createApiResponse(req, res);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return api.validationError(error.details);
  }
  
  if (error.name === 'UnauthorizedError') {
    return api.unauthorized(error.message);
  }
  
  if (error.code === 'ECONNREFUSED') {
    return api.error(ErrorCodes.DATABASE_ERROR, 'Database connection failed', 503);
  }
  
  // Default to internal server error
  return api.serverError(
    process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message
  );
}

// CORS middleware
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.set({
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    });
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}

// Health check middleware
export function healthCheck(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/health') {
    return res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  }
  next();
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: 'asc' | 'desc';
      };
      apiVersion?: string;
      startTime?: number;
    }
  }
}