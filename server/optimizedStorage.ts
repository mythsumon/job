import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, and, or, desc, asc, count, sql, ilike, inArray, gte, lte } from 'drizzle-orm';
import * as schema from "@shared/schema";
import { CacheManager, jobCache, companyCache, userCache } from './cache';

// Pagination interface for consistent pagination across all endpoints
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Performance-optimized storage for large-scale deployment
export class OptimizedStorage {
  private db: any;
  
  constructor(pool: Pool) {
    this.db = drizzle(pool, { schema });
  }

  // Generic pagination helper
  private async paginate<T>(
    query: any,
    countQuery: any,
    params: PaginationParams
  ): Promise<PaginatedResult<T>> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    try {
      // Execute count query for total records
      const countResult = await countQuery.execute();
      const total = countResult[0]?.count || 0;

      // Execute main query with pagination
      const data = await query.limit(limit).offset(offset).execute();

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Pagination error:', error);
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  // Optimized job search with caching and indexing
  async searchJobs(params: {
    search?: string;
    location?: string;
    industry?: string;
    companyId?: number;
    salaryMin?: number;
    salaryMax?: number;
    workType?: string;
    experience?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<any>> {
    const cacheKey = `jobs:${JSON.stringify(params)}`;
    
    // Check cache first
    const cached = await CacheManager.getJobListings(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let query = this.db.select().from(schema.jobs);
      let countQuery = this.db.select({ count: count() }).from(schema.jobs);

      const conditions = [];

      if (params.search) {
        const searchCondition = or(
          ilike(schema.jobs.title, `%${params.search}%`),
          ilike(schema.jobs.description, `%${params.search}%`)
        );
        conditions.push(searchCondition);
      }

      if (params.location) {
        conditions.push(ilike(schema.jobs.location, `%${params.location}%`));
      }

      if (params.industry) {
        conditions.push(eq(schema.jobs.industry, params.industry));
      }

      if (params.companyId) {
        conditions.push(eq(schema.jobs.companyId, params.companyId));
      }

      if (params.salaryMin) {
        conditions.push(gte(schema.jobs.salaryMin, params.salaryMin));
      }

      if (params.salaryMax) {
        conditions.push(lte(schema.jobs.salaryMax, params.salaryMax));
      }

      if (params.workType) {
        conditions.push(eq(schema.jobs.workType, params.workType));
      }

      if (params.experience) {
        conditions.push(eq(schema.jobs.experience, params.experience));
      }

      // Add active job filter
      conditions.push(eq(schema.jobs.status, 'active'));

      if (conditions.length > 0) {
        const whereClause = and(...conditions);
        query = query.where(whereClause);
        countQuery = countQuery.where(whereClause);
      }

      // Order by creation date descending
      query = query.orderBy(desc(schema.jobs.createdAt));

      const result = await this.paginate(query, countQuery, {
        page: params.page,
        limit: params.limit,
      });

      // Cache result for 5 minutes
      await CacheManager.setJobListings(cacheKey, result, 300);

      return result;
    } catch (error) {
      console.error('Job search error:', error);
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  // Optimized company search with caching
  async searchCompanies(params: {
    search?: string;
    industry?: string;
    location?: string;
    size?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<any>> {
    const cacheKey = `companies:${JSON.stringify(params)}`;
    
    const cached = await CacheManager.getSearchResults(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let query = this.db.select().from(schema.companies);
      let countQuery = this.db.select({ count: count() }).from(schema.companies);

      const conditions = [];

      if (params.search) {
        const searchCondition = or(
          ilike(schema.companies.name, `%${params.search}%`),
          ilike(schema.companies.description, `%${params.search}%`)
        );
        conditions.push(searchCondition);
      }

      if (params.industry) {
        conditions.push(eq(schema.companies.industry, params.industry));
      }

      if (params.location) {
        conditions.push(ilike(schema.companies.location, `%${params.location}%`));
      }

      if (params.size) {
        conditions.push(eq(schema.companies.size, params.size));
      }

      // Only show active companies
      conditions.push(eq(schema.companies.status, 'active'));

      if (conditions.length > 0) {
        const whereClause = and(...conditions);
        query = query.where(whereClause);
        countQuery = countQuery.where(whereClause);
      }

      query = query.orderBy(desc(schema.companies.createdAt));

      const result = await this.paginate(query, countQuery, {
        page: params.page,
        limit: params.limit,
      });

      // Cache for 10 minutes
      await CacheManager.setSearchResults(cacheKey, result, 600);

      return result;
    } catch (error) {
      console.error('Company search error:', error);
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  // Optimized user search for talent matching
  async searchUsers(params: {
    search?: string;
    skills?: string[];
    experience?: string;
    location?: string;
    userType?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<any>> {
    const cacheKey = `users:${JSON.stringify(params)}`;
    
    const cached = await CacheManager.getSearchResults(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let query = this.db.select().from(schema.users);
      let countQuery = this.db.select({ count: count() }).from(schema.users);

      const conditions = [];

      if (params.search) {
        const searchCondition = or(
          ilike(schema.users.fullName, `%${params.search}%`),
          ilike(schema.users.bio, `%${params.search}%`)
        );
        conditions.push(searchCondition);
      }

      if (params.userType) {
        conditions.push(eq(schema.users.userType, params.userType));
      }

      if (params.experience) {
        conditions.push(eq(schema.users.experience, params.experience));
      }

      if (params.location) {
        conditions.push(ilike(schema.users.location, `%${params.location}%`));
      }

      // Only active users
      conditions.push(eq(schema.users.isActive, true));

      if (conditions.length > 0) {
        const whereClause = and(...conditions);
        query = query.where(whereClause);
        countQuery = countQuery.where(whereClause);
      }

      query = query.orderBy(desc(schema.users.createdAt));

      const result = await this.paginate(query, countQuery, {
        page: params.page,
        limit: params.limit,
      });

      // Cache for 15 minutes
      await CacheManager.setSearchResults(cacheKey, result, 900);

      return result;
    } catch (error) {
      console.error('User search error:', error);
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  // AI-powered job recommendations with caching
  async getJobRecommendations(userId: number, limit: number = 10): Promise<any[]> {
    const cacheKey = `recommendations:${userId}`;
    
    const cached = await CacheManager.getSearchResults(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get user profile
      const [user] = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .execute();

      if (!user) {
        return [];
      }

      // Build recommendation query based on user profile
      let query = this.db
        .select()
        .from(schema.jobs)
        .where(eq(schema.jobs.status, 'active'));

      const conditions = [];

      // Match by preferred industry
      if (user.preferredIndustry) {
        conditions.push(eq(schema.jobs.industry, user.preferredIndustry));
      }

      // Match by experience level
      if (user.experience) {
        conditions.push(eq(schema.jobs.experience, user.experience));
      }

      // Match by location preference
      if (user.preferredLocation) {
        conditions.push(ilike(schema.jobs.location, `%${user.preferredLocation}%`));
      }

      // Match by work type preference
      if (user.preferredWorkType) {
        conditions.push(eq(schema.jobs.workType, user.preferredWorkType));
      }

      if (conditions.length > 0) {
        query = query.where(or(...conditions));
      }

      const recommendations = await query
        .orderBy(desc(schema.jobs.createdAt))
        .limit(limit)
        .execute();

      // Cache for 1 hour
      await CacheManager.setSearchResults(cacheKey, recommendations, 3600);

      return recommendations;
    } catch (error) {
      console.error('Recommendation error:', error);
      return [];
    }
  }

  // Bulk operations for performance
  async bulkUpdateJobViews(jobIds: number[]): Promise<void> {
    if (jobIds.length === 0) return;

    try {
      await this.db
        .update(schema.jobs)
        .set({ 
          views: sql`${schema.jobs.views} + 1`,
          updatedAt: new Date()
        })
        .where(inArray(schema.jobs.id, jobIds))
        .execute();

      // Invalidate job cache
      await CacheManager.invalidateJobCache();
    } catch (error) {
      console.error('Bulk update error:', error);
    }
  }

  // Enhanced company profile with caching
  async getCompanyProfile(companyId: number): Promise<any> {
    const cacheKey = `company:profile:${companyId}`;
    
    const cached = await CacheManager.getCompanyData(companyId);
    if (cached) {
      return cached;
    }

    try {
      const [company] = await this.db
        .select()
        .from(schema.companies)
        .where(eq(schema.companies.id, companyId))
        .execute();

      if (!company) {
        return null;
      }

      // Cache for 30 minutes
      await CacheManager.setCompanyData(companyId, company, 1800);

      return company;
    } catch (error) {
      console.error('Company profile error:', error);
      return null;
    }
  }

  // Performance monitoring
  async getPerformanceMetrics(): Promise<any> {
    try {
      const metrics = {
        tableStats: await this.db.execute(sql`
          SELECT 
            schemaname,
            tablename,
            n_tup_ins as inserts,
            n_tup_upd as updates,
            n_tup_del as deletes,
            n_live_tup as live_tuples,
            n_dead_tup as dead_tuples
          FROM pg_stat_user_tables 
          ORDER BY n_live_tup DESC
        `),
        cacheStats: {
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
            keys: CacheManager.getCacheStats().searchCache?.keys || 0,
            stats: CacheManager.getCacheStats().searchCache?.stats || {}
          }
        },
        timestamp: new Date()
      };

      return metrics;
    } catch (error) {
      console.error('Performance metrics error:', error);
      return {
        tableStats: [],
        cacheStats: {},
        timestamp: new Date()
      };
    }
  }

  // Index usage analysis
  async getIndexUsage(): Promise<any> {
    try {
      return await this.db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes 
        ORDER BY idx_scan DESC
      `);
    } catch (error) {
      console.error('Index usage error:', error);
      return [];
    }
  }
}