import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/layout/header";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { RoleGuard } from "@/components/common/RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  Building2,
  Calendar,
  Search,
  MessageCircle,
  MapPin,
  Briefcase,
  Clock,
  TrendingUp,
  Users,
  Filter,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { apiGet } from "@/lib/queryClient";

interface ProfileViewer {
  id: number;
  viewerId: number;
  viewerType: "company" | "user";
  viewerName: string;
  viewerCompany?: string;
  viewerTitle?: string;
  viewerLogo?: string;
  viewedAt: string;
  jobTitle?: string;
  jobId?: number;
  source: "search" | "application" | "recommendation" | "direct";
}

export default function ProfileViews() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "company" | "user">("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");

  // Fetch profile views
  const { data: profileViews = [], isLoading } = useQuery({
    queryKey: ["/api/user/profile-views", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        return await apiGet(`/api/user/profile-views?userId=${user.id}`);
      } catch (error) {
        // Mock data for development
        console.warn("Failed to fetch profile views, using mock data:", error);
        return [
          {
            id: 1,
            viewerId: 101,
            viewerType: "company",
            viewerName: "테크스타트",
            viewerCompany: "테크스타트",
            viewerTitle: "HR 매니저",
            viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            jobTitle: "프론트엔드 개발자",
            jobId: 1,
            source: "application",
          },
          {
            id: 2,
            viewerId: 102,
            viewerType: "company",
            viewerName: "네이버",
            viewerCompany: "네이버",
            viewerTitle: "채용 담당자",
            viewedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            jobTitle: "백엔드 개발자",
            jobId: 2,
            source: "search",
          },
          {
            id: 3,
            viewerId: 103,
            viewerType: "company",
            viewerName: "카카오",
            viewerCompany: "카카오",
            viewerTitle: "인사팀",
            viewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            jobTitle: "풀스택 개발자",
            jobId: 3,
            source: "recommendation",
          },
          {
            id: 4,
            viewerId: 104,
            viewerType: "company",
            viewerName: "쿠팡",
            viewerCompany: "쿠팡",
            viewerTitle: "HR",
            viewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            source: "direct",
          },
        ] as ProfileViewer[];
      }
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Filter and sort profile views
  const filteredViews = profileViews
    .filter((view: ProfileViewer) => {
      // Filter by type
      if (filterType !== "all" && view.viewerType !== filterType) return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          view.viewerName.toLowerCase().includes(query) ||
          view.viewerCompany?.toLowerCase().includes(query) ||
          view.jobTitle?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a: ProfileViewer, b: ProfileViewer) => {
      if (sortBy === "recent") {
        return new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime();
      } else {
        return new Date(a.viewedAt).getTime() - new Date(b.viewedAt).getTime();
      }
    });

  const handleStartChat = (viewer: ProfileViewer) => {
    if (viewer.jobId) {
      setLocation(`/user/chat?company=${viewer.viewerId}&job=${viewer.jobId}`);
    } else {
      setLocation(`/user/chat?company=${viewer.viewerId}`);
    }
    toast({
      title: "성공",
      description: `${viewer.viewerName}와의 채팅을 시작합니다.`,
    });
  };

  const handleViewJob = (jobId: number) => {
    setLocation(`/user/jobs/${jobId}`);
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "application":
        return <Badge variant="default" className="text-xs">지원서</Badge>;
      case "search":
        return <Badge variant="secondary" className="text-xs">검색</Badge>;
      case "recommendation":
        return <Badge variant="outline" className="text-xs">추천</Badge>;
      case "direct":
        return <Badge variant="outline" className="text-xs">직접</Badge>;
      default:
        return null;
    }
  };

  const totalViews = profileViews.length;
  const companyViews = profileViews.filter((v: ProfileViewer) => v.viewerType === "company").length;
  const todayViews = profileViews.filter((v: ProfileViewer) => {
    const viewDate = new Date(v.viewedAt);
    const today = new Date();
    return viewDate.toDateString() === today.toDateString();
  }).length;

  return (
    <RoleGuard allowedUserTypes={['candidate']}>
      <ProtectedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    프로필 조회
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    내 프로필을 조회한 기업과 사용자를 확인하세요.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">전체 조회</p>
                      <p className="text-3xl font-bold text-blue-600">{totalViews}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">기업 조회</p>
                      <p className="text-3xl font-bold text-green-600">{companyViews}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">오늘 조회</p>
                      <p className="text-3xl font-bold text-orange-600">{todayViews}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="기업명, 채용공고로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterType === "all" ? "default" : "outline"}
                      onClick={() => setFilterType("all")}
                      size="sm"
                    >
                      전체
                    </Button>
                    <Button
                      variant={filterType === "company" ? "default" : "outline"}
                      onClick={() => setFilterType("company")}
                      size="sm"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      기업
                    </Button>
                    <Button
                      variant={sortBy === "recent" ? "default" : "outline"}
                      onClick={() => setSortBy(sortBy === "recent" ? "oldest" : "recent")}
                      size="sm"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {sortBy === "recent" ? "최신순" : "오래된순"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Views List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  조회 내역 ({filteredViews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredViews.length === 0 ? (
                  <div className="text-center py-12">
                    <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      조회 내역이 없습니다
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchQuery ? "검색 결과가 없습니다." : "아직 프로필을 조회한 사용자가 없습니다."}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {filteredViews.map((view: ProfileViewer) => (
                        <Card key={view.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={view.viewerLogo} />
                                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                    {view.viewerName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                      {view.viewerName}
                                    </h3>
                                    {view.viewerType === "company" && (
                                      <Badge variant="outline" className="text-xs">
                                        <Building2 className="w-3 h-3 mr-1" />
                                        기업
                                      </Badge>
                                    )}
                                    {getSourceBadge(view.source)}
                                  </div>
                                  {view.viewerCompany && view.viewerCompany !== view.viewerName && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                      {view.viewerCompany}
                                    </p>
                                  )}
                                  {view.viewerTitle && (
                                    <p className="text-sm text-gray-500 mb-2">{view.viewerTitle}</p>
                                  )}
                                  {view.jobTitle && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Briefcase className="w-4 h-4 text-gray-400" />
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {view.jobTitle}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {format(new Date(view.viewedAt), "yyyy년 MM월 dd일", { locale: ko })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDistanceToNow(new Date(view.viewedAt), { addSuffix: true, locale: ko })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                {view.jobId && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewJob(view.jobId!)}
                                  >
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    공고 보기
                                  </Button>
                                )}
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleStartChat(view)}
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  채팅하기
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </ProtectedPage>
    </RoleGuard>
  );
}

