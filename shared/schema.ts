import { pgTable, text, integer, boolean, timestamp, json, varchar, serial, decimal, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username"), // Made optional for email-only login
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  // Mongolian specific fields
  ovog: text("ovog"), // Family name in Mongolian
  ner: text("ner"), // Given name in Mongolian
  mongolianId: text("mongolian_id").unique(), // Mongolian ID: 2 Mongolian letters + 8 digits
  mongolianIdFirstLetter: text("mongolian_id_first_letter"), // First letter
  mongolianIdSecondLetter: text("mongolian_id_second_letter"), // Second letter
  mongolianIdNumbers: text("mongolian_id_numbers"), // 8 digits (YYMMDDXX)
  birthPlace: text("birth_place"), // First 2 letters representing birth place
  birthDate: date("birth_date"), // Birth date (YYMMDD part of ID)
  // Citizenship fields
  citizenshipType: text("citizenship_type").default("mongolian").$type<"mongolian" | "foreign">(),
  nationality: text("nationality"), // Country for foreign citizens
  foreignId: text("foreign_id"), // ID/passport for foreign citizens
  // End Mongolian fields
  userType: text("user_type").notNull().$type<"candidate" | "employer" | "admin">(), // "candidate" | "employer" | "admin"
  role: text("role").default("user").$type<"user" | "admin" | "super_admin">(), // "user" | "admin" | "super_admin"
  profilePicture: text("profile_picture"),
  profilePictureFormat: text("profile_picture_format").default("webp"), // Image format (webp, jpeg, png)
  profilePictureSize: integer("profile_picture_size"), // File size in bytes
  location: text("location"),
  phone: text("phone"),
  countryCode: text("country_code"),
  bio: text("bio"),
  skills: json("skills").$type<string[]>(),
  experience: text("experience"),
  education: text("education"),
  // Enhanced profile fields for AI matching and talent recommendations
  major: text("major"), // 전공
  preferredIndustry: json("preferred_industry").$type<string[]>(), // 희망 근무 분야
  dreamCompany: text("dream_company"), // 꿈의 직장
  careerLevel: text("career_level").$type<"entry" | "junior" | "mid" | "senior" | "executive">(), // 경력 수준
  preferredWorkType: json("preferred_work_type").$type<string[]>(), // 희망 근무 형태 (정규직, 계약직, 프리랜서 등)
  preferredLocation: json("preferred_location").$type<string[]>(), // 희망 근무 지역
  salaryExpectation: text("salary_expectation"), // 희망 연봉
  languageSkills: json("language_skills").$type<{language: string, level: string}[]>(), // 언어 능력
  certifications: json("certifications").$type<string[]>(), // 자격증
  workAvailability: text("work_availability").$type<"immediate" | "2weeks" | "1month" | "negotiable">(), // 근무 가능 시기
  portfolioUrl: text("portfolio_url"), // 포트폴리오 URL
  githubUrl: text("github_url"), // GitHub URL
  linkedinUrl: text("linkedin_url"), // LinkedIn URL
  personalWebsite: text("personal_website"), // 개인 웹사이트
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 회사-사용자 연결 테이블 (한 회사에 여러 사용자 지원)
export const companyUsers = pgTable("company_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  companyId: integer("company_id").references(() => companies.id),
  role: text("role").notNull().default("member"), // "admin" | "editor" | "viewer" | "member"
  isPrimary: boolean("is_primary").default(false), // 기본 회사 여부
  isActive: boolean("is_active").default(true), // 활성 상태
  createdAt: timestamp("created_at").defaultNow(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  registrationNumber: text("registration_number"), // 회사 사업자등록번호
  logo: text("logo"),
  logoFormat: text("logo_format").default("webp"), // 로고 이미지 포맷 (webp, jpeg, png)
  logoSize: integer("logo_size"), // 로고 파일 크기 (bytes)
  size: text("size"), // "startup", "small", "medium", "large"
  status: text("status").notNull().default("pending"), // "pending" | "approved" | "rejected"
  description: text("description"),
  industry: text("industry"),
  location: text("location"),
  culture: text("culture"),
  benefits: json("benefits").$type<string[]>(),
  website: text("website"),
  founded: integer("founded"),
  employeeCount: integer("employee_count"),
  // 연락처 정보
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  // 소셜 미디어 링크
  linkedin: text("linkedin"),
  facebook: text("facebook"),
  twitter: text("twitter"),
  instagram: text("instagram"),
  // 기업 문화 및 비전
  mission: text("mission"),
  vision: text("vision"),
  values: json("values").$type<string[]>(),
  isDetailComplete: boolean("is_detail_complete").default(false), // 상세정보 입력 완료 여부
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  location: text("location"),
  employmentType: text("employment_type"), // "full_time", "part_time", "contract", "internship"
  experienceLevel: text("experience_level"), // "entry", "junior", "mid", "senior", "expert"
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  skills: json("skills").$type<string[]>(),
  benefits: json("benefits").$type<string[]>(),
  isFeatured: boolean("is_featured"),
  isPro: boolean("is_pro").default(false),
  isActive: boolean("is_active"),
  views: integer("views"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
  status: text("status"),
  isRemote: boolean("is_remote"),
  postedAt: timestamp("posted_at"),
  expiresAt: timestamp("expires_at"),
  applicationsCount: integer("applications_count"),
});

// Resume management table
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  
  // Basic Information (Enhanced)
  basicInfo: jsonb("basic_info").$type<{
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    dateOfBirth: string;
    nationality: string;
    maritalStatus: string;
    drivingLicense: boolean;
    availability: string;
    expectedSalary: string;
    website?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    profilePicture?: string;
  }>(),
  
  // Skills and Languages (Enhanced)
  skillsAndLanguages: jsonb("skills_and_languages").$type<{
    technicalSkills: Array<{
      category: string;
      skills: Array<{
        name: string;
        level: string; // Beginner, Intermediate, Advanced, Expert
      }>;
    }>;
    softSkills: string[];
    languages: Array<{
      name: string;
      proficiency: string; // Native, Fluent, Conversational, Basic
      certification?: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
      expiryDate?: string;
      credentialId?: string;
    }>;
  }>(),
  
  // Portfolio (Replaces Projects)
  portfolio: jsonb("portfolio").$type<Array<{
    id: string;
    title: string;
    description: string;
    images: string[];
    category: string;
    tags: string[];
    url?: string;
    completionDate: string;
    client?: string;
    role: string;
  }>>(),
  
  // Education
  education: jsonb("education").$type<Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    gpa?: string;
    description?: string;
    achievements?: string[];
  }>>(),
  
  // Work Experience
  workHistory: jsonb("work_history").$type<Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>>().default([]),
  
  // Additional Information (기타 탭)
  additionalInfo: jsonb("additional_info").$type<{
    hobbies: string[];
    volunteerWork: Array<{
      organization: string;
      role: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description: string;
    }>;
    awards: Array<{
      title: string;
      issuer: string;
      date: string;
      description?: string;
    }>;
    references: Array<{
      name: string;
      position: string;
      company: string;
      email: string;
      phone: string;
      relationship: string;
    }>;
    additionalSkills: string[];
    personalStatement: string;
    careerObjective: string;
  }>(),
  visibility: varchar("visibility", { length: 50 }).default("private"),
  templateStyle: varchar("template_style", { length: 50 }).default("modern"),
  isDefault: boolean("is_default").default(false),
  fileUrl: varchar("file_url", { length: 500 }),
  fileName: varchar("file_name", { length: 255 }),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isPublic: boolean("is_public").default(true),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  jobId: integer("job_id").references(() => jobs.id),
  resumeId: integer("resume_id").references(() => resumes.id), // Link to specific resume
  status: text("status").notNull().default("pending"), // "pending", "reviewed", "interview", "accepted", "rejected"
  coverLetter: text("cover_letter"),
  resume: text("resume"),
  appliedAt: timestamp("applied_at").defaultNow(),
});

export const savedJobs = pgTable("saved_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  jobId: integer("job_id").references(() => jobs.id),
  savedAt: timestamp("saved_at").defaultNow(),
});

export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").references(() => users.id),
  candidateId: integer("candidate_id").references(() => users.id),
  jobId: integer("job_id").references(() => jobs.id),
  status: text("status").notNull().default("active"), // "active", "closed", "pending_reopen"
  closedBy: integer("closed_by").references(() => users.id),
  closedAt: timestamp("closed_at"),
  reopenRequestedBy: integer("reopen_requested_by").references(() => users.id),
  reopenRequestedAt: timestamp("reopen_requested_at"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => chatRooms.id),
  senderId: integer("sender_id").references(() => users.id),
  message: text("message").notNull(),
  messageType: text("message_type").default("text"), // "text", "file", "image"
  isRead: boolean("is_read").default(false),
  isDeleted: boolean("is_deleted").default(false),
  sentAt: timestamp("sent_at").defaultNow(),
});

// 근무 이력 테이블
export const employmentHistory = pgTable("employment_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  companyId: integer("company_id").references(() => companies.id),
  position: text("position").notNull(),
  department: text("department"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isCurrentJob: boolean("is_current_job").default(false),
  employmentType: text("employment_type").notNull(), // "정규직", "계약직", "프리랜서", "인턴"
  salary: integer("salary"),
  description: text("description"),
  skills: json("skills").$type<string[]>(),
  achievements: json("achievements").$type<string[]>(),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  terminatedBy: integer("terminated_by").references(() => users.id),
  terminationReason: text("termination_reason"),
  terminatedAt: timestamp("terminated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 평가 테이블
export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // 평가 받는 사람
  evaluatorId: integer("evaluator_id").references(() => users.id), // 평가하는 사람
  companyId: integer("company_id").references(() => companies.id),
  employmentId: integer("employment_id").references(() => employmentHistory.id),
  evaluationType: text("evaluation_type").notNull(), // "performance", "conduct", "skills"
  overallRating: integer("overall_rating").notNull(), // 1-5 점수
  skillRating: integer("skill_rating"),
  communicationRating: integer("communication_rating"),
  teamworkRating: integer("teamwork_rating"),
  leadershipRating: integer("leadership_rating"),
  innovationRating: integer("innovation_rating"),
  reliabilityRating: integer("reliability_rating"),
  comments: text("comments"),
  strengths: json("strengths").$type<string[]>(),
  improvements: json("improvements").$type<string[]>(),
  goals: json("goals").$type<string[]>(),
  evaluatorType: text("evaluator_type").notNull(), // "supervisor", "peer", "subordinate", "self"
  evaluationPeriod: text("evaluation_period"), // "2024-Q1", "2024-annual"
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// 회사 리뷰 테이블
export const companyReviews = pgTable("company_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  companyId: integer("company_id").references(() => companies.id),
  employmentId: integer("employment_id").references(() => employmentHistory.id),
  title: text("title").notNull(),
  overallRating: integer("overall_rating").notNull(), // 1-5 점수
  workLifeBalance: integer("work_life_balance"),
  culture: integer("culture"),
  management: integer("management"),
  careerGrowth: integer("career_growth"),
  compensation: integer("compensation"),
  benefits: integer("benefits"),
  position: text("position"),
  department: text("department"),
  employmentType: text("employment_type"),
  workPeriod: text("work_period"), // "1년 미만", "1-2년", "3-5년", "5년 이상"
  pros: text("pros"),
  cons: text("cons"),
  advice: text("advice"),
  isAnonymous: boolean("is_anonymous").default(true),
  isPublic: boolean("is_public").default(true),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 구독 테이블
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  planType: text("plan_type").notNull(), // "basic", "premium", "enterprise"
  status: text("status").notNull().default("active"), // "active", "cancelled", "expired"
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  price: integer("price").notNull(),
  features: json("features").$type<string[]>(),
  autoRenew: boolean("auto_renew").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, appliedAt: true });
export const insertSavedJobSchema = createInsertSchema(savedJobs).omit({ id: true, savedAt: true });
export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, sentAt: true });
export const insertCompanyUserSchema = createInsertSchema(companyUsers).omit({ id: true, createdAt: true }).extend({
  isPrimary: z.boolean().optional()
});
export const insertEmploymentHistorySchema = createInsertSchema(employmentHistory).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEvaluationSchema = createInsertSchema(evaluations).omit({ id: true, createdAt: true });
export const insertCompanyReviewSchema = createInsertSchema(companyReviews).omit({ id: true, createdAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type SavedJob = typeof savedJobs.$inferSelect;
export type InsertSavedJob = z.infer<typeof insertSavedJobSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type CompanyUser = typeof companyUsers.$inferSelect;
export type InsertCompanyUser = z.infer<typeof insertCompanyUserSchema>;
export type EmploymentHistory = typeof employmentHistory.$inferSelect;
export type InsertEmploymentHistory = z.infer<typeof insertEmploymentHistorySchema>;
export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type CompanyReview = typeof companyReviews.$inferSelect;
export type InsertCompanyReview = z.infer<typeof insertCompanyReviewSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// Extended types for joins
export type JobWithCompany = Job & { company: Company };
export type ApplicationWithUser = Application & { user: User };
export type ApplicationWithJob = Application & { job: JobWithCompany };
export type ChatRoomWithParticipants = ChatRoom & {
  employer: User;
  candidate: User;
  job: Job;
};
export type ChatMessageWithSender = ChatMessage & {
  sender: User;
};

// 정산관리 테이블
export const paymentSettlements = pgTable("payment_settlements", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  jobId: integer("job_id").references(() => jobs.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  settlementDate: date("settlement_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 플랫폼 분석 테이블
export const platformAnalytics = pgTable("platform_analytics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).default("0"),
  jobPostingRevenue: decimal("job_posting_revenue", { precision: 15, scale: 2 }).default("0"),
  subscriptionRevenue: decimal("subscription_revenue", { precision: 15, scale: 2 }).default("0"),
  totalUsers: integer("total_users").default(0),
  newUsers: integer("new_users").default(0),
  totalCompanies: integer("total_companies").default(0),
  newCompanies: integer("new_companies").default(0),
  totalJobs: integer("total_jobs").default(0),
  newJobs: integer("new_jobs").default(0),
  totalApplications: integer("total_applications").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// 시스템 설정 테이블
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  category: varchar("category", { length: 100 }).default("general"),
  type: varchar("type", { length: 50 }).default("string"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 관리자 활동 로그 테이블
export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id),
  action: varchar("action", { length: 255 }).notNull(),
  targetType: varchar("target_type", { length: 100 }),
  targetId: integer("target_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 요금제 테이블
export const pricingPlans = pgTable("pricing_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("MNT"),
  durationDays: integer("duration_days").notNull(),
  features: jsonb("features"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 광고 배너 테이블
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  position: varchar("position", { length: 50 }).notNull().default("jobs_header"), // "jobs_header", "home_top", "sidebar" 등
  priority: integer("priority").default(0), // 높을수록 우선
  backgroundColor: varchar("background_color", { length: 7 }).default("#f8f9fa"),
  textColor: varchar("text_color", { length: 7 }).default("#333333"),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  clickCount: integer("click_count").default(0),
  viewCount: integer("view_count").default(0),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 스키마 생성
export const insertPaymentSettlementSchema = createInsertSchema(paymentSettlements);
export const insertPlatformAnalyticsSchema = createInsertSchema(platformAnalytics);
export const insertSystemSettingSchema = createInsertSchema(systemSettings);
export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLogs);
export const insertPricingPlanSchema = createInsertSchema(pricingPlans);
export const insertBannerSchema = createInsertSchema(banners).omit({ id: true, clickCount: true, viewCount: true, createdAt: true, updatedAt: true });

// 타입 정의
export type PaymentSettlement = typeof paymentSettlements.$inferSelect;
export type InsertPaymentSettlement = z.infer<typeof insertPaymentSettlementSchema>;

export type PlatformAnalytics = typeof platformAnalytics.$inferSelect;
export type InsertPlatformAnalytics = z.infer<typeof insertPlatformAnalyticsSchema>;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;

export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type InsertAdminActivityLog = z.infer<typeof insertAdminActivityLogSchema>;

export type PricingPlan = typeof pricingPlans.$inferSelect;
export type InsertPricingPlan = z.infer<typeof insertPricingPlanSchema>;

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = z.infer<typeof insertBannerSchema>;

// Resume schema and types
export const insertResumeSchema = createInsertSchema(resumes).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
});

export type Resume = typeof resumes.$inferSelect;