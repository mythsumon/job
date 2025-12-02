import { 
  users, companies, jobs, applications, savedJobs, chatRooms, chatMessages,
  employmentHistory, evaluations, companyReviews, subscriptions, companyUsers, resumes,
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
  type Resume, type InsertResume
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, or, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMongolianId(mongolianId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Companies
  getCompany(id: number): Promise<Company | undefined>;
  getCompanies(filters?: { industry?: string; size?: string; location?: string }): Promise<Company[]>;
  getCompanyByUserId(userId: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;

  // Talents
  getTalents(filters?: { search?: string; experience?: string; location?: string; skills?: string }): Promise<User[]>;

  // Jobs
  getJob(id: number): Promise<Job | undefined>;
  getJobWithCompany(id: number): Promise<JobWithCompany | undefined>;
  getJobs(filters?: { 
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
  }): Promise<JobWithCompany[]>;
  getFeaturedJobs(limit?: number): Promise<JobWithCompany[]>;
  getProJobs(limit?: number): Promise<JobWithCompany[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined>;
  incrementJobViews(id: number): Promise<void>;

  // Applications
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByJob(jobId: number): Promise<Application[]>;
  getApplicationsByUser(userId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application | undefined>;

  // Saved Jobs
  getSavedJob(userId: number, jobId: number): Promise<SavedJob | undefined>;
  getSavedJobsByUser(userId: number): Promise<SavedJob[]>;
  createSavedJob(savedJob: InsertSavedJob): Promise<SavedJob>;
  deleteSavedJob(userId: number, jobId: number): Promise<boolean>;

  // Chat Rooms
  getChatRoom(id: number): Promise<ChatRoom | undefined>;
  getChatRoomWithParticipants(id: number): Promise<ChatRoomWithParticipants | undefined>;
  getChatRoomsByUser(userId: number): Promise<ChatRoomWithParticipants[]>;
  findOrCreateChatRoom(employerId: number, candidateId: number, jobId: number): Promise<ChatRoom>;
  updateChatRoomLastMessage(roomId: number): Promise<void>;

  // Chat Messages
  getChatMessage(id: number): Promise<ChatMessage | undefined>;
  getChatMessagesByRoom(roomId: number, limit?: number, offset?: number): Promise<ChatMessageWithSender[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessagesAsRead(roomId: number, userId: number): Promise<void>;
  getUnreadMessageCount(roomId: number, userId: number): Promise<number>;

  // Company Users
  createCompanyUser(companyUser: InsertCompanyUser): Promise<CompanyUser>;
  getCompanyUser(id: number): Promise<CompanyUser | undefined>;
  getCompanyUsersByCompany(companyId: number): Promise<CompanyUser[]>;
  getCompanyUsersByUser(userId: number): Promise<CompanyUser[]>;
  getUserCompanyRole(userId: number, companyId: number): Promise<string | null>;
  getUserPrimaryCompany(userId: number): Promise<Company | undefined>;
  getUserCompanyAssociation(userId: number): Promise<any>;

  // Resume Management
  getResume(id: number): Promise<Resume | undefined>;
  getResumesByUser(userId: number): Promise<Resume[]>;
  createResume(resume: InsertResume & { userId: number }): Promise<Resume>;
  updateResume(id: number, resume: Partial<InsertResume>): Promise<Resume | undefined>;
  deleteResume(id: number): Promise<boolean>;
  setDefaultResume(userId: number, resumeId: number): Promise<Resume | undefined>;
  getUserDefaultResume(userId: number): Promise<Resume | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByMongolianId(mongolianId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.mongolianId, mongolianId));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const validatedUser: any = {
      ...user,
      userType: user.userType as "candidate" | "employer" | "admin",
      citizenshipType: user.citizenshipType as "mongolian" | "foreign" | null | undefined
    };
    const [newUser] = await db.insert(users).values([validatedUser]).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const validatedUser: any = {
      ...user,
      userType: user.userType as "candidate" | "employer" | "admin" | undefined,
      citizenshipType: user.citizenshipType as "mongolian" | "foreign" | null | undefined
    };
    const [updatedUser] = await db.update(users).set(validatedUser).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  // Companies
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanies(filters?: { industry?: string; size?: string; location?: string }): Promise<Company[]> {
    let query = db.select().from(companies);
    
    if (filters) {
      const conditions = [];
      if (filters.industry) conditions.push(eq(companies.industry, filters.industry));
      if (filters.size) conditions.push(eq(companies.size, filters.size));
      if (filters.location) conditions.push(like(companies.location, `%${filters.location}%`));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return query;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values([company]).returning();
    return newCompany;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updatedCompany] = await db.update(companies).set(company).where(eq(companies.id, id)).returning();
    return updatedCompany;
  }

  async getCompanyByUserId(userId: number): Promise<Company | undefined> {
    // First try to find company through company_users relation
    const [companyUser] = await db
      .select({ companyId: companyUsers.companyId })
      .from(companyUsers)
      .where(eq(companyUsers.userId, userId))
      .limit(1);
    
    if (companyUser) {
      return this.getCompany(companyUser.companyId);
    }
    
    // Fallback: try to find company where userId matches (if companies table has userId field)
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
    return company;
  }

  // Talents
  async getTalents(filters?: { search?: string; experience?: string; location?: string; skills?: string }): Promise<User[]> {
    let query = db.select().from(users).where(eq(users.userType, 'candidate'));
    
    if (filters) {
      const conditions = [eq(users.userType, 'candidate')];
      if (filters.search) {
        conditions.push(
          or(
            like(users.fullName, `%${filters.search}%`),
            like(users.email, `%${filters.search}%`)
          )
        );
      }
      if (filters.experience) conditions.push(eq(users.experience, filters.experience));
      if (filters.location) conditions.push(like(users.location, `%${filters.location}%`));
      
      query = query.where(and(...conditions));
    }
    
    return query;
  }

  // Jobs
  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getJobWithCompany(id: number): Promise<JobWithCompany | undefined> {
    const result = await db
      .select()
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.id, id));

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.jobs,
      company: row.companies || null
    } as JobWithCompany;
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
    let query = db
      .select()
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id));

    if (filters) {
      const conditions = [];
      if (filters.location) conditions.push(like(jobs.location, `%${filters.location}%`));
      if (filters.experience) conditions.push(eq(jobs.experienceLevel, filters.experience));
      if (filters.type) conditions.push(eq(jobs.employmentType, filters.type));
      if (filters.isRemote !== undefined) conditions.push(eq(jobs.isRemote, filters.isRemote));
      if (filters.isFeatured !== undefined) conditions.push(eq(jobs.isFeatured, filters.isFeatured));
      if (filters.companyId) conditions.push(eq(jobs.companyId, filters.companyId));
      if (filters.search) {
        conditions.push(
          or(
            like(jobs.title, `%${filters.search}%`),
            like(jobs.description, `%${filters.search}%`)
          )
        );
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    query = query.orderBy(desc(jobs.postedAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const results = await query;
    return results.map(row => ({
      ...row.jobs,
      company: row.companies || null
    })) as JobWithCompany[];
  }

  async getFeaturedJobs(limit: number = 6): Promise<JobWithCompany[]> {
    return this.getJobs({ isFeatured: true, limit });
  }

  async getProJobs(limit: number = 8): Promise<JobWithCompany[]> {
    const allJobs = await this.getJobs({ limit: 50 });
    return allJobs.filter(job => job.isPro).slice(0, limit);
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined> {
    const [updatedJob] = await db.update(jobs).set(job).where(eq(jobs.id, id)).returning();
    return updatedJob;
  }

  async incrementJobViews(id: number): Promise<void> {
    await db.update(jobs).set({ views: sql`${jobs.views} + 1` }).where(eq(jobs.id, id));
  }

  // Company Users
  async createCompanyUser(companyUser: InsertCompanyUser): Promise<CompanyUser> {
    const [newCompanyUser] = await db.insert(companyUsers).values(companyUser).returning();
    return newCompanyUser;
  }

  async getCompanyUser(id: number): Promise<CompanyUser | undefined> {
    const [companyUser] = await db.select().from(companyUsers).where(eq(companyUsers.id, id));
    return companyUser;
  }

  async getCompanyUsersByCompany(companyId: number): Promise<CompanyUser[]> {
    return db.select().from(companyUsers).where(eq(companyUsers.companyId, companyId));
  }

  async getCompanyUsersByUser(userId: number): Promise<CompanyUser[]> {
    return db.select().from(companyUsers).where(eq(companyUsers.userId, userId));
  }

  async getUserCompanyRole(userId: number, companyId: number): Promise<string | null> {
    const [companyUser] = await db
      .select({ role: companyUsers.role })
      .from(companyUsers)
      .where(and(eq(companyUsers.userId, userId), eq(companyUsers.companyId, companyId)));
    
    return companyUser?.role || null;
  }

  async getUserPrimaryCompany(userId: number): Promise<Company | undefined> {
    const result = await db
      .select()
      .from(companies)
      .leftJoin(companyUsers, eq(companies.id, companyUsers.companyId))
      .where(and(eq(companyUsers.userId, userId), eq(companyUsers.isPrimary, true)));

    return result[0]?.companies;
  }

  // Stub implementations for required interface methods
  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }

  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return db.select().from(applications).where(eq(applications.jobId, jobId));
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
    return db.select().from(applications).where(eq(applications.userId, userId));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application | undefined> {
    const [updatedApplication] = await db.update(applications).set(application).where(eq(applications.id, id)).returning();
    return updatedApplication;
  }

  async getSavedJob(userId: number, jobId: number): Promise<SavedJob | undefined> {
    const [savedJob] = await db.select().from(savedJobs)
      .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)));
    return savedJob;
  }

  async getSavedJobsByUser(userId: number): Promise<SavedJob[]> {
    return db.select().from(savedJobs).where(eq(savedJobs.userId, userId));
  }

  async createSavedJob(savedJob: InsertSavedJob): Promise<SavedJob> {
    const [newSavedJob] = await db.insert(savedJobs).values(savedJob).returning();
    return newSavedJob;
  }

  async deleteSavedJob(userId: number, jobId: number): Promise<boolean> {
    const result = await db.delete(savedJobs)
      .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)));
    return result.rowCount > 0;
  }

  // Chat functionality - minimal implementations
  async getChatRoom(id: number): Promise<ChatRoom | undefined> { return undefined; }
  async getChatRoomWithParticipants(id: number): Promise<ChatRoomWithParticipants | undefined> { return undefined; }
  async getChatRoomsByUser(userId: number): Promise<ChatRoomWithParticipants[]> { return []; }
  async findOrCreateChatRoom(employerId: number, candidateId: number, jobId: number): Promise<ChatRoom> { 
    throw new Error("Chat functionality not implemented"); 
  }
  async updateChatRoomLastMessage(roomId: number): Promise<void> {}
  async getChatMessage(id: number): Promise<ChatMessage | undefined> { return undefined; }
  async getChatMessagesByRoom(roomId: number, limit?: number, offset?: number): Promise<ChatMessageWithSender[]> { return []; }
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> { 
    throw new Error("Chat functionality not implemented"); 
  }
  async markMessagesAsRead(roomId: number, userId: number): Promise<void> {}
  async getUnreadMessageCount(roomId: number, userId: number): Promise<number> { return 0; }

  // Resume Management
  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  async getResumesByUser(userId: number): Promise<Resume[]> {
    return await db.select().from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.isDefault), desc(resumes.updatedAt));
  }

  async createResume(resume: InsertResume & { userId: number }): Promise<Resume> {
    const [newResume] = await db.insert(resumes).values(resume).returning();
    return newResume;
  }

  async updateResume(id: number, resume: Partial<InsertResume>): Promise<Resume | undefined> {
    const [updatedResume] = await db.update(resumes)
      .set({ ...resume, updatedAt: new Date() })
      .where(eq(resumes.id, id))
      .returning();
    return updatedResume;
  }

  async deleteResume(id: number): Promise<boolean> {
    const result = await db.delete(resumes).where(eq(resumes.id, id));
    return result.rowCount > 0;
  }

  async setDefaultResume(userId: number, resumeId: number): Promise<Resume | undefined> {
    // First, unset all default resumes for this user
    await db.update(resumes)
      .set({ isDefault: false })
      .where(eq(resumes.userId, userId));

    // Then set the specified resume as default
    const [updatedResume] = await db.update(resumes)
      .set({ isDefault: true })
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))
      .returning();
    
    return updatedResume;
  }

  async getUserDefaultResume(userId: number): Promise<Resume | undefined> {
    try {
      // Convert userId to number if it's a string
      const validUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      
      if (!validUserId || typeof validUserId !== 'number' || isNaN(validUserId)) {
        console.error('Invalid userId in getUserDefaultResume:', userId, 'converted to:', validUserId);
        return undefined;
      }

      const [resume] = await db.select().from(resumes)
        .where(and(eq(resumes.userId, validUserId), eq(resumes.isDefault, true)))
        .limit(1);
      
      return resume;
    } catch (error) {
      console.error('getUserDefaultResume error:', error);
      return undefined;
    }
  }

  async getUserCompanyAssociation(userId: number): Promise<any> {
    try {
      const [companyUser] = await db.select().from(companyUsers)
        .where(eq(companyUsers.userId, userId))
        .limit(1);
      
      return companyUser;
    } catch (error) {
      console.error('getUserCompanyAssociation error:', error);
      return null;
    }
  }
}

// import { PostgreSQLStorage } from './postgresql-storage';

export const storage = new DatabaseStorage();