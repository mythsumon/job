import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  BookOpen, 
  TrendingUp, 
  Users, 
  Award, 
  PlayCircle, 
  Calendar, 
  Clock, 
  Star,
  ArrowRight,
  Target,
  Lightbulb,
  PieChart
} from "lucide-react";

interface CareerResource {
  id: number;
  title: string;
  description: string;
  type: 'article' | 'video' | 'course' | 'webinar';
  category: string;
  duration?: string;
  rating: number;
  views: number;
  author: string;
  publishedAt: string;
  thumbnail?: string;
}

interface CareerTip {
  id: number;
  title: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export default function Career() {
  const [activeTab, setActiveTab] = useState("resources");

  // Mock data for career resources
  const careerResources: CareerResource[] = [
    {
      id: 1,
      title: "몽골 IT 시장 트렌드 2024",
      description: "몽골 IT 업계의 최신 동향과 성장 전망을 분석합니다.",
      type: "article",
      category: "시장 분석",
      duration: "5분",
      rating: 4.8,
      views: 1250,
      author: "김몽골",
      publishedAt: "2024-01-15"
    },
    {
      id: 2,
      title: "효과적인 이력서 작성법",
      description: "HR 전문가가 알려주는 합격하는 이력서 작성 노하우",
      type: "video",
      category: "취업 준비",
      duration: "15분",
      rating: 4.9,
      views: 3420,
      author: "박채용",
      publishedAt: "2024-01-10"
    },
    {
      id: 3,
      title: "Python 프로그래밍 입문",
      description: "초보자를 위한 파이썬 프로그래밍 완전 정복 과정",
      type: "course",
      category: "프로그래밍",
      duration: "40시간",
      rating: 4.7,
      views: 850,
      author: "이개발",
      publishedAt: "2024-01-05"
    },
    {
      id: 4,
      title: "글로벌 원격 근무 가이드",
      description: "국제 기업과의 원격 근무 성공 전략",
      type: "webinar",
      category: "워크라이프",
      duration: "1시간",
      rating: 4.6,
      views: 650,
      author: "최글로벌",
      publishedAt: "2024-01-20"
    }
  ];

  const careerTips: CareerTip[] = [
    {
      id: 1,
      title: "면접에서 자주 묻는 질문 준비하기",
      content: "자기소개, 장단점, 지원 동기 등 기본 질문에 대한 답변을 미리 준비하세요.",
      category: "면접",
      difficulty: "beginner"
    },
    {
      id: 2,
      title: "네트워킹의 중요성",
      content: "업계 인맥을 쌓는 것은 커리어 발전에 매우 중요합니다. 적극적으로 행사에 참여하세요.",
      category: "네트워킹",
      difficulty: "intermediate"
    },
    {
      id: 3,
      title: "지속적인 스킬 업데이트",
      content: "기술 발전 속도가 빠른 만큼 새로운 기술을 꾸준히 학습하고 적용해보세요.",
      category: "스킬 개발",
      difficulty: "advanced"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <BookOpen className="w-4 h-4" />;
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'course': return <Award className="w-4 h-4" />;
      case 'webinar': return <Users className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              커리어 성장 센터
            </h1>
            <p className="text-xl opacity-90 mb-8">
              전문가들의 조언과 실무 경험으로 당신의 커리어를 한 단계 끌어올리세요
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <div className="text-2xl font-bold">1,200+</div>
                <div className="text-sm opacity-80">학습 자료</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm opacity-80">전문가</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <div className="text-2xl font-bold">15,000+</div>
                <div className="text-sm opacity-80">수강생</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <div className="text-2xl font-bold">4.8★</div>
                <div className="text-sm opacity-80">평균 평점</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              학습 자료
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              커리어 팁
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              시장 동향
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              목표 설정
            </TabsTrigger>
          </TabsList>

          {/* Learning Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                추천 학습 자료
              </h2>
              <Button variant="outline">
                모든 자료 보기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careerResources.map((resource) => (
                <Card key={resource.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getTypeIcon(resource.type)}
                        {resource.type}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{resource.rating}</span>
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {resource.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {resource.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{resource.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{resource.views}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        by {resource.author}
                      </span>
                      <Button size="sm" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                        시작하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Career Tips Tab */}
          <TabsContent value="tips" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              전문가 커리어 팁
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careerTips.map((tip) => (
                <Card key={tip.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getDifficultyColor(tip.difficulty)}>
                        {tip.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {tip.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">{tip.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Market Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              시장 동향 분석
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    인기 직무 분야
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>소프트웨어 개발</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full w-4/5"></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">80%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>데이터 분석</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full w-3/5"></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">60%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>디지털 마케팅</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full w-2/5"></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">40%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    급성장 스킬
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['AI/머신러닝', 'React/Vue.js', 'Node.js', 'Docker/Kubernetes', 'AWS/Azure'].map((skill, index) => (
                      <div key={skill} className="flex items-center justify-between">
                        <span>{skill}</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          +{(5-index) * 10}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goal Setting Tab */}
          <TabsContent value="goals" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              커리어 목표 설정
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>단기 목표 (3-6개월)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>새로운 기술 스택 학습</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>프로젝트 포트폴리오 구축</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>네트워킹 활동 강화</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>장기 목표 (1-2년)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span>시니어 개발자 승진</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span>팀 리더십 역할 수행</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    <span>글로벌 기업 진출</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>목표 달성을 위한 액션 플랜</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <h3 className="font-medium">스킬 갭 분석</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">현재 스킬과 목표 포지션 요구사항 비교</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <h3 className="font-medium">학습 계획 수립</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">우선순위에 따른 체계적인 학습 로드맵 작성</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <h3 className="font-medium">실행 및 피드백</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">정기적인 진행상황 점검 및 계획 조정</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
    </>
  );
}