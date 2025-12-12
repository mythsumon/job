/**
 * Shared Mock Users Data
 * 
 * This is the single source of truth for user mock data.
 * All pages (user, company, admin) should import from here.
 */

import type { User } from "@/types/domain";

// Base user data - matches domain.User type
export const mockUsers: User[] = [
  {
    id: 1,
    email: "wizar.temuujin1@gmail.com",
    name: "John Doe",
    role: "candidate",
    headline: "Experienced software developer with 5 years of React and TypeScript experience. Passionate about building scalable web applications.",
    skills: ["React", "TypeScript", "Node.js", "Next.js", "GraphQL"],
    experienceYears: 5,
    location: "Ulaanbaatar",
    profilePicture: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    email: "comp@mail.com",
    name: "Jane Smith",
    role: "employer",
    location: "Ulaanbaatar",
    profilePicture: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    email: "admin@admin.admin",
    name: "Admin User",
    role: "admin",
    location: "Ulaanbaatar",
    profilePicture: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    email: "seojun.kim@email.com",
    name: "김서준",
    role: "candidate",
    headline: "시니어 프론트엔드 개발자. 대기업에서 핵심 서비스를 개발하고 있으며, 오픈소스 기여자입니다.",
    skills: ["React", "TypeScript", "Next.js", "GraphQL", "AWS"],
    experienceYears: 5,
    location: "서울시 판교",
    profilePicture: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

