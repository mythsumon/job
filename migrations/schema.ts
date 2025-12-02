import { pgTable, varchar, foreignKey, check, serial, integer, text, boolean, timestamp, date, numeric, jsonb, unique, inet } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const newtable = pgTable("newtable", {
	column1: varchar(),
});

export const newtable1 = pgTable("newtable_1", {
	column1: varchar(),
});

export const chatMessages = pgTable("chat_messages", {
	id: serial().primaryKey().notNull(),
	roomId: integer("room_id"),
	senderId: integer("sender_id"),
	message: text().notNull(),
	messageType: text("message_type").default('text'),
	isRead: boolean("is_read").default(false),
	sentAt: timestamp("sent_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [chatRooms.id],
			name: "chat_messages_room_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "chat_messages_sender_id_fkey"
		}).onDelete("cascade"),
	check("chat_messages_message_type_check", sql`message_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text])`),
]);

export const employmentHistory = pgTable("employment_history", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	companyId: integer("company_id"),
	position: text().notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date"),
	status: text().default('pending'),
	approvedBy: integer("approved_by"),
	terminatedBy: integer("terminated_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "employment_history_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "employment_history_company_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.id],
			name: "employment_history_approved_by_fkey"
		}),
	foreignKey({
			columns: [table.terminatedBy],
			foreignColumns: [users.id],
			name: "employment_history_terminated_by_fkey"
		}),
	check("employment_history_status_check", sql`status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'terminated'::text])`),
]);

export const evaluations = pgTable("evaluations", {
	id: serial().primaryKey().notNull(),
	employmentId: integer("employment_id"),
	evaluatorId: integer("evaluator_id"),
	evaluatorType: text("evaluator_type").notNull(),
	rating: integer().notNull(),
	comment: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.employmentId],
			foreignColumns: [employmentHistory.id],
			name: "evaluations_employment_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.evaluatorId],
			foreignColumns: [users.id],
			name: "evaluations_evaluator_id_fkey"
		}).onDelete("cascade"),
	check("evaluations_evaluator_type_check", sql`evaluator_type = ANY (ARRAY['company'::text, 'employee'::text])`),
	check("evaluations_rating_check", sql`(rating >= 1) AND (rating <= 5)`),
]);

export const pricingPlans = pgTable("pricing_plans", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	currency: varchar({ length: 3 }).default('MNT'),
	durationDays: integer("duration_days").notNull(),
	features: jsonb(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	email: text().notNull(),
	fullName: text("full_name").notNull(),
	userType: text("user_type").notNull(),
	role: text().default('user'),
	profilePicture: text("profile_picture"),
	location: text(),
	phone: text(),
	bio: text(),
	skills: jsonb().default([]),
	experience: text(),
	education: text(),
	isActive: boolean("is_active").default(true),
	lastLogin: timestamp("last_login", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_username_key").on(table.username),
	unique("users_email_key").on(table.email),
	check("users_user_type_check", sql`user_type = ANY (ARRAY['candidate'::text, 'employer'::text, 'admin'::text])`),
]);

export const companyReviews = pgTable("company_reviews", {
	id: serial().primaryKey().notNull(),
	companyId: integer("company_id"),
	userId: integer("user_id"),
	rating: integer().notNull(),
	title: text(),
	review: text(),
	pros: text(),
	cons: text(),
	isPublic: boolean("is_public").default(true),
	isAnonymous: boolean("is_anonymous").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "company_reviews_company_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "company_reviews_user_id_fkey"
		}).onDelete("cascade"),
	unique("company_reviews_company_id_user_id_key").on(table.companyId, table.userId),
	check("company_reviews_rating_check", sql`(rating >= 1) AND (rating <= 5)`),
]);

export const companies = pgTable("companies", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	logo: text(),
	size: text(),
	status: text().default('pending').notNull(),
	description: text(),
	industry: text(),
	location: text(),
	culture: text(),
	benefits: text().array().default(["RAY"]),
	website: text(),
	founded: integer(),
	employeeCount: integer("employee_count"),
	isDetailComplete: boolean("is_detail_complete").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	check("companies_status_check", sql`status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])`),
]);

export const subscriptions = pgTable("subscriptions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	plan: text().notNull(),
	status: text().default('active'),
	startDate: date("start_date").notNull(),
	endDate: date("end_date"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "subscriptions_user_id_fkey"
		}).onDelete("cascade"),
	check("subscriptions_plan_check", sql`plan = ANY (ARRAY['basic'::text, 'premium'::text, 'enterprise'::text])`),
	check("subscriptions_status_check", sql`status = ANY (ARRAY['active'::text, 'canceled'::text, 'expired'::text])`),
]);

export const paymentSettlements = pgTable("payment_settlements", {
	id: serial().primaryKey().notNull(),
	companyId: integer("company_id"),
	jobId: integer("job_id"),
	amount: numeric({ precision: 15, scale:  2 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	paymentMethod: varchar("payment_method", { length: 50 }),
	transactionId: varchar("transaction_id", { length: 255 }),
	settlementDate: date("settlement_date"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "payment_settlements_company_id_fkey"
		}),
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "payment_settlements_job_id_fkey"
		}),
	check("payment_settlements_type_check", sql`(type)::text = ANY ((ARRAY['job_posting'::character varying, 'featured_listing'::character varying, 'premium_placement'::character varying, 'subscription'::character varying])::text[])`),
	check("payment_settlements_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying])::text[])`),
]);

export const platformAnalytics = pgTable("platform_analytics", {
	id: serial().primaryKey().notNull(),
	date: date().notNull(),
	totalRevenue: numeric("total_revenue", { precision: 15, scale:  2 }).default('0'),
	jobPostingRevenue: numeric("job_posting_revenue", { precision: 15, scale:  2 }).default('0'),
	subscriptionRevenue: numeric("subscription_revenue", { precision: 15, scale:  2 }).default('0'),
	totalUsers: integer("total_users").default(0),
	newUsers: integer("new_users").default(0),
	totalCompanies: integer("total_companies").default(0),
	newCompanies: integer("new_companies").default(0),
	totalJobs: integer("total_jobs").default(0),
	newJobs: integer("new_jobs").default(0),
	totalApplications: integer("total_applications").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("platform_analytics_date_key").on(table.date),
]);

export const jobs = pgTable("jobs", {
	id: serial().primaryKey().notNull(),
	companyId: integer("company_id"),
	title: text().notNull(),
	description: text().notNull(),
	requirements: text(),
	location: text(),
	employmentType: text("employment_type").default('full-time'),
	experienceLevel: text("experience_level").default('mid'),
	salaryMin: integer("salary_min"),
	salaryMax: integer("salary_max"),
	skills: text().array().default(["RAY"]),
	benefits: text().array().default(["RAY"]),
	isFeatured: boolean("is_featured").default(false),
	isActive: boolean("is_active").default(true),
	views: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	status: text().default('active'),
	isRemote: boolean("is_remote").default(false),
	postedAt: timestamp("posted_at", { mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	applicationsCount: integer("applications_count").default(0),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "jobs_company_id_fkey"
		}).onDelete("cascade"),
	check("jobs_employment_type_check", sql`employment_type = ANY (ARRAY['full-time'::text, 'part-time'::text, 'contract'::text, 'freelance'::text, 'internship'::text])`),
	check("jobs_experience_level_check", sql`experience_level = ANY (ARRAY['entry'::text, 'mid'::text, 'senior'::text, 'lead'::text])`),
	check("jobs_status_check", sql`status = ANY (ARRAY['active'::text, 'inactive'::text, 'closed'::text])`),
]);

export const systemSettings = pgTable("system_settings", {
	id: serial().primaryKey().notNull(),
	key: varchar({ length: 255 }).notNull(),
	value: text(),
	description: text(),
	category: varchar({ length: 100 }).default('general'),
	type: varchar({ length: 50 }).default('string'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("system_settings_key_key").on(table.key),
	check("system_settings_type_check", sql`(type)::text = ANY ((ARRAY['string'::character varying, 'number'::character varying, 'boolean'::character varying, 'json'::character varying])::text[])`),
]);

export const companyUsers = pgTable("company_users", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	companyId: integer("company_id"),
	role: text().default('member').notNull(),
	isPrimary: boolean("is_primary").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	isActive: boolean("is_active").default(true),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "company_users_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "company_users_company_id_fkey"
		}).onDelete("cascade"),
	unique("company_users_user_id_company_id_key").on(table.userId, table.companyId),
	check("company_users_role_check", sql`role = ANY (ARRAY['owner'::text, 'admin'::text, 'hr'::text, 'member'::text])`),
]);

export const applications = pgTable("applications", {
	id: serial().primaryKey().notNull(),
	jobId: integer("job_id"),
	userId: integer("user_id"),
	status: text().default('pending'),
	coverLetter: text("cover_letter"),
	resumeUrl: text("resume_url"),
	appliedAt: timestamp("applied_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "applications_job_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "applications_user_id_fkey"
		}).onDelete("cascade"),
	unique("applications_job_id_user_id_key").on(table.jobId, table.userId),
	check("applications_status_check", sql`status = ANY (ARRAY['pending'::text, 'reviewing'::text, 'interview'::text, 'accepted'::text, 'rejected'::text])`),
]);

export const savedJobs = pgTable("saved_jobs", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	jobId: integer("job_id"),
	savedAt: timestamp("saved_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "saved_jobs_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "saved_jobs_job_id_fkey"
		}).onDelete("cascade"),
	unique("saved_jobs_user_id_job_id_key").on(table.userId, table.jobId),
]);

export const adminActivityLogs = pgTable("admin_activity_logs", {
	id: serial().primaryKey().notNull(),
	adminId: integer("admin_id"),
	action: varchar({ length: 255 }).notNull(),
	targetType: varchar("target_type", { length: 100 }),
	targetId: integer("target_id"),
	details: jsonb(),
	ipAddress: inet("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [users.id],
			name: "admin_activity_logs_admin_id_fkey"
		}),
]);

export const chatRooms = pgTable("chat_rooms", {
	id: serial().primaryKey().notNull(),
	employerId: integer("employer_id"),
	candidateId: integer("candidate_id"),
	jobId: integer("job_id"),
	status: text().default('active'),
	closedBy: integer("closed_by"),
	lastMessageAt: timestamp("last_message_at", { mode: 'string' }),
	employerDeleted: boolean("employer_deleted").default(false),
	candidateDeleted: boolean("candidate_deleted").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.employerId],
			foreignColumns: [users.id],
			name: "chat_rooms_employer_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.candidateId],
			foreignColumns: [users.id],
			name: "chat_rooms_candidate_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "chat_rooms_job_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.closedBy],
			foreignColumns: [users.id],
			name: "chat_rooms_closed_by_fkey"
		}),
	unique("chat_rooms_employer_id_candidate_id_job_id_key").on(table.employerId, table.candidateId, table.jobId),
	check("chat_rooms_status_check", sql`status = ANY (ARRAY['active'::text, 'closed'::text, 'pending_reopen'::text])`),
]);
