import { Pool } from 'pg';
import { 
  users, companies, jobs, applications, savedJobs, chatRooms, chatMessages,
  employmentHistory, evaluations, companyReviews, subscriptions, companyUsers,
  paymentSettlements, platformAnalytics, systemSettings, adminActivityLogs, pricingPlans,
  type User, type InsertUser,
  type Company, type InsertCompany,
  type Job, type InsertJob, type JobWithCompany,
  type Application, type InsertApplication,
  type SavedJob, type InsertSavedJob,
  type ChatRoom, type InsertChatRoom, type ChatRoomWithParticipants,
  type ChatMessage, type InsertChatMessage, type ChatMessageWithSender,
  type EmploymentHistory, type InsertEmploymentHistory,
  type Evaluation, type InsertEvaluation,
  type CompanyReview, type InsertCompanyReview,
  type Subscription, type InsertSubscription,
  type CompanyUser, type InsertCompanyUser,
  type PaymentSettlement, type InsertPaymentSettlement,
  type PlatformAnalytics, type InsertPlatformAnalytics,
  type SystemSetting, type InsertSystemSetting,
  type AdminActivityLog, type InsertAdminActivityLog,
  type PricingPlan, type InsertPricingPlan
} from "@shared/schema";
import { IStorage } from "./storage";

export class PostgreSQLStorage implements IStorage {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: '203.23.49.100',
      port: 5432,
      database: 'jobmongolia',
      user: 'jobmongolia_user',
      password: 'JobMongolia2025R5!',
      ssl: false
    });
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      const client = await this.pool.connect();
      console.log('Connected to PostgreSQL database successfully');
      client.release();
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log(`[STORAGE] Getting user by username: ${username}`);
      const result = await this.pool.query('SELECT * FROM users WHERE username = $1', [username]);
      console.log(`[STORAGE] Query result: found ${result.rows.length} rows`);
      if (result.rows[0]) {
        console.log(`[STORAGE] User found: ID ${result.rows[0].id}, email: ${result.rows[0].email}, userType: ${result.rows[0].user_type}`);
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log(`[STORAGE] Getting user by email: ${email}`);
      const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
      console.log(`[STORAGE] Query result: found ${result.rows.length} rows`);
      if (result.rows[0]) {
        console.log(`[STORAGE] User found: ID ${result.rows[0].id}, username: ${result.rows[0].username}, userType: ${result.rows[0].user_type}`);
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const result = await this.pool.query(
        'INSERT INTO users (username, password, email, full_name, user_type, role, profile_picture, location, phone, bio, skills, experience, education, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
        [user.username, user.password, user.email, user.fullName, user.userType, user.role || 'user', user.profilePicture, user.location, user.phone, user.bio, JSON.stringify(user.skills), user.experience, user.education, user.isActive !== false]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(user).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbKey = key === 'fullName' ? 'full_name' : 
                       key === 'userType' ? 'user_type' :
                       key === 'profilePicture' ? 'profile_picture' :
                       key === 'isActive' ? 'is_active' : key;
          fields.push(`${dbKey} = $${paramIndex}`);
          values.push(key === 'skills' ? JSON.stringify(value) : value);
          paramIndex++;
        }
      });

      if (fields.length === 0) return this.getUser(id);

      const query = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  // Companies
  async getCompany(id: number): Promise<Company | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM companies WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting company:', error);
      return undefined;
    }
  }

  async getCompanies(filters?: { industry?: string; size?: string; location?: string }): Promise<Company[]> {
    try {
      let query = 'SELECT * FROM companies WHERE status = $1';
      const values: any[] = ['approved'];
      let paramIndex = 2;

      if (filters?.industry) {
        query += ` AND industry = $${paramIndex}`;
        values.push(filters.industry);
        paramIndex++;
      }
      if (filters?.size) {
        query += ` AND size = $${paramIndex}`;
        values.push(filters.size);
        paramIndex++;
      }
      if (filters?.location) {
        query += ` AND location ILIKE $${paramIndex}`;
        values.push(`%${filters.location}%`);
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await this.pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting companies:', error);
      return [];
    }
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    try {
      const result = await this.pool.query(
        'INSERT INTO companies (name, logo, size, status, description, industry, location, culture, benefits, website, founded, employee_count, is_detail_complete) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
        [company.name, company.logo, company.size, company.status || 'pending', company.description, company.industry, company.location, company.culture, company.benefits, company.website, company.founded, company.employeeCount, company.isDetailComplete || false]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(company).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbKey = key === 'employeeCount' ? 'employee_count' :
                       key === 'isDetailComplete' ? 'is_detail_complete' : key;
          fields.push(`${dbKey} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (fields.length === 0) return this.getCompany(id);

      const query = `UPDATE companies SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating company:', error);
      return undefined;
    }
  }

  // Talents
  async getTalents(filters?: { search?: string; experience?: string; location?: string; skills?: string }): Promise<User[]> {
    try {
      let query = 'SELECT * FROM users WHERE user_type = $1';
      const values: any[] = ['candidate'];
      let paramIndex = 2;

      if (filters?.search) {
        query += ` AND (full_name ILIKE $${paramIndex} OR bio ILIKE $${paramIndex})`;
        values.push(`%${filters.search}%`);
        paramIndex++;
      }
      if (filters?.experience) {
        query += ` AND experience = $${paramIndex}`;
        values.push(filters.experience);
        paramIndex++;
      }
      if (filters?.location) {
        query += ` AND location ILIKE $${paramIndex}`;
        values.push(`%${filters.location}%`);
        paramIndex++;
      }
      if (filters?.skills) {
        query += ` AND skills::text ILIKE $${paramIndex}`;
        values.push(`%${filters.skills}%`);
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await this.pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting talents:', error);
      return [];
    }
  }

  // Jobs
  async getJob(id: number): Promise<Job | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting job:', error);
      return undefined;
    }
  }

  async getJobWithCompany(id: number): Promise<JobWithCompany | undefined> {
    try {
      const result = await this.pool.query(`
        SELECT j.*, 
               c.name as company_name, c.logo as company_logo, c.size as company_size,
               c.status as company_status, c.description as company_description,
               c.industry as company_industry, c.location as company_location,
               c.culture as company_culture, c.benefits as company_benefits,
               c.website as company_website, c.founded as company_founded,
               c.employee_count as company_employee_count, c.is_detail_complete as company_is_detail_complete,
               c.created_at as company_created_at, c.updated_at as company_updated_at
        FROM jobs j 
        JOIN companies c ON j.company_id = c.id 
        WHERE j.id = $1
      `, [id]);
      
      if (result.rows.length === 0) return undefined;
      
      const row = result.rows[0];
      return {
        id: row.id,
        companyId: row.company_id,
        title: row.title,
        description: row.description,
        location: row.location,
        type: row.type,
        experience: row.experience,
        salaryMin: row.salary_min,
        salaryMax: row.salary_max,
        isRemote: row.is_remote,
        isFeatured: row.is_featured,
        isUrgent: row.is_urgent,
        skills: row.skills,
        requirements: row.requirements,
        benefits: row.benefits,
        status: row.status,
        applications: row.applications,
        views: row.views,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        company: {
          id: row.company_id,
          name: row.company_name,
          size: row.company_size,
          status: row.company_status,
          description: row.company_description,
          industry: row.company_industry,
          location: row.company_location,
          culture: row.company_culture,
          benefits: row.company_benefits,
          logo: row.company_logo,
          website: row.company_website,
          founded: row.company_founded,
          employeeCount: row.company_employee_count,
          isDetailComplete: row.company_is_detail_complete,
          createdAt: row.company_created_at,
          updatedAt: row.company_updated_at
        }
      };
    } catch (error) {
      console.error('Error getting job with company:', error);
      return undefined;
    }
  }

  async getJobs(filters?: { 
    location?: string; 
    industry?: string; 
    experience?: string; 
    type?: string;
    salaryMin?: number;
    salaryMax?: number;
    isRemote?: boolean;
    isFeatured?: boolean;
    search?: string;
    companyId?: number;
    limit?: number;
    offset?: number;
  }): Promise<JobWithCompany[]> {
    try {
      let query = `
        SELECT j.*, 
               c.name as company_name, c.logo as company_logo, c.size as company_size,
               c.status as company_status, c.description as company_description,
               c.industry as company_industry, c.location as company_location,
               c.culture as company_culture, c.benefits as company_benefits,
               c.website as company_website, c.founded as company_founded,
               c.employee_count as company_employee_count, c.is_detail_complete as company_is_detail_complete,
               c.created_at as company_created_at, c.updated_at as company_updated_at
        FROM jobs j 
        JOIN companies c ON j.company_id = c.id 
        WHERE j.status = $1 AND c.status = $2
      `;
      const values: any[] = ['active', 'approved'];
      let paramIndex = 3;

      if (filters?.search) {
        query += ` AND (j.title ILIKE $${paramIndex} OR j.description ILIKE $${paramIndex})`;
        values.push(`%${filters.search}%`);
        paramIndex++;
      }
      if (filters?.location) {
        query += ` AND j.location ILIKE $${paramIndex}`;
        values.push(`%${filters.location}%`);
        paramIndex++;
      }
      if (filters?.industry) {
        query += ` AND c.industry = $${paramIndex}`;
        values.push(filters.industry);
        paramIndex++;
      }
      if (filters?.experience) {
        query += ` AND j.experience = $${paramIndex}`;
        values.push(filters.experience);
        paramIndex++;
      }
      if (filters?.type) {
        query += ` AND j.type = $${paramIndex}`;
        values.push(filters.type);
        paramIndex++;
      }
      if (filters?.salaryMin) {
        query += ` AND j.salary_min >= $${paramIndex}`;
        values.push(filters.salaryMin);
        paramIndex++;
      }
      if (filters?.salaryMax) {
        query += ` AND j.salary_max <= $${paramIndex}`;
        values.push(filters.salaryMax);
        paramIndex++;
      }
      if (filters?.isRemote !== undefined) {
        query += ` AND j.is_remote = $${paramIndex}`;
        values.push(filters.isRemote);
        paramIndex++;
      }
      if (filters?.isFeatured !== undefined) {
        query += ` AND j.is_featured = $${paramIndex}`;
        values.push(filters.isFeatured);
        paramIndex++;
      }
      if (filters?.companyId) {
        query += ` AND j.company_id = $${paramIndex}`;
        values.push(filters.companyId);
        paramIndex++;
      }

      query += ' ORDER BY j.is_featured DESC, j.created_at DESC';

      if (filters?.limit) {
        query += ` LIMIT $${paramIndex}`;
        values.push(filters.limit);
        paramIndex++;
      }
      if (filters?.offset) {
        query += ` OFFSET $${paramIndex}`;
        values.push(filters.offset);
        paramIndex++;
      }

      const result = await this.pool.query(query, values);
      return result.rows.map(row => ({
        id: row.id,
        companyId: row.company_id,
        title: row.title,
        description: row.description,
        location: row.location,
        type: row.type,
        experience: row.experience,
        salaryMin: row.salary_min,
        salaryMax: row.salary_max,
        isRemote: row.is_remote,
        isFeatured: row.is_featured,
        isUrgent: row.is_urgent,
        skills: row.skills,
        requirements: row.requirements,
        benefits: row.benefits,
        status: row.status,
        applications: row.applications,
        views: row.views,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        company: {
          id: row.company_id,
          name: row.company_name,
          size: row.company_size,
          status: row.company_status,
          description: row.company_description,
          industry: row.company_industry,
          location: row.company_location,
          culture: row.company_culture,
          benefits: row.company_benefits,
          logo: row.company_logo,
          website: row.company_website,
          founded: row.company_founded,
          employeeCount: row.company_employee_count,
          isDetailComplete: row.company_is_detail_complete,
          createdAt: row.company_created_at,
          updatedAt: row.company_updated_at
        }
      }));
    } catch (error) {
      console.error('Error getting jobs:', error);
      return [];
    }
  }

  async getFeaturedJobs(limit: number = 6): Promise<JobWithCompany[]> {
    return this.getJobs({ isFeatured: true, limit });
  }

  async createJob(job: InsertJob): Promise<Job> {
    try {
      const result = await this.pool.query(
        'INSERT INTO jobs (company_id, title, description, location, type, experience, salary_min, salary_max, is_remote, is_featured, is_urgent, skills, requirements, benefits, status, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *',
        [job.companyId, job.title, job.description, job.location, job.type, job.experience, job.salaryMin, job.salaryMax, job.isRemote, job.isFeatured, job.isUrgent, JSON.stringify(job.skills), JSON.stringify(job.requirements), JSON.stringify(job.benefits), job.status || 'active', job.expiresAt]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(job).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbKey = key === 'companyId' ? 'company_id' :
                       key === 'salaryMin' ? 'salary_min' :
                       key === 'salaryMax' ? 'salary_max' :
                       key === 'isRemote' ? 'is_remote' :
                       key === 'isFeatured' ? 'is_featured' :
                       key === 'isUrgent' ? 'is_urgent' :
                       key === 'expiresAt' ? 'expires_at' : key;
          fields.push(`${dbKey} = $${paramIndex}`);
          const dbValue = (key === 'skills' || key === 'requirements' || key === 'benefits') ? JSON.stringify(value) : value;
          values.push(dbValue);
          paramIndex++;
        }
      });

      if (fields.length === 0) return this.getJob(id);

      const query = `UPDATE jobs SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating job:', error);
      return undefined;
    }
  }

  async incrementJobViews(id: number): Promise<void> {
    try {
      await this.pool.query('UPDATE jobs SET views = views + 1 WHERE id = $1', [id]);
    } catch (error) {
      console.error('Error incrementing job views:', error);
    }
  }

  // Applications
  async getApplication(id: number): Promise<Application | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM applications WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting application:', error);
      return undefined;
    }
  }

  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    try {
      const result = await this.pool.query('SELECT * FROM applications WHERE job_id = $1 ORDER BY applied_at DESC', [jobId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting applications by job:', error);
      return [];
    }
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
    try {
      const result = await this.pool.query('SELECT * FROM applications WHERE user_id = $1 ORDER BY applied_at DESC', [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting applications by user:', error);
      return [];
    }
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    try {
      const result = await this.pool.query(
        'INSERT INTO applications (user_id, job_id, cover_letter, resume_url, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [application.userId, application.jobId, application.coverLetter, application.resumeUrl, application.status || 'pending']
      );
      
      // Increment application count for the job
      await this.pool.query('UPDATE jobs SET applications = applications + 1 WHERE id = $1', [application.jobId]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  async updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application | undefined> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(application).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbKey = key === 'userId' ? 'user_id' :
                       key === 'jobId' ? 'job_id' :
                       key === 'coverLetter' ? 'cover_letter' :
                       key === 'resumeUrl' ? 'resume_url' : key;
          fields.push(`${dbKey} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (fields.length === 0) return this.getApplication(id);

      const query = `UPDATE applications SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating application:', error);
      return undefined;
    }
  }

  // Saved Jobs
  async getSavedJob(userId: number, jobId: number): Promise<SavedJob | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM saved_jobs WHERE user_id = $1 AND job_id = $2', [userId, jobId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting saved job:', error);
      return undefined;
    }
  }

  async getSavedJobsByUser(userId: number): Promise<SavedJob[]> {
    try {
      const result = await this.pool.query('SELECT * FROM saved_jobs WHERE user_id = $1 ORDER BY saved_at DESC', [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting saved jobs by user:', error);
      return [];
    }
  }

  async createSavedJob(savedJob: InsertSavedJob): Promise<SavedJob> {
    try {
      const result = await this.pool.query(
        'INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) RETURNING *',
        [savedJob.userId, savedJob.jobId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating saved job:', error);
      throw error;
    }
  }

  async deleteSavedJob(userId: number, jobId: number): Promise<boolean> {
    try {
      const result = await this.pool.query('DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2', [userId, jobId]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting saved job:', error);
      return false;
    }
  }

  // Chat Rooms
  async getChatRoom(id: number): Promise<ChatRoom | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM chat_rooms WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting chat room:', error);
      return undefined;
    }
  }

  async getChatRoomWithParticipants(id: number): Promise<ChatRoomWithParticipants | undefined> {
    try {
      const result = await this.pool.query(`
        SELECT cr.*, 
               e.username as employer_username, e.full_name as employer_name, e.profile_picture as employer_picture,
               c.username as candidate_username, c.full_name as candidate_name, c.profile_picture as candidate_picture,
               j.title as job_title
        FROM chat_rooms cr
        LEFT JOIN users e ON cr.employer_id = e.id
        LEFT JOIN users c ON cr.candidate_id = c.id
        LEFT JOIN jobs j ON cr.job_id = j.id
        WHERE cr.id = $1
      `, [id]);
      
      if (result.rows.length === 0) return undefined;
      
      const row = result.rows[0];
      return {
        id: row.id,
        employerId: row.employer_id,
        candidateId: row.candidate_id,
        jobId: row.job_id,
        status: row.status,
        closedBy: row.closed_by,
        closedAt: row.closed_at,
        reopenRequestedBy: row.reopen_requested_by,
        reopenRequestedAt: row.reopen_requested_at,
        lastMessageAt: row.last_message_at,
        createdAt: row.created_at,
        employer: {
          id: row.employer_id,
          username: row.employer_username,
          fullName: row.employer_name,
          profilePicture: row.employer_picture
        },
        candidate: {
          id: row.candidate_id,
          username: row.candidate_username,
          fullName: row.candidate_name,
          profilePicture: row.candidate_picture
        },
        job: {
          id: row.job_id,
          title: row.job_title
        }
      };
    } catch (error) {
      console.error('Error getting chat room with participants:', error);
      return undefined;
    }
  }

  async getChatRoomsByUser(userId: number): Promise<ChatRoomWithParticipants[]> {
    try {
      const result = await this.pool.query(`
        SELECT cr.*, 
               e.username as employer_username, e.full_name as employer_name, e.profile_picture as employer_picture,
               c.username as candidate_username, c.full_name as candidate_name, c.profile_picture as candidate_picture,
               j.title as job_title
        FROM chat_rooms cr
        LEFT JOIN users e ON cr.employer_id = e.id
        LEFT JOIN users c ON cr.candidate_id = c.id
        LEFT JOIN jobs j ON cr.job_id = j.id
        WHERE cr.employer_id = $1 OR cr.candidate_id = $1
        ORDER BY cr.last_message_at DESC, cr.created_at DESC
      `, [userId]);
      
      return result.rows.map(row => ({
        id: row.id,
        employerId: row.employer_id,
        candidateId: row.candidate_id,
        jobId: row.job_id,
        status: row.status,
        closedBy: row.closed_by,
        closedAt: row.closed_at,
        reopenRequestedBy: row.reopen_requested_by,
        reopenRequestedAt: row.reopen_requested_at,
        lastMessageAt: row.last_message_at,
        createdAt: row.created_at,
        employer: {
          id: row.employer_id,
          username: row.employer_username,
          fullName: row.employer_name,
          profilePicture: row.employer_picture
        },
        candidate: {
          id: row.candidate_id,
          username: row.candidate_username,
          fullName: row.candidate_name,
          profilePicture: row.candidate_picture
        },
        job: {
          id: row.job_id,
          title: row.job_title
        }
      }));
    } catch (error) {
      console.error('Error getting chat rooms by user:', error);
      return [];
    }
  }

  async findOrCreateChatRoom(employerId: number, candidateId: number, jobId: number): Promise<ChatRoom> {
    try {
      // Try to find existing chat room
      let result = await this.pool.query(
        'SELECT * FROM chat_rooms WHERE employer_id = $1 AND candidate_id = $2 AND job_id = $3',
        [employerId, candidateId, jobId]
      );
      
      if (result.rows.length > 0) {
        return result.rows[0];
      }
      
      // Create new chat room
      result = await this.pool.query(
        'INSERT INTO chat_rooms (employer_id, candidate_id, job_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [employerId, candidateId, jobId, 'active']
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error finding or creating chat room:', error);
      throw error;
    }
  }

  async updateChatRoomLastMessage(roomId: number): Promise<void> {
    try {
      await this.pool.query('UPDATE chat_rooms SET last_message_at = NOW() WHERE id = $1', [roomId]);
    } catch (error) {
      console.error('Error updating chat room last message:', error);
    }
  }

  // Chat Messages
  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM chat_messages WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting chat message:', error);
      return undefined;
    }
  }

  async getChatMessagesByRoom(roomId: number, limit: number = 50, offset: number = 0): Promise<ChatMessageWithSender[]> {
    try {
      const result = await this.pool.query(`
        SELECT cm.*, u.username, u.full_name, u.profile_picture
        FROM chat_messages cm
        LEFT JOIN users u ON cm.sender_id = u.id
        WHERE cm.room_id = $1 AND cm.is_deleted = false
        ORDER BY cm.sent_at DESC
        LIMIT $2 OFFSET $3
      `, [roomId, limit, offset]);
      
      return result.rows.map(row => ({
        id: row.id,
        roomId: row.room_id,
        senderId: row.sender_id,
        message: row.message,
        messageType: row.message_type,
        isRead: row.is_read,
        isDeleted: row.is_deleted,
        sentAt: row.sent_at,
        sender: {
          id: row.sender_id,
          username: row.username,
          fullName: row.full_name,
          profilePicture: row.profile_picture
        }
      }));
    } catch (error) {
      console.error('Error getting chat messages by room:', error);
      return [];
    }
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    try {
      const result = await this.pool.query(
        'INSERT INTO chat_messages (room_id, sender_id, message, message_type) VALUES ($1, $2, $3, $4) RETURNING *',
        [message.roomId, message.senderId, message.message, message.messageType || 'text']
      );
      
      // Update chat room last message time
      await this.updateChatRoomLastMessage(message.roomId);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating chat message:', error);
      throw error;
    }
  }

  async markMessagesAsRead(roomId: number, userId: number): Promise<void> {
    try {
      await this.pool.query(
        'UPDATE chat_messages SET is_read = true WHERE room_id = $1 AND sender_id != $2 AND is_read = false',
        [roomId, userId]
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  async getUnreadMessageCount(roomId: number, userId: number): Promise<number> {
    try {
      const result = await this.pool.query(
        'SELECT COUNT(*) FROM chat_messages WHERE room_id = $1 AND sender_id != $2 AND is_read = false',
        [roomId, userId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  }

  // Employment History - Stub implementations
  async getEmploymentHistory(id: number): Promise<EmploymentHistory | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM employment_history WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting employment history:', error);
      return undefined;
    }
  }

  async getEmploymentHistoryByUser(userId: number): Promise<EmploymentHistory[]> {
    try {
      const result = await this.pool.query('SELECT * FROM employment_history WHERE user_id = $1 ORDER BY start_date DESC', [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting employment history by user:', error);
      return [];
    }
  }

  async getEmploymentHistoryByCompany(companyId: number): Promise<EmploymentHistory[]> {
    try {
      const result = await this.pool.query('SELECT * FROM employment_history WHERE company_id = $1 ORDER BY start_date DESC', [companyId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting employment history by company:', error);
      return [];
    }
  }

  async createEmploymentRequest(employment: InsertEmploymentHistory): Promise<EmploymentHistory> {
    try {
      const result = await this.pool.query(
        'INSERT INTO employment_history (user_id, company_id, position, department, start_date, end_date, is_current_job, employment_type, salary, description, skills, achievements, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
        [employment.userId, employment.companyId, employment.position, employment.department, employment.startDate, employment.endDate, employment.isCurrentJob, employment.employmentType, employment.salary, employment.description, JSON.stringify(employment.skills), JSON.stringify(employment.achievements), employment.status || 'pending']
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating employment request:', error);
      throw error;
    }
  }

  async approveEmploymentRequest(id: number, approverId: number): Promise<EmploymentHistory | undefined> {
    try {
      const result = await this.pool.query(
        'UPDATE employment_history SET status = $1, approved_by = $2, approved_at = NOW(), updated_at = NOW() WHERE id = $3 RETURNING *',
        ['approved', approverId, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error approving employment request:', error);
      return undefined;
    }
  }

  async rejectEmploymentRequest(id: number): Promise<EmploymentHistory | undefined> {
    try {
      const result = await this.pool.query(
        'UPDATE employment_history SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        ['rejected', id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error rejecting employment request:', error);
      return undefined;
    }
  }

  async terminateEmployment(id: number, terminatedBy: number): Promise<EmploymentHistory | undefined> {
    try {
      const result = await this.pool.query(
        'UPDATE employment_history SET end_date = NOW(), is_current_job = false, terminated_by = $1, terminated_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *',
        [terminatedBy, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error terminating employment:', error);
      return undefined;
    }
  }

  // Evaluations - Stub implementations
  async getEvaluation(id: number): Promise<Evaluation | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM evaluations WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting evaluation:', error);
      return undefined;
    }
  }

  async getEvaluationsByEmployment(employmentId: number): Promise<Evaluation[]> {
    try {
      const result = await this.pool.query('SELECT * FROM evaluations WHERE employment_id = $1 ORDER BY created_at DESC', [employmentId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting evaluations by employment:', error);
      return [];
    }
  }

  async getEvaluationsByUser(userId: number, evaluatorType?: string): Promise<Evaluation[]> {
    try {
      let query = 'SELECT * FROM evaluations WHERE user_id = $1';
      const values: any[] = [userId];
      
      if (evaluatorType) {
        query += ' AND evaluator_type = $2';
        values.push(evaluatorType);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await this.pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting evaluations by user:', error);
      return [];
    }
  }

  async createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation> {
    try {
      const result = await this.pool.query(
        'INSERT INTO evaluations (user_id, evaluator_id, company_id, employment_id, evaluation_type, overall_rating, skill_rating, communication_rating, teamwork_rating, leadership_rating, innovation_rating, reliability_rating, comments, strengths, improvements, goals, evaluator_type, evaluation_period, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *',
        [evaluation.userId, evaluation.evaluatorId, evaluation.companyId, evaluation.employmentId, evaluation.evaluationType, evaluation.overallRating, evaluation.skillRating, evaluation.communicationRating, evaluation.teamworkRating, evaluation.leadershipRating, evaluation.innovationRating, evaluation.reliabilityRating, evaluation.comments, JSON.stringify(evaluation.strengths), JSON.stringify(evaluation.improvements), JSON.stringify(evaluation.goals), evaluation.evaluatorType, evaluation.evaluationPeriod, evaluation.isPublic || false]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating evaluation:', error);
      throw error;
    }
  }

  async getEmployeeEvaluations(userId: number): Promise<Evaluation[]> {
    return this.getEvaluationsByUser(userId);
  }

  async getCompanyEvaluations(companyId: number): Promise<Evaluation[]> {
    try {
      const result = await this.pool.query('SELECT * FROM evaluations WHERE company_id = $1 ORDER BY created_at DESC', [companyId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting company evaluations:', error);
      return [];
    }
  }

  // Company Reviews - Stub implementations
  async getCompanyReview(id: number): Promise<CompanyReview | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM company_reviews WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting company review:', error);
      return undefined;
    }
  }

  async getCompanyReviews(companyId: number, isPublic: boolean = true): Promise<CompanyReview[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM company_reviews WHERE company_id = $1 AND is_public = $2 ORDER BY created_at DESC',
        [companyId, isPublic]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting company reviews:', error);
      return [];
    }
  }

  async getReviewsByUser(userId: number): Promise<CompanyReview[]> {
    try {
      const result = await this.pool.query('SELECT * FROM company_reviews WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting reviews by user:', error);
      return [];
    }
  }

  async createCompanyReview(review: InsertCompanyReview): Promise<CompanyReview> {
    try {
      const result = await this.pool.query(
        'INSERT INTO company_reviews (user_id, company_id, employment_id, title, overall_rating, work_life_balance, culture, management, career_growth, compensation, benefits, position, department, employment_type, work_period, pros, cons, advice, is_anonymous, is_public, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *',
        [review.userId, review.companyId, review.employmentId, review.title, review.overallRating, review.workLifeBalance, review.culture, review.management, review.careerGrowth, review.compensation, review.benefits, review.position, review.department, review.employmentType, review.workPeriod, review.pros, review.cons, review.advice, review.isAnonymous !== false, review.isPublic !== false, review.isVerified || false]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating company review:', error);
      throw error;
    }
  }

  async getCompanyRating(companyId: number): Promise<{ averageRating: number; totalReviews: number }> {
    try {
      const result = await this.pool.query(
        'SELECT AVG(overall_rating) as avg_rating, COUNT(*) as total_reviews FROM company_reviews WHERE company_id = $1 AND is_public = true',
        [companyId]
      );
      
      const row = result.rows[0];
      return {
        averageRating: parseFloat(row.avg_rating) || 0,
        totalReviews: parseInt(row.total_reviews) || 0
      };
    } catch (error) {
      console.error('Error getting company rating:', error);
      return { averageRating: 0, totalReviews: 0 };
    }
  }

  // Subscriptions - Stub implementations
  async getSubscription(id: number): Promise<Subscription | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM subscriptions WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting subscription:', error);
      return undefined;
    }
  }

  async getActiveSubscription(userId: number): Promise<Subscription | undefined> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
        [userId, 'active']
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting active subscription:', error);
      return undefined;
    }
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    try {
      const result = await this.pool.query(
        'INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date, price, features, auto_renew) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [subscription.userId, subscription.planType, subscription.status || 'active', subscription.startDate, subscription.endDate, subscription.price, JSON.stringify(subscription.features), subscription.autoRenew !== false]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(subscription).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbKey = key === 'userId' ? 'user_id' :
                       key === 'planType' ? 'plan_type' :
                       key === 'startDate' ? 'start_date' :
                       key === 'endDate' ? 'end_date' :
                       key === 'autoRenew' ? 'auto_renew' : key;
          fields.push(`${dbKey} = $${paramIndex}`);
          const dbValue = key === 'features' ? JSON.stringify(value) : value;
          values.push(dbValue);
          paramIndex++;
        }
      });

      if (fields.length === 0) return this.getSubscription(id);

      const query = `UPDATE subscriptions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating subscription:', error);
      return undefined;
    }
  }

  async cancelSubscription(id: number): Promise<Subscription | undefined> {
    try {
      const result = await this.pool.query(
        'UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        ['cancelled', id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return undefined;
    }
  }

  // Company User methods
  async createCompanyUser(companyUser: InsertCompanyUser): Promise<CompanyUser> {
    try {
      const result = await this.pool.query(
        'INSERT INTO company_users (user_id, company_id, role, is_primary) VALUES ($1, $2, $3, $4) RETURNING *',
        [companyUser.userId, companyUser.companyId, companyUser.role, companyUser.isPrimary]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating company user:', error);
      throw error;
    }
  }

  async getCompanyUser(id: number): Promise<CompanyUser | undefined> {
    try {
      const result = await this.pool.query('SELECT * FROM company_users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting company user:', error);
      return undefined;
    }
  }

  async getCompanyUsersByCompany(companyId: number): Promise<CompanyUser[]> {
    try {
      const result = await this.pool.query('SELECT * FROM company_users WHERE company_id = $1', [companyId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting company users by company:', error);
      return [];
    }
  }

  async getCompanyUsersByUser(userId: number): Promise<CompanyUser[]> {
    try {
      const result = await this.pool.query('SELECT * FROM company_users WHERE user_id = $1', [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting company users by user:', error);
      return [];
    }
  }

  async getUserCompanyRole(userId: number, companyId: number): Promise<string | null> {
    try {
      const result = await this.pool.query(
        'SELECT role FROM company_users WHERE user_id = $1 AND company_id = $2',
        [userId, companyId]
      );
      return result.rows[0]?.role || null;
    } catch (error) {
      console.error('Error getting user company role:', error);
      return null;
    }
  }

  async getUserPrimaryCompany(userId: number): Promise<Company | undefined> {
    try {
      const result = await this.pool.query(`
        SELECT c.* FROM companies c 
        JOIN company_users cu ON c.id = cu.company_id 
        WHERE cu.user_id = $1 AND cu.is_primary = true
      `, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user primary company:', error);
      return undefined;
    }
  }

  // Chat Room methods
  async closeChatRoom(roomId: number, closedBy: number): Promise<void> {
    try {
      await this.pool.query(
        'UPDATE chat_rooms SET status = $1, closed_by = $2 WHERE id = $3',
        ['closed', closedBy, roomId]
      );
    } catch (error) {
      console.error('Error closing chat room:', error);
      throw error;
    }
  }

  async reopenChatRoom(roomId: number, userId: number): Promise<void> {
    try {
      await this.pool.query(
        'UPDATE chat_rooms SET status = $1, closed_by = NULL WHERE id = $2',
        ['active', roomId]
      );
    } catch (error) {
      console.error('Error reopening chat room:', error);
      throw error;
    }
  }

  async requestChatReopen(roomId: number, userId: number): Promise<void> {
    try {
      await this.pool.query(
        'UPDATE chat_rooms SET status = $1 WHERE id = $2',
        ['pending_reopen', roomId]
      );
    } catch (error) {
      console.error('Error requesting chat reopen:', error);
      throw error;
    }
  }

  async acceptChatReopen(roomId: number): Promise<void> {
    try {
      await this.pool.query(
        'UPDATE chat_rooms SET status = $1, closed_by = NULL WHERE id = $2',
        ['active', roomId]
      );
    } catch (error) {
      console.error('Error accepting chat reopen:', error);
      throw error;
    }
  }

  async deleteChatForUser(roomId: number, userId: number): Promise<void> {
    try {
      const result = await this.pool.query(
        'SELECT employer_id, candidate_id FROM chat_rooms WHERE id = $1',
        [roomId]
      );
      
      if (result.rows.length > 0) {
        const room = result.rows[0];
        if (room.employer_id === userId) {
          await this.pool.query(
            'UPDATE chat_rooms SET employer_deleted = true WHERE id = $1',
            [roomId]
          );
        } else if (room.candidate_id === userId) {
          await this.pool.query(
            'UPDATE chat_rooms SET candidate_deleted = true WHERE id = $1',
            [roomId]
          );
        }
      }
    } catch (error) {
      console.error('Error deleting chat for user:', error);
      throw error;
    }
  }

  // 정산관리 메서드들
  async getPaymentSettlements(filters?: { 
    companyId?: number; 
    status?: string; 
    dateFrom?: string; 
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaymentSettlement[]> {
    try {
      let query = `
        SELECT ps.*, c.name as company_name, j.title as job_title
        FROM payment_settlements ps
        LEFT JOIN companies c ON ps.company_id = c.id
        LEFT JOIN jobs j ON ps.job_id = j.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.companyId) {
        query += ` AND ps.company_id = $${paramIndex}`;
        params.push(filters.companyId);
        paramIndex++;
      }

      if (filters?.status) {
        query += ` AND ps.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters?.dateFrom) {
        query += ` AND ps.created_at >= $${paramIndex}`;
        params.push(filters.dateFrom);
        paramIndex++;
      }

      if (filters?.dateTo) {
        query += ` AND ps.created_at <= $${paramIndex}`;
        params.push(filters.dateTo);
        paramIndex++;
      }

      query += ` ORDER BY ps.created_at DESC`;

      if (filters?.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(filters.limit);
        paramIndex++;
      }

      if (filters?.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(filters.offset);
      }

      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching payment settlements:', error);
      throw error;
    }
  }

  async createPaymentSettlement(settlement: InsertPaymentSettlement): Promise<PaymentSettlement> {
    try {
      const result = await this.pool.query(`
        INSERT INTO payment_settlements (company_id, job_id, amount, type, status, payment_method, transaction_id, settlement_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        settlement.companyId,
        settlement.jobId,
        settlement.amount,
        settlement.type,
        settlement.status || 'pending',
        settlement.paymentMethod,
        settlement.transactionId,
        settlement.settlementDate
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating payment settlement:', error);
      throw error;
    }
  }

  async updatePaymentSettlement(id: number, settlement: Partial<InsertPaymentSettlement>): Promise<PaymentSettlement | undefined> {
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(settlement)) {
        if (value !== undefined) {
          updateFields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (updateFields.length === 0) return undefined;

      values.push(id);
      const result = await this.pool.query(`
        UPDATE payment_settlements 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `, values);

      return result.rows[0];
    } catch (error) {
      console.error('Error updating payment settlement:', error);
      throw error;
    }
  }

  // 플랫폼 분석 메서드들
  async getPlatformAnalytics(dateFrom?: string, dateTo?: string): Promise<PlatformAnalytics[]> {
    try {
      let query = 'SELECT * FROM platform_analytics WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (dateFrom) {
        query += ` AND date >= $${paramIndex}`;
        params.push(dateFrom);
        paramIndex++;
      }

      if (dateTo) {
        query += ` AND date <= $${paramIndex}`;
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

  async createOrUpdatePlatformAnalytics(analytics: InsertPlatformAnalytics): Promise<PlatformAnalytics> {
    try {
      const result = await this.pool.query(`
        INSERT INTO platform_analytics (
          date, total_revenue, job_posting_revenue, subscription_revenue,
          total_users, new_users, total_companies, new_companies,
          total_jobs, new_jobs, total_applications
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (date) DO UPDATE SET
          total_revenue = EXCLUDED.total_revenue,
          job_posting_revenue = EXCLUDED.job_posting_revenue,
          subscription_revenue = EXCLUDED.subscription_revenue,
          total_users = EXCLUDED.total_users,
          new_users = EXCLUDED.new_users,
          total_companies = EXCLUDED.total_companies,
          new_companies = EXCLUDED.new_companies,
          total_jobs = EXCLUDED.total_jobs,
          new_jobs = EXCLUDED.new_jobs,
          total_applications = EXCLUDED.total_applications
        RETURNING *
      `, [
        analytics.date,
        analytics.totalRevenue || 0,
        analytics.jobPostingRevenue || 0,
        analytics.subscriptionRevenue || 0,
        analytics.totalUsers || 0,
        analytics.newUsers || 0,
        analytics.totalCompanies || 0,
        analytics.newCompanies || 0,
        analytics.totalJobs || 0,
        analytics.newJobs || 0,
        analytics.totalApplications || 0
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating/updating platform analytics:', error);
      throw error;
    }
  }

  async generateDailyAnalytics(date: string): Promise<PlatformAnalytics> {
    try {
      // 일일 통계 생성
      const [
        totalUsers, newUsers, totalCompanies, newCompanies,
        totalJobs, newJobs, totalApplications, totalRevenue
      ] = await Promise.all([
        this.pool.query('SELECT COUNT(*) FROM users WHERE created_at <= $1', [date + ' 23:59:59']),
        this.pool.query('SELECT COUNT(*) FROM users WHERE DATE(created_at) = $1', [date]),
        this.pool.query('SELECT COUNT(*) FROM companies WHERE created_at <= $1', [date + ' 23:59:59']),
        this.pool.query('SELECT COUNT(*) FROM companies WHERE DATE(created_at) = $1', [date]),
        this.pool.query('SELECT COUNT(*) FROM jobs WHERE created_at <= $1', [date + ' 23:59:59']),
        this.pool.query('SELECT COUNT(*) FROM jobs WHERE DATE(created_at) = $1', [date]),
        this.pool.query('SELECT COUNT(*) FROM applications WHERE DATE(applied_at) = $1', [date]),
        this.pool.query('SELECT COALESCE(SUM(amount), 0) FROM payment_settlements WHERE DATE(created_at) = $1 AND status = \'completed\'', [date])
      ]);

      const analytics: InsertPlatformAnalytics = {
        date,
        totalRevenue: totalRevenue.rows[0].coalesce,
        jobPostingRevenue: totalRevenue.rows[0].coalesce, // 간단화
        subscriptionRevenue: '0',
        totalUsers: parseInt(totalUsers.rows[0].count),
        newUsers: parseInt(newUsers.rows[0].count),
        totalCompanies: parseInt(totalCompanies.rows[0].count),
        newCompanies: parseInt(newCompanies.rows[0].count),
        totalJobs: parseInt(totalJobs.rows[0].count),
        newJobs: parseInt(newJobs.rows[0].count),
        totalApplications: parseInt(totalApplications.rows[0].count)
      };

      return await this.createOrUpdatePlatformAnalytics(analytics);
    } catch (error) {
      console.error('Error generating daily analytics:', error);
      throw error;
    }
  }

  // 시스템 설정 메서드들
  async getSystemSettings(category?: string): Promise<SystemSetting[]> {
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

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
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

  async updateSystemSetting(key: string, value: string): Promise<SystemSetting | undefined> {
    try {
      const result = await this.pool.query(`
        UPDATE system_settings 
        SET value = $1, updated_at = NOW()
        WHERE key = $2
        RETURNING *
      `, [value, key]);

      return result.rows[0];
    } catch (error) {
      console.error('Error updating system setting:', error);
      throw error;
    }
  }

  async createSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    try {
      const result = await this.pool.query(`
        INSERT INTO system_settings (key, value, description, category, type)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        setting.key,
        setting.value,
        setting.description,
        setting.category || 'general',
        setting.type || 'string'
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating system setting:', error);
      throw error;
    }
  }

  // 관리자 활동 로그 메서드들
  async createAdminLog(log: InsertAdminActivityLog): Promise<AdminActivityLog> {
    try {
      const result = await this.pool.query(`
        INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        log.adminId,
        log.action,
        log.targetType,
        log.targetId,
        JSON.stringify(log.details),
        log.ipAddress,
        log.userAgent
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating admin log:', error);
      throw error;
    }
  }

  async getAdminLogs(filters?: {
    adminId?: number;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<AdminActivityLog[]> {
    try {
      let query = `
        SELECT al.*, u.username, u.full_name
        FROM admin_activity_logs al
        LEFT JOIN users u ON al.admin_id = u.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.adminId) {
        query += ` AND al.admin_id = $${paramIndex}`;
        params.push(filters.adminId);
        paramIndex++;
      }

      if (filters?.action) {
        query += ` AND al.action ILIKE $${paramIndex}`;
        params.push(`%${filters.action}%`);
        paramIndex++;
      }

      if (filters?.dateFrom) {
        query += ` AND al.created_at >= $${paramIndex}`;
        params.push(filters.dateFrom);
        paramIndex++;
      }

      if (filters?.dateTo) {
        query += ` AND al.created_at <= $${paramIndex}`;
        params.push(filters.dateTo);
        paramIndex++;
      }

      query += ` ORDER BY al.created_at DESC`;

      if (filters?.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(filters.limit);
        paramIndex++;
      }

      if (filters?.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(filters.offset);
      }

      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      throw error;
    }
  }

  // 요금제 관리 메서드들
  async getPricingPlans(): Promise<PricingPlan[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM pricing_plans ORDER BY price ASC'
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      throw error;
    }
  }

  async createPricingPlan(plan: InsertPricingPlan): Promise<PricingPlan> {
    try {
      const result = await this.pool.query(`
        INSERT INTO pricing_plans (name, description, price, currency, duration_days, features, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        plan.name,
        plan.description,
        plan.price,
        plan.currency || 'MNT',
        plan.durationDays,
        JSON.stringify(plan.features),
        plan.isActive !== undefined ? plan.isActive : true
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating pricing plan:', error);
      throw error;
    }
  }

  async updatePricingPlan(id: number, plan: Partial<InsertPricingPlan>): Promise<PricingPlan | undefined> {
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(plan)) {
        if (value !== undefined) {
          if (key === 'features') {
            updateFields.push(`${key} = $${paramIndex}`);
            values.push(JSON.stringify(value));
          } else {
            updateFields.push(`${key} = $${paramIndex}`);
            values.push(value);
          }
          paramIndex++;
        }
      }

      if (updateFields.length === 0) return undefined;

      values.push(id);
      const result = await this.pool.query(`
        UPDATE pricing_plans 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `, values);

      return result.rows[0];
    } catch (error) {
      console.error('Error updating pricing plan:', error);
      throw error;
    }
  }

  async deletePricingPlan(id: number): Promise<boolean> {
    try {
      const result = await this.pool.query(
        'DELETE FROM pricing_plans WHERE id = $1',
        [id]
      );
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
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
}