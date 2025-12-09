// Mock Data for UI Flow Demo (No Backend Connection)

export const mockUsers = [
  {
    id: 1,
    email: "wizar.temuujin1@gmail.com",
    fullName: "John Doe",
    userType: "candidate",
    profilePicture: null,
    location: "Ulaanbaatar",
    bio: "Experienced software developer",
    skills: ["React", "TypeScript", "Node.js"],
    isActive: true,
  },
  {
    id: 2,
    email: "comp@mail.com",
    fullName: "Jane Smith",
    userType: "employer",
    profilePicture: null,
    location: "Ulaanbaatar",
    bio: "HR Manager",
    isActive: true,
  },
  {
    id: 3,
    email: "admin@admin.admin",
    fullName: "Admin User",
    userType: "admin",
    role: "admin",
    profilePicture: null,
    location: "Ulaanbaatar",
    bio: "Platform Administrator",
    isActive: true,
  },
];

export const mockCompanies = [
  {
    id: 1,
    name: "Tech Mongolia",
    logo: null,
    size: "medium",
    status: "approved",
    description: "Leading tech company in Mongolia",
    industry: "Technology",
    location: "Ulaanbaatar",
    website: "https://techmongolia.mn",
    employeeCount: 150,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Startup Hub",
    logo: null,
    size: "small",
    status: "approved",
    description: "Innovative startup accelerator",
    industry: "Technology",
    location: "Ulaanbaatar",
    website: "https://startuphub.mn",
    employeeCount: 30,
    createdAt: new Date().toISOString(),
  },
];

export const mockJobs = [
  {
    id: 1,
    companyId: 1,
    company: mockCompanies[0],
    title: "Senior Frontend Developer",
    description: "We are looking for an experienced frontend developer...",
    requirements: "5+ years of experience with React",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "senior",
    salaryMin: 2000000,
    salaryMax: 3000000,
    skills: ["React", "TypeScript", "CSS"],
    benefits: ["Health Insurance", "Remote Work"],
    isFeatured: true,
    isPro: false,
    isActive: true,
    isRemote: true,
    views: 150,
    status: "active",
    createdAt: new Date().toISOString(),
    postedAt: new Date().toISOString(),
    applicationsCount: 5,
  },
  {
    id: 2,
    companyId: 1,
    company: mockCompanies[0],
    title: "Backend Developer",
    description: "Join our backend team...",
    requirements: "3+ years of Node.js experience",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1500000,
    salaryMax: 2500000,
    skills: ["Node.js", "PostgreSQL", "Docker"],
    benefits: ["Health Insurance"],
    isFeatured: false,
    isPro: true,
    isActive: true,
    isRemote: false,
    views: 80,
    status: "active",
    createdAt: new Date().toISOString(),
    postedAt: new Date().toISOString(),
    applicationsCount: 3,
  },
  {
    id: 3,
    companyId: 2,
    company: mockCompanies[1],
    title: "Full Stack Developer",
    description: "We need a full stack developer...",
    requirements: "Experience with React and Node.js",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1800000,
    salaryMax: 2800000,
    skills: ["React", "Node.js", "MongoDB"],
    benefits: ["Flexible Hours", "Remote Work"],
    isFeatured: true,
    isPro: false,
    isActive: true,
    isRemote: true,
    views: 200,
    status: "active",
    createdAt: new Date().toISOString(),
    postedAt: new Date().toISOString(),
    applicationsCount: 8,
  },
];

export const mockApplications = [
  {
    id: 1,
    userId: 1,
    jobId: 1,
    resumeId: 1,
    status: "pending",
    coverLetter: "I am very interested in this position...",
    appliedAt: new Date().toISOString(),
    job: mockJobs[0],
  },
];

export const mockSavedJobs = [
  {
    id: 1,
    userId: 1,
    jobId: 1,
    savedAt: new Date().toISOString(),
    job: mockJobs[0],
  },
];

export const mockChatRooms = [
  {
    id: 1,
    employerId: 2,
    candidateId: 1,
    jobId: 1,
    status: "active",
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    employer: mockUsers[1],
    candidate: mockUsers[0],
    job: mockJobs[0],
  },
];

export const mockChatMessages = [
  {
    id: 1,
    roomId: 1,
    senderId: 2,
    message: "Hello! Thank you for your application.",
    messageType: "text",
    isRead: false,
    sentAt: new Date(Date.now() - 3600000).toISOString(),
    sender: mockUsers[1],
  },
  {
    id: 2,
    roomId: 1,
    senderId: 1,
    message: "Thank you! I'm very interested in this position.",
    messageType: "text",
    isRead: true,
    sentAt: new Date(Date.now() - 1800000).toISOString(),
    sender: mockUsers[0],
  },
];

export const mockStats = {
  totalJobs: mockJobs.length,
  totalCompanies: mockCompanies.length,
  featuredJobs: mockJobs.filter((j) => j.isFeatured).length,
  activeJobs: mockJobs.filter((j) => j.isActive).length,
};

export const mockResumes = [
  {
    id: 1,
    userId: 1,
    title: "John Doe's Resume",
    summary: "Experienced software developer",
    basicInfo: {
      fullName: "John Doe",
      email: "candidate@example.com",
      phone: "+976 12345678",
      address: "Ulaanbaatar, Mongolia",
    },
    skillsAndLanguages: {
      technicalSkills: [
        {
          category: "Frontend",
          skills: [
            { name: "React", level: "Advanced" },
            { name: "TypeScript", level: "Advanced" },
          ],
        },
      ],
      languages: [
        { name: "English", proficiency: "Fluent" },
        { name: "Mongolian", proficiency: "Native" },
      ],
    },
    workHistory: [],
    education: [],
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
];

// Initialize mock token in localStorage if not exists
if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
  localStorage.setItem('auth_token', 'mock-token-123');
  localStorage.setItem('user_data', JSON.stringify(mockUsers[0]));
}

// Mock data getters
export const getMockData = (url: string): any => {
  // Remove query params for matching
  const baseUrl = url.split("?")[0];

  // Auth endpoints
  if (baseUrl === "/api/auth/user") {
    // Return user from localStorage or default mock user
    try {
      const stored = localStorage.getItem('user_data');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored user:', e);
    }
    return mockUsers[0]; // Return candidate user
  }

  if (baseUrl === "/api/auth/login" || baseUrl === "/api/auth/register") {
    // Extract email from request body if available (for login/register)
    // In mock mode, return user based on email if provided
    let user = mockUsers[0]; // Default to candidate
    
    // Try to get email from URL params or use default
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    const email = urlParams.get("email");
    
    if (email) {
      const foundUser = mockUsers.find(u => u.email === email);
      if (foundUser) {
        user = foundUser;
      }
    }
    
    return {
      token: "mock-token-123",
      user: user,
      message: "Success",
    };
  }

  // Jobs endpoints
  if (baseUrl === "/api/jobs/featured") {
    return mockJobs.filter((j) => j.isFeatured);
  }

  if (baseUrl === "/api/jobs/pro") {
    return mockJobs.filter((j) => j.isPro);
  }

  if (baseUrl.startsWith("/api/jobs/") && baseUrl !== "/api/jobs") {
    const jobId = parseInt(baseUrl.split("/").pop() || "0");
    return mockJobs.find((j) => j.id === jobId) || null;
  }

  if (baseUrl === "/api/jobs") {
    return mockJobs;
  }

  // Companies endpoints
  if (baseUrl === "/api/companies") {
    return mockCompanies;
  }

  if (baseUrl.startsWith("/api/companies/") && baseUrl !== "/api/companies") {
    const companyId = parseInt(baseUrl.split("/").pop() || "0");
    return mockCompanies.find((c) => c.id === companyId) || null;
  }

  // Stats endpoint
  if (baseUrl === "/api/stats") {
    return mockStats;
  }

  // Applications endpoints
  if (baseUrl.startsWith("/api/applications/user/")) {
    return mockApplications;
  }

  if (baseUrl.startsWith("/api/applications/job/")) {
    return mockApplications;
  }

  // Chat endpoints
  if (baseUrl === "/api/chat/rooms" || baseUrl.startsWith("/api/chat/rooms/user/")) {
    return mockChatRooms;
  }

  if (baseUrl.startsWith("/api/chat/rooms/") && !baseUrl.includes("/messages")) {
    const roomId = parseInt(baseUrl.split("/").pop() || "0");
    return mockChatRooms.find((r) => r.id === roomId) || null;
  }

  if (baseUrl.startsWith("/api/chat/messages/")) {
    const roomId = parseInt(baseUrl.split("/").pop() || "0");
    return mockChatMessages.filter((m) => m.roomId === roomId);
  }

  if (baseUrl === "/api/chat/unread-count") {
    return mockChatMessages.filter((m) => !m.isRead).length;
  }

  // Resume endpoints
  if (baseUrl === "/api/resumes") {
    return mockResumes;
  }

  if (baseUrl === "/api/resumes/default") {
    return mockResumes.find((r) => r.isDefault) || mockResumes[0];
  }

  if (baseUrl.startsWith("/api/resumes/")) {
    const resumeId = parseInt(baseUrl.split("/").pop() || "0");
    return mockResumes.find((r) => r.id === resumeId) || null;
  }

  // User profile endpoints
  if (baseUrl === "/api/user/profile" || baseUrl === "/api/users/profile") {
    return mockUsers[0];
  }

  // Talents endpoint
  if (baseUrl === "/api/talents") {
    return mockUsers.filter((u) => u.userType === "candidate");
  }

  // Admin endpoints
  if (baseUrl === "/api/admin/stats") {
    return {
      totalUsers: mockUsers.length,
      totalCompanies: mockCompanies.length,
      activeJobs: mockJobs.filter((j) => j.isActive).length,
      monthlyRevenue: 12500000,
      userGrowth: 12.5,
      companyGrowth: 8.3,
      jobGrowth: 15.2,
      revenueGrowth: 23.7,
    };
  }

  if (baseUrl === "/api/admin/users") {
    return {
      data: mockUsers,
      total: mockUsers.length,
    };
  }

  if (baseUrl === "/api/admin/companies") {
    return {
      data: mockCompanies,
      total: mockCompanies.length,
    };
  }

  // Default: return empty array
  return [];
};

// Simulate network delay
export const mockDelay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

