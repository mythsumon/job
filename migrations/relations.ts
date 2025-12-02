import { relations } from "drizzle-orm/relations";
import { chatRooms, chatMessages, users, employmentHistory, companies, evaluations, companyReviews, subscriptions, paymentSettlements, jobs, companyUsers, applications, savedJobs, adminActivityLogs } from "./schema";

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	chatRoom: one(chatRooms, {
		fields: [chatMessages.roomId],
		references: [chatRooms.id]
	}),
	user: one(users, {
		fields: [chatMessages.senderId],
		references: [users.id]
	}),
}));

export const chatRoomsRelations = relations(chatRooms, ({one, many}) => ({
	chatMessages: many(chatMessages),
	user_employerId: one(users, {
		fields: [chatRooms.employerId],
		references: [users.id],
		relationName: "chatRooms_employerId_users_id"
	}),
	user_candidateId: one(users, {
		fields: [chatRooms.candidateId],
		references: [users.id],
		relationName: "chatRooms_candidateId_users_id"
	}),
	job: one(jobs, {
		fields: [chatRooms.jobId],
		references: [jobs.id]
	}),
	user_closedBy: one(users, {
		fields: [chatRooms.closedBy],
		references: [users.id],
		relationName: "chatRooms_closedBy_users_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	chatMessages: many(chatMessages),
	employmentHistories_userId: many(employmentHistory, {
		relationName: "employmentHistory_userId_users_id"
	}),
	employmentHistories_approvedBy: many(employmentHistory, {
		relationName: "employmentHistory_approvedBy_users_id"
	}),
	employmentHistories_terminatedBy: many(employmentHistory, {
		relationName: "employmentHistory_terminatedBy_users_id"
	}),
	evaluations: many(evaluations),
	companyReviews: many(companyReviews),
	subscriptions: many(subscriptions),
	companyUsers: many(companyUsers),
	applications: many(applications),
	savedJobs: many(savedJobs),
	adminActivityLogs: many(adminActivityLogs),
	chatRooms_employerId: many(chatRooms, {
		relationName: "chatRooms_employerId_users_id"
	}),
	chatRooms_candidateId: many(chatRooms, {
		relationName: "chatRooms_candidateId_users_id"
	}),
	chatRooms_closedBy: many(chatRooms, {
		relationName: "chatRooms_closedBy_users_id"
	}),
}));

export const employmentHistoryRelations = relations(employmentHistory, ({one, many}) => ({
	user_userId: one(users, {
		fields: [employmentHistory.userId],
		references: [users.id],
		relationName: "employmentHistory_userId_users_id"
	}),
	company: one(companies, {
		fields: [employmentHistory.companyId],
		references: [companies.id]
	}),
	user_approvedBy: one(users, {
		fields: [employmentHistory.approvedBy],
		references: [users.id],
		relationName: "employmentHistory_approvedBy_users_id"
	}),
	user_terminatedBy: one(users, {
		fields: [employmentHistory.terminatedBy],
		references: [users.id],
		relationName: "employmentHistory_terminatedBy_users_id"
	}),
	evaluations: many(evaluations),
}));

export const companiesRelations = relations(companies, ({many}) => ({
	employmentHistories: many(employmentHistory),
	companyReviews: many(companyReviews),
	paymentSettlements: many(paymentSettlements),
	jobs: many(jobs),
	companyUsers: many(companyUsers),
}));

export const evaluationsRelations = relations(evaluations, ({one}) => ({
	employmentHistory: one(employmentHistory, {
		fields: [evaluations.employmentId],
		references: [employmentHistory.id]
	}),
	user: one(users, {
		fields: [evaluations.evaluatorId],
		references: [users.id]
	}),
}));

export const companyReviewsRelations = relations(companyReviews, ({one}) => ({
	company: one(companies, {
		fields: [companyReviews.companyId],
		references: [companies.id]
	}),
	user: one(users, {
		fields: [companyReviews.userId],
		references: [users.id]
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
}));

export const paymentSettlementsRelations = relations(paymentSettlements, ({one}) => ({
	company: one(companies, {
		fields: [paymentSettlements.companyId],
		references: [companies.id]
	}),
	job: one(jobs, {
		fields: [paymentSettlements.jobId],
		references: [jobs.id]
	}),
}));

export const jobsRelations = relations(jobs, ({one, many}) => ({
	paymentSettlements: many(paymentSettlements),
	company: one(companies, {
		fields: [jobs.companyId],
		references: [companies.id]
	}),
	applications: many(applications),
	savedJobs: many(savedJobs),
	chatRooms: many(chatRooms),
}));

export const companyUsersRelations = relations(companyUsers, ({one}) => ({
	user: one(users, {
		fields: [companyUsers.userId],
		references: [users.id]
	}),
	company: one(companies, {
		fields: [companyUsers.companyId],
		references: [companies.id]
	}),
}));

export const applicationsRelations = relations(applications, ({one}) => ({
	job: one(jobs, {
		fields: [applications.jobId],
		references: [jobs.id]
	}),
	user: one(users, {
		fields: [applications.userId],
		references: [users.id]
	}),
}));

export const savedJobsRelations = relations(savedJobs, ({one}) => ({
	user: one(users, {
		fields: [savedJobs.userId],
		references: [users.id]
	}),
	job: one(jobs, {
		fields: [savedJobs.jobId],
		references: [jobs.id]
	}),
}));

export const adminActivityLogsRelations = relations(adminActivityLogs, ({one}) => ({
	user: one(users, {
		fields: [adminActivityLogs.adminId],
		references: [users.id]
	}),
}));