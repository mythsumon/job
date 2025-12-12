import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Briefcase, 
  Building, 
  FileText, 
  TrendingUp, 
  Star, 
  ArrowRight, 
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  Hourglass,
  MessageCircle,
  Eye,
  Heart,
  Bell,
  User,
  Settings,
  Plus,
  Zap
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { RoleGuard } from "@/components/common/RoleGuard";
import { apiGet } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import type { JobWithCompany } from "@shared/schema";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Application {
  id: number;
  jobId: number;
  status: "pending" | "reviewed" | "interview" | "accepted" | "rejected";
  appliedAt: string;
  job?: JobWithCompany;
}

interface SavedJob {
  id: number;
  jobId: number;
  savedAt: string;
  job?: JobWithCompany;
}

interface Resume {
  id: number;
  title: string;
  isDefault: boolean;
  updatedAt: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary" className="flex items-center gap-1 w-fit"><Hourglass className="w-3 h-3" />대기중</Badge>;
    case "reviewed":
      return <Badge className="bg-blue-500 flex items-center gap-1 w-fit"><FileText className="w-3 h-3" />서류 검토</Badge>;
    case "interview":
      return <Badge className="bg-purple-500 flex items-center gap-1 w-fit"><Calendar className="w-3 h-3" />면접</Badge>;
    case "accepted":
      return <Badge className="bg-green-500 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" />합격</Badge>;
    case "rejected":
      return <Badge variant="destructive" className="flex items-center gap-1 w-fit">불합격</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return "협의";
  if (min && max) return `₮${min.toLocaleString()} - ₮${max.toLocaleString()}`;
  if (min) return `₮${min.toLocaleString()} 이상`;
  return `₮${max?.toLocaleString()} 이하`;
};

export default function UserHome() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();

  // Fetch recent applications
  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await apiGet<Application[]>(`/api/applications/user/${user.id}`);
    },
    enabled: isAuthenticated && !!user?.id,
  });

  // Fetch saved jobs
  const { data: savedJobs, isLoading: savedJobsLoading } = useQuery<SavedJob[]>({
    queryKey: ["/api/saved-jobs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await apiGet<SavedJob[]>(`/api/saved-jobs?userId=${user.id}`);
    },
    enabled: isAuthenticated && !!user?.id,
  });

  // Fetch resumes
  const { data: resumes, isLoading: resumesLoading } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
    queryFn: async () => {
      return await apiGet<Resume[]>("/api/resumes");
    },
    enabled: isAuthenticated && !!user?.id,
  });

  // Fetch recommended jobs
  const { data: recommendedJobs, isLoading: recommendedJobsLoading } = useQuery<JobWithCompany[]>({
    queryKey: ["/api/jobs/recommended"],
    queryFn: async () => {
      return await apiGet<JobWithCompany[]>("/api/jobs/recommended");
    },
    enabled: isAuthenticated && !!user?.id,
  });

  // Fetch profile views count
  const { data: profileViews = [] } = useQuery({
    queryKey: ["/api/user/profile-views", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        return await apiGet(`/api/user/profile-views?userId=${user.id}`);
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated && !!user?.id,
  });

  // Calculate stats
  const stats = {
    applications: applications?.length || 0,
    pendingApplications: applications?.filter(app => app.status === "pending").length || 0,
    savedJobs: savedJobs?.length || 0,
    resumes: resumes?.length || 0,
  };

  const profileViewsCount = Array.isArray(profileViews) ? profileViews.length : 0;

  return (
    <RoleGuard allowedUserTypes={['candidate']}>
      <ProtectedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    안녕하세요, {user?.fullName || user?.username || "사용자"}님! 👋
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    오늘도 좋은 하루 되세요. 새로운 기회를 찾아보세요.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Globe className="h-4 w-4 mr-2" />
                        {language === "ko" ? "한국어" : language === "en" ? "English" : "Монгол"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setLanguage("ko")}>
                        한국어
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage("en")}>
                        English
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage("mn")}>
                        Монгол
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {(user?.userType === 'employer' || user?.role === 'employer') && (
                    <Link href="/company/dashboard">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        기업 대시보드
                      </Button>
                    </Link>
                  )}
                  {(user?.userType === 'admin' || user?.role === 'admin') && (
                    <Link href="/admin/dashboard">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        관리자 대시보드
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">지원 현황</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.applications}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        대기중: {stats.pendingApplications}건
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">저장된 공고</p>
                      <p className="text-3xl font-bold text-red-600">{stats.savedJobs}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">이력서</p>
                      <p className="text-3xl font-bold text-green-600">{stats.resumes}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Link href="/user/profile-views">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">프로필 조회</p>
                        <p className="text-3xl font-bold text-purple-600">{profileViewsCount}</p>
                        <p className="text-xs text-purple-600 mt-1">조회 내역 보기 →</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <Eye className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      빠른 작업
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Link href="/user/jobs">
                        <Button className="w-full" variant="outline">
                          <Briefcase className="w-4 h-4 mr-2" />
                          채용공고 찾기
                        </Button>
                      </Link>
                      <Link href="/user/resumes">
                        <Button className="w-full" variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          이력서 관리
                        </Button>
                      </Link>
                      <Link href="/user/applications">
                        <Button className="w-full" variant="outline">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          지원 현황
                        </Button>
                      </Link>
                      <Link href="/user/profile">
                        <Button className="w-full" variant="outline">
                          <User className="w-4 h-4 mr-2" />
                          프로필 수정
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Applications */}
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      최근 지원 내역
                    </CardTitle>
                    <Link href="/user/applications">
                      <Button variant="ghost" size="sm">
                        전체보기
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {applicationsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : applications && applications.length > 0 ? (
                      <div className="space-y-4">
                        {applications.slice(0, 3).map((application) => (
                          <div
                            key={application.id}
                            className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {application.job?.title || "채용공고 제목"}
                                </h3>
                                {getStatusBadge(application.status)}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Building className="w-4 h-4" />
                                  <span>{application.job?.company?.name || "회사명"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatDate(application.appliedAt)}</span>
                                </div>
                              </div>
                            </div>
                            <Link href={`/user/jobs/${application.jobId}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">아직 지원한 채용공고가 없습니다.</p>
                        <Link href="/user/jobs">
                          <Button>
                            채용공고 찾기
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recommended Jobs */}
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      추천 채용공고
                    </CardTitle>
                    <Link href="/user/jobs">
                      <Button variant="ghost" size="sm">
                        전체보기
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {recommendedJobsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : recommendedJobs && recommendedJobs.length > 0 ? (
                      <div className="space-y-4">
                        {recommendedJobs.slice(0, 3).map((job: any) => (
                          <div
                            key={job.id}
                            className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {job.title}
                                </h3>
                                {job.matchScore && (
                                  <Badge 
                                    className={`${
                                      job.matchScore >= 90 ? 'bg-green-500' :
                                      job.matchScore >= 75 ? 'bg-blue-500' :
                                      job.matchScore >= 60 ? 'bg-purple-500' :
                                      job.matchScore >= 45 ? 'bg-yellow-500' :
                                      'bg-orange-500'
                                    } text-white`}
                                  >
                                    {job.matchScore}% 매칭
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <div className="flex items-center gap-1">
                                  <Building className="w-4 h-4" />
                                  <span>{job.company?.name || "회사명"}</span>
                                </div>
                                {job.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{job.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                                </div>
                              </div>
                              {job.matchReasons && job.matchReasons.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {job.matchReasons.slice(0, 2).map((reason: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {reason}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {job.matchedSkills && job.matchedSkills.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    일치하는 기술: {job.matchedSkills.slice(0, 3).join(", ")}
                                    {job.matchedSkills.length > 3 && ` +${job.matchedSkills.length - 3}`}
                                  </p>
                                </div>
                              )}
                            </div>
                            <Link href={`/user/jobs/${job.id}`}>
                              <Button size="sm">
                                지원하기
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">추천 채용공고가 없습니다.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Saved Jobs */}
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      저장된 공고
                    </CardTitle>
                    <Link href="/user/saved-jobs">
                      <Button variant="ghost" size="sm">
                        전체보기
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {savedJobsLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : savedJobs && savedJobs.length > 0 ? (
                      <div className="space-y-3">
                        {savedJobs.slice(0, 3).map((savedJob) => (
                          <Link key={savedJob.id} href={`/user/jobs/${savedJob.jobId}`}>
                            <div className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                              <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                                {savedJob.job?.title || "채용공고 제목"}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {savedJob.job?.company?.name || "회사명"}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Heart className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mb-3">저장된 공고가 없습니다.</p>
                        <Link href="/user/jobs">
                          <Button size="sm" variant="outline">
                            공고 찾기
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Profile Completion */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      프로필 완성도
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">85%</span>
                          <span className="text-xs text-muted-foreground">완성</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">기본 정보</span>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">이력서</span>
                          {stats.resumes > 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <span className="text-xs text-red-500">필수</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">프로필 사진</span>
                          {user?.profilePicture ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <span className="text-xs text-yellow-500">권장</span>
                          )}
                        </div>
                      </div>
                      <Link href="/user/profile">
                        <Button className="w-full" size="sm">
                          프로필 완성하기
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                  <CardHeader>
                    <CardTitle>빠른 링크</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Link href="/user/notifications">
                        <Button variant="ghost" className="w-full justify-start">
                          <Bell className="w-4 h-4 mr-2" />
                          알림 센터
                        </Button>
                      </Link>
                      <Link href="/user/chat">
                        <Button variant="ghost" className="w-full justify-start">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          메시지
                        </Button>
                      </Link>
                      <Link href="/user/settings">
                        <Button variant="ghost" className="w-full justify-start">
                          <Settings className="w-4 h-4 mr-2" />
                          설정
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedPage>
    </RoleGuard>
  );
}