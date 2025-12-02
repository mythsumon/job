import type { Request, Response } from 'express';
import type { MetricsData, HealthCheck, AnalyticsEvent } from '@shared/types';

export class PerformanceMonitor {
  private metrics: Map<string, MetricsData[]> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private analytics: AnalyticsEvent[] = [];

  // Record performance metrics
  recordMetric(name: string, value: number, unit: string, tags: Record<string, string> = {}) {
    const metric: MetricsData = {
      name,
      value,
      unit,
      tags,
      timestamp: new Date()
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricsList = this.metrics.get(name)!;
    metricsList.push(metric);

    // Keep only last 1000 metrics per type
    if (metricsList.length > 1000) {
      metricsList.shift();
    }
  }

  // Record health check
  recordHealthCheck(service: string, status: 'healthy' | 'unhealthy' | 'degraded', responseTime: number, details?: Record<string, any>) {
    const healthCheck: HealthCheck = {
      service,
      status,
      responseTime,
      lastCheck: new Date(),
      details
    };

    this.healthChecks.set(service, healthCheck);
  }

  // Record analytics event
  recordAnalytics(event: AnalyticsEvent) {
    this.analytics.push(event);

    // Keep only last 10000 events
    if (this.analytics.length > 10000) {
      this.analytics.shift();
    }
  }

  // Get metrics summary
  getMetricsSummary(name: string, timeRange: number = 3600000): any {
    const metrics = this.metrics.get(name) || [];
    const cutoff = new Date(Date.now() - timeRange);
    const recentMetrics = metrics.filter(m => m.timestamp > cutoff);

    if (recentMetrics.length === 0) {
      return null;
    }

    const values = recentMetrics.map(m => m.value);
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      latest: values[values.length - 1],
      unit: recentMetrics[0].unit
    };
  }

  // Get all health checks
  getHealthChecks(): Record<string, HealthCheck> {
    return Object.fromEntries(this.healthChecks);
  }

  // Get analytics summary
  getAnalyticsSummary(timeRange: number = 3600000): any {
    const cutoff = new Date(Date.now() - timeRange);
    const recentEvents = this.analytics.filter(e => e.timestamp > cutoff);

    const eventCounts = recentEvents.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: recentEvents.length,
      eventTypes: eventCounts,
      uniqueUsers: new Set(recentEvents.map(e => e.userId).filter(Boolean)).size,
      uniqueSessions: new Set(recentEvents.map(e => e.sessionId)).size
    };
  }
}

export const monitor = new PerformanceMonitor();

// Express middleware for request monitoring
export function requestMonitoring(req: Request, res: Response, next: Function) {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    const duration = Date.now() - start;
    const { method, url } = req;
    const { statusCode } = res;

    // Record request metrics
    monitor.recordMetric('request_duration', duration, 'ms', {
      method,
      route: url,
      status: statusCode.toString()
    });

    monitor.recordMetric('request_count', 1, 'count', {
      method,
      route: url,
      status: statusCode.toString()
    });

    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${method} ${url} took ${duration}ms`);
      monitor.recordAnalytics({
        eventType: 'slow_request',
        sessionId: req.sessionID || 'unknown',
        properties: { method, url, duration, statusCode },
        timestamp: new Date()
      });
    }

    return originalSend.call(this, data);
  };

  next();
}

// Database query monitoring
export function monitorDatabaseQuery(query: string, duration: number, success: boolean) {
  monitor.recordMetric('db_query_duration', duration, 'ms', {
    success: success.toString()
  });

  if (duration > 500) {
    console.warn(`Slow database query (${duration}ms): ${query.substring(0, 100)}...`);
  }
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  const usage = process.memoryUsage();
  
  monitor.recordMetric('memory_rss', usage.rss / 1024 / 1024, 'MB');
  monitor.recordMetric('memory_heap_used', usage.heapUsed / 1024 / 1024, 'MB');
  monitor.recordMetric('memory_heap_total', usage.heapTotal / 1024 / 1024, 'MB');
  monitor.recordMetric('memory_external', usage.external / 1024 / 1024, 'MB');
}

// CPU usage monitoring
export function monitorCpuUsage() {
  const usage = process.cpuUsage();
  monitor.recordMetric('cpu_user', usage.user / 1000, 'ms');
  monitor.recordMetric('cpu_system', usage.system / 1000, 'ms');
}

// Business metrics tracking
export class BusinessMetrics {
  static trackJobApplication(jobId: number, userId: number) {
    monitor.recordAnalytics({
      eventType: 'job_application',
      userId: userId.toString(),
      sessionId: 'system',
      properties: { jobId },
      timestamp: new Date()
    });

    monitor.recordMetric('job_applications', 1, 'count', {
      jobId: jobId.toString()
    });
  }

  static trackJobView(jobId: number, userId?: number) {
    monitor.recordAnalytics({
      eventType: 'job_view',
      userId: userId?.toString(),
      sessionId: 'system',
      properties: { jobId },
      timestamp: new Date()
    });

    monitor.recordMetric('job_views', 1, 'count', {
      jobId: jobId.toString()
    });
  }

  static trackUserRegistration(userId: number, userType: string) {
    monitor.recordAnalytics({
      eventType: 'user_registration',
      userId: userId.toString(),
      sessionId: 'system',
      properties: { userType },
      timestamp: new Date()
    });

    monitor.recordMetric('user_registrations', 1, 'count', {
      userType
    });
  }

  static trackCompanyRegistration(companyId: number) {
    monitor.recordAnalytics({
      eventType: 'company_registration',
      sessionId: 'system',
      properties: { companyId },
      timestamp: new Date()
    });

    monitor.recordMetric('company_registrations', 1, 'count');
  }

  static trackSearchQuery(query: string, resultsCount: number, userId?: number) {
    monitor.recordAnalytics({
      eventType: 'search_query',
      userId: userId?.toString(),
      sessionId: 'system',
      properties: { query, resultsCount },
      timestamp: new Date()
    });

    monitor.recordMetric('search_queries', 1, 'count');
    monitor.recordMetric('search_results', resultsCount, 'count');
  }
}

// System health monitoring
export async function performHealthChecks() {
  const checks = [
    checkDatabaseHealth(),
    checkMemoryHealth(),
    checkCpuHealth(),
    checkDiskHealth()
  ];

  await Promise.all(checks);
}

async function checkDatabaseHealth() {
  const start = Date.now();
  try {
    // Simple database ping - would need actual database connection
    const responseTime = Date.now() - start;
    monitor.recordHealthCheck('database', 'healthy', responseTime);
  } catch (error) {
    const responseTime = Date.now() - start;
    monitor.recordHealthCheck('database', 'unhealthy', responseTime, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function checkMemoryHealth() {
  const usage = process.memoryUsage();
  const heapUsedMB = usage.heapUsed / 1024 / 1024;
  const heapTotalMB = usage.heapTotal / 1024 / 1024;
  const usagePercent = (heapUsedMB / heapTotalMB) * 100;

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (usagePercent > 90) status = 'unhealthy';
  else if (usagePercent > 75) status = 'degraded';

  monitor.recordHealthCheck('memory', status, 0, {
    heapUsedMB: Math.round(heapUsedMB),
    heapTotalMB: Math.round(heapTotalMB),
    usagePercent: Math.round(usagePercent)
  });
}

function checkCpuHealth() {
  // CPU health check would need more sophisticated monitoring
  monitor.recordHealthCheck('cpu', 'healthy', 0, {
    uptime: process.uptime()
  });
}

function checkDiskHealth() {
  // Disk health check would need fs module
  monitor.recordHealthCheck('disk', 'healthy', 0);
}

// Initialize monitoring intervals
export function initializeMonitoring() {
  // Monitor system resources every 30 seconds
  setInterval(() => {
    monitorMemoryUsage();
    monitorCpuUsage();
  }, 30000);

  // Perform health checks every 5 minutes
  setInterval(performHealthChecks, 5 * 60 * 1000);

  console.log('Monitoring system initialized');
}

// Error tracking
export class ErrorTracker {
  static trackError(error: Error, context?: Record<string, any>) {
    monitor.recordAnalytics({
      eventType: 'error',
      sessionId: 'system',
      properties: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...context
      },
      timestamp: new Date()
    });

    monitor.recordMetric('errors', 1, 'count', {
      errorType: error.name
    });
  }

  static trackWarning(message: string, context?: Record<string, any>) {
    monitor.recordAnalytics({
      eventType: 'warning',
      sessionId: 'system',
      properties: {
        message,
        ...context
      },
      timestamp: new Date()
    });
  }
}