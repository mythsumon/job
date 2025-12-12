/**
 * Domain Types - Single Source of Truth
 * 
 * These types define the core entities used across User, Company, and Admin interfaces.
 * All UI components should import and use these types instead of defining ad-hoc shapes.
 * 
 * Based on shared/schema.ts but simplified for UI consistency.
 */

// ============================================================================
// User Domain Type
// ============================================================================
export interface User {
  id: number;
  email: string;
  name: string; // fullName in DB schema
  role: "candidate" | "employer" | "admin"; // userType in DB schema
  
  // Candidate-specific profile fields (for candidate userType)
  headline?: string; // bio field
  skills?: string[];
  experienceYears?: number; // derived from experience field
  
  // Common fields
  location?: string;
  phone?: string;
  profilePicture?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Company Domain Type
// ============================================================================
export interface Company {
  id: number;
  name: string;
  industry?: string;
  size?: string; // "startup" | "small" | "medium" | "large"
  location?: string;
  description?: string;
  logoUrl?: string; // logo field in DB
  websiteUrl?: string; // website field in DB
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Job Domain Type
// ============================================================================
export interface Job {
  id: number;
  title: string;
  companyId: number;
  companyName?: string; // populated from company relation
  location?: string;
  employmentType?: string; // "full_time" | "contract" | "freelance" | "internship"
  experienceLevel?: string; // "entry" | "junior" | "mid" | "senior" | "expert"
  salary?: string; // formatted from salaryMin/salaryMax (e.g., "2000-3000만원")
  requiredSkills?: string[]; // skills field in DB
  deadline?: string; // expiresAt field in DB
  description: string;
  status?: string; // "pending" | "public" | "closed" | "rejected"
  isPremium?: boolean; // isPro field in DB
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Application Domain Type
// ============================================================================
export interface Application {
  id: number;
  jobId: number;
  candidateId: number; // userId in DB schema
  status: "pending" | "reviewed" | "interview" | "accepted" | "rejected";
  appliedAt: string;
  updatedAt?: string;
}

// ============================================================================
// Resume Domain Type
// ============================================================================
export interface Resume {
  id: number;
  candidateId: number; // userId in DB schema
  title: string;
  summary?: string;
  skills?: string[]; // from skillsAndLanguages.technicalSkills
  experience?: any; // workHistory field in DB
  education?: any; // education field in DB
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Skill Domain Type
// ============================================================================
export interface Skill {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// JobOption Domain Type
// ============================================================================
export interface JobOption {
  id: number;
  name: string;
  nameKo?: string;
  nameEn?: string;
  nameMn?: string;
  order: number;
  isActive: boolean;
  type?: "department" | "employmentType" | "experienceLevel" | "preferredIndustry";
}

// ============================================================================
// Banner Domain Type
// ============================================================================
export interface Banner {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  position: string; // "home_top" | "jobs_header" | "sidebar"
  priority: number;
  backgroundColor?: string;
  textColor?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  clickCount: number;
  viewCount: number;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// ChatRoom Domain Type
// ============================================================================
export interface ChatRoom {
  id: number;
  employerId: number;
  candidateId: number;
  jobId?: number;
  status: "active" | "closed" | "pending_reopen";
  lastMessageAt?: string;
  createdAt?: string;
}

// ============================================================================
// Message Domain Type
// ============================================================================
export interface Message {
  id: number;
  roomId: number;
  senderId: number;
  content: string; // message field in DB
  messageType?: string; // "text" | "file" | "image"
  isRead: boolean;
  createdAt: string; // sentAt field in DB
}

