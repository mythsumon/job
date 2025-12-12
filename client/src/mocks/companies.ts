/**
 * Shared Mock Companies Data
 * 
 * This is the single source of truth for company mock data.
 * All pages (user, company, admin) should import from here.
 */

import type { Company } from "@/types/domain";

// Base company data - matches domain.Company type
export const mockCompanies: Company[] = [
  {
    id: 1,
    name: "Tech Mongolia",
    industry: "Technology",
    size: "medium",
    location: "Ulaanbaatar",
    description: "Leading tech company in Mongolia",
    logoUrl: null,
    websiteUrl: "https://techmongolia.mn",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Startup Hub",
    industry: "Technology",
    size: "small",
    location: "Ulaanbaatar",
    description: "Innovative startup accelerator",
    logoUrl: null,
    websiteUrl: "https://startuphub.mn",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Mongolian Bank",
    industry: "Finance",
    size: "large",
    location: "Ulaanbaatar",
    description: "Premier financial services provider in Mongolia",
    logoUrl: null,
    websiteUrl: "https://mongolianbank.mn",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

