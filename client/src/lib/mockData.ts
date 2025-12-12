// Mock Data for UI Flow Demo (No Backend Connection)

export const mockUsers = [
  {
    id: 1,
    email: "wizar.temuujin1@gmail.com",
    fullName: "John Doe",
    userType: "candidate",
    profilePicture: null,
    location: "Ulaanbaatar",
    bio: "Experienced software developer with 5 years of React and TypeScript experience. Passionate about building scalable web applications.",
    skills: ["React", "TypeScript", "Node.js", "Next.js", "GraphQL"],
    experience: "5년",
    education: "KAIST 컴퓨터공학과",
    major: "Computer Science",
    preferredIndustry: ["Technology", "Software"],
    dreamCompany: "네이버",
    careerLevel: "senior",
    salaryExpectation: "6000-8000만원",
    workAvailability: "immediate",
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
  {
    id: 4,
    email: "seojun.kim@email.com",
    fullName: "김서준",
    userType: "candidate",
    profilePicture: null,
    location: "서울시 판교",
    bio: "시니어 프론트엔드 개발자. 대기업에서 핵심 서비스를 개발하고 있으며, 오픈소스 기여자입니다.",
    skills: ["React", "TypeScript", "Next.js", "GraphQL", "AWS"],
    experience: "5년",
    education: "KAIST 컴퓨터공학과",
    major: "Computer Science",
    preferredIndustry: ["Technology"],
    dreamCompany: "네이버",
    careerLevel: "senior",
    salaryExpectation: "6000-8000만원",
    workAvailability: "immediate",
    isActive: true,
  },
  {
    id: 5,
    email: "jihye.park@email.com",
    fullName: "박지혜",
    userType: "candidate",
    profilePicture: null,
    location: "서울시 강남구",
    bio: "프론트엔드 개발자. 카카오톡 UI 개발 경험이 있으며, 사용자 경험 개선과 디자인 시스템 구축에 전문가입니다.",
    skills: ["Vue.js", "React", "JavaScript", "Webpack", "Docker"],
    experience: "3년",
    education: "서울대학교 컴퓨터공학과",
    major: "Computer Science",
    preferredIndustry: ["Technology", "Startup"],
    dreamCompany: "카카오",
    careerLevel: "mid",
    salaryExpectation: "4500-6000만원",
    workAvailability: "2weeks",
    isActive: true,
  },
  {
    id: 6,
    email: "donghyun.lee@email.com",
    fullName: "이동현",
    userType: "candidate",
    profilePicture: null,
    location: "서울시 서초구",
    bio: "주니어 프론트엔드 개발자. 성장 의욕이 강하고 팀워크를 중시합니다. 반응형 웹 개발에 특화되어 있습니다.",
    skills: ["React", "JavaScript", "CSS", "Git", "Figma"],
    experience: "2년",
    education: "연세대학교 컴퓨터과학과",
    major: "Computer Science",
    preferredIndustry: ["Technology"],
    dreamCompany: "라인",
    careerLevel: "junior",
    salaryExpectation: "3500-4500만원",
    workAvailability: "1month",
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
  {
    id: 3,
    name: "Mongolian Bank",
    logo: null,
    size: "large",
    status: "approved",
    description: "Premier financial services provider in Mongolia",
    industry: "Finance",
    location: "Ulaanbaatar",
    website: "https://mongolianbank.mn",
    employeeCount: 500,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 4,
    name: "Green Energy Solutions",
    logo: null,
    size: "medium",
    status: "approved",
    description: "Renewable energy solutions and consulting",
    industry: "Energy",
    location: "Ulaanbaatar",
    website: "https://greenenergy.mn",
    employeeCount: 120,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 5,
    name: "EduTech Mongolia",
    logo: null,
    size: "small",
    status: "approved",
    description: "Educational technology platform for Mongolian students",
    industry: "Education",
    location: "Ulaanbaatar",
    website: "https://edutech.mn",
    employeeCount: 45,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 6,
    name: "Mongolian E-Commerce",
    logo: null,
    size: "large",
    status: "approved",
    description: "Leading e-commerce platform in Mongolia",
    industry: "Retail",
    location: "Ulaanbaatar",
    website: "https://mongolianec.mn",
    employeeCount: 300,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 7,
    name: "HealthCare Plus",
    logo: null,
    size: "medium",
    status: "approved",
    description: "Healthcare services and medical technology",
    industry: "Healthcare",
    location: "Ulaanbaatar",
    website: "https://healthcareplus.mn",
    employeeCount: 200,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 8,
    name: "Construction Pro",
    logo: null,
    size: "medium",
    status: "approved",
    description: "Construction and infrastructure development",
    industry: "Construction",
    location: "Ulaanbaatar",
    website: "https://constructionpro.mn",
    employeeCount: 180,
    createdAt: new Date(Date.now() - 518400000).toISOString(),
  },
  {
    id: 9,
    name: "Media Mongolia",
    logo: null,
    size: "small",
    status: "approved",
    description: "Digital media and content creation",
    industry: "Media",
    location: "Ulaanbaatar",
    website: "https://mediamongolia.mn",
    employeeCount: 60,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 10,
    name: "Logistics Express",
    logo: null,
    size: "medium",
    status: "approved",
    description: "Logistics and transportation services",
    industry: "Logistics",
    location: "Ulaanbaatar",
    website: "https://logisticsexpress.mn",
    employeeCount: 150,
    createdAt: new Date(Date.now() - 691200000).toISOString(),
  },
  {
    id: 11,
    name: "Food & Beverage Co.",
    logo: null,
    size: "large",
    status: "approved",
    description: "Food and beverage manufacturing and distribution",
    industry: "Food & Beverage",
    location: "Ulaanbaatar",
    website: "https://foodbev.mn",
    employeeCount: 400,
    createdAt: new Date(Date.now() - 777600000).toISOString(),
  },
  {
    id: 12,
    name: "Real Estate Mongolia",
    logo: null,
    size: "medium",
    status: "approved",
    description: "Real estate development and property management",
    industry: "Real Estate",
    location: "Ulaanbaatar",
    website: "https://realestatemongolia.mn",
    employeeCount: 100,
    createdAt: new Date(Date.now() - 864000000).toISOString(),
  },
  {
    id: 13,
    name: "Tourism Mongolia",
    logo: null,
    size: "small",
    status: "approved",
    description: "Tourism and travel services",
    industry: "Tourism",
    location: "Ulaanbaatar",
    website: "https://tourismmongolia.mn",
    employeeCount: 35,
    createdAt: new Date(Date.now() - 950400000).toISOString(),
  },
  {
    id: 14,
    name: "Agriculture Tech",
    logo: null,
    size: "small",
    status: "approved",
    description: "Agricultural technology and solutions",
    industry: "Agriculture",
    location: "Darkhan",
    website: "https://agritech.mn",
    employeeCount: 50,
    createdAt: new Date(Date.now() - 1036800000).toISOString(),
  },
  {
    id: 15,
    name: "Mining Solutions",
    logo: null,
    size: "large",
    status: "approved",
    description: "Mining technology and consulting services",
    industry: "Mining",
    location: "Erdenet",
    website: "https://miningsolutions.mn",
    employeeCount: 600,
    createdAt: new Date(Date.now() - 1123200000).toISOString(),
  },
];

export const mockJobs = [
  {
    id: 1,
    companyId: 1,
    company: mockCompanies[0],
    title: "Senior Frontend Developer",
    description: "We are looking for an experienced frontend developer to join our team. You will be responsible for building modern, responsive web applications using React and TypeScript.",
    requirements: "5+ years of experience with React, TypeScript, and modern frontend frameworks",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "senior",
    salaryMin: 2000000,
    salaryMax: 3000000,
    skills: ["React", "TypeScript", "CSS", "Next.js", "GraphQL"],
    benefits: ["Health Insurance", "Remote Work", "Flexible Hours"],
    isFeatured: true,
    isPro: false,
    isActive: true,
    isRemote: true,
    views: 150,
    status: "public",
    createdAt: new Date().toISOString(),
    postedAt: new Date().toISOString(),
    applicationsCount: 5,
    department: "개발팀",
    industry: "Technology",
  },
  {
    id: 2,
    companyId: 1,
    company: mockCompanies[0],
    title: "Backend Developer",
    description: "Join our backend team and help build scalable APIs and microservices. Experience with cloud infrastructure is a plus.",
    requirements: "3+ years of Node.js experience, knowledge of databases and RESTful APIs",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1500000,
    salaryMax: 2500000,
    skills: ["Node.js", "PostgreSQL", "Docker", "AWS", "REST API"],
    benefits: ["Health Insurance", "Stock Options"],
    isFeatured: false,
    isPro: true,
    isActive: true,
    isRemote: false,
    views: 80,
    status: "public",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    postedAt: new Date(Date.now() - 86400000).toISOString(),
    applicationsCount: 3,
    department: "개발팀",
    industry: "Technology",
  },
  {
    id: 3,
    companyId: 2,
    company: mockCompanies[1],
    title: "Full Stack Developer",
    description: "We need a full stack developer who can work on both frontend and backend. You'll be working on exciting projects with a talented team.",
    requirements: "Experience with React and Node.js, knowledge of databases",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1800000,
    salaryMax: 2800000,
    skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript"],
    benefits: ["Flexible Hours", "Remote Work", "Learning Budget"],
    isFeatured: true,
    isPro: false,
    isActive: true,
    isRemote: true,
    views: 200,
    status: "public",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    postedAt: new Date(Date.now() - 172800000).toISOString(),
    applicationsCount: 8,
    department: "개발팀",
    industry: "Technology",
  },
  {
    id: 4,
    companyId: 1,
    company: mockCompanies[0],
    title: "UI/UX Designer",
    description: "We're looking for a creative UI/UX designer to join our design team. You'll be creating beautiful and intuitive user interfaces.",
    requirements: "3+ years of UI/UX design experience, proficiency in Figma or Adobe XD",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1200000,
    salaryMax: 2000000,
    skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
    benefits: ["Health Insurance", "Design Tools Budget"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 95,
    status: "public",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    postedAt: new Date(Date.now() - 259200000).toISOString(),
    applicationsCount: 12,
    department: "디자인팀",
    industry: "Design",
  },
  {
    id: 5,
    companyId: 2,
    company: mockCompanies[1],
    title: "데이터 분석가",
    description: "데이터를 분석하여 비즈니스 인사이트를 제공하는 데이터 분석가를 모집합니다. Python과 SQL 경험이 필수입니다.",
    requirements: "2+ years of data analysis experience, Python, SQL, statistical analysis",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1400000,
    salaryMax: 2200000,
    skills: ["Python", "SQL", "Excel", "Tableau", "Statistics"],
    benefits: ["Health Insurance", "Remote Work"],
    isFeatured: false,
    isPro: true,
    isActive: true,
    isRemote: true,
    views: 110,
    status: "public",
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    postedAt: new Date(Date.now() - 345600000).toISOString(),
    applicationsCount: 6,
    department: "데이터팀",
    industry: "Data",
  },
  {
    id: 6,
    companyId: 1,
    company: mockCompanies[0],
    title: "마케팅 매니저",
    description: "디지털 마케팅 전략을 수립하고 실행할 마케팅 매니저를 찾습니다. 소셜 미디어 및 콘텐츠 마케팅 경험이 필요합니다.",
    requirements: "5+ years of marketing experience, digital marketing, content strategy",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "senior",
    salaryMin: 1600000,
    salaryMax: 2400000,
    skills: ["Digital Marketing", "SEO", "Social Media", "Content Strategy", "Analytics"],
    benefits: ["Health Insurance", "Marketing Budget"],
    isFeatured: true,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 175,
    status: "public",
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    postedAt: new Date(Date.now() - 432000000).toISOString(),
    applicationsCount: 15,
    department: "마케팅팀",
    industry: "Marketing",
  },
  {
    id: 7,
    companyId: 2,
    company: mockCompanies[1],
    title: "주니어 프론트엔드 개발자",
    description: "신입 또는 주니어 프론트엔드 개발자를 모집합니다. React 기초 지식이 있으시면 지원 가능합니다.",
    requirements: "React 기초 지식, HTML/CSS/JavaScript 경험",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "junior",
    salaryMin: 800000,
    salaryMax: 1200000,
    skills: ["React", "JavaScript", "HTML", "CSS", "Git"],
    benefits: ["Health Insurance", "Mentorship Program"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 250,
    status: "public",
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    postedAt: new Date(Date.now() - 518400000).toISOString(),
    applicationsCount: 25,
    department: "개발팀",
    industry: "Technology",
  },
  {
    id: 8,
    companyId: 1,
    company: mockCompanies[0],
    title: "DevOps 엔지니어",
    description: "인프라 구축 및 CI/CD 파이프라인을 관리할 DevOps 엔지니어를 모집합니다. Kubernetes 경험이 우대됩니다.",
    requirements: "3+ years of DevOps experience, Docker, Kubernetes, AWS/GCP",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1700000,
    salaryMax: 2600000,
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform"],
    benefits: ["Health Insurance", "Remote Work", "Certification Support"],
    isFeatured: false,
    isPro: true,
    isActive: true,
    isRemote: true,
    views: 88,
    status: "public",
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    postedAt: new Date(Date.now() - 604800000).toISOString(),
    applicationsCount: 7,
    department: "인프라팀",
    industry: "Technology",
  },
  {
    id: 9,
    companyId: 2,
    company: mockCompanies[1],
    title: "영업 대표",
    description: "B2B 영업을 담당할 영업 대표를 모집합니다. IT 제품/서비스 영업 경험이 있으시면 우대합니다.",
    requirements: "3+ years of sales experience, B2B sales, communication skills",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1000000,
    salaryMax: 2000000,
    skills: ["Sales", "Negotiation", "CRM", "Communication", "B2B"],
    benefits: ["Commission", "Health Insurance", "Car Allowance"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 142,
    status: "public",
    createdAt: new Date(Date.now() - 691200000).toISOString(),
    postedAt: new Date(Date.now() - 691200000).toISOString(),
    applicationsCount: 18,
    department: "영업팀",
    industry: "Sales",
  },
  {
    id: 10,
    companyId: 1,
    company: mockCompanies[0],
    title: "프로젝트 매니저",
    description: "소프트웨어 개발 프로젝트를 관리할 프로젝트 매니저를 모집합니다. Agile/Scrum 경험이 필수입니다.",
    requirements: "5+ years of project management experience, Agile/Scrum, PMP certification preferred",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "senior",
    salaryMin: 1900000,
    salaryMax: 2800000,
    skills: ["Project Management", "Agile", "Scrum", "Jira", "Leadership"],
    benefits: ["Health Insurance", "PMP Certification Support"],
    isFeatured: true,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 165,
    status: "public",
    createdAt: new Date(Date.now() - 777600000).toISOString(),
    postedAt: new Date(Date.now() - 777600000).toISOString(),
    applicationsCount: 10,
    department: "PM팀",
    industry: "Management",
  },
  {
    id: 11,
    companyId: 2,
    company: mockCompanies[1],
    title: "모바일 앱 개발자 (React Native)",
    description: "React Native를 사용하여 모바일 앱을 개발할 개발자를 모집합니다. iOS/Android 앱 개발 경험이 필요합니다.",
    requirements: "2+ years of React Native experience, iOS/Android development",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1500000,
    salaryMax: 2300000,
    skills: ["React Native", "iOS", "Android", "JavaScript", "Mobile Development"],
    benefits: ["Health Insurance", "Remote Work", "Device Budget"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: true,
    views: 98,
    status: "public",
    createdAt: new Date(Date.now() - 864000000).toISOString(),
    postedAt: new Date(Date.now() - 864000000).toISOString(),
    applicationsCount: 9,
    department: "모바일팀",
    industry: "Technology",
  },
  {
    id: 12,
    companyId: 1,
    company: mockCompanies[0],
    title: "QA 엔지니어",
    description: "소프트웨어 품질 보증을 담당할 QA 엔지니어를 모집합니다. 자동화 테스트 경험이 우대됩니다.",
    requirements: "2+ years of QA experience, test automation, Selenium/Cypress",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1100000,
    salaryMax: 1800000,
    skills: ["QA", "Test Automation", "Selenium", "Cypress", "Manual Testing"],
    benefits: ["Health Insurance"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 72,
    status: "public",
    createdAt: new Date(Date.now() - 950400000).toISOString(),
    postedAt: new Date(Date.now() - 950400000).toISOString(),
    applicationsCount: 4,
    department: "QA팀",
    industry: "Technology",
  },
  {
    id: 13,
    companyId: 2,
    company: mockCompanies[1],
    title: "신규 채용공고 (검수중)",
    description: "새로 등록된 채용공고로 관리자 승인 대기 중입니다.",
    requirements: "경력 3년 이상",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1300000,
    salaryMax: 2100000,
    skills: ["React", "TypeScript"],
    benefits: ["Health Insurance"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 0,
    status: "pending",
    createdAt: new Date().toISOString(),
    postedAt: new Date().toISOString(),
    applicationsCount: 0,
    department: "개발팀",
    industry: "Technology",
  },
  {
    id: 14,
    companyId: 1,
    company: mockCompanies[0],
    title: "마감된 채용공고",
    description: "이미 마감된 채용공고입니다.",
    requirements: "경력 5년 이상",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "senior",
    salaryMin: 2000000,
    salaryMax: 3000000,
    skills: ["Java", "Spring"],
    benefits: ["Health Insurance"],
    isFeatured: false,
    isPro: false,
    isActive: false,
    isRemote: false,
    views: 500,
    status: "closed",
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
    postedAt: new Date(Date.now() - 2592000000).toISOString(),
    expiresAt: new Date(Date.now() - 86400000).toISOString(),
    applicationsCount: 50,
    department: "개발팀",
    industry: "Technology",
  },
  {
    id: 15,
    companyId: 2,
    company: mockCompanies[1],
    title: "거부된 채용공고",
    description: "관리자에 의해 거부된 채용공고입니다.",
    requirements: "경력 2년 이상",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "junior",
    salaryMin: 1000000,
    salaryMax: 1500000,
    skills: ["JavaScript", "HTML", "CSS"],
    benefits: ["Health Insurance"],
    isFeatured: false,
    isPro: false,
    isActive: false,
    isRemote: false,
    views: 0,
    status: "rejected",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    postedAt: null,
    applicationsCount: 0,
    department: "개발팀",
    industry: "Technology",
    rejectionReason: "부적절한 내용",
  },
  {
    id: 16,
    companyId: 1,
    company: mockCompanies[0],
    title: "비공개 채용공고",
    description: "비공개 처리된 채용공고입니다.",
    requirements: "경력 2년 이상",
    location: "Ulaanbaatar",
    employmentType: "contract",
    experienceLevel: "mid",
    salaryMin: 1000000,
    salaryMax: 1500000,
    skills: ["Python", "Django"],
    benefits: ["Health Insurance"],
    isFeatured: false,
    isPro: false,
    isActive: false,
    isRemote: false,
    views: 20,
    status: "private",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    postedAt: new Date(Date.now() - 172800000).toISOString(),
    applicationsCount: 2,
    department: "개발팀",
    industry: "Technology",
  },
  {
    id: 16,
    companyId: 1,
    company: mockCompanies[0],
    title: "신고된 채용공고",
    description: "사용자 신고가 접수된 채용공고입니다.",
    requirements: "경력 4년 이상",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "senior",
    salaryMin: 1800000,
    salaryMax: 2600000,
    skills: ["Vue.js", "Nuxt.js"],
    benefits: ["Health Insurance"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: true,
    views: 120,
    status: "public",
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    postedAt: new Date(Date.now() - 345600000).toISOString(),
    applicationsCount: 8,
    reportedCount: 3,
    reportedReasons: ["부적절한 내용", "스팸", "사기 의심"],
    department: "개발팀",
    industry: "Technology",
  },
  {
    id: 17,
    companyId: 3,
    company: mockCompanies[2],
    title: "금융 분석가",
    description: "금융 데이터 분석 및 투자 전략 수립을 담당할 금융 분석가를 모집합니다.",
    requirements: "경력 3년 이상, 금융/경제 전공, CFA 자격증 우대",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1800000,
    salaryMax: 2700000,
    skills: ["Financial Analysis", "Excel", "Bloomberg", "Risk Management", "CFA"],
    benefits: ["Health Insurance", "Performance Bonus", "CFA Support"],
    isFeatured: true,
    isPro: true,
    isActive: true,
    isRemote: false,
    views: 195,
    status: "public",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    postedAt: new Date(Date.now() - 259200000).toISOString(),
    applicationsCount: 22,
    department: "금융팀",
    industry: "Finance",
  },
  {
    id: 18,
    companyId: 3,
    company: mockCompanies[2],
    title: "은행원 (고객 서비스)",
    description: "고객 상담 및 금융 상품 안내를 담당할 은행원을 모집합니다.",
    requirements: "고등학교 졸업 이상, 고객 서비스 경험 우대",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "junior",
    salaryMin: 900000,
    salaryMax: 1400000,
    skills: ["Customer Service", "Communication", "Banking Products", "MS Office"],
    benefits: ["Health Insurance", "Training Program"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 320,
    status: "public",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    postedAt: new Date(Date.now() - 172800000).toISOString(),
    applicationsCount: 45,
    department: "고객서비스팀",
    industry: "Finance",
  },
  {
    id: 19,
    companyId: 4,
    company: mockCompanies[3],
    title: "재생 에너지 엔지니어",
    description: "태양광 및 풍력 에너지 프로젝트를 설계하고 관리할 엔지니어를 모집합니다.",
    requirements: "경력 4년 이상, 전기/기계 공학 전공, 재생 에너지 프로젝트 경험",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "senior",
    salaryMin: 2000000,
    salaryMax: 3000000,
    skills: ["Renewable Energy", "Solar Power", "Wind Energy", "Project Management", "AutoCAD"],
    benefits: ["Health Insurance", "Remote Work", "Field Allowance"],
    isFeatured: true,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 145,
    status: "public",
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    postedAt: new Date(Date.now() - 345600000).toISOString(),
    applicationsCount: 12,
    department: "엔지니어링팀",
    industry: "Energy",
  },
  {
    id: 20,
    companyId: 5,
    company: mockCompanies[4],
    title: "교육 콘텐츠 개발자",
    description: "온라인 교육 플랫폼을 위한 교육 콘텐츠를 개발하고 제작할 인력을 모집합니다.",
    requirements: "경력 2년 이상, 교육/콘텐츠 제작 경험, 몽골어 능통",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1300000,
    salaryMax: 2000000,
    skills: ["Content Creation", "Video Editing", "Educational Design", "Mongolian Language", "LMS"],
    benefits: ["Health Insurance", "Remote Work", "Learning Budget"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: true,
    views: 98,
    status: "public",
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    postedAt: new Date(Date.now() - 432000000).toISOString(),
    applicationsCount: 15,
    department: "콘텐츠팀",
    industry: "Education",
  },
  {
    id: 21,
    companyId: 6,
    company: mockCompanies[5],
    title: "이커머스 운영 매니저",
    description: "온라인 쇼핑몰 운영 및 상품 관리를 담당할 매니저를 모집합니다.",
    requirements: "경력 3년 이상, 이커머스 운영 경험, 데이터 분석 능력",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1500000,
    salaryMax: 2300000,
    skills: ["E-commerce", "Product Management", "Data Analysis", "SEO", "Marketing"],
    benefits: ["Health Insurance", "Performance Bonus", "Employee Discount"],
    isFeatured: true,
    isPro: true,
    isActive: true,
    isRemote: false,
    views: 210,
    status: "public",
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    postedAt: new Date(Date.now() - 518400000).toISOString(),
    applicationsCount: 28,
    department: "운영팀",
    industry: "Retail",
  },
  {
    id: 22,
    companyId: 6,
    company: mockCompanies[5],
    title: "물류 관리자",
    description: "배송 및 창고 관리를 담당할 물류 관리자를 모집합니다.",
    requirements: "경력 2년 이상, 물류/유통 경험",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1200000,
    salaryMax: 1800000,
    skills: ["Logistics", "Warehouse Management", "Inventory Control", "ERP", "Supply Chain"],
    benefits: ["Health Insurance"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 165,
    status: "public",
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    postedAt: new Date(Date.now() - 604800000).toISOString(),
    applicationsCount: 19,
    department: "물류팀",
    industry: "Retail",
  },
  {
    id: 23,
    companyId: 7,
    company: mockCompanies[6],
    title: "의료진 (간호사)",
    description: "병원에서 환자 케어를 담당할 간호사를 모집합니다.",
    requirements: "간호사 면허, 경력 1년 이상",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1100000,
    salaryMax: 1700000,
    skills: ["Nursing", "Patient Care", "Medical Knowledge", "Communication"],
    benefits: ["Health Insurance", "Shift Allowance", "Training"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 280,
    status: "public",
    createdAt: new Date(Date.now() - 691200000).toISOString(),
    postedAt: new Date(Date.now() - 691200000).toISOString(),
    applicationsCount: 35,
    department: "간호팀",
    industry: "Healthcare",
  },
  {
    id: 24,
    companyId: 7,
    company: mockCompanies[6],
    title: "의료 IT 전문가",
    description: "의료 정보 시스템을 관리하고 개발할 IT 전문가를 모집합니다.",
    requirements: "경력 3년 이상, 의료 IT 경험 우대",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1700000,
    salaryMax: 2500000,
    skills: ["Healthcare IT", "HL7", "EMR Systems", "Database Management", "System Integration"],
    benefits: ["Health Insurance", "Remote Work"],
    isFeatured: false,
    isPro: true,
    isActive: true,
    isRemote: true,
    views: 112,
    status: "public",
    createdAt: new Date(Date.now() - 777600000).toISOString(),
    postedAt: new Date(Date.now() - 777600000).toISOString(),
    applicationsCount: 8,
    department: "IT팀",
    industry: "Healthcare",
  },
  {
    id: 25,
    companyId: 8,
    company: mockCompanies[7],
    title: "건축 설계사",
    description: "건축 설계 및 도면 작성을 담당할 설계사를 모집합니다.",
    requirements: "경력 4년 이상, 건축학 전공, AutoCAD 능숙",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "senior",
    salaryMin: 1900000,
    salaryMax: 2800000,
    skills: ["Architecture", "AutoCAD", "Revit", "Building Design", "Project Management"],
    benefits: ["Health Insurance", "Field Allowance"],
    isFeatured: true,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 178,
    status: "public",
    createdAt: new Date(Date.now() - 864000000).toISOString(),
    postedAt: new Date(Date.now() - 864000000).toISOString(),
    applicationsCount: 14,
    department: "설계팀",
    industry: "Construction",
  },
  {
    id: 26,
    companyId: 9,
    company: mockCompanies[8],
    title: "비디오 편집자",
    description: "영상 콘텐츠 제작 및 편집을 담당할 편집자를 모집합니다.",
    requirements: "경력 2년 이상, Premiere Pro/Final Cut Pro 능숙",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1000000,
    salaryMax: 1600000,
    skills: ["Video Editing", "Premiere Pro", "After Effects", "Color Grading", "Motion Graphics"],
    benefits: ["Health Insurance", "Creative Tools Budget"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 155,
    status: "public",
    createdAt: new Date(Date.now() - 950400000).toISOString(),
    postedAt: new Date(Date.now() - 950400000).toISOString(),
    applicationsCount: 21,
    department: "제작팀",
    industry: "Media",
  },
  {
    id: 27,
    companyId: 10,
    company: mockCompanies[9],
    title: "물류 운영 매니저",
    description: "물류 센터 운영 및 배송 관리를 담당할 매니저를 모집합니다.",
    requirements: "경력 5년 이상, 물류/운송 관리 경험",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "senior",
    salaryMin: 1800000,
    salaryMax: 2600000,
    skills: ["Logistics Management", "Supply Chain", "Fleet Management", "ERP", "Operations"],
    benefits: ["Health Insurance", "Performance Bonus"],
    isFeatured: true,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 132,
    status: "public",
    createdAt: new Date(Date.now() - 1036800000).toISOString(),
    postedAt: new Date(Date.now() - 1036800000).toISOString(),
    applicationsCount: 11,
    department: "운영팀",
    industry: "Logistics",
  },
  {
    id: 28,
    companyId: 11,
    company: mockCompanies[10],
    title: "품질 관리 엔지니어",
    description: "식품 품질 관리 및 검사를 담당할 엔지니어를 모집합니다.",
    requirements: "경력 3년 이상, 식품 공학/화학 전공, 품질 관리 경험",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1400000,
    salaryMax: 2100000,
    skills: ["Quality Control", "Food Safety", "Laboratory Testing", "HACCP", "ISO Standards"],
    benefits: ["Health Insurance", "Training"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 108,
    status: "public",
    createdAt: new Date(Date.now() - 1123200000).toISOString(),
    postedAt: new Date(Date.now() - 1123200000).toISOString(),
    applicationsCount: 9,
    department: "품질관리팀",
    industry: "Food & Beverage",
  },
  {
    id: 29,
    companyId: 12,
    company: mockCompanies[11],
    title: "부동산 중개사",
    description: "부동산 매매 및 임대 중개를 담당할 중개사를 모집합니다.",
    requirements: "부동산 중개사 자격증, 경력 2년 이상",
    location: "Ulaanbaatar",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 800000,
    salaryMax: 2000000,
    skills: ["Real Estate", "Sales", "Negotiation", "Property Valuation", "Customer Service"],
    benefits: ["Commission", "Health Insurance"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 245,
    status: "public",
    createdAt: new Date(Date.now() - 1209600000).toISOString(),
    postedAt: new Date(Date.now() - 1209600000).toISOString(),
    applicationsCount: 32,
    department: "중개팀",
    industry: "Real Estate",
  },
  {
    id: 30,
    companyId: 13,
    company: mockCompanies[12],
    title: "여행 가이드",
    description: "관광객 안내 및 여행 프로그램 운영을 담당할 가이드를 모집합니다.",
    requirements: "외국어 능통 (영어/중국어/러시아어), 여행 가이드 경험",
    location: "Ulaanbaatar",
    employmentType: "contract",
    experienceLevel: "mid",
    salaryMin: 600000,
    salaryMax: 1200000,
    skills: ["Tourism", "Languages", "Customer Service", "Cultural Knowledge", "Driving License"],
    benefits: ["Tips", "Travel Allowance"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 198,
    status: "public",
    createdAt: new Date(Date.now() - 1296000000).toISOString(),
    postedAt: new Date(Date.now() - 1296000000).toISOString(),
    applicationsCount: 26,
    department: "가이드팀",
    industry: "Tourism",
  },
  {
    id: 31,
    companyId: 14,
    company: mockCompanies[13],
    title: "농업 기술자",
    description: "농업 기술 개발 및 현장 지원을 담당할 기술자를 모집합니다.",
    requirements: "경력 2년 이상, 농업/생명공학 전공",
    location: "Darkhan",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 1200000,
    salaryMax: 1800000,
    skills: ["Agriculture", "Crop Management", "Soil Science", "Field Research", "Technology"],
    benefits: ["Health Insurance", "Field Allowance"],
    isFeatured: false,
    isPro: false,
    isActive: true,
    isRemote: false,
    views: 87,
    status: "public",
    createdAt: new Date(Date.now() - 1382400000).toISOString(),
    postedAt: new Date(Date.now() - 1382400000).toISOString(),
    applicationsCount: 7,
    department: "기술팀",
    industry: "Agriculture",
  },
  {
    id: 32,
    companyId: 15,
    company: mockCompanies[14],
    title: "채굴 엔지니어",
    description: "광산 개발 및 채굴 작업을 관리할 엔지니어를 모집합니다.",
    requirements: "경력 5년 이상, 채굴/지질 공학 전공",
    location: "Erdenet",
    employmentType: "full_time",
    experienceLevel: "senior",
    salaryMin: 2200000,
    salaryMax: 3200000,
    skills: ["Mining Engineering", "Geology", "Safety Management", "Project Management", "Equipment"],
    benefits: ["Health Insurance", "Field Allowance", "Housing Support"],
    isFeatured: true,
    isPro: true,
    isActive: true,
    isRemote: false,
    views: 156,
    status: "public",
    createdAt: new Date(Date.now() - 1468800000).toISOString(),
    postedAt: new Date(Date.now() - 1468800000).toISOString(),
    applicationsCount: 13,
    department: "채굴팀",
    industry: "Mining",
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

export const mockNotifications = [
  {
    id: 1,
    type: "job_application",
    title: "지원서가 접수되었습니다",
    message: "Senior Frontend Developer 포지션에 지원서가 접수되었습니다.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    link: "/company/applications",
  },
  {
    id: 2,
    type: "application_status",
    title: "지원 상태가 변경되었습니다",
    message: "Backend Developer 포지션 지원 상태가 '검토중'으로 변경되었습니다.",
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    link: "/user/applications",
  },
  {
    id: 3,
    type: "interview_scheduled",
    title: "면접 일정이 잡혔습니다",
    message: "Full Stack Developer 포지션 면접이 2024년 1월 25일 오후 2시로 예약되었습니다.",
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    link: "/user/interviews",
  },
  {
    id: 4,
    type: "message",
    title: "새로운 메시지가 도착했습니다",
    message: "Tech Mongolia에서 메시지를 보냈습니다.",
    isRead: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    link: "/user/messages",
  },
  {
    id: 5,
    type: "job_recommendation",
    title: "맞춤 채용공고 추천",
    message: "당신의 프로필과 일치하는 새로운 채용공고가 있습니다: UI/UX Designer",
    isRead: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    link: "/user/jobs/4",
  },
  {
    id: 6,
    type: "alert",
    title: "중요 알림",
    message: "이력서가 성공적으로 업데이트되었습니다.",
    isRead: true,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    link: "/user/resumes",
  },
];

export const mockChatRooms = [
  {
    id: 1,
    employerId: 2,
    candidateId: 1,
    jobId: 1,
    status: "public",
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    employer: mockUsers[1],
    candidate: {
      id: 1,
      name: "John Doe",
      profileImage: null,
      title: "Senior Frontend Developer",
      isOnline: true,
      lastSeen: new Date().toISOString(),
    },
    job: {
      id: 1,
      title: "Senior Frontend Developer",
      department: "개발팀",
    },
    lastMessage: "Thank you! I'm very interested in this position.",
    unreadCount: 0,
  },
  {
    id: 2,
    employerId: 2,
    candidateId: 1,
    jobId: 2,
    status: "public",
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    employer: mockUsers[1],
    candidate: {
      id: 1,
      name: "John Doe",
      profileImage: null,
      title: "Backend Developer",
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000).toISOString(),
    },
    job: {
      id: 2,
      title: "Backend Developer",
      department: "개발팀",
    },
    lastMessage: "면접 일정을 확인해주세요.",
    unreadCount: 2,
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
    content: "Hello! Thank you for your application.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
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
    content: "Thank you! I'm very interested in this position.",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 3,
    roomId: 2,
    senderId: 2,
    message: "안녕하세요! 지원해주셔서 감사합니다.",
    messageType: "text",
    isRead: false,
    sentAt: new Date(Date.now() - 7200000).toISOString(),
    sender: mockUsers[1],
    content: "안녕하세요! 지원해주셔서 감사합니다.",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 4,
    roomId: 2,
    senderId: 1,
    message: "면접 일정을 확인해주세요.",
    messageType: "text",
    isRead: false,
    sentAt: new Date(Date.now() - 3600000).toISOString(),
    sender: mockUsers[0],
    content: "면접 일정을 확인해주세요.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
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

// Mock data getters
// Store for job options mutations (in-memory for mock mode)
let mockJobOptionsStore = {
  departments: [
    { id: 1, name: "개발팀", nameKo: "개발팀", nameEn: "Development", nameMn: "Хөгжүүлэлт", order: 1, isActive: true },
    { id: 2, name: "디자인팀", nameKo: "디자인팀", nameEn: "Design", nameMn: "Дизайн", order: 2, isActive: true },
    { id: 3, name: "마케팅팀", nameKo: "마케팅팀", nameEn: "Marketing", nameMn: "Маркетинг", order: 3, isActive: true },
    { id: 4, name: "데이터팀", nameKo: "데이터팀", nameEn: "Data", nameMn: "Өгөгдөл", order: 4, isActive: true },
  ],
  employmentTypes: [
    { id: 1, name: "정규직", nameKo: "정규직", nameEn: "Full Time", nameMn: "Бүтэн цагийн", order: 1, isActive: true },
    { id: 2, name: "계약직", nameKo: "계약직", nameEn: "Contract", nameMn: "Гэрээт", order: 2, isActive: true },
    { id: 3, name: "프리랜서", nameKo: "프리랜서", nameEn: "Freelance", nameMn: "Чөлөөт", order: 3, isActive: true },
    { id: 4, name: "인턴십", nameKo: "인턴십", nameEn: "Internship", nameMn: "Дадлагажигч", order: 4, isActive: true },
  ],
  experienceLevels: [
    { id: 1, name: "신입 (0-2년)", nameKo: "신입 (0-2년)", nameEn: "Entry (0-2 years)", nameMn: "Эхлэгч (0-2 жил)", order: 1, isActive: true },
    { id: 2, name: "주니어 (3-5년)", nameKo: "주니어 (3-5년)", nameEn: "Junior (3-5 years)", nameMn: "Дунд (3-5 жил)", order: 2, isActive: true },
    { id: 3, name: "미드 (3-7년)", nameKo: "미드 (3-7년)", nameEn: "Mid (3-7 years)", nameMn: "Дунд (3-7 жил)", order: 3, isActive: true },
    { id: 4, name: "시니어 (6-10년)", nameKo: "시니어 (6-10년)", nameEn: "Senior (6-10 years)", nameMn: "Ахлах (6-10 жил)", order: 4, isActive: true },
    { id: 5, name: "전문가 (10년+)", nameKo: "전문가 (10년+)", nameEn: "Expert (10+ years)", nameMn: "Мэргэжилтэн (10+ жил)", order: 5, isActive: true },
  ],
  preferredIndustries: [
    { id: 1, nameKo: "IT/소프트웨어", nameEn: "IT/Software", nameMn: "IT/Программ хангамж", order: 1, isActive: true },
    { id: 2, nameKo: "금융/은행", nameEn: "Finance/Banking", nameMn: "Санхүү/Банк", order: 2, isActive: true },
    { id: 3, nameKo: "제조업", nameEn: "Manufacturing", nameMn: "Үйлдвэрлэл", order: 3, isActive: true },
    { id: 4, nameKo: "의료/건강", nameEn: "Healthcare", nameMn: "Эрүүл мэнд", order: 4, isActive: true },
    { id: 5, nameKo: "교육", nameEn: "Education", nameMn: "Боловсрол", order: 5, isActive: true },
    { id: 6, nameKo: "소매/유통", nameEn: "Retail/Distribution", nameMn: "Жижиглэн худалдаа/Түгээлт", order: 6, isActive: true },
    { id: 7, nameKo: "건설/부동산", nameEn: "Construction/Real Estate", nameMn: "Барилга/Үл хөдлөх хөрөнгө", order: 7, isActive: true },
    { id: 8, nameKo: "미디어/엔터테인먼트", nameEn: "Media/Entertainment", nameMn: "Хэвлэл мэдээлэл/Зохион байгуулалт", order: 8, isActive: true },
    { id: 9, nameKo: "물류/운송", nameEn: "Logistics/Transportation", nameMn: "Логистик/Тээвэр", order: 9, isActive: true },
    { id: 10, nameKo: "식음료", nameEn: "Food & Beverage", nameMn: "Хоол хүнс", order: 10, isActive: true },
  ],
  skills: [
    { id: 1, name: "React", description: "React 라이브러리", isActive: true, createdAt: new Date().toISOString() },
    { id: 2, name: "TypeScript", description: "TypeScript 프로그래밍 언어", isActive: true, createdAt: new Date().toISOString() },
    { id: 3, name: "JavaScript", description: "JavaScript 프로그래밍 언어", isActive: true, createdAt: new Date().toISOString() },
    { id: 4, name: "Node.js", description: "Node.js 런타임 환경", isActive: true, createdAt: new Date().toISOString() },
    { id: 5, name: "Next.js", description: "Next.js 프레임워크", isActive: true, createdAt: new Date().toISOString() },
    { id: 6, name: "GraphQL", description: "GraphQL 쿼리 언어", isActive: true, createdAt: new Date().toISOString() },
    { id: 7, name: "CSS", description: "CSS 스타일링", isActive: true, createdAt: new Date().toISOString() },
    { id: 8, name: "HTML", description: "HTML 마크업", isActive: true, createdAt: new Date().toISOString() },
    { id: 9, name: "Python", description: "Python 프로그래밍 언어", isActive: true, createdAt: new Date().toISOString() },
    { id: 10, name: "Java", description: "Java 프로그래밍 언어", isActive: true, createdAt: new Date().toISOString() },
    { id: 11, name: "Docker", description: "Docker 컨테이너 기술", isActive: true, createdAt: new Date().toISOString() },
    { id: 12, name: "Kubernetes", description: "Kubernetes 오케스트레이션", isActive: true, createdAt: new Date().toISOString() },
    { id: 13, name: "AWS", description: "Amazon Web Services", isActive: true, createdAt: new Date().toISOString() },
    { id: 14, name: "PostgreSQL", description: "PostgreSQL 데이터베이스", isActive: true, createdAt: new Date().toISOString() },
    { id: 15, name: "MongoDB", description: "MongoDB 데이터베이스", isActive: true, createdAt: new Date().toISOString() },
    { id: 16, name: "Vue.js", description: "Vue.js 프레임워크", isActive: true, createdAt: new Date().toISOString() },
    { id: 17, name: "Angular", description: "Angular 프레임워크", isActive: true, createdAt: new Date().toISOString() },
    { id: 18, name: "Git", description: "Git 버전 관리", isActive: true, createdAt: new Date().toISOString() },
    { id: 19, name: "Figma", description: "Figma 디자인 도구", isActive: true, createdAt: new Date().toISOString() },
    { id: 20, name: "SQL", description: "SQL 데이터베이스 쿼리", isActive: true, createdAt: new Date().toISOString() },
  ],
};

// Store for banners (in-memory for mock mode)
let mockBannersStore = [
  {
    id: 1,
    title: "🚀 몽골 최고의 개발자 채용 플랫폼",
    content: "프리미엄 기업들과 연결되어 더 나은 기회를 찾아보세요",
    imageUrl: "",
    linkUrl: "/user/companies",
    position: "home_top",
    priority: 10,
    backgroundColor: "#f59e0b",
    textColor: "#ffffff",
    isActive: true,
    startDate: null,
    endDate: null,
    clickCount: 0,
    viewCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "💼 새로운 커리어의 시작",
    content: "한국 대기업들의 독점 채용정보를 확인하세요",
    imageUrl: "",
    linkUrl: "/user/jobs",
    position: "jobs_header",
    priority: 8,
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
    isActive: true,
    startDate: null,
    endDate: null,
    clickCount: 0,
    viewCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "📊 AI 기반 맞춤 채용 추천",
    content: "당신의 경력과 완벽하게 매칭되는 포지션을 찾아드립니다",
    imageUrl: "",
    linkUrl: "/user/jobs",
    position: "home_top",
    priority: 5,
    backgroundColor: "#10b981",
    textColor: "#ffffff",
    isActive: true,
    startDate: null,
    endDate: null,
    clickCount: 0,
    viewCount: 0,
    createdAt: new Date().toISOString(),
  },
];

export const getMockData = (url: string, method: string = "GET", data?: any): any => {
  // Remove query params for matching
  const baseUrl = url.split("?")[0];

  // Auth endpoints
  if (baseUrl === "/api/auth/user") {
    // Check if there's a token first - only return user if authenticated
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      // No token means user is not logged in, return null
      return null;
    }
    
    // Return user from localStorage if exists
    try {
      const stored = localStorage.getItem('user_data');
      if (stored) {
        const user = JSON.parse(stored);
        
        // Check if user is active - if deactivated, return null to force logout
        if (user.isActive === false || user.is_active === false) {
          console.log('[AUTH] User is deactivated, clearing auth');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          return null;
        }
        
        // Also check in mockUsers array for consistency
        const userInDb = mockUsers.find(u => u.id === user.id);
        if (userInDb && userInDb.isActive === false) {
          console.log('[AUTH] User is deactivated in DB, clearing auth');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          return null;
        }
        
        return user;
      }
    } catch (e) {
      console.error('Failed to parse stored user:', e);
    }
    
    // If token exists but no stored user, return null (shouldn't happen in normal flow)
    return null;
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
    
    // If registering as employer, create company and notify admins
    if (method === "POST" && baseUrl === "/api/auth/register" && data) {
      if (data.userType === "employer" || data.userType === "employer") {
        // Create new company with pending status
        const newCompanyId = Math.max(...mockCompanies.map(c => c.id), 0) + 1;
        const newCompany = {
          id: newCompanyId,
          name: data.companyName || "New Company",
          logo: null,
          size: data.companySize || "small",
          status: "pending",
          description: data.companyDescription || "",
          industry: data.companyIndustry || "",
          location: data.companyLocation || "",
          website: data.companyWebsite || "",
          employeeCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockCompanies.push(newCompany);
        
        // Create company user relationship
        const newUser = {
          id: mockUsers.length + 1,
          email: data.email,
          fullName: data.fullName || data.name || "",
          userType: "employer",
          isActive: true,
          companyId: newCompanyId,
        };
        mockUsers.push(newUser);
        
        const newCompanyUser = {
          id: mockCompanyUsers.length + 1,
          userId: newUser.id,
          companyId: newCompanyId,
          role: "owner",
          isPrimary: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          joinedAt: new Date().toISOString(),
        };
        mockCompanyUsers.push(newCompanyUser);
        
        // Notify all admins about new company registration
        const adminUsers = mockUsers.filter(u => u.userType === "admin" && u.isActive);
        adminUsers.forEach(admin => {
          const notificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
          mockNotifications.push({
            id: notificationId,
            type: "company_pending",
            title: "새로운 기업 등록 요청",
            message: `"${newCompany.name}" 기업이 등록되었습니다. 승인을 검토해주세요.`,
            isRead: false,
            createdAt: new Date().toISOString(),
            link: `/admin/companies/${newCompanyId}`,
            userId: admin.id,
          });
        });
        
        return {
          token: "mock-token-123",
          user: newUser,
          company: newCompany,
          message: "Success",
        };
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

  // Job matching endpoint - matches user requirements with jobs
  if (baseUrl === "/api/jobs/recommended" || baseUrl === "/api/jobs/matched") {
    // Get current user from localStorage
    try {
      const stored = localStorage.getItem('user_data');
      if (stored) {
        const user = JSON.parse(stored);
        // Import matching function synchronously
        const { matchUserWithJobs } = require('@/lib/jobMatching');
        // Get all active jobs
        const activeJobs = mockJobs.filter(j => j.isActive && j.status === "public");
        // Match user with jobs
        const matches = matchUserWithJobs(user, activeJobs);
        // Return jobs with match scores (top 10)
        return matches.slice(0, 10).map(match => ({
          ...match.job,
          matchScore: match.matchScore,
          matchReasons: match.matchReasons,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
        }));
      }
    } catch (e) {
      console.error('Failed to get user for job matching:', e);
    }
    // Fallback: return featured jobs if no user
    return mockJobs.filter((j) => j.isFeatured).slice(0, 10);
  }

  if (baseUrl.startsWith("/api/jobs/") && baseUrl !== "/api/jobs") {
    const jobId = parseInt(baseUrl.split("/").pop() || "0");
    return mockJobs.find((j) => j.id === jobId) || null;
  }

  if (baseUrl === "/api/jobs") {
    // Auto-expire jobs with past deadlines (only check active public jobs)
    const now = new Date();
    try {
      mockJobs.forEach(job => {
        if (job.expiresAt && job.status === "public" && job.isActive) {
          try {
            const deadline = new Date(job.expiresAt);
            // Check if deadline is valid and in the past
            if (!isNaN(deadline.getTime()) && deadline < now) {
              // Auto-close expired jobs
              job.status = "closed";
              job.isActive = false;
              job.updatedAt = new Date().toISOString();
            }
          } catch (e) {
            // Skip jobs with invalid dates
            console.warn('Invalid expiresAt for job:', job.id, e);
          }
        }
      });
    } catch (e) {
      console.warn('Error in auto-expire logic:', e);
    }
    // Parse query parameters for filtering
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    
    // Start with all active and public jobs
    let filteredJobs = mockJobs.filter(job => 
      job.isActive === true && job.status === "public"
    );
    
    // Check if any filters are applied
    const hasFilters = Array.from(urlParams.keys()).length > 0;
    
    // Only apply filters if they are actually set
    const search = urlParams.get("search");
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.company?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    const location = urlParams.get("location");
    if (location && location.trim() !== "") {
      filteredJobs = filteredJobs.filter(job => 
        job.location?.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    const industry = urlParams.get("industry");
    if (industry && industry.trim() !== "" && industry !== "all") {
      filteredJobs = filteredJobs.filter(job => 
        job.industry?.toLowerCase() === industry.toLowerCase()
      );
    }
    
    const experience = urlParams.get("experience");
    if (experience && experience.trim() !== "" && experience !== "all") {
      filteredJobs = filteredJobs.filter(job => 
        job.experienceLevel?.toLowerCase() === experience.toLowerCase()
      );
    }
    
    const type = urlParams.get("type");
    if (type && type.trim() !== "" && type !== "all") {
      filteredJobs = filteredJobs.filter(job => 
        job.employmentType?.toLowerCase() === type.toLowerCase()
      );
    }
    
    const isRemote = urlParams.get("isRemote");
    if (isRemote === "true") {
      filteredJobs = filteredJobs.filter(job => job.isRemote === true);
    }
    
    const isFeatured = urlParams.get("isFeatured");
    if (isFeatured === "true") {
      filteredJobs = filteredJobs.filter(job => job.isFeatured === true);
    }
    
    // If filtering resulted in empty array and filters were applied, return at least some jobs
    // This ensures UI always shows cards even with strict filters
    if (filteredJobs.length === 0 && hasFilters) {
      // Return first 10 active public jobs as fallback
      return mockJobs.filter(job => 
        job.isActive === true && job.status === "public"
      ).slice(0, 10);
    }
    
    // Return filtered results (or all jobs if no filters)
    return filteredJobs;
  }

  // Companies endpoints
  if (baseUrl === "/api/companies") {
    // Parse query parameters for filtering
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    
    // Start with all approved companies
    let filteredCompanies = mockCompanies.filter(company => 
      company.status === "approved"
    );
    
    // Check if any filters are applied
    const hasFilters = Array.from(urlParams.keys()).length > 0;
    
    // Only apply filters if they are actually set
    const search = urlParams.get("search");
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase();
      filteredCompanies = filteredCompanies.filter(company => 
        company.name?.toLowerCase().includes(searchLower) ||
        company.description?.toLowerCase().includes(searchLower) ||
        company.industry?.toLowerCase().includes(searchLower)
      );
    }
    
    const location = urlParams.get("location");
    if (location && location.trim() !== "" && location !== "all") {
      filteredCompanies = filteredCompanies.filter(company => 
        company.location?.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    const size = urlParams.get("size");
    if (size && size.trim() !== "" && size !== "all") {
      filteredCompanies = filteredCompanies.filter(company => 
        company.size?.toLowerCase() === size.toLowerCase()
      );
    }
    
    const industry = urlParams.get("industry");
    if (industry && industry.trim() !== "" && industry !== "all") {
      filteredCompanies = filteredCompanies.filter(company => 
        company.industry?.toLowerCase() === industry.toLowerCase()
      );
    }
    
    // If filtering resulted in empty array and filters were applied, return at least some companies
    // This ensures UI always shows cards even with strict filters
    if (filteredCompanies.length === 0 && hasFilters) {
      // Return first 10 approved companies as fallback
      return mockCompanies.filter(company => 
        company.status === "approved"
      ).slice(0, 10);
    }
    
    // Return filtered results (or all companies if no filters)
    return filteredCompanies;
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
  if (baseUrl === "/api/applications" && method === "POST") {
    // Create new application
    const newId = Math.max(...mockApplications.map(a => a.id), 0) + 1;
    const job = mockJobs.find(j => j.id === data.jobId);
    const candidate = mockUsers.find(u => u.id === data.userId || u.id === data.candidateId);
    const company = job ? mockCompanies.find(c => c.id === job.companyId) : null;
    
    const newApplication = {
      id: newId,
      userId: data.userId || data.candidateId, // Support both formats
      candidateId: data.userId || data.candidateId, // Domain: candidateId
      jobId: data.jobId,
      resumeId: data.resumeId || null,
      status: data.status || "pending",
      coverLetter: data.coverLetter || "",
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      job: job,
    };
    mockApplications.push(newApplication);
    
    // Update job applications count
    if (job) {
      job.applicationsCount = (job.applicationsCount || 0) + 1;
    }
    
    // Create notification for company about new application
    if (company && job) {
      const companyUsers = mockCompanyUsers.filter(cu => cu.companyId === company.id && cu.isActive);
      companyUsers.forEach(cu => {
        const companyUser = mockUsers.find(u => u.id === cu.userId);
        if (companyUser) {
          const notificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
          mockNotifications.push({
            id: notificationId,
            type: "job_application",
            title: "새로운 지원서가 접수되었습니다",
            message: `${candidate?.name || "지원자"}님이 "${job.title}" 포지션에 지원했습니다.`,
            isRead: false,
            createdAt: new Date().toISOString(),
            link: `/company/applications?jobId=${job.id}`,
            userId: companyUser.id,
          });
        }
      });
    }
    
    // Create chat room automatically when application is created
    if (job && candidate && company) {
      // Find company employer user
      const employerUser = mockUsers.find(u => 
        u.role === "employer" && mockCompanyUsers.some(cu => cu.companyId === company.id && cu.userId === u.id)
      ) || mockUsers.find(u => u.role === "employer") || mockUsers[1];
      
      // Check if chat room already exists
      const existingRoom = mockChatRooms.find(r => 
        r.jobId === job.id && 
        r.candidateId === candidate.id && 
        r.employerId === employerUser.id
      );
      
      if (!existingRoom) {
        const newRoomId = Math.max(...mockChatRooms.map(r => r.id), 0) + 1;
        mockChatRooms.push({
          id: newRoomId,
          employerId: employerUser.id,
          candidateId: candidate.id,
          jobId: job.id,
          status: "active",
          lastMessageAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          employer: employerUser,
          candidate: {
            id: candidate.id,
            name: candidate.name || candidate.fullName || "지원자",
            profileImage: candidate.profilePicture || null,
            title: candidate.headline || "",
            isOnline: false,
            lastSeen: new Date().toISOString(),
          },
          job: {
            id: job.id,
            title: job.title,
            department: job.department || "",
          },
          lastMessage: `${candidate.name || "지원자"}님이 지원했습니다.`,
          unreadCount: 1, // Unread for employer
        });
      }
    }
    
    return newApplication;
  }

  if (baseUrl.startsWith("/api/applications/user/")) {
    const userId = parseInt(baseUrl.split("/").pop() || "0");
    return mockApplications.filter(a => a.userId === userId || a.candidateId === userId);
  }

  if (baseUrl.startsWith("/api/applications/job/")) {
    const jobId = parseInt(baseUrl.split("/").pop() || "0");
    return mockApplications.filter(a => a.jobId === jobId);
  }
  
  // Update application status
  if (baseUrl.startsWith("/api/applications/") && method === "PATCH") {
    const applicationId = parseInt(baseUrl.split("/").pop() || "0");
    const index = mockApplications.findIndex(a => a.id === applicationId);
    if (index !== -1) {
      const oldStatus = mockApplications[index].status;
      mockApplications[index].status = data.status || mockApplications[index].status;
      mockApplications[index].updatedAt = new Date().toISOString();
      
      // Create notification for candidate when status changes
      if (oldStatus !== mockApplications[index].status) {
        const application = mockApplications[index];
        const job = mockJobs.find(j => j.id === application.jobId);
        const candidate = mockUsers.find(u => u.id === application.userId || u.id === application.candidateId);
        
        if (candidate && job) {
          const statusLabels: Record<string, string> = {
            reviewed: "검토중",
            interview: "면접",
            accepted: "합격",
            rejected: "불합격",
          };
          
          const notificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
          mockNotifications.push({
            id: notificationId,
            type: "application_status",
            title: "지원 상태가 변경되었습니다",
            message: `"${job.title}" 포지션 지원 상태가 '${statusLabels[mockApplications[index].status] || mockApplications[index].status}'으로 변경되었습니다.`,
            isRead: false,
            createdAt: new Date().toISOString(),
            link: `/user/applications`,
            userId: candidate.id,
          });
        }
      }
      
      return mockApplications[index];
    }
  }

  // Notifications endpoints
  if (baseUrl === "/api/notifications") {
    return mockNotifications;
  }

  if (baseUrl.startsWith("/api/notifications/") && baseUrl.includes("/read")) {
    const notificationId = parseInt(baseUrl.split("/")[3] || "0");
    const notification = mockNotifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
    return { success: true };
  }

  if (baseUrl === "/api/notifications/read-all") {
    mockNotifications.forEach((n) => {
      n.isRead = true;
    });
    return { success: true };
  }

  if (baseUrl.startsWith("/api/notifications/") && !baseUrl.includes("/read")) {
    const notificationId = parseInt(baseUrl.split("/").pop() || "0");
    const index = mockNotifications.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      mockNotifications.splice(index, 1);
    }
    return { success: true };
  }

  // Chat endpoints
  if (baseUrl === "/api/chat/rooms" || baseUrl.startsWith("/api/chat/rooms/user/") || baseUrl === "/api/chat/rooms/company") {
    return mockChatRooms;
  }

  if (baseUrl.startsWith("/api/chat/rooms/") && !baseUrl.includes("/messages") && !baseUrl.includes("/read")) {
    const roomId = parseInt(baseUrl.split("/").pop() || "0");
    return mockChatRooms.find((r) => r.id === roomId) || null;
  }

  if (baseUrl.startsWith("/api/chat/messages/") || (baseUrl.startsWith("/api/chat/rooms/") && baseUrl.includes("/messages"))) {
    const roomId = parseInt(baseUrl.split("/").pop() || "0");
    return mockChatMessages.filter((m) => m.roomId === roomId);
  }

  if (baseUrl === "/api/chat/unread-count") {
    return mockChatMessages.filter((m) => !m.isRead).length;
  }

  // Job Options endpoints
  if (baseUrl === "/api/admin/job-options/departments") {
    if (method === "POST" && data) {
      const newId = Math.max(...mockJobOptionsStore.departments.map(d => d.id), 0) + 1;
      const newDept = { ...data, id: newId, order: mockJobOptionsStore.departments.length + 1, isActive: true };
      mockJobOptionsStore.departments.push(newDept);
      return newDept;
    }
    if (method === "PUT" && baseUrl.includes("/departments/") && data) {
      const id = parseInt(baseUrl.split("/").pop() || "0");
      const index = mockJobOptionsStore.departments.findIndex(d => d.id === id);
      if (index !== -1) {
        mockJobOptionsStore.departments[index] = { ...mockJobOptionsStore.departments[index], ...data };
        return mockJobOptionsStore.departments[index];
      }
    }
    if (method === "DELETE" && baseUrl.includes("/departments/")) {
      const id = parseInt(baseUrl.split("/").pop() || "0");
      mockJobOptionsStore.departments = mockJobOptionsStore.departments.filter(d => d.id !== id);
      return { success: true };
    }
    return mockJobOptionsStore.departments;
  }
  if (baseUrl === "/api/admin/job-options/employment-types") {
    if (method === "POST" && data) {
      const newId = Math.max(...mockJobOptionsStore.employmentTypes.map(e => e.id), 0) + 1;
      const newType = { ...data, id: newId, order: mockJobOptionsStore.employmentTypes.length + 1, isActive: true };
      mockJobOptionsStore.employmentTypes.push(newType);
      return newType;
    }
    if (method === "PUT" && baseUrl.includes("/employment-types/") && data) {
      const id = parseInt(baseUrl.split("/").pop() || "0");
      const index = mockJobOptionsStore.employmentTypes.findIndex(e => e.id === id);
      if (index !== -1) {
        mockJobOptionsStore.employmentTypes[index] = { ...mockJobOptionsStore.employmentTypes[index], ...data };
        return mockJobOptionsStore.employmentTypes[index];
      }
    }
    if (method === "DELETE" && baseUrl.includes("/employment-types/")) {
      const id = parseInt(baseUrl.split("/").pop() || "0");
      mockJobOptionsStore.employmentTypes = mockJobOptionsStore.employmentTypes.filter(e => e.id !== id);
      return { success: true };
    }
    return mockJobOptionsStore.employmentTypes;
  }
  if (baseUrl === "/api/admin/job-options/experience-levels") {
    if (method === "POST" && data) {
      const newId = Math.max(...mockJobOptionsStore.experienceLevels.map(e => e.id), 0) + 1;
      const newLevel = { ...data, id: newId, order: mockJobOptionsStore.experienceLevels.length + 1, isActive: true };
      mockJobOptionsStore.experienceLevels.push(newLevel);
      return newLevel;
    }
    if (method === "PUT" && baseUrl.includes("/experience-levels/") && data) {
      const id = parseInt(baseUrl.split("/").pop() || "0");
      const index = mockJobOptionsStore.experienceLevels.findIndex(e => e.id === id);
      if (index !== -1) {
        mockJobOptionsStore.experienceLevels[index] = { ...mockJobOptionsStore.experienceLevels[index], ...data };
        return mockJobOptionsStore.experienceLevels[index];
      }
    }
    if (method === "DELETE" && baseUrl.includes("/experience-levels/")) {
      const id = parseInt(baseUrl.split("/").pop() || "0");
      mockJobOptionsStore.experienceLevels = mockJobOptionsStore.experienceLevels.filter(e => e.id !== id);
      return { success: true };
    }
    return mockJobOptionsStore.experienceLevels;
  }

  // Preferred Industries endpoints
  if (baseUrl === "/api/admin/job-options/preferred-industries") {
    if (method === "POST" && data) {
      const newId = Math.max(...mockJobOptionsStore.preferredIndustries.map(p => p.id), 0) + 1;
      const newIndustry = { ...data, id: newId, order: data.order || mockJobOptionsStore.preferredIndustries.length + 1, isActive: data.isActive !== undefined ? data.isActive : true };
      mockJobOptionsStore.preferredIndustries.push(newIndustry);
      return newIndustry;
    }
    if (baseUrl.includes("/preferred-industries/") && method === "PUT" && data) {
      const id = parseInt(baseUrl.split("/").pop() || "0");
      const index = mockJobOptionsStore.preferredIndustries.findIndex(p => p.id === id);
      if (index !== -1) {
        mockJobOptionsStore.preferredIndustries[index] = { ...mockJobOptionsStore.preferredIndustries[index], ...data };
        return mockJobOptionsStore.preferredIndustries[index];
      }
    }
    if (baseUrl.includes("/preferred-industries/") && method === "DELETE") {
      const id = parseInt(baseUrl.split("/").pop() || "0");
      mockJobOptionsStore.preferredIndustries = mockJobOptionsStore.preferredIndustries.filter(p => p.id !== id);
      return { success: true };
    }
    return mockJobOptionsStore.preferredIndustries;
  }

  // Skills Master Management endpoints
  if (baseUrl === "/api/admin/skills") {
    if (method === "POST" && data) {
      const newId = Math.max(...mockJobOptionsStore.skills.map(s => s.id), 0) + 1;
      const newSkill = { 
        ...data, 
        id: newId, 
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockJobOptionsStore.skills.push(newSkill);
      return newSkill;
    }
    if (baseUrl.includes("/skills/") && method === "PUT" && data) {
      const id = parseInt(baseUrl.split("/").pop() || "0");
      const index = mockJobOptionsStore.skills.findIndex(s => s.id === id);
      if (index !== -1) {
        mockJobOptionsStore.skills[index] = { 
          ...mockJobOptionsStore.skills[index], 
          ...data,
          updatedAt: new Date().toISOString()
        };
        return mockJobOptionsStore.skills[index];
      }
    }
    if (baseUrl.includes("/skills/") && method === "PATCH" && data) {
      const id = parseInt(baseUrl.split("/").pop() || "0");
      const index = mockJobOptionsStore.skills.findIndex(s => s.id === id);
      if (index !== -1) {
        mockJobOptionsStore.skills[index] = { 
          ...mockJobOptionsStore.skills[index], 
          ...data,
          updatedAt: new Date().toISOString()
        };
        return mockJobOptionsStore.skills[index];
      }
    }
    if (baseUrl.includes("/skills/") && method === "DELETE") {
      const id = parseInt(baseUrl.split("/").pop() || "0");
      mockJobOptionsStore.skills = mockJobOptionsStore.skills.filter(s => s.id !== id);
      return { success: true };
    }
    return mockJobOptionsStore.skills;
  }

  // Get active skills for job creation (from master skills)
  if (baseUrl === "/api/skills/active") {
    return mockJobOptionsStore.skills.filter(s => s.isActive).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      isActive: s.isActive,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
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

  // Get all unique skills (from master skills + user skills)
  if (baseUrl === "/api/skills/all") {
    const allSkills = new Set<string>();
    
    // First, add all active master skills
    mockJobOptionsStore.skills
      .filter(s => s.isActive)
      .forEach((skill) => {
        if (skill.name && skill.name.trim()) {
          allSkills.add(skill.name.trim());
        }
      });
    
    // Then, add skills from all users
    mockUsers.forEach((user: any) => {
      if (user.skills && Array.isArray(user.skills)) {
        user.skills.forEach((skill: string) => {
          if (skill && skill.trim()) {
            allSkills.add(skill.trim());
          }
        });
      }
    });
    
    return Array.from(allSkills).sort();
  }

  // Recommendations endpoint (AI-powered talent recommendations)
  if (baseUrl === "/api/recommendations" || baseUrl === "/api/talents/recommended") {
    // Return candidates sorted by match score (mock AI recommendation)
    const candidates = mockUsers.filter((u) => u.userType === "candidate");
    // Sort by profile completeness and skills
    return candidates.sort((a, b) => {
      const aScore = (a.skills?.length || 0) + (a.experience ? 1 : 0) + (a.education ? 1 : 0) + (a.bio ? 1 : 0);
      const bScore = (b.skills?.length || 0) + (b.experience ? 1 : 0) + (b.education ? 1 : 0) + (b.bio ? 1 : 0);
      return bScore - aScore;
    });
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

  // Admin Users Management endpoints
  if (baseUrl === "/api/admin/users") {
    // GET /api/admin/users - List all users with filtering
    if (method === "GET") {
      const urlObj = new URL(url, "http://localhost");
      const search = urlObj.searchParams.get("search") || "";
      const userType = urlObj.searchParams.get("userType") || "all";
      const status = urlObj.searchParams.get("status") || "all";
      const page = parseInt(urlObj.searchParams.get("page") || "1");
      const limit = 10;
      
      let filtered = [...mockUsers];
      
      // Filter by search query
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(u => 
          u.fullName?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower) ||
          u.username?.toLowerCase().includes(searchLower)
        );
      }
      
      // Filter by user type
      if (userType !== "all") {
        filtered = filtered.filter(u => {
          if (userType === "job_seeker") return u.userType === "candidate";
          if (userType === "employer") return u.userType === "employer";
          if (userType === "admin") return u.userType === "admin";
          return true;
        });
      }
      
      // Filter by status
      if (status !== "all") {
        filtered = filtered.filter(u => {
          if (status === "active") return u.isActive !== false;
          if (status === "inactive") return u.isActive === false;
          return true;
        });
      }
      
      // Pagination
      const total = filtered.length;
      const start = filtered.slice((page - 1) * limit, page * limit);
      
      return {
        data: filtered,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
    
    // POST /api/admin/users - Create new user (including admin)
    if (method === "POST" && data) {
      // Get current user from token to check permissions
      const token = localStorage.getItem('auth_token');
      const currentUserData = localStorage.getItem('user_data');
      let currentUser: any = null;
      
      if (currentUserData) {
        try {
          currentUser = JSON.parse(currentUserData);
        } catch (e) {
          console.error('Failed to parse current user:', e);
        }
      }
      
      // Check if creating admin - only existing admins can create admins
      if (data.userType === "admin" || data.userType === "admin") {
        if (!currentUser || (currentUser.userType !== "admin" && currentUser.role !== "admin")) {
          throw new Error("관리자만 다른 관리자를 생성할 수 있습니다.");
        }
      }
      
      // Check if email already exists
      const existingUser = mockUsers.find(u => u.email === data.email);
      if (existingUser) {
        throw new Error("이미 사용 중인 이메일입니다.");
      }
      
      const newId = Math.max(...mockUsers.map(u => u.id), 0) + 1;
      const newUser = {
        id: newId,
        username: data.username || data.email.split("@")[0],
        email: data.email,
        password: data.password || "temp123!", // In real app, hash password
        fullName: data.fullName || "",
        userType: data.userType || "candidate",
        role: data.userType === "admin" ? (data.role || "admin") : "user", // admin or super_admin
        phone: data.phone || "",
        location: data.location || "",
        bio: data.bio || "",
        profilePicture: null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        skills: [],
      };
      
      mockUsers.push(newUser);
      
      // If creating admin, create notification for other admins
      if (newUser.userType === "admin") {
        const adminUsers = mockUsers.filter(u => u.userType === "admin" && u.id !== newUser.id && u.isActive);
        adminUsers.forEach(admin => {
          const notificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
          mockNotifications.push({
            id: notificationId,
            type: "admin_created",
            title: "새로운 관리자가 생성되었습니다",
            message: `${currentUser?.fullName || "관리자"}님이 "${newUser.fullName}" 관리자 계정을 생성했습니다.`,
            isRead: false,
            createdAt: new Date().toISOString(),
            link: `/admin/users?id=${newUser.id}`,
            userId: admin.id,
          });
        });
      }
      
      return newUser;
    }
    
    // Default: return all users
    return {
      data: mockUsers,
      total: mockUsers.length,
    };
  }
  
  // GET /api/admin/users/stats - User statistics
  if (baseUrl === "/api/admin/users/stats") {
    const totalUsers = mockUsers.length;
    const jobSeekers = mockUsers.filter(u => u.userType === "candidate").length;
    const employers = mockUsers.filter(u => u.userType === "employer").length;
    const admins = mockUsers.filter(u => u.userType === "admin").length;
    const activeUsers = mockUsers.filter(u => u.isActive !== false).length;
    
    return {
      totalUsers,
      jobSeekers,
      employers,
      admins,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
    };
  }
  
  // GET /api/admin/users/:id - Get user detail
  if (baseUrl.startsWith("/api/admin/users/") && method === "GET" && !baseUrl.includes("/reset-password")) {
    const userId = parseInt(baseUrl.split("/").pop() || "0");
    return mockUsers.find(u => u.id === userId) || null;
  }
  
  // PUT /api/admin/users/:id - Update user (including admin role)
  if (baseUrl.startsWith("/api/admin/users/") && method === "PUT") {
    const userId = parseInt(baseUrl.split("/").pop() || "0");
    const index = mockUsers.findIndex(u => u.id === userId);
    
    if (index === -1) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }
    
    // Get current user from token
    const currentUserData = localStorage.getItem('user_data');
    let currentUser: any = null;
    if (currentUserData) {
      try {
        currentUser = JSON.parse(currentUserData);
      } catch (e) {
        console.error('Failed to parse current user:', e);
      }
    }
    
    const targetUser = mockUsers[index];
    
    // Prevent self-deactivation
    if (currentUser && currentUser.id === userId && data.isActive === false) {
      throw new Error("자기 자신을 비활성화할 수 없습니다.");
    }
    
    // Prevent deactivating last active admin
    if (targetUser.userType === "admin" && data.isActive === false) {
      const activeAdmins = mockUsers.filter(u => u.userType === "admin" && u.id !== userId && u.isActive !== false);
      if (activeAdmins.length === 0) {
        throw new Error("마지막 활성 관리자는 비활성화할 수 없습니다.");
      }
    }
    
    // Check if changing to admin - only existing admins can change role to admin
    if (data.userType === "admin" && targetUser.userType !== "admin") {
      if (!currentUser || (currentUser.userType !== "admin" && currentUser.role !== "admin")) {
        throw new Error("관리자만 사용자를 관리자로 변경할 수 있습니다.");
      }
    }
    
    // Update user
    mockUsers[index] = {
      ...mockUsers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    // If user was deactivated and is currently logged in, force logout
    if (data.isActive === false && currentUser && currentUser.id === userId) {
      // This will be handled by the frontend - user will be logged out
    }
    
    return mockUsers[index];
  }
  
  // PATCH /api/admin/users/:id - Update user status (activate/deactivate)
  if (baseUrl.startsWith("/api/admin/users/") && method === "PATCH") {
    const userId = parseInt(baseUrl.split("/").pop() || "0");
    const index = mockUsers.findIndex(u => u.id === userId);
    
    if (index === -1) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }
    
    // Get current user from token
    const currentUserData = localStorage.getItem('user_data');
    let currentUser: any = null;
    if (currentUserData) {
      try {
        currentUser = JSON.parse(currentUserData);
      } catch (e) {
        console.error('Failed to parse current user:', e);
      }
    }
    
    const targetUser = mockUsers[index];
    
    // Prevent self-deactivation
    if (currentUser && currentUser.id === userId && data.isActive === false) {
      throw new Error("자기 자신을 비활성화할 수 없습니다.");
    }
    
    // Prevent deactivating last active admin
    if (targetUser.userType === "admin" && data.isActive === false) {
      const activeAdmins = mockUsers.filter(u => u.userType === "admin" && u.id !== userId && u.isActive !== false);
      if (activeAdmins.length === 0) {
        throw new Error("마지막 활성 관리자는 비활성화할 수 없습니다.");
      }
    }
    
    // Update status
    mockUsers[index].isActive = data.isActive !== undefined ? data.isActive : mockUsers[index].isActive;
    mockUsers[index].updatedAt = new Date().toISOString();
    
    // If admin was deactivated, notify other admins
    if (targetUser.userType === "admin" && data.isActive === false) {
      const adminUsers = mockUsers.filter(u => u.userType === "admin" && u.id !== userId && u.isActive);
      adminUsers.forEach(admin => {
        const notificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
        mockNotifications.push({
          id: notificationId,
          type: "admin_deactivated",
          title: "관리자가 비활성화되었습니다",
          message: `${currentUser?.fullName || "관리자"}님이 "${targetUser.fullName}" 관리자 계정을 비활성화했습니다.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          link: `/admin/users?id=${userId}`,
          userId: admin.id,
        });
      });
    }
    
    return mockUsers[index];
  }
  
  // DELETE /api/admin/users/:id - Delete user
  if (baseUrl.startsWith("/api/admin/users/") && method === "DELETE") {
    const userId = parseInt(baseUrl.split("/").pop() || "0");
    const index = mockUsers.findIndex(u => u.id === userId);
    
    if (index === -1) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }
    
    // Get current user from token
    const currentUserData = localStorage.getItem('user_data');
    let currentUser: any = null;
    if (currentUserData) {
      try {
        currentUser = JSON.parse(currentUserData);
      } catch (e) {
        console.error('Failed to parse current user:', e);
      }
    }
    
    const targetUser = mockUsers[index];
    
    // Prevent self-deletion
    if (currentUser && currentUser.id === userId) {
      throw new Error("자기 자신을 삭제할 수 없습니다.");
    }
    
    // Prevent deleting last active admin
    if (targetUser.userType === "admin" && targetUser.isActive !== false) {
      const activeAdmins = mockUsers.filter(u => u.userType === "admin" && u.id !== userId && u.isActive !== false);
      if (activeAdmins.length === 0) {
        throw new Error("마지막 활성 관리자는 삭제할 수 없습니다.");
      }
    }
    
    // If deleting admin, notify other admins
    if (targetUser.userType === "admin") {
      const adminUsers = mockUsers.filter(u => u.userType === "admin" && u.id !== userId && u.isActive);
      adminUsers.forEach(admin => {
        const notificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
        mockNotifications.push({
          id: notificationId,
          type: "admin_deleted",
          title: "관리자가 삭제되었습니다",
          message: `${currentUser?.fullName || "관리자"}님이 "${targetUser.fullName}" 관리자 계정을 삭제했습니다.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          link: `/admin/users`,
          userId: admin.id,
        });
      });
    }
    
    mockUsers.splice(index, 1);
    return { success: true };
  }
  
  // POST /api/admin/users/:id/reset-password - Reset user password
  if (baseUrl.startsWith("/api/admin/users/") && baseUrl.includes("/reset-password") && method === "POST") {
    const userId = parseInt(baseUrl.split("/users/")[1].split("/")[0] || "0");
    const index = mockUsers.findIndex(u => u.id === userId);
    
    if (index === -1) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }
    
    // In real app, hash the password
    mockUsers[index].password = data.newPassword;
    mockUsers[index].updatedAt = new Date().toISOString();
    
    return { success: true };
  }

  // Mock company users data
  const mockCompanyUsers: any[] = [
    {
      id: 1,
      userId: 2, // Jane Smith (employer)
      companyId: 1,
      role: "owner",
      isPrimary: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
      user: mockUsers.find(u => u.id === 2),
    },
    {
      id: 2,
      userId: 7, // Additional employer user
      companyId: 1,
      role: "admin",
      isPrimary: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
      user: mockUsers.find(u => u.id === 7),
    },
    {
      id: 3,
      userId: 8, // Another employer user
      companyId: 1,
      role: "hr",
      isPrimary: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
      user: mockUsers.find(u => u.id === 8),
    },
  ];

  // Admin Companies endpoints
  if (baseUrl === "/api/admin/companies") {
    // GET /api/admin/companies - List all companies with filtering
    if (method === "GET") {
      const urlObj = new URL(url, "http://localhost");
      const search = urlObj.searchParams.get("search") || "";
      const industry = urlObj.searchParams.get("industry") || "all";
      const size = urlObj.searchParams.get("size") || "all";
      const page = parseInt(urlObj.searchParams.get("page") || "1");
      const limit = 10;
      
      let filtered = [...mockCompanies];
      
      // Filter by search query
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(c => 
          c.name?.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower) ||
          c.industry?.toLowerCase().includes(searchLower)
        );
      }
      
      // Filter by industry
      if (industry !== "all") {
        filtered = filtered.filter(c => c.industry?.toLowerCase() === industry.toLowerCase());
      }
      
      // Filter by size
      if (size !== "all") {
        filtered = filtered.filter(c => c.size === size);
      }
      
      // Pagination
      const total = filtered.length;
      const start = filtered.slice((page - 1) * limit, page * limit);
      
      return {
        data: filtered,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
    
    // Default: return all companies
    return {
      data: mockCompanies,
      total: mockCompanies.length,
    };
  }
  
  // GET /api/admin/companies/stats - Company statistics
  if (baseUrl === "/api/admin/companies/stats") {
    const totalCompanies = mockCompanies.length;
    const approvedCompanies = mockCompanies.filter(c => c.status === "approved").length;
    const pendingCompanies = mockCompanies.filter(c => c.status === "pending").length;
    const rejectedCompanies = mockCompanies.filter(c => c.status === "rejected").length;
    const suspendedCompanies = mockCompanies.filter(c => c.status === "suspended").length;
    const activeJobs = mockJobs.filter(j => j.isActive && j.status === "public").length;
    
    return {
      totalCompanies,
      approvedCompanies,
      pendingCompanies,
      rejectedCompanies,
      suspendedCompanies,
      activeJobs,
    };
  }
  
  // Admin company detail endpoint
  if (baseUrl.startsWith("/api/admin/companies/") && !baseUrl.includes("/users") && !baseUrl.includes("/approve") && !baseUrl.includes("/reject") && !baseUrl.includes("/suspend") && !baseUrl.includes("/reactivate") && !baseUrl.includes("/delete")) {
    const companyId = parseInt(baseUrl.split("/").pop() || "0");
    const company = mockCompanies.find((c) => c.id === companyId);
    if (company) {
      // Find owner user
      const ownerCompanyUser = mockCompanyUsers.find(cu => cu.companyId === companyId && cu.isPrimary);
      const ownerUser = ownerCompanyUser ? mockUsers.find(u => u.id === ownerCompanyUser.userId) : null;
      
      return {
        ...company,
        email: company.email || `contact@${company.name.toLowerCase().replace(/\s+/g, "")}.mn`,
        phone: company.phone || "+976 12345678",
        ownerUser: ownerUser || null,
      };
    }
    return null;
  }
  
  // PUT /api/admin/companies/:id - Update company information
  if (baseUrl.startsWith("/api/admin/companies/") && method === "PUT" && !baseUrl.includes("/users") && !baseUrl.includes("/approve") && !baseUrl.includes("/reject") && !baseUrl.includes("/suspend") && !baseUrl.includes("/reactivate") && !baseUrl.includes("/delete")) {
    const companyId = parseInt(baseUrl.split("/").pop() || "0");
    const index = mockCompanies.findIndex(c => c.id === companyId);
    
    if (index === -1) {
      throw new Error("기업을 찾을 수 없습니다.");
    }
    
    // Update company
    mockCompanies[index] = {
      ...mockCompanies[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return mockCompanies[index];
  }
  
  // DELETE /api/admin/companies/:id - Delete company
  if (baseUrl.startsWith("/api/admin/companies/") && method === "DELETE" && !baseUrl.includes("/users")) {
    const companyId = parseInt(baseUrl.split("/").pop() || "0");
    const index = mockCompanies.findIndex(c => c.id === companyId);
    
    if (index === -1) {
      throw new Error("기업을 찾을 수 없습니다.");
    }
    
    const company = mockCompanies[index];
    
    // Delete associated company users
    mockCompanyUsers.forEach((cu, idx) => {
      if (cu.companyId === companyId) {
        mockCompanyUsers.splice(idx, 1);
      }
    });
    
    // Delete associated jobs
    mockJobs.forEach((job, idx) => {
      if (job.companyId === companyId) {
        mockJobs.splice(idx, 1);
      }
    });
    
    mockCompanies.splice(index, 1);
    
    return { success: true };
  }
  
  // POST /api/admin/companies/:id/approve - Approve company
  if (baseUrl.startsWith("/api/admin/companies/") && baseUrl.includes("/approve") && method === "POST") {
    const companyId = parseInt(baseUrl.split("/companies/")[1].split("/")[0] || "0");
    const index = mockCompanies.findIndex(c => c.id === companyId);
    
    if (index === -1) {
      throw new Error("기업을 찾을 수 없습니다.");
    }
    
    const company = mockCompanies[index];
    const oldStatus = company.status;
    
    // Update company status
    mockCompanies[index].status = "approved";
    mockCompanies[index].updatedAt = new Date().toISOString();
    
    // Create notifications for company users
    const companyUsers = mockCompanyUsers.filter(cu => cu.companyId === companyId && cu.isActive);
    companyUsers.forEach(cu => {
      const companyUser = mockUsers.find(u => u.id === cu.userId);
      if (companyUser) {
        const notificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
        mockNotifications.push({
          id: notificationId,
          type: oldStatus === "rejected" ? "company_reapproved" : "company_approved",
          title: oldStatus === "rejected" ? "기업 계정이 재승인되었습니다" : "기업 계정이 승인되었습니다",
          message: oldStatus === "rejected" 
            ? `"${company.name}" 기업 계정이 재승인되어 사용 가능합니다.`
            : `"${company.name}" 기업 계정이 승인되어 사용 가능합니다.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          link: `/company/dashboard`,
          userId: companyUser.id,
        });
      }
    });
    
    return mockCompanies[index];
  }
  
  // POST /api/admin/companies/:id/reject - Reject company
  if (baseUrl.startsWith("/api/admin/companies/") && baseUrl.includes("/reject") && method === "POST") {
    const companyId = parseInt(baseUrl.split("/companies/")[1].split("/")[0] || "0");
    const index = mockCompanies.findIndex(c => c.id === companyId);
    
    if (index === -1) {
      throw new Error("기업을 찾을 수 없습니다.");
    }
    
    const company = mockCompanies[index];
    
    // Update company status
    mockCompanies[index].status = "rejected";
    mockCompanies[index].rejectionReason = data.reason || "";
    mockCompanies[index].updatedAt = new Date().toISOString();
    
    // Create notifications for company users
    const companyUsers = mockCompanyUsers.filter(cu => cu.companyId === companyId && cu.isActive);
    companyUsers.forEach(cu => {
      const companyUser = mockUsers.find(u => u.id === cu.userId);
      if (companyUser) {
        const notificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
        mockNotifications.push({
          id: notificationId,
          type: "company_rejected",
          title: "기업 계정이 거부되었습니다",
          message: `"${company.name}" 기업 계정이 거부되었습니다.${data.reason ? ` 사유: ${data.reason}` : ""}`,
          isRead: false,
          createdAt: new Date().toISOString(),
          link: `/company/info`,
          userId: companyUser.id,
        });
      }
    });
    
    return mockCompanies[index];
  }
  
  // POST /api/admin/companies/:id/suspend - Suspend company
  if (baseUrl.startsWith("/api/admin/companies/") && baseUrl.includes("/suspend") && method === "POST") {
    const companyId = parseInt(baseUrl.split("/companies/")[1].split("/")[0] || "0");
    const index = mockCompanies.findIndex(c => c.id === companyId);
    
    if (index === -1) {
      throw new Error("기업을 찾을 수 없습니다.");
    }
    
    const company = mockCompanies[index];
    
    // Update company status
    mockCompanies[index].status = "suspended";
    mockCompanies[index].updatedAt = new Date().toISOString();
    
    // Deactivate all jobs for this company
    mockJobs.forEach(job => {
      if (job.companyId === companyId) {
        job.isActive = false;
      }
    });
    
    // Create notifications for company users
    const companyUsers = mockCompanyUsers.filter(cu => cu.companyId === companyId && cu.isActive);
    companyUsers.forEach(cu => {
      const companyUser = mockUsers.find(u => u.id === cu.userId);
      if (companyUser) {
        const notificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
        mockNotifications.push({
          id: notificationId,
          type: "company_suspended",
          title: "기업 계정이 중지되었습니다",
          message: `"${company.name}" 기업 계정이 중지되었습니다. 모든 채용공고가 비활성화되었습니다.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          link: `/company/info`,
          userId: companyUser.id,
        });
      }
    });
    
    return mockCompanies[index];
  }
  
  // POST /api/admin/companies/:id/reactivate - Reactivate suspended company
  if (baseUrl.startsWith("/api/admin/companies/") && baseUrl.includes("/reactivate") && method === "POST") {
    const companyId = parseInt(baseUrl.split("/companies/")[1].split("/")[0] || "0");
    const index = mockCompanies.findIndex(c => c.id === companyId);
    
    if (index === -1) {
      throw new Error("기업을 찾을 수 없습니다.");
    }
    
    const company = mockCompanies[index];
    
    // Update company status back to approved
    mockCompanies[index].status = "approved";
    mockCompanies[index].updatedAt = new Date().toISOString();
    
    // Create notifications for company users
    const companyUsers = mockCompanyUsers.filter(cu => cu.companyId === companyId && cu.isActive);
    companyUsers.forEach(cu => {
      const companyUser = mockUsers.find(u => u.id === cu.userId);
      if (companyUser) {
        const notificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
        mockNotifications.push({
          id: notificationId,
          type: "company_reactivated",
          title: "기업 계정이 재활성화되었습니다",
          message: `"${company.name}" 기업 계정이 재활성화되었습니다.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          link: `/company/dashboard`,
          userId: companyUser.id,
        });
      }
    });
    
    return mockCompanies[index];
  }

  // Admin company users endpoints
  if (baseUrl.includes("/api/admin/companies/") && baseUrl.includes("/users")) {
    const parts = baseUrl.split("/");
    const companyIdIndex = parts.indexOf("companies") + 1;
    const companyId = parseInt(parts[companyIdIndex] || "0");
    const userIdIndex = parts.indexOf("users") + 1;
    const userId = userIdIndex > 0 && parts[userIdIndex] ? parseInt(parts[userIdIndex]) : null;

    // GET /api/admin/companies/:id/users - List company users
    if (method === "GET" && !userId) {
      return mockCompanyUsers.filter(cu => cu.companyId === companyId).map(cu => ({
        ...cu,
        user: mockUsers.find(u => u.id === cu.userId),
      }));
    }

    // POST /api/admin/companies/:id/users - Create company user
    if (method === "POST" && !userId && data) {
      const newUser = {
        id: mockUsers.length + 1,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        userType: "employer",
        isActive: true,
      };
      mockUsers.push(newUser);

      const newCompanyUser = {
        id: mockCompanyUsers.length + 1,
        userId: newUser.id,
        companyId: companyId,
        role: data.role || "member",
        isPrimary: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
        user: newUser,
      };
      mockCompanyUsers.push(newCompanyUser);
      return { user: newUser, companyUser: newCompanyUser };
    }

    // PUT /api/admin/companies/:id/users/:userId - Update company user role
    if (method === "PUT" && userId && data) {
      const companyUser = mockCompanyUsers.find(cu => cu.companyId === companyId && cu.userId === userId);
      if (companyUser) {
        companyUser.role = data.role;
        return { ...companyUser, user: mockUsers.find(u => u.id === userId) };
      }
      return null;
    }

    // PATCH /api/admin/companies/:id/users/:userId - Update company user status
    if (method === "PATCH" && userId && data) {
      const companyUser = mockCompanyUsers.find(cu => cu.companyId === companyId && cu.userId === userId);
      if (companyUser) {
        companyUser.isActive = data.isActive;
        return { ...companyUser, user: mockUsers.find(u => u.id === userId) };
      }
      return null;
    }

    // DELETE /api/admin/companies/:id/users/:userId - Delete company user
    if (method === "DELETE" && userId) {
      const index = mockCompanyUsers.findIndex(cu => cu.companyId === companyId && cu.userId === userId);
      if (index > -1) {
        mockCompanyUsers.splice(index, 1);
        return { success: true };
      }
      return null;
    }
  }

  // Admin Jobs endpoints
  if (baseUrl === "/api/admin/jobs") {
    const urlObj = new URL(url, "http://localhost");
    const search = urlObj.searchParams.get("search") || "";
    const company = urlObj.searchParams.get("company") || "all";
    const status = urlObj.searchParams.get("status") || "all";
    const type = urlObj.searchParams.get("type") || "all";
    const dateRange = urlObj.searchParams.get("dateRange") || "all";
    
    let filtered = mockJobs.map(job => ({
      ...job,
      company: {
        id: job.companyId,
        name: job.company.name
      }
    }));
    
    if (search) {
      filtered = filtered.filter((j) => 
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.company.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (company !== "all") {
      filtered = filtered.filter((j) => j.companyId.toString() === company);
    }
    
    if (status !== "all") {
      filtered = filtered.filter((j) => j.status === status);
    }
    
    if (type !== "all") {
      filtered = filtered.filter((j) => j.employmentType === type);
    }
    
    if (dateRange !== "all") {
      const now = new Date();
      filtered = filtered.filter((j) => {
        if (!j.postedAt) return false;
        const postedDate = new Date(j.postedAt);
        const daysDiff = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateRange) {
          case "today":
            return daysDiff === 0;
          case "week":
            return daysDiff <= 7;
          case "month":
            return daysDiff <= 30;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }

  if (baseUrl === "/api/admin/jobs/stats") {
    const publicJobs = mockJobs.filter((j) => j.status === "public").length;
    const pendingJobs = mockJobs.filter((j) => j.status === "pending").length;
    const closedJobs = mockJobs.filter((j) => j.status === "closed").length;
    const reportedJobs = mockJobs.filter((j) => j.reportedCount && j.reportedCount > 0).length;
    
    return {
      totalJobs: mockJobs.length,
      publicJobs,
      pendingJobs,
      closedJobs,
      reportedJobs,
    };
  }

  // Admin Job Approval endpoints
  if (baseUrl.startsWith("/api/admin/jobs/") && baseUrl.includes("/approve") && method === "POST") {
    const jobId = parseInt(baseUrl.split("/jobs/")[1].split("/")[0] || "0");
    const index = mockJobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      const job = mockJobs[index];
      // Allow approval for both pending and rejected jobs
      if (job.status === "pending" || job.status === "rejected") {
        const company = mockCompanies.find(c => c.id === job.companyId);
        
        // Approve job - change status to public and set isActive
        mockJobs[index].status = "public";
        mockJobs[index].isActive = true;
        mockJobs[index].postedAt = new Date().toISOString();
        mockJobs[index].updatedAt = new Date().toISOString();
        
        // Create notification for company about job approval
        if (company) {
          const companyUsers = mockCompanyUsers.filter(cu => cu.companyId === company.id && cu.isActive);
          companyUsers.forEach(cu => {
            const companyUser = mockUsers.find(u => u.id === cu.userId);
            if (companyUser) {
              const notificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
              mockNotifications.push({
                id: notificationId,
                type: "job_approved",
                title: "채용공고가 승인되었습니다",
                message: `"${job.title}" 채용공고가 승인되어 웹사이트에 게시되었습니다.`,
                isRead: false,
                createdAt: new Date().toISOString(),
                link: `/company/jobs?id=${job.id}`,
                userId: companyUser.id,
              });
            }
          });
        }
        
        return mockJobs[index];
      }
    }
    return { success: false, message: "Job not found or cannot be approved" };
  }

  // Admin Job Rejection endpoints
  if (baseUrl.startsWith("/api/admin/jobs/") && baseUrl.includes("/reject") && method === "POST") {
    const jobId = parseInt(baseUrl.split("/jobs/")[1].split("/")[0] || "0");
    const index = mockJobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      const job = mockJobs[index];
      const company = mockCompanies.find(c => c.id === job.companyId);
      
      // Reject job - change status to rejected
      mockJobs[index].status = "rejected";
      mockJobs[index].isActive = false;
      mockJobs[index].rejectionReason = data.reason || "";
      mockJobs[index].updatedAt = new Date().toISOString();
      
      // Create notification for company about job rejection
      if (company) {
        const companyUsers = mockCompanyUsers.filter(cu => cu.companyId === company.id && cu.isActive);
        companyUsers.forEach(cu => {
          const companyUser = mockUsers.find(u => u.id === cu.userId);
          if (companyUser) {
            const notificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
            mockNotifications.push({
              id: notificationId,
              type: "job_rejected",
              title: "채용공고가 거부되었습니다",
              message: `"${job.title}" 채용공고가 거부되었습니다.${data.reason ? ` 사유: ${data.reason}` : ""}`,
              isRead: false,
              createdAt: new Date().toISOString(),
              link: `/company/jobs?id=${job.id}`,
              userId: companyUser.id,
            });
          }
        });
      }
      
      return mockJobs[index];
    }
    return null;
  }

  // Company Jobs Management endpoints
  if (baseUrl === "/api/company/jobs") {
    // Get company ID from auth user (in real app, from token)
    // For now, return all jobs (filtered by company in real implementation)
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    const search = urlParams.get("search") || "";
    const status = urlParams.get("status") || "all";
    const department = urlParams.get("department") || "all";
    
    // In real app, filter by authenticated company's ID
    // For demo, return all jobs (or filter by companyId if provided)
    let filtered = [...mockJobs];
    
    if (search) {
      filtered = filtered.filter((j) => 
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.department?.toLowerCase().includes(search.toLowerCase()) ||
        j.location?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status !== "all") {
      filtered = filtered.filter((j) => {
        // Map company status to job status
        if (status === "active") return j.status === "public" && j.isActive;
        if (status === "draft") return j.status === "pending";
        if (status === "closed") return j.status === "closed";
        if (status === "paused") return !j.isActive && j.status === "public";
        return true;
      });
    }
    
    if (department !== "all") {
      filtered = filtered.filter((j) => j.department === department);
    }
    
    // Transform to company jobs format
    return filtered.map(job => ({
      id: job.id,
      title: job.title,
      department: job.department || "미지정",
      location: job.location,
      type: job.employmentType === "full_time" ? "정규직" : 
            job.employmentType === "contract" ? "계약직" :
            job.employmentType === "freelance" ? "프리랜서" :
            job.employmentType === "internship" ? "인턴십" : "정규직",
      experience: job.experienceLevel === "entry" ? "신입 (0-2년)" :
                  job.experienceLevel === "junior" ? "주니어 (3-5년)" :
                  job.experienceLevel === "mid" ? "미드 (3-7년)" :
                  job.experienceLevel === "senior" ? "시니어 (6-10년)" :
                  job.experienceLevel === "expert" ? "전문가 (10년+)" : "경력 무관",
      salary: job.salaryMin && job.salaryMax 
        ? `${(job.salaryMin / 10000).toFixed(0)}-${(job.salaryMax / 10000).toFixed(0)}만원`
        : "협의",
      isRemote: job.isRemote,
      status: job.status === "public" && job.isActive ? "active" :
              job.status === "pending" ? "draft" :
              job.status === "closed" ? "closed" :
              !job.isActive ? "paused" : "active",
      postedAt: job.postedAt || job.createdAt,
      deadline: job.expiresAt,
      views: job.views || 0,
      applications: job.applicationsCount || 0,
      saves: 0, // Will be calculated from saved-jobs
      description: job.description,
      requirements: job.requirements ? job.requirements.split(",").map(r => r.trim()) : [],
      benefits: job.benefits || [],
    }));
  }

  // Company Job CRUD operations
  if (baseUrl === "/api/company/jobs" && method === "POST") {
    // Create new job - Always starts as "pending" for admin approval
    const newId = Math.max(...mockJobs.map(j => j.id), 0) + 1;
    const company = mockCompanies.find(c => c.id === (data.companyId || 1)) || mockCompanies[0];
    
    // Map domain fields (title, employmentType, experienceLevel, salary, requiredSkills)
    // Support both old format (jobTitle, salaryRange, experience) and new format (title, salary, experienceLevel)
    const jobTitle = data.title || data.jobTitle || "";
    const jobDescription = data.description || data.jobDescription || "";
    const employmentType = data.employmentType || "full_time";
    const experienceLevel = data.experienceLevel || data.experience || "";
    
    // Parse salary - support both string format ("2000-3000만원") and range format
    let salaryMin: number | undefined;
    let salaryMax: number | undefined;
    if (data.salary) {
      // String format: "2000-3000만원"
      const match = data.salary.match(/(\d+)\s*-\s*(\d+)/);
      if (match) {
        salaryMin = parseInt(match[1]) * 10000;
        salaryMax = parseInt(match[2]) * 10000;
      }
    } else if (data.salaryRange) {
      // Old format: "2000-3000만원"
      const parts = data.salaryRange.split("-");
      if (parts.length === 2) {
        salaryMin = parseInt(parts[0].replace("만원", "").trim()) * 10000;
        salaryMax = parseInt(parts[1].replace("만원", "").trim()) * 10000;
      }
    }
    
    const requiredSkills = data.requiredSkills || data.skills || [];
    const deadline = data.deadline || null;
    const requirements = data.requirements || "";
    const benefits = data.benefits || [];
    
    const newJob = {
      id: newId,
      companyId: data.companyId || 1,
      company: company,
      title: jobTitle,
      description: jobDescription,
      requirements: requirements,
      location: data.location || "",
      employmentType: employmentType,
      experienceLevel: experienceLevel,
      salaryMin: salaryMin,
      salaryMax: salaryMax,
      skills: requiredSkills, // Domain: requiredSkills -> DB: skills
      benefits: benefits,
      isFeatured: false,
      isPro: false,
      isPremium: false, // Domain: isPremium
      isActive: false, // Inactive until approved by admin
      isRemote: data.isRemote || false,
      views: 0,
      status: data.status === "draft" ? "pending" : "pending", // Always pending - requires admin approval
      createdAt: new Date().toISOString(),
      postedAt: null, // Will be set when approved
      expiresAt: deadline,
      applicationsCount: 0,
      department: data.department, // Not in domain spec, but keep for compatibility
      industry: company.industry || "Technology",
      rejectionReason: null, // Will be set if rejected
    };
    mockJobs.push(newJob);
    
    // Create notification for admin about new job pending approval
    const adminNotificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
    mockNotifications.push({
      id: adminNotificationId,
      type: "job_pending",
      title: "새로운 채용공고 승인 대기",
      message: `${company.name}에서 "${jobTitle}" 채용공고를 등록했습니다. 승인을 검토해주세요.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      link: `/admin/jobs?id=${newId}`,
      userId: 3, // Admin user ID
    });
    
    return newJob;
  }

  if (baseUrl.startsWith("/api/company/jobs/") && method === "PUT") {
    // Update job
    const jobId = parseInt(baseUrl.split("/").pop() || "0");
    const index = mockJobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      const existingJob = mockJobs[index];
      
      // Map domain fields - support both old and new format
      const jobTitle = data.title || data.jobTitle || existingJob.title;
      const jobDescription = data.description || data.jobDescription || existingJob.description;
      const employmentType = data.employmentType || existingJob.employmentType;
      const experienceLevel = data.experienceLevel || data.experience || existingJob.experienceLevel;
      
      // Parse salary
      let salaryMin = existingJob.salaryMin;
      let salaryMax = existingJob.salaryMax;
      if (data.salary) {
        const match = data.salary.match(/(\d+)\s*-\s*(\d+)/);
        if (match) {
          salaryMin = parseInt(match[1]) * 10000;
          salaryMax = parseInt(match[2]) * 10000;
        }
      } else if (data.salaryRange) {
        const parts = data.salaryRange.split("-");
        if (parts.length === 2) {
          salaryMin = parseInt(parts[0].replace("만원", "").trim()) * 10000;
          salaryMax = parseInt(parts[1].replace("만원", "").trim()) * 10000;
        }
      }
      
      const requiredSkills = data.requiredSkills || data.skills || existingJob.skills;
      
      const requirements = data.requirements !== undefined ? data.requirements : existingJob.requirements;
      const benefits = data.benefits !== undefined ? data.benefits : existingJob.benefits;
      
      mockJobs[index] = {
        ...existingJob,
        title: jobTitle,
        description: jobDescription,
        requirements: requirements,
        location: data.location || existingJob.location,
        employmentType: employmentType,
        experienceLevel: experienceLevel,
        salaryMin: salaryMin,
        salaryMax: salaryMax,
        skills: requiredSkills,
        benefits: benefits,
        // Don't allow company to change status directly - only admin can approve
        isActive: existingJob.status === "public" ? existingJob.isActive : false,
        isRemote: data.isRemote !== undefined ? data.isRemote : existingJob.isRemote,
        status: existingJob.status === "public" ? "public" : "pending", // Keep pending if not approved
        postedAt: existingJob.status === "public" ? existingJob.postedAt : null,
        expiresAt: data.deadline || existingJob.expiresAt,
        department: data.department || existingJob.department,
        updatedAt: new Date().toISOString(),
      };
      
      // If job was previously approved and is being updated, notify admin
      if (existingJob.status === "public") {
        const notificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
        mockNotifications.push({
          id: notificationId,
          type: "job_updated",
          title: "채용공고가 수정되었습니다",
          message: `"${jobTitle}" 채용공고가 수정되었습니다. 변경사항을 확인해주세요.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          link: `/admin/jobs?id=${jobId}`,
          userId: 3, // Admin user ID
        });
      }
      
      return mockJobs[index];
    }
  }

  if (baseUrl.startsWith("/api/company/jobs/") && method === "DELETE") {
    // Delete job
    const jobId = parseInt(baseUrl.split("/").pop() || "0");
    const index = mockJobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      mockJobs.splice(index, 1);
      return { success: true };
    }
  }

  if (baseUrl.startsWith("/api/company/jobs/") && method === "PATCH") {
    // Update job status or other fields
    const jobId = parseInt(baseUrl.split("/").pop() || "0");
    const index = mockJobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      const existingJob = mockJobs[index];
      
      // Handle status update
      if (data.status) {
        const oldStatus = existingJob.status;
        mockJobs[index].status = data.status === "active" ? "public" : 
                                 data.status === "draft" ? "pending" : 
                                 data.status === "paused" ? "public" :
                                 data.status;
        mockJobs[index].isActive = data.status === "active" ? true :
                                   data.status === "paused" ? false : 
                                   data.status === "closed" ? false :
                                   existingJob.isActive;
        
        // If reactivating a rejected job, change status back to pending for re-approval
        if (oldStatus === "rejected" && data.status === "pending") {
          mockJobs[index].status = "pending";
          mockJobs[index].isActive = false;
          mockJobs[index].rejectionReason = null;
          
          // Notify admin about re-submission
          const adminNotificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
          mockNotifications.push({
            id: adminNotificationId,
            type: "job_pending",
            title: "채용공고 재제출",
            message: `"${existingJob.title}" 채용공고가 재제출되었습니다. 승인을 검토해주세요.`,
            isRead: false,
            createdAt: new Date().toISOString(),
            link: `/admin/jobs?id=${jobId}`,
            userId: 3, // Admin user ID
          });
        }
        
        if (data.status === "active" && !mockJobs[index].postedAt) {
          mockJobs[index].postedAt = new Date().toISOString();
        }
      }
      
      // Handle deadline extension
      if (data.deadline) {
        mockJobs[index].expiresAt = data.deadline;
        mockJobs[index].updatedAt = new Date().toISOString();
      }
      
      // Handle pause/resume
      if (data.isActive !== undefined) {
        mockJobs[index].isActive = data.isActive;
        mockJobs[index].updatedAt = new Date().toISOString();
      }
      
      return mockJobs[index];
    }
  }
  
  // POST /api/company/jobs/:id/resubmit - Resubmit rejected job
  if (baseUrl.startsWith("/api/company/jobs/") && baseUrl.includes("/resubmit") && method === "POST") {
    const jobId = parseInt(baseUrl.split("/jobs/")[1].split("/")[0] || "0");
    const index = mockJobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      const job = mockJobs[index];
      
      if (job.status === "rejected") {
        // Change status back to pending for re-approval
        mockJobs[index].status = "pending";
        mockJobs[index].isActive = false;
        mockJobs[index].rejectionReason = null;
        mockJobs[index].updatedAt = new Date().toISOString();
        
        // Notify admin about re-submission
        const adminNotificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
        mockNotifications.push({
          id: adminNotificationId,
          type: "job_pending",
          title: "채용공고 재제출",
          message: `"${job.title}" 채용공고가 재제출되었습니다. 승인을 검토해주세요.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          link: `/admin/jobs?id=${jobId}`,
          userId: 3, // Admin user ID
        });
        
        return mockJobs[index];
      }
    }
    throw new Error("Only rejected jobs can be resubmitted");
  }
  
  // POST /api/company/jobs/:id/extend-deadline - Extend job deadline
  if (baseUrl.startsWith("/api/company/jobs/") && baseUrl.includes("/extend-deadline") && method === "POST") {
    const jobId = parseInt(baseUrl.split("/jobs/")[1].split("/")[0] || "0");
    const index = mockJobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      const job = mockJobs[index];
      const newDeadline = data.deadline || data.newDeadline;
      
      if (newDeadline) {
        mockJobs[index].expiresAt = newDeadline;
        mockJobs[index].updatedAt = new Date().toISOString();
        
        return mockJobs[index];
      }
    }
    throw new Error("New deadline is required");
  }
  
  // POST /api/company/jobs/:id/pause - Pause active job
  if (baseUrl.startsWith("/api/company/jobs/") && baseUrl.includes("/pause") && method === "POST") {
    const jobId = parseInt(baseUrl.split("/jobs/")[1].split("/")[0] || "0");
    const index = mockJobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      const job = mockJobs[index];
      
      if (job.status === "public" && job.isActive) {
        mockJobs[index].isActive = false;
        mockJobs[index].updatedAt = new Date().toISOString();
        
        return mockJobs[index];
      }
    }
    throw new Error("Only active public jobs can be paused");
  }
  
  // POST /api/company/jobs/:id/resume - Resume paused job
  if (baseUrl.startsWith("/api/company/jobs/") && baseUrl.includes("/resume") && method === "POST") {
    const jobId = parseInt(baseUrl.split("/jobs/")[1].split("/")[0] || "0");
    const index = mockJobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      const job = mockJobs[index];
      
      if (job.status === "public" && !job.isActive) {
        mockJobs[index].isActive = true;
        mockJobs[index].updatedAt = new Date().toISOString();
        
        return mockJobs[index];
      }
    }
    throw new Error("Only paused public jobs can be resumed");
  }
  
  // POST /api/company/jobs/batch - Batch operations on multiple jobs
  if (baseUrl === "/api/company/jobs/batch" && method === "POST") {
    const { jobIds, action, data: actionData } = data;
    
    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      throw new Error("Job IDs array is required");
    }
    
    const results: any[] = [];
    
    for (const jobId of jobIds) {
      const index = mockJobs.findIndex(j => j.id === jobId);
      if (index !== -1) {
        const job = mockJobs[index];
        
        switch (action) {
          case "delete":
            mockJobs.splice(index, 1);
            results.push({ jobId, success: true });
            break;
          case "pause":
            if (job.status === "public" && job.isActive) {
              mockJobs[index].isActive = false;
              mockJobs[index].updatedAt = new Date().toISOString();
              results.push({ jobId, success: true });
            } else {
              results.push({ jobId, success: false, error: "Only active public jobs can be paused" });
            }
            break;
          case "resume":
            if (job.status === "public" && !job.isActive) {
              mockJobs[index].isActive = true;
              mockJobs[index].updatedAt = new Date().toISOString();
              results.push({ jobId, success: true });
            } else {
              results.push({ jobId, success: false, error: "Only paused public jobs can be resumed" });
            }
            break;
          case "close":
            mockJobs[index].status = "closed";
            mockJobs[index].isActive = false;
            mockJobs[index].updatedAt = new Date().toISOString();
            results.push({ jobId, success: true });
            break;
          case "resubmit":
            if (job.status === "rejected") {
              mockJobs[index].status = "pending";
              mockJobs[index].isActive = false;
              mockJobs[index].rejectionReason = null;
              mockJobs[index].updatedAt = new Date().toISOString();
              
              // Notify admin
              const adminNotificationId = Math.max(...mockNotifications.map(n => n.id), 0) + 1;
              mockNotifications.push({
                id: adminNotificationId,
                type: "job_pending",
                title: "채용공고 재제출",
                message: `"${job.title}" 채용공고가 재제출되었습니다. 승인을 검토해주세요.`,
                isRead: false,
                createdAt: new Date().toISOString(),
                link: `/admin/jobs?id=${jobId}`,
                userId: 3,
              });
              
              results.push({ jobId, success: true });
            } else {
              results.push({ jobId, success: false, error: "Only rejected jobs can be resubmitted" });
            }
            break;
          default:
            results.push({ jobId, success: false, error: `Unknown action: ${action}` });
        }
      } else {
        results.push({ jobId, success: false, error: "Job not found" });
      }
    }
    
    return { results, successCount: results.filter(r => r.success).length, totalCount: results.length };
  }

  // Community endpoints
  if (baseUrl === "/api/community/posts") {
    const mockPosts = [
      {
        id: 1,
        type: 'job_post',
        author: {
          id: 2,
          name: 'MongolTech',
          avatar: '',
          title: 'HR 매니저',
          company: 'MongolTech',
          verified: true
        },
        content: '🚀 몽골테크에서 시니어 풀스택 개발자를 모십니다!\n\n우리와 함께 몽골의 디지털 미래를 만들어갈 개발자를 찾고 있습니다. React, Node.js 경험이 있으신 분들의 많은 지원 바랍니다.',
        metadata: {
          jobTitle: '시니어 풀스택 개발자',
          company: 'MongolTech',
          location: '울란바토르',
          salary: '₮2,500,000 - ₮4,000,000',
          tags: ['React', 'Node.js', 'MongoDB', '풀스택'],
          jobId: 1
        },
        stats: {
          likes: 24,
          comments: 8,
          shares: 5
        },
        userInteraction: {
          liked: true,
          bookmarked: false
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        type: 'career_tip',
        author: {
          id: 1,
          name: '김커리어',
          avatar: '',
          title: '커리어 코치',
          company: 'CareerPath Mongolia',
          verified: false
        },
        content: '💡 면접에서 자주 묻는 질문과 답변 팁!\n\n1. "자신의 강점과 약점은?" - 구체적인 사례와 개선 노력을 함께 말하세요\n2. "5년 후 목표는?" - 회사와 개인의 성장을 연결해서 답하세요\n3. "왜 이 회사를 선택했나?" - 회사의 가치와 본인의 가치관을 연결하세요\n\n준비된 면접은 성공의 첫걸음입니다! 👍',
        stats: {
          likes: 89,
          comments: 23,
          shares: 45
        },
        userInteraction: {
          liked: false,
          bookmarked: true
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        type: 'user_achievement',
        author: {
          id: 1,
          name: '이개발자',
          avatar: '',
          title: 'Frontend Developer',
          company: 'TechStartup',
          verified: false
        },
        content: '🎉 드디어 첫 회사에 입사했습니다!\n\n6개월간의 취업 준비 끝에 꿈꾸던 프론트엔드 개발자로 첫 발을 내딛게 되었습니다. 포기하지 않고 계속 도전한 결과라고 생각합니다.\n\n취업 준비하시는 모든 분들, 힘내세요! 💪',
        stats: {
          likes: 156,
          comments: 34,
          shares: 12
        },
        userInteraction: {
          liked: true,
          bookmarked: false
        },
        createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    return {
      posts: mockPosts,
      total: mockPosts.length,
      page: 1,
      limit: 10
    };
  }

  if (url.includes("/api/community/posts/") && url.includes("/comments")) {
    const postId = parseInt(url.split("/posts/")[1].split("/")[0]);
    return {
      comments: [
        {
          id: 1,
          postId: postId,
          authorId: 1,
          authorName: "김댓글러",
          content: "정말 좋은 정보네요! 감사합니다.",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          postId: postId,
          authorId: 2,
          authorName: "이응원",
          content: "화이팅! 응원합니다!",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
  }

  if (url.includes("/api/community/posts/") && (url.includes("/like") || url.includes("/bookmark") || url.includes("/share"))) {
    return { success: true };
  }

  if (url === "/api/community/posts/report") {
    return { success: true, message: "신고가 접수되었습니다." };
  }

  if (url.includes("/api/users/") && url.includes("/follow")) {
    return { success: true, message: "팔로우했습니다." };
  }

  // Admin Banner Management endpoints
  if (baseUrl === "/api/admin/banners") {
    if (method === "POST" && data) {
      const newId = Math.max(...mockBannersStore.map(b => b.id), 0) + 1;
      const newBanner = {
        id: newId,
        title: data.title,
        content: data.content || "",
        imageUrl: data.imageUrl || "",
        linkUrl: data.linkUrl || "",
        position: data.position || "jobs_header",
        priority: data.priority || 0,
        backgroundColor: data.backgroundColor || "#f59e0b",
        textColor: data.textColor || "#ffffff",
        isActive: data.isActive !== undefined ? data.isActive : true,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        clickCount: 0,
        viewCount: 0,
        createdAt: new Date().toISOString(),
      };
      mockBannersStore.push(newBanner);
      return newBanner;
    }
    if (method === "PUT" && baseUrl.includes("/banners/") && data) {
      const id = parseInt(baseUrl.split("/").pop() || "0");
      const index = mockBannersStore.findIndex(b => b.id === id);
      if (index !== -1) {
        mockBannersStore[index] = {
          ...mockBannersStore[index],
          title: data.title,
          content: data.content || "",
          imageUrl: data.imageUrl || "",
          linkUrl: data.linkUrl || "",
          position: data.position || mockBannersStore[index].position,
          priority: data.priority !== undefined ? data.priority : mockBannersStore[index].priority,
          backgroundColor: data.backgroundColor || mockBannersStore[index].backgroundColor,
          textColor: data.textColor || mockBannersStore[index].textColor,
          isActive: data.isActive !== undefined ? data.isActive : mockBannersStore[index].isActive,
          startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
          endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
          updatedAt: new Date().toISOString(),
        };
        return mockBannersStore[index];
      }
    }
    if (method === "PATCH" && baseUrl.includes("/banners/") && baseUrl.includes("/toggle") && data) {
      const id = parseInt(baseUrl.split("/").slice(-2)[0] || "0");
      const index = mockBannersStore.findIndex(b => b.id === id);
      if (index !== -1) {
        mockBannersStore[index].isActive = data.isActive;
        return mockBannersStore[index];
      }
    }
    if (method === "DELETE" && baseUrl.includes("/banners/")) {
      const id = parseInt(baseUrl.split("/").pop() || "0");
      mockBannersStore = mockBannersStore.filter(b => b.id !== id);
      return { success: true };
    }
    // GET /api/admin/banners
    return mockBannersStore;
  }

  // Banner endpoints (for website display)
  if (url.includes("/api/banners") && !url.includes("/admin")) {
    const urlObj = new URL(url, "http://localhost");
    const position = urlObj.searchParams.get("position") || "all";
    const isActive = urlObj.searchParams.get("isActive") === "true";

    let filteredBanners = [...mockBannersStore];

    // Filter by position
    if (position !== "all") {
      filteredBanners = filteredBanners.filter((b) => b.position === position);
    }

    // Filter by active status
    if (isActive) {
      filteredBanners = filteredBanners.filter((b) => b.isActive === true);
    }

    return filteredBanners;
  }

  // Banner view/click tracking
  if (url.includes("/api/banners/") && (url.includes("/view") || url.includes("/click"))) {
    const id = parseInt(url.split("/").slice(-2)[0] || "0");
    const index = mockBannersStore.findIndex(b => b.id === id);
    if (index !== -1) {
      if (url.includes("/view")) {
        mockBannersStore[index].viewCount = (mockBannersStore[index].viewCount || 0) + 1;
      } else if (url.includes("/click")) {
        mockBannersStore[index].clickCount = (mockBannersStore[index].clickCount || 0) + 1;
      }
      return { success: true };
    }
    return { success: false };
  }

  // Admin Chat endpoints
  if (baseUrl === "/api/admin/chat/rooms") {
    // Transform mockChatRooms to admin format and add more sample data
    const adminChatRooms = [
      ...mockChatRooms.map((room) => ({
        id: room.id,
        jobId: room.jobId || 1,
        jobTitle: room.job?.title || "프론트엔드 개발자",
        candidateId: room.candidateId || 1,
        candidateName: room.candidate?.name || "John Doe",
        candidateEmail: mockUsers[0]?.email || "candidate@example.com",
        employerId: room.employerId || 2,
        employerName: room.employer?.fullName || "Jane Smith",
        employerEmail: mockUsers[1]?.email || "employer@example.com",
        companyId: 1,
        companyName: "TechCorp",
        lastMessage: room.lastMessage || "안녕하세요, 지원하고 싶습니다.",
        lastMessageAt: room.lastMessageAt || new Date().toISOString(),
        unreadCount: room.unreadCount || 0,
        status: (room.status || "active") as "active" | "closed" | "archived",
        createdAt: room.createdAt || new Date().toISOString(),
      })),
      // Additional sample chat rooms for admin
      {
        id: 3,
        jobId: 3,
        jobTitle: "백엔드 개발자",
        candidateId: 4,
        candidateName: "김서준",
        candidateEmail: "seojun.kim@email.com",
        employerId: 2,
        employerName: "Jane Smith",
        employerEmail: "comp@mail.com",
        companyId: 1,
        companyName: "TechCorp",
        lastMessage: "이력서 검토 중입니다. 곧 연락드리겠습니다.",
        lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
        unreadCount: 1,
        status: "active" as const,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 4,
        jobId: 4,
        jobTitle: "UI/UX 디자이너",
        candidateId: 1,
        candidateName: "John Doe",
        candidateEmail: "wizar.temuujin1@gmail.com",
        employerId: 2,
        employerName: "Jane Smith",
        employerEmail: "comp@mail.com",
        companyId: 2,
        companyName: "DesignStudio",
        lastMessage: "포트폴리오 확인했습니다. 면접 일정 조율하겠습니다.",
        lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 0,
        status: "active" as const,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        id: 5,
        jobId: 5,
        jobTitle: "데이터 분석가",
        candidateId: 4,
        candidateName: "김서준",
        candidateEmail: "seojun.kim@email.com",
        employerId: 2,
        employerName: "Jane Smith",
        employerEmail: "comp@mail.com",
        companyId: 3,
        companyName: "DataTech",
        lastMessage: "면접 합격하셨습니다! 축하합니다.",
        lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
        unreadCount: 0,
        status: "closed" as const,
        createdAt: new Date(Date.now() - 604800000).toISOString(),
      },
      {
        id: 6,
        jobId: 6,
        jobTitle: "프로젝트 매니저",
        candidateId: 1,
        candidateName: "John Doe",
        candidateEmail: "wizar.temuujin1@gmail.com",
        employerId: 2,
        employerName: "Jane Smith",
        employerEmail: "comp@mail.com",
        companyId: 1,
        companyName: "TechCorp",
        lastMessage: "채용이 취소되었습니다.",
        lastMessageAt: new Date(Date.now() - 172800000).toISOString(),
        unreadCount: 0,
        status: "archived" as const,
        createdAt: new Date(Date.now() - 1209600000).toISOString(),
      },
    ];

    // Filter by search query if provided
    const urlObj = new URL(url, "http://localhost");
    const search = urlObj.searchParams.get("search");
    const status = urlObj.searchParams.get("status");

    let filtered = adminChatRooms;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (room) =>
          room.candidateName.toLowerCase().includes(searchLower) ||
          room.companyName.toLowerCase().includes(searchLower) ||
          room.jobTitle.toLowerCase().includes(searchLower) ||
          room.employerName.toLowerCase().includes(searchLower)
      );
    }

    if (status && status !== "all") {
      filtered = filtered.filter((room) => room.status === status);
    }

    return filtered;
  }

  if (baseUrl === "/api/admin/chat/stats") {
    const activeRooms = mockChatRooms.filter((r) => r.status === "active" || !r.status).length;
    const closedRooms = mockChatRooms.filter((r) => r.status === "closed").length;
    const archivedRooms = mockChatRooms.filter((r) => r.status === "archived").length;
    
    // Count today's messages
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMessages = mockChatMessages.filter((m) => {
      const msgDate = new Date(m.createdAt);
      return msgDate >= today;
    }).length;

    return {
      totalRooms: mockChatRooms.length,
      activeRooms: activeRooms,
      closedRooms: closedRooms,
      archivedRooms: archivedRooms,
      todayMessages: todayMessages,
      reportedRooms: 0, // Can be added later if needed
    };
  }

  // Admin Reports API
  if (baseUrl === "/api/admin/reports") {
    // Mock reports data
    const mockReports = [
      {
        id: 1,
        type: "user",
        targetId: 4,
        targetName: "김서준",
        reporterId: 5,
        reporterName: "박지혜",
        reporterEmail: "jihye.park@email.com",
        reason: "부적절한 프로필 사진",
        description: "프로필 사진이 부적절합니다. 확인 부탁드립니다.",
        status: "pending",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        type: "job",
        targetId: 1,
        targetName: "Senior Frontend Developer",
        reporterId: 4,
        reporterName: "김서준",
        reporterEmail: "seojun.kim@email.com",
        reason: "사기성 채용공고",
        description: "채용공고 내용과 실제 업무가 다릅니다. 면접 후에 다른 업무를 요구하고 있습니다.",
        status: "pending",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        type: "company",
        targetId: 1,
        targetName: "Tech Mongolia",
        reporterId: 6,
        reporterName: "이동현",
        reporterEmail: "donghyun.lee@email.com",
        reason: "부적절한 회사 정보",
        description: "회사 정보가 거짓입니다. 실제로는 존재하지 않는 회사인 것 같습니다.",
        status: "reviewed",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedBy: 3,
        resolvedByName: "Admin User",
        resolutionNote: "회사 정보 확인 완료. 문제 없음.",
      },
      {
        id: 4,
        type: "user",
        targetId: 5,
        targetName: "박지혜",
        reporterId: 4,
        reporterName: "김서준",
        reporterEmail: "seojun.kim@email.com",
        reason: "스팸 계정",
        description: "스팸 계정으로 보입니다. 반복적인 부적절한 메시지를 보내고 있습니다.",
        status: "resolved",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedBy: 3,
        resolvedByName: "Admin User",
        resolutionNote: "계정 확인 후 경고 조치 완료.",
      },
      {
        id: 5,
        type: "job",
        targetId: 2,
        targetName: "Backend Developer",
        reporterId: 5,
        reporterName: "박지혜",
        reporterEmail: "jihye.park@email.com",
        reason: "차별적 채용공고",
        description: "성별, 나이 등 차별적 내용이 포함되어 있습니다.",
        status: "dismissed",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedBy: 3,
        resolvedByName: "Admin User",
        resolutionNote: "확인 결과 차별적 내용 없음. 기각 처리.",
      },
    ];

    if (method === "GET") {
      let filtered = [...mockReports];

      // Filter by type
      const urlParams = new URLSearchParams(url.split("?")[1] || "");
      const type = urlParams.get("type");
      const status = urlParams.get("status");
      const search = urlParams.get("search");

      if (type && type !== "all") {
        filtered = filtered.filter((r) => r.type === type);
      }

      if (status && status !== "all") {
        filtered = filtered.filter((r) => r.status === status);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.targetName.toLowerCase().includes(searchLower) ||
            r.reporterName.toLowerCase().includes(searchLower) ||
            r.reason.toLowerCase().includes(searchLower) ||
            r.description.toLowerCase().includes(searchLower)
        );
      }

      return filtered;
    }
  }

  // Resolve report
  if (baseUrl.startsWith("/api/admin/reports/") && baseUrl.includes("/resolve") && method === "PUT") {
    const reportId = parseInt(baseUrl.split("/")[4]);
    const { action, note } = data || {};
    
    // In real app, this would update the database
    return {
      id: reportId,
      status: action,
      resolutionNote: note,
      resolvedAt: new Date().toISOString(),
      resolvedBy: 3, // Current admin user ID
      resolvedByName: "Admin User",
    };
  }

  // Report job/user/company
  if (baseUrl === "/api/reports" && method === "POST") {
    const { type, targetId, reason, description } = data || {};
    
    // In real app, this would save to database
    const newReport = {
      id: Math.floor(Math.random() * 10000),
      type,
      targetId,
      reason,
      description,
      reporterId: 1, // Current user ID
      reporterName: "User",
      reporterEmail: "user@example.com",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    
    return newReport;
  }

  // Company Message Templates API
  if (baseUrl === "/api/company/message-templates" && method === "GET") {
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    const type = urlParams.get("type");
    
    const mockTemplates = [
      {
        id: 1,
        type: "reject",
        name: "표준 거절 메시지",
        subject: "지원해주신 채용공고에 대한 안내",
        body: "안녕하세요 {candidateName}님,\n\n{candidateName}님께서 지원해주신 \"{jobTitle}\" 포지션에 대해 검토한 결과, 이번 기회에는 함께하지 못하게 되었습니다.\n\n많은 지원자 중에서 {candidateName}님의 이력서를 검토할 기회를 주셔서 감사합니다.\n\n감사합니다.\n{companyName}",
        isDefault: true,
        variables: ["candidateName", "jobTitle", "companyName"],
      },
      {
        id: 2,
        type: "offer",
        name: "표준 합격 안내",
        subject: "채용 제안 안내",
        body: "안녕하세요 {candidateName}님,\n\n축하합니다! {candidateName}님께서 지원해주신 \"{jobTitle}\" 포지션에 최종 합격하셨습니다.\n\n저희 회사와 함께 성장하실 {candidateName}님을 환영합니다.\n\n감사합니다.\n{companyName}",
        isDefault: true,
        variables: ["candidateName", "jobTitle", "companyName"],
      },
      {
        id: 3,
        type: "interview",
        name: "표준 면접 안내",
        subject: "면접 일정 안내",
        body: "안녕하세요 {candidateName}님,\n\n{candidateName}님께서 지원해주신 \"{jobTitle}\" 포지션의 면접 일정을 안내드립니다.\n\n📅 면접 일시: {interviewDate} {interviewTime}\n📍 면접 장소: {interviewLocation}\n⏱ 소요 시간: 약 {duration}분\n\n면접 준비에 참고하시기 바랍니다.\n\n감사합니다.\n{companyName}",
        isDefault: true,
        variables: ["candidateName", "jobTitle", "interviewDate", "interviewTime", "interviewLocation", "duration", "companyName"],
      },
    ];
    
    if (type) {
      return mockTemplates.filter((t: any) => t.type === type);
    }
    return mockTemplates;
  }

  if (baseUrl === "/api/company/message-templates" && method === "POST") {
    const newTemplate = {
      id: Math.floor(Math.random() * 10000),
      ...data,
      createdAt: new Date().toISOString(),
    };
    return newTemplate;
  }

  if (baseUrl.startsWith("/api/company/message-templates/") && method === "DELETE") {
    const templateId = parseInt(baseUrl.split("/").pop() || "0");
    return { success: true, templateId };
  }

  // Send Message API
  if (baseUrl === "/api/company/send-message" && method === "POST") {
    // In a real app, this would send an email/SMS
    return {
      success: true,
      messageId: Math.floor(Math.random() * 10000),
      sentAt: new Date().toISOString(),
    };
  }

  // Application Reject/Accept with Email
  if (baseUrl.startsWith("/api/company/applications/") && baseUrl.includes("/reject") && method === "PUT") {
    const applicationId = parseInt(baseUrl.split("/applications/")[1].split("/")[0] || "0");
    return { success: true, applicationId, status: "rejected" };
  }

  if (baseUrl.startsWith("/api/company/applications/") && baseUrl.includes("/accept") && method === "PUT") {
    const applicationId = parseInt(baseUrl.split("/applications/")[1].split("/")[0] || "0");
    return { success: true, applicationId, status: "accepted" };
  }

  // Interview Send Notification
  if (baseUrl.startsWith("/api/company/interviews/") && baseUrl.includes("/send-notification") && method === "POST") {
    const interviewId = parseInt(baseUrl.split("/interviews/")[1].split("/")[0] || "0");
    return { success: true, interviewId, sentAt: new Date().toISOString() };
  }

  // Application Timeline API
  if (baseUrl.startsWith("/api/company/applications/") && baseUrl.includes("/timeline") && method === "GET") {
    const applicationId = parseInt(baseUrl.split("/applications/")[1].split("/")[0] || "0");
    const now = new Date();
    
    // Mock timeline events
    const mockTimelineEvents = [
      {
        id: 1,
        type: "document",
        title: "이력서 제출",
        description: "지원자가 이력서를 제출했습니다.",
        timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          documentType: "이력서",
          documentName: "이력서_김민수.pdf",
        },
      },
      {
        id: 2,
        type: "status_change",
        title: "지원 상태 변경",
        description: "지원 상태가 변경되었습니다.",
        timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          oldStatus: "서류 검토",
          newStatus: "면접 대기",
        },
        actor: {
          id: 1,
          name: "박팀장",
        },
      },
      {
        id: 3,
        type: "chat",
        title: "채팅 메시지",
        description: "지원자와 채팅을 시작했습니다.",
        timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          message: "안녕하세요, 면접 일정에 대해 문의드립니다.",
        },
        actor: {
          id: 1,
          name: "김민수",
        },
      },
      {
        id: 4,
        type: "interview",
        title: "면접 일정 추가",
        description: "1차 면접 일정이 추가되었습니다.",
        timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          interviewDate: "2024-06-15 14:00",
          interviewType: "화상면접",
        },
        actor: {
          id: 1,
          name: "박팀장",
        },
      },
      {
        id: 5,
        type: "email",
        title: "면접 안내 이메일 전송",
        description: "면접 일정 안내 이메일이 전송되었습니다.",
        timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        metadata: {
          emailSubject: "면접 일정 안내",
        },
        actor: {
          id: 1,
          name: "시스템",
        },
      },
      {
        id: 6,
        type: "interview",
        title: "면접 완료",
        description: "1차 면접이 완료되었습니다.",
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          interviewDate: "2024-06-15 14:00",
          interviewType: "화상면접",
        },
        actor: {
          id: 1,
          name: "박팀장",
        },
      },
      {
        id: 7,
        type: "evaluation",
        title: "면접 평가 작성",
        description: "면접 평가가 작성되었습니다.",
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        metadata: {
          rating: 4.5,
        },
        actor: {
          id: 1,
          name: "박팀장",
        },
      },
      {
        id: 8,
        type: "note",
        title: "노트 추가",
        description: "지원자에 대한 노트가 추가되었습니다.",
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          message: "우수한 포트폴리오, 팀워크 경험 풍부",
        },
        actor: {
          id: 1,
          name: "박팀장",
        },
      },
    ];
    
    return mockTimelineEvents;
  }

  // Default: return empty array
  return [];
};

// Simulate network delay
export const mockDelay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));