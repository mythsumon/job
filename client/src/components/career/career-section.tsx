import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  TrendingUp, 
  Award, 
  PlayCircle, 
  Clock, 
  Star,
  ArrowRight,
  Target,
  Lightbulb,
  PieChart
} from "lucide-react";
import { useLocation } from "wouter";

interface CareerSectionProps {
  compact?: boolean;
  showHeader?: boolean;
}

export function CareerSection({ compact = false, showHeader = true }: CareerSectionProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("resources");

  const careerResources = [
    {
      id: 1,
      title: "몽골 IT 시장 트렌드 2024",
      description: "몽골 IT 업계의 최신 동향과 성장 전망을 분석합니다.",
      type: "article",
      category: "시장 분석",
      duration: "5분",
      rating: 4.8,
      views: 1250,
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
    },
    {
      id: 3,
      title: "면접 준비 가이드",
      description: "면접에서 자주 묻는 질문과 답변 전략",
      type: "course",
      category: "면접",
      duration: "2시간",
      rating: 4.7,
      views: 850,
    },
  ];

  const careerTips = [
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
      content: "업계 인맥을 쌓는 것은 커리어 발전에 매우 중요합니다.",
      category: "네트워킹",
      difficulty: "intermediate"
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <BookOpen className="w-4 h-4" />;
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'course': return <Award className="w-4 h-4" />;
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

  if (compact) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            커리어 리소스
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/career")}
          >
            모두 보기
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {careerResources.slice(0, 2).map((resource) => (
              <div key={resource.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  {getTypeIcon(resource.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {resource.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {resource.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span>{resource.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{resource.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              커리어 성장 센터
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              전문가들의 조언과 실무 경험으로 당신의 커리어를 한 단계 끌어올리세요
            </p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
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
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careerResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
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
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{resource.duration}</span>
                    </div>
                    <Button size="sm">시작하기</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careerTips.map((tip) => (
              <Card key={tip.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getDifficultyColor(tip.difficulty)}>
                      {tip.difficulty}
                    </Badge>
                    <Badge variant="outline">{tip.category}</Badge>
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

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                인기 직무 분야
              </CardTitle>
            </CardHeader>
            <CardContent>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}








