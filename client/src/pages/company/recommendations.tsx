import React, { useState, useEffect } from "react";
import { CompanyLayout } from "@/components/company/company-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  UserCheck,
  Search,
  Filter,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Send,
  Target,
  Users,
  FileText,
  Calendar,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { CandidateProfileDialog } from "@/components/company/candidate-profile-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/queryClient";

// Transform jobseeker profile data to recommendation format
const transformJobseekerToRecommendation = (user: any, index: number): any => {
  // Calculate match score based on profile completeness and skills
  let matchScore = 60; // Base score
  if (user.skills && user.skills.length > 0) matchScore += Math.min(user.skills.length * 5, 20);
  if (user.experience) matchScore += 10;
  if (user.education) matchScore += 5;
  if (user.bio) matchScore += 5;
  
  // Generate match reasons based on profile data
  const matchReasons: string[] = [];
  if (user.skills && user.skills.length > 0) {
    matchReasons.push(`${user.skills[0]} 전문 기술 보유`);
  }
  if (user.experience) {
    matchReasons.push(`${user.experience} 경력 보유`);
  }
  if (user.education) {
    matchReasons.push(`${user.education} 학력`);
  }
  if (user.bio) {
    matchReasons.push("프로필 정보가 상세함");
  }
  
  // Generate highlights from skills and bio
  const highlights: string[] = [];
  if (user.skills && user.skills.length > 0) {
    highlights.push(`${user.skills.slice(0, 2).join(", ")} 전문가`);
  }
  if (user.bio) {
    highlights.push("프로필 완성도 높음");
  }
  
  // Parse experience to get years
  const experienceYears = user.experience ? parseInt(user.experience.replace(/[^0-9]/g, "")) || 0 : 0;
  const experienceText = experienceYears > 0 ? `${experienceYears}년` : "신입";
  
  // Determine current role based on experience
  let currentRole = "개발자";
  if (experienceYears >= 5) currentRole = "시니어 개발자";
  else if (experienceYears >= 3) currentRole = "개발자";
  else if (experienceYears >= 1) currentRole = "주니어 개발자";
  
  // Calculate last active (mock for now)
  const lastActiveOptions = ["방금 전", "1시간 전", "2시간 전", "3시간 전", "1일 전", "2일 전"];
  const lastActive = lastActiveOptions[index % lastActiveOptions.length];
  
  return {
    id: user.id,
    name: user.fullName || user.name || `인재 ${user.id}`,
    email: user.email,
    avatar: (user.fullName || user.name || "U")[0]?.toUpperCase() || "U",
    currentRole: currentRole,
    company: user.dreamCompany || "현재 회사",
    location: user.location || "위치 미입력",
    experience: experienceText,
    education: user.education || "학력 정보 없음",
    skills: user.skills || [],
    matchScore: Math.min(matchScore, 100),
    salaryExpectation: user.salaryExpectation || "협의 가능",
    availableFrom: user.workAvailability === "immediate" ? "즉시 가능" : "협의 가능",
    lastActive: lastActive,
    profileViews: Math.floor(Math.random() * 1000) + 100,
    isOpenToOffers: user.workAvailability !== undefined,
    matchReasons: matchReasons.length > 0 ? matchReasons : ["프로필이 등록되어 있습니다"],
    highlights: highlights.length > 0 ? highlights : ["활발한 활동"],
    // Keep original user data for reference
    userId: user.id,
    userData: user,
  };
};

const searchFilters = [
  { label: "프론트엔드 개발자", count: 234, category: "직무" },
  { label: "React 전문가", count: 156, category: "기술" },
  { label: "3-5년 경력", count: 189, category: "경력" },
  { label: "서울 거주", count: 445, category: "지역" },
  { label: "이직 준비 중", count: 89, category: "상태" },
];

export default function CompanyRecommendations() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTalent, setSelectedTalent] = useState<any>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [savedTalents, setSavedTalents] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("match");
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [isCustomSearchOpen, setIsCustomSearchOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedTalentForSchedule, setSelectedTalentForSchedule] = useState<any>(null);

  // Fetch AI-recommended jobseekers (candidates) from API
  const { data: jobseekers = [], isLoading: isLoadingJobseekers } = useQuery({
    queryKey: ["/api/recommendations"],
    queryFn: async () => {
      try {
        // Try recommendations endpoint first (AI-powered)
        return await apiGet("/api/recommendations");
      } catch {
        // Fallback to regular talents endpoint
        return await apiGet("/api/talents");
      }
    },
  });

  // Transform jobseekers to recommendation format
  const recommendedTalents = React.useMemo(() => {
    return Array.isArray(jobseekers) 
      ? jobseekers.map((user: any, index: number) => transformJobseekerToRecommendation(user, index))
      : [];
  }, [jobseekers]);

  const [displayedTalents, setDisplayedTalents] = useState(recommendedTalents);

  // Update displayed talents when jobseekers data changes
  useEffect(() => {
    if (recommendedTalents.length > 0) {
      setDisplayedTalents(recommendedTalents);
    } else {
      setDisplayedTalents([]);
    }
  }, [recommendedTalents]);

  const handleViewProfile = (talent: any) => {
    setSelectedTalent(talent);
    setIsProfileDialogOpen(true);
  };

  const handleStartChat = (talent: any) => {
    setLocation(`/company/chat?talent=${talent.id}`);
    toast({
      title: t("common.success") || "성공",
      description: `${talent.name}님과의 채팅을 시작합니다.`,
    });
  };

  const handleAddToPipeline = (talent: any) => {
    setLocation(`/company/pipeline?addTalent=${talent.id}`);
    toast({
      title: t("common.success") || "성공",
      description: `${talent.name}님을 파이프라인에 추가했습니다.`,
    });
  };

  const handleSaveTalent = (talentId: number) => {
    if (savedTalents.includes(talentId)) {
      setSavedTalents(savedTalents.filter(id => id !== talentId));
      toast({
        title: t("common.success") || "성공",
        description: "관심 인재 목록에서 제거했습니다.",
      });
    } else {
      setSavedTalents([...savedTalents, talentId]);
      toast({
        title: t("common.success") || "성공",
        description: "관심 인재 목록에 추가했습니다.",
      });
    }
  };

  const handleViewApplications = () => {
    setLocation("/company/applications");
  };

  const handleViewTalents = () => {
    setLocation("/company/talents");
  };

  const handleViewPipeline = () => {
    setLocation("/company/pipeline");
  };

  const handleSearch = () => {
    let filtered = [...recommendedTalents];
    
    // 검색어 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter(talent => 
        talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // 경력 필터
    if (experienceFilter !== "all") {
      filtered = filtered.filter(talent => {
        const exp = parseInt(talent.experience);
        if (experienceFilter === "junior") return exp >= 1 && exp < 3;
        if (experienceFilter === "mid") return exp >= 3 && exp < 5;
        if (experienceFilter === "senior") return exp >= 5;
        return true;
      });
    }
    
    // 선택된 필터 적용
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(talent => {
        return selectedFilters.some(filter => {
          if (filter.includes("프론트엔드")) return talent.currentRole.includes("프론트엔드");
          if (filter.includes("React")) return talent.skills.includes("React");
          if (filter.includes("3-5년")) {
            const exp = parseInt(talent.experience);
            return exp >= 3 && exp < 5;
          }
          if (filter.includes("서울")) return talent.location.includes("서울");
          if (filter.includes("이직")) return talent.isOpenToOffers;
          return false;
        });
      });
    }
    
    // 정렬
    filtered.sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      if (sortBy === "active") {
        const aTime = parseInt(a.lastActive);
        const bTime = parseInt(b.lastActive);
        return aTime - bTime;
      }
      if (sortBy === "experience") {
        return parseInt(b.experience) - parseInt(a.experience);
      }
      if (sortBy === "salary") {
        const aSalary = parseInt(a.salaryExpectation.split("-")[0].replace(/[^0-9]/g, ""));
        const bSalary = parseInt(b.salaryExpectation.split("-")[0].replace(/[^0-9]/g, ""));
        return bSalary - aSalary;
      }
      return 0;
    });
    
    setDisplayedTalents(filtered);
    toast({
      title: t("common.success") || "성공",
      description: `${filtered.length}명의 인재를 찾았습니다.`,
    });
  };

  const handleFilterClick = (filterLabel: string) => {
    if (selectedFilters.includes(filterLabel)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filterLabel));
    } else {
      setSelectedFilters([...selectedFilters, filterLabel]);
    }
    // 필터 변경 시 자동 검색
    setTimeout(() => handleSearch(), 100);
  };

  const handleScheduleInterview = (talent: any) => {
    setSelectedTalentForSchedule(talent);
    setIsScheduleDialogOpen(true);
  };

  const handleScheduleSubmit = () => {
    toast({
      title: t("common.success") || "성공",
      description: "면접 일정이 추가되었습니다.",
    });
    setIsScheduleDialogOpen(false);
    setLocation("/company/interviews");
  };

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('companyRecommendations.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('companyRecommendations.subtitle')}
          </p>
        </div>

        {/* Search - 최상단 */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    placeholder="직무, 기술, 회사명으로 검색..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 h-12 text-base"
                  />
                </div>
              </div>
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger className="w-48 h-12">
                  <SelectValue placeholder="경력" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 경력</SelectItem>
                  <SelectItem value="junior">1-3년</SelectItem>
                  <SelectItem value="mid">3-5년</SelectItem>
                  <SelectItem value="senior">5년 이상</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="h-12 px-6">검색</Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Navigation Buttons - 검색 아래 */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" onClick={handleViewApplications} size="sm">
            <FileText className="h-4 w-4 mr-2" />
            {t('companyNav.applications') || '지원자 관리'}
          </Button>
          <Button variant="outline" onClick={handleViewTalents} size="sm">
            <Users className="h-4 w-4 mr-2" />
            {t('companyNav.talents') || '인재풀'}
          </Button>
          <Button variant="outline" onClick={handleViewPipeline} size="sm">
            <Target className="h-4 w-4 mr-2" />
            {t('companyNav.pipeline') || '파이프라인'}
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsAdvancedFilterOpen(true)}
            size="sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            {t('companyRecommendations.advancedFilter')}
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600"
            onClick={() => setIsCustomSearchOpen(true)}
            size="sm"
          >
            <Target className="h-4 w-4 mr-2" />
            {t('companyRecommendations.customSearch')}
          </Button>
        </div>

        {/* Stats Cards - 검색 아래 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow" onClick={handleViewTalents}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyRecommendations.stats.recommendedTalents')}</p>
                  <p className="text-2xl font-bold text-blue-600">{recommendedTalents.length}</p>
                  <p className="text-xs text-gray-500 mt-1">클릭하여 인재풀 보기</p>
                </div>
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyRecommendations.stats.averageMatch')}</p>
                  <p className="text-2xl font-bold text-green-600">88%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setLocation("/company/chat")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyRecommendations.stats.contactable')}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {recommendedTalents.filter(talent => talent.isOpenToOffers).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">클릭하여 채팅 보기</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow" onClick={handleViewPipeline}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyRecommendations.stats.totalTalentPool')}</p>
                  <p className="text-2xl font-bold text-orange-600">2,341</p>
                  <p className="text-xs text-gray-500 mt-1">클릭하여 파이프라인 보기</p>
                </div>
                <Search className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - 추천 인재 */}
          <div className="lg:col-span-3">

            {/* Recommended Talents */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isLoadingJobseekers ? (
                    "AI 추천 인재를 불러오는 중..."
                  ) : (
                    `추천 인재 (${displayedTalents.length})`
                  )}
                </h2>
                <Select value={sortBy} onValueChange={(value) => {
                  setSortBy(value);
                  handleSearch();
                }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="정렬 기준" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">매칭률 높은 순</SelectItem>
                    <SelectItem value="active">최근 활동 순</SelectItem>
                    <SelectItem value="experience">경력 순</SelectItem>
                    <SelectItem value="salary">연봉 순</SelectItem>
                  </SelectContent>
                </Select>
              </div>

          {isLoadingJobseekers ? (
            <div className="grid gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="h-16 w-16 bg-gray-300 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6">
              {displayedTalents.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    검색 결과가 없습니다
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    다른 검색어나 필터를 시도해보세요.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setExperienceFilter("all");
                      setSelectedFilters([]);
                      setDisplayedTalents(recommendedTalents);
                    }}
                  >
                    필터 초기화
                  </Button>
                </CardContent>
              </Card>
            ) : (
              displayedTalents.map((talent) => (
              <Card key={talent.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold">
                          {talent.avatar}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {talent.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-green-100 text-green-800">
                              {talent.matchScore}% 매칭
                            </Badge>
                            {talent.isOpenToOffers && (
                              <Badge className="bg-blue-100 text-blue-800">
                                연락 가능
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-lg text-blue-600 font-medium">
                            {talent.currentRole}
                          </p>
                          <p className="text-gray-600">
                            {talent.company} • {talent.experience}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {talent.location}
                          </div>
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-1" />
                            {talent.education}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {talent.lastActive}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">매칭률</span>
                            <span className="text-sm font-medium text-blue-600">{talent.matchScore}%</span>
                          </div>
                          <Progress value={talent.matchScore} className="h-2" />
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">핵심 기술</p>
                          <div className="flex flex-wrap gap-2">
                            {talent.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">하이라이트</p>
                          <div className="flex flex-wrap gap-2">
                            {talent.highlights.map((highlight, index) => (
                              <Badge key={index} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                            왜 추천되었나요?
                          </p>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            {talent.matchReasons.map((reason, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <span className="text-gray-500">희망 연봉:</span>
                            <p className="font-medium">{talent.salaryExpectation}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">입사 가능일:</span>
                            <p className="font-medium">{talent.availableFrom}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">프로필 조회:</span>
                            <p className="font-medium">{talent.profileViews.toLocaleString()}회</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-green-500 to-green-600"
                        onClick={() => handleStartChat(talent)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        {t('companyRecommendations.actions.contact') || '연락하기'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewProfile(talent)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t('companyRecommendations.actions.viewProfile') || '프로필 보기'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSaveTalent(talent.id)}
                        className={savedTalents.includes(talent.id) ? "bg-red-50 border-red-200 text-red-600" : ""}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${savedTalents.includes(talent.id) ? "fill-red-600" : ""}`} />
                        {savedTalents.includes(talent.id) ? "저장됨" : (t('companyRecommendations.actions.saveToList') || '관심 인재')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddToPipeline(talent)}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        {t('companyRecommendations.actions.sendOffer') || '파이프라인 추가'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleScheduleInterview(talent)}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        면접 일정
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
              </div>
            )}
            </div>

            {/* Load More */}
            {displayedTalents.length > 0 && (
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    toast({
                      title: t("common.info") || "정보",
                      description: "더 많은 인재를 불러오는 중...",
                    });
                    // 실제로는 API 호출로 더 많은 데이터를 가져옴
                  }}
                >
                  {t('companyRecommendations.loadMore') || '더 많은 인재 보기'}
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar - 필터 그룹화 */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
              {/* 인기 필터 */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Filter className="h-4 w-4 mr-2 text-purple-600" />
                    인기 필터
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {searchFilters.map((filter, index) => (
                      <Button
                        key={index}
                        variant={selectedFilters.includes(filter.label) ? "default" : "outline"}
                        size="sm"
                        className={`w-full justify-between text-left ${
                          selectedFilters.includes(filter.label) ? "bg-blue-600 text-white" : ""
                        }`}
                        onClick={() => handleFilterClick(filter.label)}
                      >
                        <span className="text-xs">{filter.label}</span>
                        <Badge variant={selectedFilters.includes(filter.label) ? "secondary" : "secondary"} className="text-xs">
                          {filter.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 필터 그룹화 */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">필터 그룹</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 직무 필터 */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">직무</p>
                    <div className="space-y-1">
                      {searchFilters.filter(f => f.category === "직무").map((filter, index) => (
                        <Button
                          key={index}
                          variant={selectedFilters.includes(filter.label) ? "default" : "outline"}
                          size="sm"
                          className={`w-full justify-start text-xs ${
                            selectedFilters.includes(filter.label) ? "bg-blue-600 text-white" : ""
                          }`}
                          onClick={() => handleFilterClick(filter.label)}
                        >
                          {filter.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 기술 필터 */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">기술</p>
                    <div className="space-y-1">
                      {searchFilters.filter(f => f.category === "기술").map((filter, index) => (
                        <Button
                          key={index}
                          variant={selectedFilters.includes(filter.label) ? "default" : "outline"}
                          size="sm"
                          className={`w-full justify-start text-xs ${
                            selectedFilters.includes(filter.label) ? "bg-blue-600 text-white" : ""
                          }`}
                          onClick={() => handleFilterClick(filter.label)}
                        >
                          {filter.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 경력 필터 */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">경력</p>
                    <div className="space-y-1">
                      {searchFilters.filter(f => f.category === "경력").map((filter, index) => (
                        <Button
                          key={index}
                          variant={selectedFilters.includes(filter.label) ? "default" : "outline"}
                          size="sm"
                          className={`w-full justify-start text-xs ${
                            selectedFilters.includes(filter.label) ? "bg-blue-600 text-white" : ""
                          }`}
                          onClick={() => handleFilterClick(filter.label)}
                        >
                          {filter.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 지역 필터 */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">지역</p>
                    <div className="space-y-1">
                      {searchFilters.filter(f => f.category === "지역").map((filter, index) => (
                        <Button
                          key={index}
                          variant={selectedFilters.includes(filter.label) ? "default" : "outline"}
                          size="sm"
                          className={`w-full justify-start text-xs ${
                            selectedFilters.includes(filter.label) ? "bg-blue-600 text-white" : ""
                          }`}
                          onClick={() => handleFilterClick(filter.label)}
                        >
                          {filter.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 상태 필터 */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">상태</p>
                    <div className="space-y-1">
                      {searchFilters.filter(f => f.category === "상태").map((filter, index) => (
                        <Button
                          key={index}
                          variant={selectedFilters.includes(filter.label) ? "default" : "outline"}
                          size="sm"
                          className={`w-full justify-start text-xs ${
                            selectedFilters.includes(filter.label) ? "bg-blue-600 text-white" : ""
                          }`}
                          onClick={() => handleFilterClick(filter.label)}
                        >
                          {filter.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Candidate Profile Dialog */}
        {selectedTalent && (
          <CandidateProfileDialog
            open={isProfileDialogOpen}
            onOpenChange={setIsProfileDialogOpen}
            candidate={{
              id: selectedTalent.id,
              name: selectedTalent.name,
              email: selectedTalent.email,
              location: selectedTalent.location,
              avatar: selectedTalent.avatar,
              profileImage: selectedTalent.userData?.profilePicture,
              experience: selectedTalent.experience,
              education: selectedTalent.education,
              skills: selectedTalent.skills,
              bio: selectedTalent.userData?.bio || selectedTalent.highlights?.join(", ") || "",
            }}
            candidateUserId={selectedTalent.userId || selectedTalent.id}
            resumeId={selectedTalent.userData?.resumeId}
          />
        )}

        {/* Advanced Filter Dialog */}
        <Dialog open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('companyRecommendations.advancedFilter') || '고급 필터'}</DialogTitle>
              <DialogDescription>
                더 세밀한 조건으로 인재를 검색하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">기술 스택</label>
                <div className="flex flex-wrap gap-2">
                  {["React", "Vue.js", "TypeScript", "Node.js", "Python", "Java"].map((skill) => (
                    <Button
                      key={skill}
                      variant={selectedFilters.includes(skill) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterClick(skill)}
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">지역</label>
                <div className="flex flex-wrap gap-2">
                  {["서울", "경기", "부산", "대전"].map((location) => (
                    <Button
                      key={location}
                      variant={selectedFilters.includes(location) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterClick(location)}
                    >
                      {location}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">연봉 범위</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="최소 연봉 (만원)" />
                  <Input type="number" placeholder="최대 연봉 (만원)" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setSelectedFilters([]);
                  setIsAdvancedFilterOpen(false);
                }}>
                  초기화
                </Button>
                <Button onClick={() => {
                  handleSearch();
                  setIsAdvancedFilterOpen(false);
                }}>
                  적용
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Custom Search Dialog */}
        <Dialog open={isCustomSearchOpen} onOpenChange={setIsCustomSearchOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('companyRecommendations.customSearch') || '커스텀 검색'}</DialogTitle>
              <DialogDescription>
                AI가 추천하는 인재를 찾기 위한 조건을 입력하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">원하는 직무</label>
                <Input placeholder="예: 프론트엔드 개발자" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">필수 기술</label>
                <Input placeholder="예: React, TypeScript, Next.js" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">추가 요구사항</label>
                <Textarea placeholder="예: 대기업 경력, 팀 리딩 경험, 오픈소스 기여" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCustomSearchOpen(false)}>
                  취소
                </Button>
                <Button onClick={() => {
                  toast({
                    title: t("common.success") || "성공",
                    description: "AI가 맞춤 인재를 추천하고 있습니다...",
                  });
                  setIsCustomSearchOpen(false);
                }}>
                  AI 추천 받기
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Interview Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('companyInterviews.addInterviewDialog.title') || '면접 일정 추가'}</DialogTitle>
              <DialogDescription>
                {selectedTalentForSchedule && (
                  <>
                    {selectedTalentForSchedule.name}님과의 면접 일정을 잡아주세요.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t('companyInterviews.form.interviewer') || '면접관'}</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('companyInterviews.form.interviewerPlaceholder') || '면접관 선택'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t('companyInterviews.form.interviewerExample1') || '박팀장'}</SelectItem>
                      <SelectItem value="2">{t('companyInterviews.form.interviewerExample2') || '최CTO'}</SelectItem>
                      <SelectItem value="3">{t('companyInterviews.form.interviewerExample3') || '김부장'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('companyInterviews.form.type') || '면접 유형'}</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('companyInterviews.form.typePlaceholder') || '유형 선택'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">{t('companyInterviews.types.video') || '화상면접'}</SelectItem>
                      <SelectItem value="inPerson">{t('companyInterviews.types.inPerson') || '대면면접'}</SelectItem>
                      <SelectItem value="phone">{t('companyInterviews.types.phone') || '전화면접'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t('companyInterviews.form.date') || '날짜'}</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('companyInterviews.form.time') || '시간'}</label>
                  <Input type="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t('companyInterviews.form.duration') || '소요시간'}</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('companyInterviews.form.durationPlaceholder') || '시간 선택'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">{t('companyInterviews.form.duration30') || '30분'}</SelectItem>
                      <SelectItem value="60">{t('companyInterviews.form.duration60') || '60분'}</SelectItem>
                      <SelectItem value="90">{t('companyInterviews.form.duration90') || '90분'}</SelectItem>
                      <SelectItem value="120">{t('companyInterviews.form.duration120') || '120분'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('companyInterviews.form.location') || '장소 / 링크'}</label>
                  <Input placeholder={t('companyInterviews.form.locationPlaceholder') || '회의실 또는 화상회의 링크'} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">{t('companyInterviews.form.notes') || '메모'}</label>
                <Textarea placeholder={t('companyInterviews.form.notesPlaceholder') || '면접에 대한 메모...'} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                  {t('companyInterviews.form.cancel') || '취소'}
                </Button>
                <Button onClick={handleScheduleSubmit} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  {t('companyInterviews.form.schedule') || '일정 추가'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CompanyLayout>
  );
}