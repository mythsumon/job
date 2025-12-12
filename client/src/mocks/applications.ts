/**
 * Shared Mock Applications Data
 * 
 * This is the single source of truth for application mock data.
 * All pages (user, company, admin) should import from here.
 */

import type { Application } from "@/types/domain";

// Base application data - matches domain.Application type
export const mockApplications: Application[] = [
  {
    id: 1,
    jobId: 1,
    candidateId: 1,
    status: "pending",
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    jobId: 2,
    candidateId: 1,
    status: "reviewed",
    appliedAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    jobId: 3,
    candidateId: 4,
    status: "interview",
    appliedAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

