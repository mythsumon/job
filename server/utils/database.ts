import type { Connection } from 'mysql2/promise';
import type { FilterParams, PaginationParams } from '@shared/types';

export class QueryBuilder {
  private query: string = '';
  private conditions: string[] = [];
  private joins: string[] = [];
  private orderClauses: string[] = [];
  private params: any[] = [];

  constructor(private baseQuery: string) {
    this.query = baseQuery;
  }

  where(condition: string, value?: any): this {
    this.conditions.push(condition);
    if (value !== undefined) {
      this.params.push(value);
    }
    return this;
  }

  whereIn(column: string, values: any[]): this {
    if (values.length > 0) {
      const placeholders = values.map(() => '?').join(',');
      this.conditions.push(`${column} IN (${placeholders})`);
      this.params.push(...values);
    }
    return this;
  }

  whereLike(column: string, value: string): this {
    this.conditions.push(`${column} LIKE ?`);
    this.params.push(`%${value}%`);
    return this;
  }

  whereBetween(column: string, min: any, max: any): this {
    this.conditions.push(`${column} BETWEEN ? AND ?`);
    this.params.push(min, max);
    return this;
  }

  join(table: string, on: string): this {
    this.joins.push(`JOIN ${table} ON ${on}`);
    return this;
  }

  leftJoin(table: string, on: string): this {
    this.joins.push(`LEFT JOIN ${table} ON ${on}`);
    return this;
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderClauses.push(`${column} ${direction}`);
    return this;
  }

  paginate(pagination: PaginationParams): this {
    const offset = (pagination.page - 1) * pagination.limit;
    this.query += ` LIMIT ${pagination.limit} OFFSET ${offset}`;
    return this;
  }

  build(): { query: string; params: any[] } {
    let finalQuery = this.query;

    if (this.joins.length > 0) {
      finalQuery += ' ' + this.joins.join(' ');
    }

    if (this.conditions.length > 0) {
      finalQuery += ' WHERE ' + this.conditions.join(' AND ');
    }

    if (this.orderClauses.length > 0) {
      finalQuery += ' ORDER BY ' + this.orderClauses.join(', ');
    }

    return { query: finalQuery, params: this.params };
  }
}

export class DatabaseOptimizer {
  constructor(private connection: Connection) {}

  async createIndexes(): Promise<void> {
    const indexes = [
      // Jobs table indexes
      'CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_experience ON jobs(experience)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_salary ON jobs(salary_min, salary_max)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs(is_featured)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_remote ON jobs(is_remote)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON jobs(expires_at)',
      
      // Companies table indexes
      'CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry)',
      'CREATE INDEX IF NOT EXISTS idx_companies_size ON companies(size)',
      'CREATE INDEX IF NOT EXISTS idx_companies_location ON companies(location)',
      'CREATE INDEX IF NOT EXISTS idx_companies_verified ON companies(verified)',
      
      // Users table indexes
      'CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type)',
      'CREATE INDEX IF NOT EXISTS idx_users_location ON users(location)',
      'CREATE INDEX IF NOT EXISTS idx_users_experience ON users(experience)',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
      
      // Applications table indexes
      'CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id)',
      'CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)',
      'CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at)',
      
      // Saved jobs table indexes
      'CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id)',
      'CREATE INDEX IF NOT EXISTS idx_saved_jobs_saved_at ON saved_jobs(saved_at)',
      
      // Chat messages indexes
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id)',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id)',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_sent_at ON chat_messages(sent_at)',
      
      // Employment history indexes
      'CREATE INDEX IF NOT EXISTS idx_employment_user_id ON employment_history(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_employment_company_id ON employment_history(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_employment_status ON employment_history(status)',
      
      // Full-text search indexes
      'CREATE FULLTEXT INDEX IF NOT EXISTS ft_jobs_title_description ON jobs(title, description)',
      'CREATE FULLTEXT INDEX IF NOT EXISTS ft_companies_name_description ON companies(name, description)',
      'CREATE FULLTEXT INDEX IF NOT EXISTS ft_users_full_name ON users(full_name)',
    ];

    for (const indexQuery of indexes) {
      try {
        await this.connection.execute(indexQuery);
        console.log(`Index created: ${indexQuery.split(' ')[5]}`);
      } catch (error) {
        console.warn(`Failed to create index: ${error}`);
      }
    }
  }

  async analyzeTable(tableName: string): Promise<any[]> {
    const [rows] = await this.connection.execute(`ANALYZE TABLE ${tableName}`);
    return rows as any[];
  }

  async getTableStats(tableName: string): Promise<any> {
    const [rows] = await this.connection.execute(`
      SELECT 
        table_name,
        table_rows,
        data_length,
        index_length,
        (data_length + index_length) as total_size
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = ?
    `, [tableName]);
    
    return (rows as any[])[0];
  }

  async getSlowQueries(): Promise<any[]> {
    try {
      const [rows] = await this.connection.execute(`
        SELECT 
          sql_text,
          exec_count,
          avg_timer_wait / 1000000000 as avg_time_seconds,
          sum_timer_wait / 1000000000 as total_time_seconds
        FROM performance_schema.events_statements_summary_by_digest 
        WHERE avg_timer_wait > 1000000000 
        ORDER BY avg_timer_wait DESC 
        LIMIT 10
      `);
      return rows as any[];
    } catch (error) {
      console.warn('Performance schema not available');
      return [];
    }
  }
}

export function buildJobSearchQuery(filters: FilterParams, pagination: PaginationParams) {
  const builder = new QueryBuilder(`
    SELECT j.*, c.name as companyName, c.logo as companyLogo 
    FROM jobs j
  `);

  builder.leftJoin('companies c', 'j.company_id = c.id');

  if (filters.search) {
    builder.where('MATCH(j.title, j.description) AGAINST(? IN NATURAL LANGUAGE MODE)', filters.search);
  }

  if (filters.location) {
    builder.whereLike('j.location', filters.location);
  }

  if (filters.type) {
    builder.where('j.type = ?', filters.type);
  }

  if (filters.experience) {
    builder.where('j.experience = ?', filters.experience);
  }

  if (filters.industry) {
    builder.where('c.industry = ?', filters.industry);
  }

  if (filters.salaryMin) {
    builder.where('j.salary_min >= ?', filters.salaryMin);
  }

  if (filters.salaryMax) {
    builder.where('j.salary_max <= ?', filters.salaryMax);
  }

  if (filters.isRemote !== undefined) {
    builder.where('j.is_remote = ?', filters.isRemote ? 1 : 0);
  }

  if (filters.isFeatured !== undefined) {
    builder.where('j.is_featured = ?', filters.isFeatured ? 1 : 0);
  }

  if (filters.skills && filters.skills.length > 0) {
    // For JSON array search in MySQL
    const skillConditions = filters.skills.map(() => 'JSON_CONTAINS(j.skills, ?)').join(' OR ');
    builder.where(`(${skillConditions})`, ...filters.skills.map(skill => JSON.stringify(skill)));
  }

  // Add active job filter
  builder.where('(j.expires_at IS NULL OR j.expires_at > NOW())');

  builder.orderBy(`j.${pagination.sortBy}`, pagination.sortOrder.toUpperCase() as 'ASC' | 'DESC');
  builder.paginate(pagination);

  return builder.build();
}

export function buildCompanySearchQuery(filters: FilterParams, pagination: PaginationParams) {
  const builder = new QueryBuilder('SELECT * FROM companies c');

  if (filters.search) {
    builder.where('MATCH(c.name, c.description) AGAINST(? IN NATURAL LANGUAGE MODE)', filters.search);
  }

  if (filters.industry) {
    builder.where('c.industry = ?', filters.industry);
  }

  if (filters.location) {
    builder.whereLike('c.location', filters.location);
  }

  builder.where('c.verified = 1'); // Only show verified companies
  builder.orderBy(`c.${pagination.sortBy}`, pagination.sortOrder.toUpperCase() as 'ASC' | 'DESC');
  builder.paginate(pagination);

  return builder.build();
}

export function buildTalentSearchQuery(filters: FilterParams, pagination: PaginationParams) {
  const builder = new QueryBuilder('SELECT * FROM users u');

  builder.where('u.user_type = ?', 'job_seeker');

  if (filters.search) {
    builder.where('MATCH(u.full_name) AGAINST(? IN NATURAL LANGUAGE MODE)', filters.search);
  }

  if (filters.location) {
    builder.whereLike('u.location', filters.location);
  }

  if (filters.experience) {
    builder.where('u.experience = ?', filters.experience);
  }

  if (filters.skills && filters.skills.length > 0) {
    const skillConditions = filters.skills.map(() => 'JSON_CONTAINS(u.skills, ?)').join(' OR ');
    builder.where(`(${skillConditions})`, ...filters.skills.map(skill => JSON.stringify(skill)));
  }

  builder.orderBy(`u.${pagination.sortBy}`, pagination.sortOrder.toUpperCase() as 'ASC' | 'DESC');
  builder.paginate(pagination);

  return builder.build();
}

// Database connection pool configuration
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jobmongolia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
};