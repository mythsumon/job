export interface JobFilters {
  search?: string;
  location?: string;
  industry?: string;
  experience?: string;
  type?: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote?: boolean;
  isFeatured?: boolean;
  companyId?: number;
}

export interface SearchSuggestion {
  type: 'job' | 'company';
  title: string;
  company?: string;
  id: number;
}

export interface Stats {
  totalJobs: number;
  totalCompanies: number;
  featuredJobs: number;
  activeJobs: number;
}

export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: '신입 (0-2년)' },
  { value: 'junior', label: '주니어 (3-5년)' },
  { value: 'mid', label: '미드 (3-7년)' },
  { value: 'senior', label: '시니어 (6-10년)' },
  { value: 'expert', label: '전문가 (10년+)' }
];

export const JOB_TYPES = [
  { value: 'full_time', label: '정규직' },
  { value: 'contract', label: '계약직' },
  { value: 'freelance', label: '프리랜서' },
  { value: 'internship', label: '인턴십' }
];

export const SALARY_RANGES = [
  { value: 20000000, label: '2,000만원 이하' },
  { value: 40000000, label: '2,000-4,000만원' },
  { value: 60000000, label: '4,000-6,000만원' },
  { value: 60000000, label: '6,000만원 이상' }
];

export const COMPANY_SIZES = [
  { value: 'startup', label: '스타트업 (1-50명)' },
  { value: 'small', label: '중소기업 (51-300명)' },
  { value: 'medium', label: '중견기업 (301-1000명)' },
  { value: 'large', label: '대기업 (1000명+)' }
];

export const INDUSTRIES = [
  'IT/소프트웨어',
  '금융/은행',
  '광업/자원개발',
  'IT/인터넷',
  '통신/네트워크',
  '의료/헬스케어',
  '제조업',
  '교육',
  '마케팅/광고',
  '건설/부동산',
  '유통/소매',
  '운송/물류',
  '미디어/엔터테인먼트',
  '컨설팅',
  '정부/공공기관'
];

// 사용자 프로필에서 사용하는 희망 근무 분야 옵션 (복수 선택 가능)
export const PREFERRED_INDUSTRIES = [
  'IT/소프트웨어',
  '이커머스',
  '금융/은행',
  '교육',
  '마케팅/광고',
  '건설/부동산',
  '게임',
  '스타트업',
  '제조업',
  '미디어/엔터테인먼트',
  '디자인',
  '에너지',
  '핀테크',
  '대기업',
  '의료/헬스케어',
  '컨설팅',
  '물류/유통',
  '공공기관'
];

export const LOCATIONS = [
  '울란바토르',
  '다르한',
  '에르데네트',
  '초이발산',
  '무룬',
  '바양홍고르',
  '울기',
  '항가이',
  '수흐바타르',
  '만달고비'
];