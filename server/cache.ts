import NodeCache from 'node-cache';

// Cache configurations for different data types
const CACHE_TTL = {
  USER_PROFILE: 300, // 5 minutes
  COMPANY_DATA: 600, // 10 minutes
  JOB_LISTINGS: 180, // 3 minutes
  SEARCH_RESULTS: 120, // 2 minutes
  STATIC_DATA: 3600, // 1 hour
  SESSION_DATA: 1800, // 30 minutes
};

// Create cache instances
export const userCache = new NodeCache({ 
  stdTTL: CACHE_TTL.USER_PROFILE,
  checkperiod: 60,
  maxKeys: 50000 // Support for large user base
});

export const companyCache = new NodeCache({ 
  stdTTL: CACHE_TTL.COMPANY_DATA,
  checkperiod: 120,
  maxKeys: 20000 // Support for 10,000+ companies
});

export const jobCache = new NodeCache({ 
  stdTTL: CACHE_TTL.JOB_LISTINGS,
  checkperiod: 60,
  maxKeys: 100000 // Large job listing capacity
});

export const searchCache = new NodeCache({ 
  stdTTL: CACHE_TTL.SEARCH_RESULTS,
  checkperiod: 30,
  maxKeys: 10000 // Cache frequent searches
});

export const staticCache = new NodeCache({ 
  stdTTL: CACHE_TTL.STATIC_DATA,
  checkperiod: 300,
  maxKeys: 1000 // Static/reference data
});

// Cache helper functions
export class CacheManager {
  // Generic cache operations
  static async get<T>(cache: NodeCache, key: string): Promise<T | undefined> {
    try {
      return cache.get<T>(key);
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return undefined;
    }
  }

  static async set<T>(cache: NodeCache, key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      return cache.set(key, value, ttl);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  static async del(cache: NodeCache, key: string | string[]): Promise<number> {
    try {
      return cache.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return 0;
    }
  }

  // User-specific cache operations
  static async getUserProfile(userId: number) {
    return this.get(userCache, `user:${userId}`);
  }

  static async setUserProfile(userId: number, data: any, ttl?: number) {
    return this.set(userCache, `user:${userId}`, data, ttl);
  }

  static async invalidateUser(userId: number) {
    const keys = [
      `user:${userId}`,
      `user:${userId}:profile`,
      `user:${userId}:resumes`,
      `user:${userId}:applications`
    ];
    return this.del(userCache, keys);
  }

  // Company-specific cache operations
  static async getCompanyData(companyId: number) {
    return this.get(companyCache, `company:${companyId}`);
  }

  static async setCompanyData(companyId: number, data: any, ttl?: number) {
    return this.set(companyCache, `company:${companyId}`, data, ttl);
  }

  static async invalidateCompany(companyId: number) {
    const keys = [
      `company:${companyId}`,
      `company:${companyId}:profile`,
      `company:${companyId}:jobs`
    ];
    return this.del(companyCache, keys);
  }

  // Job-specific cache operations
  static async getJobListings(cacheKey: string) {
    return this.get(jobCache, cacheKey);
  }

  static async setJobListings(cacheKey: string, data: any, ttl?: number) {
    return this.set(jobCache, cacheKey, data, ttl);
  }

  static async invalidateJobCache(pattern?: string) {
    if (pattern) {
      const keys = jobCache.keys().filter(key => key.includes(pattern));
      return this.del(jobCache, keys);
    } else {
      jobCache.flushAll();
      return true;
    }
  }

  // Search cache operations
  static async getSearchResults(searchKey: string) {
    return this.get(searchCache, `search:${searchKey}`);
  }

  static async setSearchResults(searchKey: string, data: any, ttl?: number) {
    return this.set(searchCache, `search:${searchKey}`, data, ttl);
  }

  // Cache statistics for monitoring
  static getCacheStats() {
    return {
      userCache: {
        keys: userCache.keys().length,
        stats: userCache.getStats()
      },
      companyCache: {
        keys: companyCache.keys().length,
        stats: companyCache.getStats()
      },
      jobCache: {
        keys: jobCache.keys().length,
        stats: jobCache.getStats()
      },
      searchCache: {
        keys: searchCache.keys().length,
        stats: searchCache.getStats()
      }
    };
  }

  // Clear all caches
  static clearAllCaches() {
    userCache.flushAll();
    companyCache.flushAll();
    jobCache.flushAll();
    searchCache.flushAll();
    staticCache.flushAll();
  }
}

// Cache warming function for critical data
export async function warmCache() {
  console.log('Starting cache warming for critical data...');
  // This would be called during application startup
  // to pre-populate frequently accessed data
}

// Cache middleware for Express routes
export function cacheMiddleware(cache: NodeCache, keyGenerator: (req: any) => string, ttl?: number) {
  return async (req: any, res: any, next: any) => {
    try {
      const key = keyGenerator(req);
      const cached = await CacheManager.get(cache, key);
      
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }
      
      res.setHeader('X-Cache', 'MISS');
      
      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache the response
      res.json = function(data: any) {
        CacheManager.set(cache, key, data, ttl);
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}