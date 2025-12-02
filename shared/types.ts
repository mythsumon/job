// Core platform types for scalability
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterParams {
  search?: string;
  industry?: string;
  location?: string;
  experience?: string;
  type?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  isRemote?: boolean;
  isFeatured?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface CacheConfig {
  defaultTTL?: number; // Time to live in milliseconds
  maxSize?: number;
  cleanupInterval?: number;
}

export interface SearchParams {
  query: string;
  filters?: FilterParams;
  pagination?: PaginationParams;
  facets?: string[];
}

export interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  sessionId: string;
  properties: Record<string, any>;
  timestamp: Date;
}

export interface NotificationPayload {
  type: 'email' | 'sms' | 'push' | 'in_app';
  recipient: string;
  template: string;
  data: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: Date;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage?: number;
  conditions?: Record<string, any>;
  variants?: Record<string, any>;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface QueueJob {
  id: string;
  type: string;
  payload: Record<string, any>;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledAt?: Date;
  processedAt?: Date;
  failedAt?: Date;
  error?: string;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastCheck: Date;
  details?: Record<string, any>;
}

export interface MetricsData {
  name: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  timestamp: Date;
}

export interface ValidationRule {
  field: string;
  rules: string[];
  message?: string;
}

export interface BulkOperation<T> {
  operation: 'create' | 'update' | 'delete';
  data: T[];
  batchSize?: number;
  validateEach?: boolean;
}

export interface ExportRequest {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  filters?: FilterParams;
  fields?: string[];
  compression?: boolean;
}

export interface ImportRequest {
  format: 'csv' | 'xlsx' | 'json';
  file: string; // base64 or file path
  mapping: Record<string, string>;
  validation?: ValidationRule[];
  skipErrors?: boolean;
}