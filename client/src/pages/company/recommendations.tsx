import { CompanyLayout } from "@/components/company/company-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const recommendedTalents = [
  {
    id: 1,
    name: "김서준",
    email: "seojun.kim@email.com",
    avatar: "KS",
    currentRole: "시니어 프론트엔드 개발자",
    company: "네이버",
    location: "서울시 판교",
    experience: "5년",
    education: "KAIST 컴퓨터공학과",
    skills: ["React", "TypeScript", "Next.js", "GraphQL", "AWS"],
    matchScore: 95,
    salaryExpectation: "6000-8000만원",
    availableFrom: "2024-07-01",
    lastActive: "2시간 전",
    profileViews: 1250,
    isOpenToOffers: true,
    matchReasons: [
      "React 5년 경험으로 요구사항 완벽 부합",
      "대기업 시니어 개발자 경력",
      "TypeScript 전문가",
      "팀 리딩 경험 보유"
    ],
    highlights: ["Top 1% 개발자", "네이버 핵심 서비스 개발", "오픈소스 기여자"],
  },
  {
    id: 2,
    name: "박지혜",
    email: "jihye.park@email.com",
    avatar: "PJ",
    currentRole: "프론트엔드 개발자",
    company: "카카오",
    location: "서울시 강남구",
    experience: "3년",
    education: "서울대학교 컴퓨터공학과",
    skills: ["Vue.js", "React", "JavaScript", "Webpack", "Docker"],
    matchScore: 88,
    salaryExpectation: "4500-6000만원",
    availableFrom: "2024-06-15",
    lastActive: "1일 전",
    profileViews: 980,
    isOpenToOffers: true,
    matchReasons: [
      "프론트엔드 3년 경험",
      "React 프로젝트 다수 경험",
      "스타트업 관심도 높음",
      "빠른 학습 능력"
    ],
    highlights: ["카카오톡 UI 개발", "사용자 경험 개선 전문", "디자인 시스템 구축"],
  },
  {
    id: 3,
    name: "이동현",
    email: "donghyun.lee@email.com",
    avatar: "LD",
    currentRole: "주니어 프론트엔드 개발자",
    company: "라인",
    location: "서울시 서초구",
    experience: "2년",
    education: "연세대학교 컴퓨터과학과",
    skills: ["React", "JavaScript", "CSS", "Git", "Figma"],
    matchScore: 82,
    salaryExpectation: "3500-4500만원",
    availableFrom: "2024-08-01",
    lastActive: "3시간 전",
    profileViews: 720,
    isOpenToOffers: true,
    matchReasons: [
      "React 기본기 탄탄",
      "성장 의욕 강함",
      "팀워크 우수",
      "연봉 범위 적합"
    ],
    highlights: ["라인 메신저 UI", "반응형 웹 전문", "코드 리뷰 적극 참여"],
  },
];

const searchFilters = [
  { label: "프론트엔드 개발자", count: 234, category: "직무" },
  { label: "React 전문가", count: 156, category: "기술" },
  { label: "3-5년 경력", count: 189, category: "경력" },
  { label: "서울 거주", count: 445, category: "지역" },
  { label: "이직 준비 중", count: 89, category: "상태" },
];

export default function CompanyRecommendations() {
  const { t } = useLanguage();

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('companyRecommendations.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('companyRecommendations.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {t('companyRecommendations.advancedFilter')}
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Target className="h-4 w-4 mr-2" />
              {t('companyRecommendations.customSearch')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyRecommendations.stats.recommendedTalents')}</p>
                  <p className="text-2xl font-bold text-blue-600">{recommendedTalents.length}</p>
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
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyRecommendations.stats.contactable')}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {recommendedTalents.filter(talent => talent.isOpenToOffers).length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyRecommendations.stats.totalTalentPool')}</p>
                  <p className="text-2xl font-bold text-orange-600">2,341</p>
                </div>
                <Search className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Popular Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2 text-blue-600" />
                  인재 검색
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input placeholder="직무, 기술, 회사명으로 검색..." />
                  </div>
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="경력" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 경력</SelectItem>
                      <SelectItem value="junior">1-3년</SelectItem>
                      <SelectItem value="mid">3-5년</SelectItem>
                      <SelectItem value="senior">5년 이상</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>검색</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2 text-purple-600" />
                인기 필터
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {searchFilters.map((filter, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between text-left"
                  >
                    <span>{filter.label}</span>
                    <Badge variant="secondary">{filter.count}</Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Talents */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              추천 인재 ({recommendedTalents.length})
            </h2>
            <Select>
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

          <div className="grid gap-6">
            {recommendedTalents.map((talent) => (
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
                      <Button size="sm" className="bg-gradient-to-r from-green-500 to-green-600">
                        <Send className="h-4 w-4 mr-1" />
                        연락하기
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        프로필 보기
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4 mr-1" />
                        관심 인재
                      </Button>
                      <Button variant="outline" size="sm">
                        <UserCheck className="h-4 w-4 mr-1" />
                        파이프라인 추가
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            더 많은 인재 보기
          </Button>
        </div>
      </div>
    </CompanyLayout>
  );
}