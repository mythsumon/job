import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CompanyLayout } from "@/components/company/company-layout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Search,
  MapPin,
  Briefcase,
  Star,
  Clock,
  MessageCircle,
  Users,
  Award,
  TrendingUp,
  Eye,
  Heart,
  Download
} from "lucide-react";
import { CandidateProfileDialog } from "@/components/company/candidate-profile-dialog";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState as useStateHook } from "react";

interface Talent {
  id: number;
  userId: number;
  name: string;
  email?: string; // showEmail이 true인 경우만
  phone?: string; // showPhone이 true인 경우만
  profileImage?: string;
  title: string;
  location?: string; // profileVisibility가 "contacts"인 경우 제한
  experience: string;
  skills: string[];
  rating: number;
  availability: string;
  expectedSalary?: number;
  lastActive: string;
  bio: string;
  education?: string; // profileVisibility가 "contacts"인 경우 제한
  portfolio?: string;
  verified: boolean;
  profileVisibility: "public" | "contacts" | "private"; // 프로필 공개 설정
  showEmail: boolean; // 이메일 표시 여부
  showPhone: boolean; // 전화번호 표시 여부
  resumeId?: number; // 사용된 이력서 ID
  resumeTitle?: string; // 이력서 제목
  resumeSummary?: string; // 이력서 요약
}

export default function CompanyTalents() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [savedTalents, setSavedTalents] = useStateHook<number[]>([]);

  // Example data for development
  const exampleTalents: Talent[] = [
    {
      id: 1,
      userId: 101,
      name: "김민수",
      email: "minsu.kim@email.com",
      phone: "010-1234-5678",
      profileImage: undefined,
      title: "시니어 프론트엔드 개발자",
      location: "서울시 강남구",
      experience: "5년",
      skills: ["React", "TypeScript", "Next.js", "GraphQL", "Node.js"],
      rating: 4.8,
      availability: "available",
      expectedSalary: 60000000,
      lastActive: "2시간 전",
      bio: "5년 이상의 프론트엔드 개발 경험을 보유한 시니어 개발자입니다. React와 TypeScript에 특화되어 있으며, 대규모 웹 애플리케이션 개발 경험이 풍부합니다.",
      education: "서울대학교 컴퓨터공학과",
      portfolio: "https://portfolio.minsu.kim",
      verified: true,
      profileVisibility: "public",
      showEmail: true,
      showPhone: true,
      resumeId: 1,
      resumeTitle: "프론트엔드 개발자 이력서",
      resumeSummary: "5년 이상의 프론트엔드 개발 경험, React/TypeScript 전문가",
    },
    {
      id: 2,
      userId: 102,
      name: "이지현",
      email: "jihyun.lee@email.com",
      phone: "010-2345-6789",
      profileImage: undefined,
      title: "백엔드 개발자",
      location: "서울시 서초구",
      experience: "4년",
      skills: ["Java", "Spring Boot", "Kubernetes", "AWS", "PostgreSQL"],
      rating: 4.6,
      availability: "available",
      expectedSalary: 55000000,
      lastActive: "1일 전",
      bio: "백엔드 시스템 설계 및 개발 전문가입니다. 마이크로서비스 아키텍처와 클라우드 인프라에 대한 깊은 이해를 가지고 있습니다.",
      education: "연세대학교 정보시스템학과",
      portfolio: undefined,
      verified: true,
      profileVisibility: "public",
      showEmail: true,
      showPhone: false,
      resumeId: 2,
      resumeTitle: "백엔드 개발자 이력서",
      resumeSummary: "4년 이상의 백엔드 개발 경험, Spring Boot/AWS 전문가",
    },
    {
      id: 3,
      userId: 103,
      name: "박준호",
      email: "junho.park@email.com",
      phone: "010-3456-7890",
      profileImage: undefined,
      title: "풀스택 개발자",
      location: "경기도 판교",
      experience: "3년",
      skills: ["Python", "Django", "React", "Docker", "MongoDB"],
      rating: 4.5,
      availability: "available",
      expectedSalary: 50000000,
      lastActive: "3시간 전",
      bio: "풀스택 개발자로서 프론트엔드와 백엔드 모두를 다룰 수 있습니다. 스타트업 환경에서 빠른 개발과 배포 경험이 있습니다.",
      education: "한양대학교 컴퓨터공학과",
      portfolio: "https://github.com/junho-park",
      verified: false,
      profileVisibility: "public",
      showEmail: true,
      showPhone: true,
      resumeId: 3,
      resumeTitle: "풀스택 개발자 이력서",
      resumeSummary: "3년 이상의 풀스택 개발 경험, Python/Django/React 전문가",
    },
    {
      id: 4,
      userId: 104,
      name: "최수진",
      email: "sujin.choi@email.com",
      phone: "010-4567-8901",
      profileImage: undefined,
      title: "데이터 사이언티스트",
      location: "서울시 마포구",
      experience: "6년",
      skills: ["Python", "TensorFlow", "SQL", "Spark", "Machine Learning"],
      rating: 4.9,
      availability: "busy",
      expectedSalary: 70000000,
      lastActive: "5일 전",
      bio: "머신러닝과 데이터 분석 전문가입니다. 대규모 데이터 처리와 예측 모델 개발에 특화되어 있습니다.",
      education: "KAIST 산업공학과",
      portfolio: "https://sujin-choi.github.io",
      verified: true,
      profileVisibility: "public",
      showEmail: true,
      showPhone: false,
      resumeId: 4,
      resumeTitle: "데이터 사이언티스트 이력서",
      resumeSummary: "6년 이상의 데이터 사이언스 경험, ML/AI 전문가",
    },
    {
      id: 5,
      userId: 105,
      name: "구직자",
      email: undefined,
      phone: undefined,
      profileImage: undefined,
      title: "프론트엔드 개발자",
      location: undefined,
      experience: "2년",
      skills: ["React", "Vue.js", "JavaScript"],
      rating: 4.3,
      availability: "available",
      expectedSalary: 40000000,
      lastActive: "1시간 전",
      bio: undefined,
      education: undefined,
      portfolio: undefined,
      verified: false,
      profileVisibility: "contacts",
      showEmail: false,
      showPhone: false,
      resumeId: 5,
      resumeTitle: "프론트엔드 개발자 이력서",
      resumeSummary: "2년 이상의 프론트엔드 개발 경험, React/Vue.js 전문가",
    },
    {
      id: 6,
      userId: 106,
      name: "정다은",
      email: "daeun.jung@email.com",
      phone: "010-5678-9012",
      profileImage: undefined,
      title: "DevOps 엔지니어",
      location: "서울시 송파구",
      experience: "4년",
      skills: ["Kubernetes", "Docker", "CI/CD", "AWS", "Terraform"],
      rating: 4.7,
      availability: "available",
      expectedSalary: 58000000,
      lastActive: "30분 전",
      bio: "DevOps 및 인프라 자동화 전문가입니다. 클라우드 환경에서의 안정적인 서비스 운영 경험이 풍부합니다.",
      education: "고려대학교 컴퓨터학과",
      portfolio: "https://daeun-devops.com",
      verified: true,
      profileVisibility: "public",
      showEmail: true,
      showPhone: true,
      resumeId: 6,
      resumeTitle: "DevOps 엔지니어 이력서",
      resumeSummary: "4년 이상의 DevOps 경험, Kubernetes/AWS 전문가",
    },
  ];

  // Fetch talents with search and filters
  // API will filter based on:
  // 1. profileVisibility != 'private' (only show public or contacts profiles)
  // 2. Use default resume (isDefault=true) or latest public/company_only resume
  // 3. Respect showEmail and showPhone settings
  const { data: talentsData, isLoading } = useQuery({
    queryKey: ["/api/talents", searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      try {
        const response = await fetch(`/api/talents?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch talents");
        const data = await response.json();
        return Array.isArray(data) ? data : data.talents || [];
      } catch (error) {
        // API 실패 시 예시 데이터 반환
        console.warn("Failed to fetch talents, using example data:", error);
        return exampleTalents.filter(talent => {
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
              talent.name.toLowerCase().includes(searchLower) ||
              talent.title.toLowerCase().includes(searchLower) ||
              talent.skills.some(skill => skill.toLowerCase().includes(searchLower))
            );
          }
          return true;
        });
      }
    },
  });

  // Use API data if available, otherwise use example data
  const talents = (Array.isArray(talentsData) && talentsData.length > 0) 
    ? talentsData 
    : exampleTalents.filter(talent => {
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            talent.name.toLowerCase().includes(searchLower) ||
            talent.title.toLowerCase().includes(searchLower) ||
            talent.skills.some(skill => skill.toLowerCase().includes(searchLower))
          );
        }
        return true;
      });

  const handleStartChat = (talentId: number) => {
    setLocation(`/company/chat?talent=${talentId}`);
  };

  const handleSaveTalent = (talentId: number) => {
    if (savedTalents.includes(talentId)) {
      setSavedTalents(savedTalents.filter(id => id !== talentId));
      toast({
        title: t("common.success") || "성공",
        description: "관심 인재 목록에서 제거되었습니다.",
      });
    } else {
      setSavedTalents([...savedTalents, talentId]);
      toast({
        title: t("common.success") || "성공",
        description: "관심 인재 목록에 추가되었습니다.",
      });
    }
  };

  const handleDownloadList = () => {
    // Create a mock CSV file
    const csvContent = `Name,Title,Experience,Skills,Rating
${talents.map((t: Talent) => `${t.name},${t.title},${t.experience},"${t.skills.join(';')}",${t.rating}`).join('\n')}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `talents-list-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: t("common.success") || "성공",
      description: "인재 목록이 다운로드되었습니다.",
    });
  };

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('companyTalents.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('companyTalents.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleDownloadList}>
              <Download className="h-4 w-4 mr-2" />
              {t('companyTalents.downloadList')}
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('companyTalents.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('companyTalents.stats.totalTalents')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{Array.isArray(talents) ? talents.length : 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('companyTalents.stats.activeTalents')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(talents) ? talents.filter((t: Talent) => t.availability === "available").length : 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('companyTalents.stats.verifiedTalents')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(talents) ? talents.filter((t: Talent) => t.verified).length : 0}
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('companyTalents.stats.averageRating')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(talents) && talents.length > 0 ? (talents.reduce((acc: number, t: Talent) => acc + t.rating, 0) / talents.length).toFixed(1) : "0.0"}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Talent Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !Array.isArray(talents) || talents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('companyTalents.emptyState.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('companyTalents.emptyState.description')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(talents) && talents.map((talent: Talent) => (
              <Card key={talent.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={
                            talent.profileVisibility === "contacts" 
                              ? undefined // 연락처만 공개인 경우 기본 아바타
                              : talent.profileImage
                          } 
                        />
                        <AvatarFallback>
                          {talent.profileVisibility === "contacts" 
                            ? "?" // 익명 처리
                            : talent.name?.[0] || 'T'
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {talent.profileVisibility === "contacts" 
                            ? "구직자" // 익명 처리
                            : talent.name
                          }
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{talent.title}</p>
                      </div>
                    </div>
                    {talent.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {t('companyTalents.verified')}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    {talent.profileVisibility === "public" && talent.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {talent.location}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {talent.experience} {t('companyTalents.experience')}
                    </div>
                    {talent.profileVisibility === "public" && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {t('companyTalents.lastActive')}: {talent.lastActive}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(talent.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">{talent.rating}</span>
                    </div>
                    <Badge 
                      variant={talent.availability === "available" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {talent.availability === "available" ? t('companyTalents.availability.available') : t('companyTalents.availability.busy')}
                    </Badge>
                  </div>

                  {talent.profileVisibility === "public" && talent.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {talent.bio}
                    </p>
                  )}
                  {talent.profileVisibility === "contacts" && talent.resumeSummary && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {talent.resumeSummary}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-4">
                    {talent.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {talent.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{talent.skills.length - 3} {t('companyTalents.moreSkills')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {talent.profileVisibility === "contacts" ? (
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                        onClick={() => handleStartChat(talent.userId || talent.id)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        연락하기
                      </Button>
                    ) : (
                      <>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleStartChat(talent.userId || talent.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {t('companyTalents.actions.chat')}
                        </Button>
                        <CandidateProfileDialog
                          candidate={{
                            id: talent.userId || talent.id,
                            name: talent.name,
                            email: talent.showEmail ? talent.email : undefined,
                            phone: talent.showPhone ? talent.phone : undefined,
                            location: talent.profileVisibility === "public" ? talent.location : undefined,
                            profileImage: talent.profileVisibility === "public" ? talent.profileImage : undefined,
                            experience: talent.experience,
                            education: talent.profileVisibility === "public" ? talent.education : undefined,
                            skills: talent.skills,
                            rating: talent.rating,
                            bio: talent.profileVisibility === "public" ? talent.bio : talent.resumeSummary,
                          }}
                          resumeId={talent.resumeId}
                          trigger={
                            <Button 
                              variant="outline" 
                              size="sm"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSaveTalent(talent.userId || talent.id)}
                      className={savedTalents.includes(talent.userId || talent.id) ? "text-red-600" : ""}
                    >
                      <Heart className={`h-4 w-4 ${savedTalents.includes(talent.userId || talent.id) ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CompanyLayout>
  );
}