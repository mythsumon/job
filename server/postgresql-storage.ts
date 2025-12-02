import { Pool } from 'pg';
import type { 
  User, InsertUser, Company, InsertCompany, Job, InsertJob, Application, InsertApplication,
  SavedJob, InsertSavedJob, ChatRoom, InsertChatRoom, ChatMessage, InsertChatMessage,
  EmploymentHistory, InsertEmploymentHistory, Evaluation, InsertEvaluation,
  CompanyReview, InsertCompanyReview, Subscription, InsertSubscription,
  CompanyUser, InsertCompanyUser, PaymentSettlement, InsertPaymentSettlement,
  PlatformAnalytics, InsertPlatformAnalytics, SystemSetting, InsertSystemSetting,
  AdminActivityLog, InsertAdminActivityLog, PricingPlan, InsertPricingPlan
} from '@shared/schema';
import type { IStorage } from './storage';

export class PostgreSQLStorage implements IStorage {
  private pool: Pool;

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection() {
    // Try external server first, then fallback if needed
    const dbConfigs = [
      {
        host: '192.168.0.171',
        port: 5432,
        database: 'jobmongolia',
        user: 'jobmongolia_user',
        password: 'JobMongolia2025R5',
        ssl: false
      },
      {
        host: '203.23.49.100',
        port: 5432,
        database: 'jobmongolia',
        user: 'jobmongolia_user',
        password: 'JobMongolia2025R5',
        ssl: false
      }
    ];

    let connected = false;
    for (const config of dbConfigs) {
      try {
        console.log(`Attempting to connect to ${config.host}:${config.port}...`);
        this.pool = new Pool(config);
        await this.pool.query('SELECT 1');
        console.log(`Database connected successfully to ${config.host}`);
        connected = true;
        break;
      } catch (error) {
        console.error(`Failed to connect to ${config.host}:`, error);
        if (this.pool) {
          await this.pool.end();
        }
      }
    }

    if (!connected) {
      throw new Error('Could not connect to any database server');
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  async getUserByMongolianId(mongolianId: string): Promise<User | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM users WHERE mongolian_id = $1', [mongolianId]);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error getting user by Mongolian ID:', error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const result = await this.pool.query(
        `INSERT INTO users (
          username, password, email, full_name, user_type, role, profile_picture, phone, bio, 
          location, skills, ovog, ner, mongolian_id, birth_date, birth_place, 
          citizenship_type, nationality, foreign_id, is_active
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         RETURNING *`,
        [
          user.username || null, 
          user.password, 
          user.email, 
          user.fullName, 
          user.userType, 
          user.role || 'user',
          user.profilePicture || null, 
          user.phone || null, 
          user.bio || null,
          user.location || null, 
          user.skills || null, 
          user.ovog || null, 
          user.ner || null, 
          user.mongolianId || null, 
          user.birthDate || null, 
          user.birthPlace || null,
          user.citizenshipType || 'mongolian', 
          user.nationality || null, 
          user.foreignId || null, 
          user.isActive !== undefined ? user.isActive : true
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const updates: string[] = [];
      const params: any[] = [id];
      let paramCount = 1;

      Object.entries(user).forEach(([key, value]) => {
        if (value !== undefined) {
          paramCount++;
          const dbColumn = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          updates.push(`${dbColumn} = $${paramCount}`);
          params.push(value);
        }
      });

      if (updates.length === 0) return undefined;

      const query = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
      const result = await this.pool.query(query, params);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Payment Settlements Methods
  async getPaymentSettlements(filters?: { 
    companyId?: number; 
    status?: string; 
    dateFrom?: string; 
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      let query = `
        SELECT ps.*, c.name as company_name, j.title as job_title
        FROM payment_settlements ps
        LEFT JOIN companies c ON ps.company_id = c.id
        LEFT JOIN jobs j ON ps.job_id = j.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramCount = 0;

      if (filters?.companyId) {
        paramCount++;
        query += ` AND ps.company_id = $${paramCount}`;
        params.push(filters.companyId);
      }

      if (filters?.status) {
        paramCount++;
        query += ` AND ps.status = $${paramCount}`;
        params.push(filters.status);
      }

      if (filters?.dateFrom) {
        paramCount++;
        query += ` AND ps.settlement_date >= $${paramCount}`;
        params.push(filters.dateFrom);
      }

      if (filters?.dateTo) {
        paramCount++;
        query += ` AND ps.settlement_date <= $${paramCount}`;
        params.push(filters.dateTo);
      }

      query += ` ORDER BY ps.created_at DESC`;

      if (filters?.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }

      if (filters?.offset) {
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        params.push(filters.offset);
      }

      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching payment settlements:', error);
      throw error;
    }
  }

  async createPaymentSettlement(settlement: any): Promise<any> {
    try {
      const result = await this.pool.query(
        `INSERT INTO payment_settlements (company_id, job_id, amount, type, status, payment_method, settlement_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          settlement.company_id,
          settlement.job_id,
          settlement.amount,
          settlement.type,
          settlement.status,
          settlement.payment_method,
          settlement.settlement_date
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating payment settlement:', error);
      throw error;
    }
  }

  async updatePaymentSettlement(id: number, settlement: any): Promise<any> {
    try {
      const result = await this.pool.query(
        `UPDATE payment_settlements 
         SET amount = $2, type = $3, status = $4, payment_method = $5, settlement_date = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id, settlement.amount, settlement.type, settlement.status, settlement.payment_method, settlement.settlement_date]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating payment settlement:', error);
      throw error;
    }
  }

  // System Settings Methods
  async getSystemSettings(category?: string): Promise<any[]> {
    try {
      let query = 'SELECT * FROM system_settings';
      const params: any[] = [];
      
      if (category) {
        query += ' WHERE category = $1';
        params.push(category);
      }
      
      query += ' ORDER BY category, key';
      
      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  }

  async getSystemSetting(key: string): Promise<any> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM system_settings WHERE key = $1',
        [key]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching system setting:', error);
      throw error;
    }
  }

  async updateSystemSetting(key: string, value: string): Promise<any> {
    try {
      const result = await this.pool.query(
        `UPDATE system_settings 
         SET value = $2, updated_at = CURRENT_TIMESTAMP
         WHERE key = $1
         RETURNING *`,
        [key, value]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating system setting:', error);
      throw error;
    }
  }

  async createSystemSetting(setting: any): Promise<any> {
    try {
      const result = await this.pool.query(
        `INSERT INTO system_settings (key, value, category, description)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [setting.key, setting.value, setting.category, setting.description]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating system setting:', error);
      throw error;
    }
  }

  // Platform Analytics Methods
  async getPlatformAnalytics(dateFrom?: string, dateTo?: string): Promise<any[]> {
    try {
      let query = 'SELECT * FROM platform_analytics WHERE 1=1';
      const params: any[] = [];
      let paramCount = 0;

      if (dateFrom) {
        paramCount++;
        query += ` AND date >= $${paramCount}`;
        params.push(dateFrom);
      }

      if (dateTo) {
        paramCount++;
        query += ` AND date <= $${paramCount}`;
        params.push(dateTo);
      }

      query += ' ORDER BY date DESC';

      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching platform analytics:', error);
      throw error;
    }
  }

  async createOrUpdatePlatformAnalytics(analytics: any): Promise<any> {
    try {
      const result = await this.pool.query(
        `INSERT INTO platform_analytics (date, total_users, new_users, total_jobs, new_jobs, total_companies, new_companies, total_applications, new_applications, revenue)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (date) 
         DO UPDATE SET 
           total_users = EXCLUDED.total_users,
           new_users = EXCLUDED.new_users,
           total_jobs = EXCLUDED.total_jobs,
           new_jobs = EXCLUDED.new_jobs,
           total_companies = EXCLUDED.total_companies,
           new_companies = EXCLUDED.new_companies,
           total_applications = EXCLUDED.total_applications,
           new_applications = EXCLUDED.new_applications,
           revenue = EXCLUDED.revenue
         RETURNING *`,
        [
          analytics.date,
          analytics.total_users,
          analytics.new_users,
          analytics.total_jobs,
          analytics.new_jobs,
          analytics.total_companies,
          analytics.new_companies,
          analytics.total_applications,
          analytics.new_applications,
          analytics.revenue
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating/updating platform analytics:', error);
      throw error;
    }
  }

  async generateDailyAnalytics(date: string): Promise<any> {
    try {
      // Get current totals
      const [userCount, jobCount, companyCount, applicationCount] = await Promise.all([
        this.pool.query('SELECT COUNT(*) FROM users'),
        this.pool.query('SELECT COUNT(*) FROM jobs'),
        this.pool.query('SELECT COUNT(*) FROM companies'),
        this.pool.query('SELECT COUNT(*) FROM applications')
      ]);

      // Get new counts for the date
      const [newUsers, newJobs, newCompanies, newApplications, revenue] = await Promise.all([
        this.pool.query('SELECT COUNT(*) FROM users WHERE DATE(created_at) = $1', [date]),
        this.pool.query('SELECT COUNT(*) FROM jobs WHERE DATE(created_at) = $1', [date]),
        this.pool.query('SELECT COUNT(*) FROM companies WHERE DATE(created_at) = $1', [date]),
        this.pool.query('SELECT COUNT(*) FROM applications WHERE DATE(created_at) = $1', [date]),
        this.pool.query('SELECT COALESCE(SUM(amount), 0) FROM payment_settlements WHERE DATE(settlement_date) = $1', [date])
      ]);

      const analytics = {
        date,
        total_users: parseInt(userCount.rows[0].count),
        new_users: parseInt(newUsers.rows[0].count),
        total_jobs: parseInt(jobCount.rows[0].count),
        new_jobs: parseInt(newJobs.rows[0].count),
        total_companies: parseInt(companyCount.rows[0].count),
        new_companies: parseInt(newCompanies.rows[0].count),
        total_applications: parseInt(applicationCount.rows[0].count),
        new_applications: parseInt(newApplications.rows[0].count),
        revenue: parseFloat(revenue.rows[0].coalesce)
      };

      return this.createOrUpdatePlatformAnalytics(analytics);
    } catch (error) {
      console.error('Error generating daily analytics:', error);
      throw error;
    }
  }

  // Company operations (placeholder implementations to satisfy interface)
  async getCompany(id: number): Promise<Company | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM companies WHERE id = $1', [id]);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  }

  async getCompanies(filters?: { industry?: string; size?: string; location?: string }): Promise<Company[]> {
    try {
      const result = await this.pool.query('SELECT * FROM companies ORDER BY name');
      return result.rows;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    try {
      console.log('🏢 Creating company with data:', company);
      
      const result = await this.pool.query(
        `INSERT INTO companies (name, registration_number, logo, size, status, description, industry, location, culture, benefits, website, founded, employee_count, is_detail_complete)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [
          company.name,
          company.registrationNumber || null,
          company.logo || null,
          company.size || null,
          company.status || 'pending',
          company.description || null,
          company.industry || null,
          company.location || null,
          company.culture || null,
          company.benefits && company.benefits.length > 0 ? `{${company.benefits.join(',')}}` : '{}',
          company.website || null,
          company.founded || null,
          company.employeeCount || null,
          company.isDetailComplete || false
        ]
      );

      if (result.rows.length === 0) {
        throw new Error('Failed to create company');
      }

      const createdCompany = result.rows[0] as Company;
      console.log('✅ Company created successfully:', createdCompany);
      return createdCompany;
    } catch (error) {
      console.error('❌ Error creating company:', error);
      throw error;
    }
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined> {
    throw new Error("Method not implemented.");
  }

  async getCompanyByUserId(userId: number): Promise<Company | undefined> {
    try {
      const result = await this.pool.query(`
        SELECT c.* FROM companies c
        INNER JOIN company_users cu ON c.id = cu.company_id
        WHERE cu.user_id = $1 AND cu.is_primary = true
        LIMIT 1
      `, [userId]);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error fetching company by user ID:', error);
      throw error;
    }
  }

  // Additional required methods (basic implementations)
  async getTalents(filters?: any): Promise<User[]> {
    return [];
  }

  async getJob(id: number): Promise<Job | undefined> {
    return undefined;
  }

  async getJobWithCompany(id: number): Promise<any> {
    return undefined;
  }

  async getJobs(filters?: any): Promise<any[]> {
    return [];
  }

  async getFeaturedJobs(limit: number = 6): Promise<any[]> {
    return [];
  }

  async getProJobs(limit: number = 8): Promise<any[]> {
    return [];
  }

  async createJob(job: InsertJob): Promise<Job> {
    throw new Error("Method not implemented.");
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined> {
    throw new Error("Method not implemented.");
  }

  async incrementJobViews(id: number): Promise<void> {
    // Implementation
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return undefined;
  }

  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return [];
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
    return [];
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    throw new Error("Method not implemented.");
  }

  async updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application | undefined> {
    throw new Error("Method not implemented.");
  }

  async getSavedJob(userId: number, jobId: number): Promise<SavedJob | undefined> {
    return undefined;
  }

  async getSavedJobsByUser(userId: number): Promise<SavedJob[]> {
    return [];
  }

  async createSavedJob(savedJob: InsertSavedJob): Promise<SavedJob> {
    throw new Error("Method not implemented.");
  }

  async deleteSavedJob(userId: number, jobId: number): Promise<boolean> {
    return false;
  }

  async getChatRoom(id: number): Promise<ChatRoom | undefined> {
    return undefined;
  }

  async getChatRoomWithParticipants(id: number): Promise<any> {
    return undefined;
  }

  async getChatRoomsByUser(userId: number): Promise<any[]> {
    return [];
  }

  async findOrCreateChatRoom(employerId: number, candidateId: number, jobId: number): Promise<ChatRoom> {
    throw new Error("Method not implemented.");
  }

  async updateChatRoomLastMessage(roomId: number): Promise<void> {
    // Implementation
  }

  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    return undefined;
  }

  async getChatMessagesByRoom(roomId: number, limit: number = 50, offset: number = 0): Promise<any[]> {
    return [];
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    throw new Error("Method not implemented.");
  }

  async markMessagesAsRead(roomId: number, userId: number): Promise<void> {
    // Implementation
  }

  async getUnreadMessageCount(roomId: number, userId: number): Promise<number> {
    return 0;
  }

  async getEmploymentHistory(id: number): Promise<EmploymentHistory | undefined> {
    return undefined;
  }

  async getEmploymentHistoryByUser(userId: number): Promise<EmploymentHistory[]> {
    return [];
  }

  async getEmploymentHistoryByCompany(companyId: number): Promise<EmploymentHistory[]> {
    return [];
  }

  async createEmploymentRequest(employment: InsertEmploymentHistory): Promise<EmploymentHistory> {
    throw new Error("Method not implemented.");
  }

  async approveEmploymentRequest(id: number, approverId: number): Promise<EmploymentHistory | undefined> {
    throw new Error("Method not implemented.");
  }

  async rejectEmploymentRequest(id: number): Promise<EmploymentHistory | undefined> {
    throw new Error("Method not implemented.");
  }

  async terminateEmployment(id: number, terminatedBy: number): Promise<EmploymentHistory | undefined> {
    throw new Error("Method not implemented.");
  }

  async getEvaluation(id: number): Promise<Evaluation | undefined> {
    return undefined;
  }

  async getEvaluationsByEmployment(employmentId: number): Promise<Evaluation[]> {
    return [];
  }

  async getEvaluationsByUser(userId: number, evaluatorType?: string): Promise<Evaluation[]> {
    return [];
  }

  async createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation> {
    throw new Error("Method not implemented.");
  }

  async getEmployeeEvaluations(userId: number): Promise<Evaluation[]> {
    return [];
  }

  async getCompanyEvaluations(companyId: number): Promise<Evaluation[]> {
    return [];
  }

  async getCompanyReview(id: number): Promise<CompanyReview | undefined> {
    return undefined;
  }

  async getCompanyReviews(companyId: number, isPublic: boolean = true): Promise<CompanyReview[]> {
    return [];
  }

  async getReviewsByUser(userId: number): Promise<CompanyReview[]> {
    return [];
  }

  async createCompanyReview(review: InsertCompanyReview): Promise<CompanyReview> {
    throw new Error("Method not implemented.");
  }

  async getCompanyRating(companyId: number): Promise<{ averageRating: number; totalReviews: number }> {
    return { averageRating: 0, totalReviews: 0 };
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    return undefined;
  }

  async getActiveSubscription(userId: number): Promise<Subscription | undefined> {
    return undefined;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    throw new Error("Method not implemented.");
  }

  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    throw new Error("Method not implemented.");
  }

  async cancelSubscription(id: number): Promise<Subscription | undefined> {
    throw new Error("Method not implemented.");
  }

  async createCompanyUser(companyUser: InsertCompanyUser): Promise<CompanyUser> {
    try {
      console.log('🔗 Creating company_user relationship:', companyUser);
      
      const result = await this.pool.query(
        `INSERT INTO company_users (user_id, company_id, role, is_primary, is_active, created_at, joined_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          companyUser.userId,
          companyUser.companyId,
          companyUser.role || 'admin',
          companyUser.isPrimary || true,
          companyUser.isActive !== false, // Default to true if not specified
          new Date(),
          new Date()
        ]
      );

      console.log('✅ Company user relationship created:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating company user relationship:', error);
      throw error;
    }
  }

  async getCompanyUser(id: number): Promise<CompanyUser | undefined> {
    return undefined;
  }

  async getCompanyUsersByCompany(companyId: number): Promise<CompanyUser[]> {
    return [];
  }

  async getCompanyUsersByUser(userId: number): Promise<CompanyUser[]> {
    return [];
  }

  async getUserCompanyRole(userId: number, companyId: number): Promise<string | null> {
    return null;
  }

  async getUserPrimaryCompany(userId: number): Promise<Company | undefined> {
    return undefined;
  }

  async closeChatRoom(roomId: number, closedBy: number): Promise<void> {
    // Implementation
  }

  async reopenChatRoom(roomId: number, userId: number): Promise<void> {
    // Implementation
  }

  async requestChatReopen(roomId: number, userId: number): Promise<void> {
    // Implementation
  }

  async acceptChatReopen(roomId: number): Promise<void> {
    // Implementation
  }

  async deleteChatForUser(roomId: number, userId: number): Promise<void> {
    // Implementation
  }

  async createAdminLog(log: InsertAdminActivityLog): Promise<AdminActivityLog> {
    throw new Error("Method not implemented.");
  }

  async getAdminLogs(filters?: any): Promise<AdminActivityLog[]> {
    return [];
  }

  async getPricingPlans(): Promise<PricingPlan[]> {
    return [];
  }

  async createPricingPlan(plan: InsertPricingPlan): Promise<PricingPlan> {
    throw new Error("Method not implemented.");
  }

  async updatePricingPlan(id: number, plan: Partial<InsertPricingPlan>): Promise<PricingPlan | undefined> {
    throw new Error("Method not implemented.");
  }

  async deletePricingPlan(id: number): Promise<boolean> {
    return false;
  }

  // Resume Management Methods
  async getResume(id: number): Promise<any> {
    try {
      const result = await this.pool.query('SELECT * FROM resumes WHERE id = $1', [id]);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error fetching resume:', error);
      throw error;
    }
  }

  async getResumesByUser(userId: number): Promise<any[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM resumes WHERE user_id = $1 ORDER BY is_main DESC, updated_at DESC', 
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching user resumes:', error);
      throw error;
    }
  }

  async createResume(resume: any): Promise<any> {
    try {
      const result = await this.pool.query(
        `INSERT INTO resumes (user_id, title, summary, is_public, is_main, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          resume.userId,
          resume.title,
          resume.summary || '',
          resume.visibility === 'public',
          false, // 새로 생성되는 이력서는 기본으로 설정하지 않음
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  }

  async updateResume(id: number, resume: any): Promise<any> {
    try {
      const result = await this.pool.query(
        `UPDATE resumes 
         SET title = COALESCE($2, title), 
             summary = COALESCE($3, summary), 
             is_public = COALESCE($4, is_public),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 
         RETURNING *`,
        [
          id,
          resume.title,
          resume.summary,
          resume.visibility === 'public'
        ]
      );
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  }

  async deleteResume(id: number): Promise<boolean> {
    try {
      const result = await this.pool.query('DELETE FROM resumes WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }

  async setDefaultResume(userId: number, resumeId: number): Promise<any> {
    try {
      // First, unset all main resumes for this user
      await this.pool.query('UPDATE resumes SET is_main = false WHERE user_id = $1', [userId]);
      
      // Then set the specified resume as main
      const result = await this.pool.query(
        'UPDATE resumes SET is_main = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [resumeId, userId]
      );
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error setting default resume:', error);
      throw error;
    }
  }

  async getUserDefaultResume(userId: number): Promise<any> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM resumes WHERE user_id = $1 AND is_main = true LIMIT 1',
        [userId]
      );
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error fetching default resume:', error);
      throw error;
    }
  }

  async getUserCompanyAssociation(userId: number): Promise<any> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM company_users WHERE user_id = $1 LIMIT 1',
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user company association:', error);
      return null;
    }
  }
}