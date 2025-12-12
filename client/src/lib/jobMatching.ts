// Job Matching Algorithm
// Matches user requirements with company job postings

interface UserProfile {
  id: number;
  skills?: string[];
  preferredIndustry?: string[];
  careerLevel?: "entry" | "junior" | "mid" | "senior" | "executive";
  salaryExpectation?: string;
  workAvailability?: "immediate" | "2weeks" | "1month" | "negotiable";
  preferredLocation?: string[];
  preferredWorkType?: string[];
  location?: string;
  experience?: string;
  major?: string;
}

interface Job {
  id: number;
  title: string;
  companyId: number;
  company?: {
    id: number;
    name: string;
  };
  skills?: string[];
  experienceLevel?: "entry" | "junior" | "mid" | "senior" | "expert";
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  employmentType?: string;
  industry?: string;
  isRemote?: boolean;
  description?: string;
  requirements?: string;
}

interface MatchResult {
  job: Job;
  matchScore: number;
  matchReasons: string[];
  matchedSkills: string[];
  missingSkills: string[];
}

// Career level mapping
const careerLevelMap: Record<string, number> = {
  entry: 0,
  junior: 1,
  mid: 2,
  senior: 3,
  executive: 4,
  expert: 4,
};

// Parse salary expectation string to number range
function parseSalaryExpectation(salaryStr?: string): { min: number; max: number } | null {
  if (!salaryStr) return null;
  
  // Handle formats like "6000-8000만원", "6000만원", "6-8M"
  const match = salaryStr.match(/(\d+)\s*[-~]\s*(\d+)/);
  if (match) {
    const min = parseInt(match[1]) * 10000; // Convert to MNT (assuming 만원)
    const max = parseInt(match[2]) * 10000;
    return { min, max };
  }
  
  const singleMatch = salaryStr.match(/(\d+)/);
  if (singleMatch) {
    const value = parseInt(singleMatch[1]) * 10000;
    return { min: value * 0.8, max: value * 1.2 }; // ±20% range
  }
  
  return null;
}

// Calculate skills match score
function calculateSkillsMatch(userSkills: string[] = [], jobSkills: string[] = []): {
  score: number;
  matched: string[];
  missing: string[];
} {
  if (jobSkills.length === 0) return { score: 50, matched: [], missing: [] };
  if (userSkills.length === 0) return { score: 0, matched: [], missing: jobSkills };
  
  const userSkillsLower = userSkills.map(s => s.toLowerCase().trim());
  const jobSkillsLower = jobSkills.map(s => s.toLowerCase().trim());
  
  const matched: string[] = [];
  const missing: string[] = [];
  
  jobSkillsLower.forEach(jobSkill => {
    const found = userSkillsLower.some(userSkill => 
      userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
    );
    if (found) {
      matched.push(jobSkills[jobSkillsLower.indexOf(jobSkill)]);
    } else {
      missing.push(jobSkills[jobSkillsLower.indexOf(jobSkill)]);
    }
  });
  
  const matchRatio = matched.length / jobSkills.length;
  const score = Math.round(matchRatio * 100);
  
  return { score, matched, missing };
}

// Calculate career level match
function calculateCareerLevelMatch(
  userLevel?: string,
  jobLevel?: string
): { score: number; reason?: string } {
  if (!userLevel || !jobLevel) return { score: 50 };
  
  const userNum = careerLevelMap[userLevel] ?? 2;
  const jobNum = careerLevelMap[jobLevel] ?? 2;
  
  const diff = Math.abs(userNum - jobNum);
  
  if (diff === 0) return { score: 100, reason: "경력 수준이 정확히 일치합니다" };
  if (diff === 1) return { score: 75, reason: "경력 수준이 유사합니다" };
  if (userNum > jobNum) return { score: 60, reason: "경력이 요구사항보다 높습니다" };
  return { score: 40, reason: "경력이 요구사항보다 낮습니다" };
}

// Calculate salary match
function calculateSalaryMatch(
  userExpectation?: string,
  jobMin?: number,
  jobMax?: number
): { score: number; reason?: string } {
  if (!userExpectation || !jobMin) return { score: 50 };
  
  const userRange = parseSalaryExpectation(userExpectation);
  if (!userRange) return { score: 50 };
  
  const userMin = userRange.min;
  const userMax = userRange.max;
  const jobSalaryMax = jobMax || jobMin * 1.5;
  
  // Perfect match: user range overlaps with job range
  if (userMin <= jobSalaryMax && userMax >= jobMin) {
    return { score: 100, reason: "급여 범위가 일치합니다" };
  }
  
  // User expects more than job offers
  if (userMin > jobSalaryMax) {
    const diff = ((userMin - jobSalaryMax) / jobSalaryMax) * 100;
    if (diff < 20) return { score: 70, reason: "급여가 약간 높습니다" };
    if (diff < 50) return { score: 50, reason: "급여가 높습니다" };
    return { score: 30, reason: "급여가 훨씬 높습니다" };
  }
  
  // Job offers more than user expects
  if (userMax < jobMin) {
    return { score: 90, reason: "급여가 희망보다 높습니다" };
  }
  
  return { score: 50 };
}

// Calculate location match
function calculateLocationMatch(
  userLocation?: string,
  userPreferredLocations?: string[],
  jobLocation?: string,
  isRemote?: boolean
): { score: number; reason?: string } {
  if (isRemote) return { score: 100, reason: "원격 근무 가능" };
  
  if (!jobLocation) return { score: 50 };
  
  if (userLocation && jobLocation.toLowerCase().includes(userLocation.toLowerCase())) {
    return { score: 100, reason: "위치가 일치합니다" };
  }
  
  if (userPreferredLocations && userPreferredLocations.length > 0) {
    const match = userPreferredLocations.some(pref => 
      jobLocation.toLowerCase().includes(pref.toLowerCase())
    );
    if (match) return { score: 80, reason: "희망 지역과 일치합니다" };
  }
  
  return { score: 40, reason: "위치가 다릅니다" };
}

// Calculate industry match
function calculateIndustryMatch(
  userPreferredIndustries?: string[],
  jobIndustry?: string
): { score: number; reason?: string } {
  if (!jobIndustry) return { score: 50 };
  if (!userPreferredIndustries || userPreferredIndustries.length === 0) {
    return { score: 50 };
  }
  
  const match = userPreferredIndustries.some(industry =>
    jobIndustry.toLowerCase().includes(industry.toLowerCase()) ||
    industry.toLowerCase().includes(jobIndustry.toLowerCase())
  );
  
  if (match) return { score: 100, reason: "희망 산업과 일치합니다" };
  return { score: 40, reason: "산업 분야가 다릅니다" };
}

// Main matching function
export function matchUserWithJobs(user: UserProfile, jobs: Job[]): MatchResult[] {
  const results: MatchResult[] = [];
  
  jobs.forEach(job => {
    let totalScore = 0;
    let weightSum = 0;
    const reasons: string[] = [];
    
    // Skills match (weight: 40%)
    const skillsMatch = calculateSkillsMatch(user.skills, job.skills);
    totalScore += skillsMatch.score * 0.4;
    weightSum += 0.4;
    if (skillsMatch.matched.length > 0) {
      reasons.push(`${skillsMatch.matched.length}개 기술 일치`);
    }
    
    // Career level match (weight: 20%)
    const careerMatch = calculateCareerLevelMatch(user.careerLevel, job.experienceLevel);
    totalScore += careerMatch.score * 0.2;
    weightSum += 0.2;
    if (careerMatch.reason) {
      reasons.push(careerMatch.reason);
    }
    
    // Salary match (weight: 15%)
    const salaryMatch = calculateSalaryMatch(user.salaryExpectation, job.salaryMin, job.salaryMax);
    totalScore += salaryMatch.score * 0.15;
    weightSum += 0.15;
    if (salaryMatch.reason) {
      reasons.push(salaryMatch.reason);
    }
    
    // Location match (weight: 10%)
    const locationMatch = calculateLocationMatch(
      user.location,
      user.preferredLocation,
      job.location,
      job.isRemote
    );
    totalScore += locationMatch.score * 0.1;
    weightSum += 0.1;
    if (locationMatch.reason) {
      reasons.push(locationMatch.reason);
    }
    
    // Industry match (weight: 10%)
    const industryMatch = calculateIndustryMatch(user.preferredIndustry, job.industry);
    totalScore += industryMatch.score * 0.1;
    weightSum += 0.1;
    if (industryMatch.reason) {
      reasons.push(industryMatch.reason);
    }
    
    // Work type match (weight: 5%)
    // This is a simple check - can be enhanced
    let workTypeScore = 50;
    if (user.preferredWorkType && job.employmentType) {
      const match = user.preferredWorkType.some(type =>
        job.employmentType?.toLowerCase().includes(type.toLowerCase())
      );
      workTypeScore = match ? 100 : 30;
    }
    totalScore += workTypeScore * 0.05;
    weightSum += 0.05;
    
    // Calculate final score
    const finalScore = weightSum > 0 ? Math.round(totalScore / weightSum) : 0;
    
    // Only include jobs with at least 30% match
    if (finalScore >= 30) {
      results.push({
        job,
        matchScore: finalScore,
        matchReasons: reasons.length > 0 ? reasons : ["기본 매칭"],
        matchedSkills: skillsMatch.matched,
        missingSkills: skillsMatch.missing,
      });
    }
  });
  
  // Sort by match score (highest first)
  results.sort((a, b) => b.matchScore - a.matchScore);
  
  return results;
}

// Get match quality label
export function getMatchQualityLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "완벽한 매칭", color: "bg-green-500" };
  if (score >= 75) return { label: "매우 좋은 매칭", color: "bg-blue-500" };
  if (score >= 60) return { label: "좋은 매칭", color: "bg-purple-500" };
  if (score >= 45) return { label: "보통 매칭", color: "bg-yellow-500" };
  return { label: "낮은 매칭", color: "bg-orange-500" };
}

