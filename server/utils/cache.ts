import type { CacheConfig } from '@shared/types';

export class CacheManager {
  private cache: Map<string, { data: any; expiry: number; tags: string[] }> = new Map();
  private config: CacheConfig;

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTTL: 300000, // 5 minutes
      maxSize: 1000,
      ...config
    };
  }

  // Set cache entry with TTL and tags
  set(key: string, data: any, ttl?: number, tags: string[] = []): void {
    const expiry = Date.now() + (ttl || this.config.defaultTTL!);
    
    // Clean up expired entries if cache is at max size
    if (this.cache.size >= this.config.maxSize!) {
      this.cleanup();
    }

    this.cache.set(key, { data, expiry, tags });
  }

  // Get cache entry
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Get or set pattern
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl?: number, 
    tags?: string[]
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttl, tags);
    return data;
  }

  // Delete specific key
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear cache by tags
  clearByTag(tag: string): number {
    let cleared = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    return cleared;
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  // Get cache statistics
  getStats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
  } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need hit/miss tracking
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }

  // Pattern-based key deletion
  deletePattern(pattern: RegExp): number {
    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    return deleted;
  }
}

// Global cache instance
export const cache = new CacheManager({
  defaultTTL: 300000, // 5 minutes
  maxSize: 2000
});

// Application-specific cache helpers
export class AppCache {
  // Jobs cache
  static async getJobs(filters: any): Promise<any[]> {
    const key = `jobs:${JSON.stringify(filters)}`;
    return cache.getOrSet(
      key,
      async () => {
        // Would fetch from storage
        return [];
      },
      300000, // 5 minutes
      ['jobs']
    );
  }

  static invalidateJobs(): void {
    cache.clearByTag('jobs');
  }

  // Companies cache
  static async getCompanies(filters: any): Promise<any[]> {
    const key = `companies:${JSON.stringify(filters)}`;
    return cache.getOrSet(
      key,
      async () => {
        // Would fetch from storage
        return [];
      },
      600000, // 10 minutes
      ['companies']
    );
  }

  static invalidateCompanies(): void {
    cache.clearByTag('companies');
  }

  // User profile cache
  static async getUserProfile(userId: number): Promise<any> {
    const key = `user:${userId}`;
    return cache.getOrSet(
      key,
      async () => {
        // Would fetch from storage
        return null;
      },
      900000, // 15 minutes
      ['users', `user:${userId}`]
    );
  }

  static invalidateUser(userId: number): void {
    cache.clearByTag(`user:${userId}`);
  }

  // Statistics cache
  static async getPlatformStats(): Promise<any> {
    const key = 'stats:platform';
    return cache.getOrSet(
      key,
      async () => {
        // Would calculate stats
        return {
          totalJobs: 0,
          totalCompanies: 0,
          totalUsers: 0
        };
      },
      1800000, // 30 minutes
      ['stats']
    );
  }

  static invalidateStats(): void {
    cache.clearByTag('stats');
  }

  // Search results cache
  static async getSearchResults(query: string, filters: any): Promise<any> {
    const key = `search:${query}:${JSON.stringify(filters)}`;
    return cache.getOrSet(
      key,
      async () => {
        // Would perform search
        return { results: [], total: 0 };
      },
      180000, // 3 minutes
      ['search']
    );
  }

  static invalidateSearch(): void {
    cache.clearByTag('search');
  }
}

// Cache warming strategies
export class CacheWarmer {
  static async warmPopularData(): Promise<void> {
    console.log('Warming cache with popular data...');
    
    // Warm featured jobs
    await AppCache.getJobs({ featured: true });
    
    // Warm platform stats
    await AppCache.getPlatformStats();
    
    // Warm popular companies
    await AppCache.getCompanies({ verified: true });
    
    console.log('Cache warming completed');
  }

  static async warmUserData(userId: number): Promise<void> {
    // Warm user-specific data when they log in
    await AppCache.getUserProfile(userId);
  }
}

// Cache middleware for Express
export function cacheMiddleware(ttl: number = 300000, tags: string[] = []) {
  return (req: any, res: any, next: any) => {
    const key = `route:${req.method}:${req.originalUrl}`;
    const cached = cache.get(key);
    
    if (cached) {
      return res.json(cached);
    }

    const originalSend = res.send;
    res.send = function(data: any) {
      try {
        const parsedData = JSON.parse(data);
        cache.set(key, parsedData, ttl, tags);
      } catch {
        // Not JSON, don't cache
      }
      return originalSend.call(this, data);
    };

    next();
  };
}

// Automatic cache cleanup
setInterval(() => {
  const cleaned = cache.cleanup();
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired cache entries`);
  }
}, 60000); // Every minute