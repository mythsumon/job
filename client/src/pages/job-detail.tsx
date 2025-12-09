import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Heart, MapPin, Clock, Users, Building, Calendar, Globe, Share2, ArrowLeft, Sparkles, TrendingUp, DollarSign, Briefcase } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, apiGet } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { ApplyDialog } from "@/components/jobs/apply-dialog";
import type { JobWithCompany } from "@shared/schema";

export default function JobDetail() {
  const { id } = useParams();
  const jobId = parseInt(id || "0");
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  const { data: job, isLoading, error } = useQuery<JobWithCompany>({
    queryKey: [`/api/jobs/${id}`],
    enabled: !!id,
  });

  const { data: relatedJobs } = useQuery<JobWithCompany[]>({
    queryKey: ["/api/jobs", { companyId: job?.companyId, limit: 3 }],
    enabled: !!job?.companyId,
  });

  // Check if job is saved
  const { data: savedJobs } = useQuery({
    queryKey: ["/api/saved-jobs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        return await apiGet<any[]>(`/api/saved-jobs?userId=${user.id}`);
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated && !!user?.id,
  });

  // Check if user already applied
  const { data: existingApplication } = useQuery({
    queryKey: ["/api/applications/user", user?.id, jobId],
    queryFn: async () => {
      if (!user?.id || !id) return null;
      try {
        const applications = await apiGet<any[]>(`/api/applications/user/${user.id}`);
        return applications.find((app: any) => app.jobId === parseInt(id));
      } catch {
        return null;
      }
    },
    enabled: isAuthenticated && !!user?.id && !!id,
  });

  const isJobSaved = savedJobs?.some((sj: any) => sj.jobId === parseInt(id || "0"));
  const hasApplied = !!existingApplication;

  const saveJobMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        toast({
          title: "로그인 필요",
          description: "로그인 후 이용해주세요.",
          variant: "destructive",
        });
        return;
      }
      if (isJobSaved) {
        await apiRequest("DELETE", `/api/saved-jobs/${user.id}/${id}`);
      } else {
        await apiRequest("POST", "/api/saved-jobs", {
          userId: user.id,
          jobId: parseInt(id!),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs", user?.id] });
      toast({
        title: isJobSaved ? "채용공고 저장 취소" : "채용공고 저장 완료",
        description: isJobSaved ? "관심 목록에서 제거되었습니다." : "관심 목록에 추가되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류 발생",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start mb-6">
                    <Skeleton className="w-16 h-16 rounded-xl mr-4" />
                    <div className="flex-1">
                      <Skeleton className="h-8 w-64 mb-2" />
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-32 w-full mb-6" />
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">채용공고를 찾을 수 없습니다</h1>
              <p className="text-muted-foreground mb-6">요청하신 채용공고가 존재하지 않거나 삭제되었습니다.</p>
              <Link href="/jobs">
                <Button>채용정보 목록으로 돌아가기</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "협의";
    if (min && max) {
      return `${(min / 10000000).toFixed(0)}-${(max / 10000000).toFixed(0)}천만원`;
    }
    if (min) return `${(min / 10000000).toFixed(0)}천만원 이상`;
    if (max) return `${(max / 10000000).toFixed(0)}천만원 이하`;
    return "협의";
  };

  const getExperienceLabel = (experience: string) => {
    const labels: Record<string, string> = {
      entry: "경력 0-2년",
      junior: "경력 3-5년",
      mid: "경력 3-7년", 
      senior: "경력 6-10년",
      expert: "경력 10년+"
    };
    return labels[experience] || experience;
  };

  const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      full_time: "정규직",
      part_time: "계약직",
      contract: "프리랜서",
      internship: "인턴십"
    };
    return labels[type] || type;
  };

  const generateCompanyLogo = (name: string) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600",
      "from-purple-500 to-purple-600",
      "from-red-500 to-red-600",
      "from-orange-500 to-orange-600",
      "from-cyan-500 to-cyan-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600"
    ];
    const colorIndex = name.length % colors.length;
    const initials = name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    
    return { color: colors[colorIndex], initials };
  };

  const logo = generateCompanyLogo(job.company?.name || "Unknown Company");

  // Determine job tier for styling
  const isPremium = job.isFeatured;
  const isPro = job.isPro || (job.salaryMax && job.salaryMax > 80000000); // Use isPro field or salary criteria
  
  const getJobTierStyling = () => {
    if (isPremium) {
      return {
        bgClass: "bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-orange-50/40 dark:from-amber-950/20 dark:via-yellow-950/15 dark:to-orange-950/10",
        cardClass: "border-amber-200 dark:border-amber-800 shadow-lg shadow-amber-500/10",
        accentColor: "text-amber-600 dark:text-amber-400",
        icon: <Sparkles className="w-5 h-5" />
      };
    } else if (isPro) {
      return {
        bgClass: "bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-zinc-50/40 dark:from-slate-950/20 dark:via-gray-950/15 dark:to-zinc-950/10",
        cardClass: "border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-500/10",
        accentColor: "text-slate-600 dark:text-slate-400",
        icon: <TrendingUp className="w-5 h-5" />
      };
    }
    return {
      bgClass: "bg-background",
      cardClass: "border-border shadow-sm",
      accentColor: "text-primary",
      icon: <Briefcase className="w-5 h-5" />
    };
  };

  const tierStyling = getJobTierStyling();

  return (
    <div className={`min-h-screen ${tierStyling.bgClass}`}>
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Back Button */}
        <Link href="/jobs">
          <Button variant="ghost" className="mb-6 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            채용정보 목록으로 돌아가기
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className={`relative overflow-hidden ${tierStyling.cardClass}`}>
              {/* Premium background effects */}
              {isPremium && (
                <>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/30 rounded-bl-full blur-xl"></div>
                  <div className="absolute top-2 right-2">
                    <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
                  </div>
                </>
              )}
              {isPro && !isPremium && (
                <>
                  <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-slate-400/15 to-zinc-500/25 rounded-bl-full blur-lg"></div>
                  <div className="absolute top-2 right-2">
                    <TrendingUp className="w-6 h-6 text-slate-600 dark:text-slate-400 animate-pulse" />
                  </div>
                </>
              )}
              
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start flex-1">
                    <div className={`w-16 h-16 bg-gradient-to-br ${logo.color} rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0 shadow-lg transition-all duration-300 hover:scale-110`}>
                      {logo.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h1 className={`text-2xl font-bold transition-colors duration-300 ${isPremium ? 'text-amber-900 dark:text-amber-100' : isPro ? 'text-slate-800 dark:text-slate-200' : 'text-foreground'}`}>
                          {job.title}
                        </h1>
                        {job.isRemote && (
                          <Badge variant="secondary" className="animate-pulse">
                            <Globe className="w-3 h-3 mr-1" />
                            원격가능
                          </Badge>
                        )}
                        {job.isFeatured && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 animate-pulse">
                            <Sparkles className="w-3 h-3 mr-1" />
                            프리미엄
                          </Badge>
                        )}
                        {job.isPro && !job.isFeatured && (
                          <Badge className="bg-gradient-to-r from-slate-600 to-zinc-600 text-white border-0">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            프로
                          </Badge>
                        )}
                      </div>
                      {job.company?.id ? (
                        <Link href={`/companies/${job.company.id}`}>
                          <p className={`text-lg font-medium hover:underline mb-2 transition-colors duration-300 ${isPremium ? 'text-amber-700 dark:text-amber-300' : isPro ? 'text-slate-700 dark:text-slate-300' : 'text-primary'}`}>
                            {job.company.name}
                          </p>
                        </Link>
                      ) : (
                        <p className={`text-lg font-medium mb-2 transition-colors duration-300 ${isPremium ? 'text-amber-700 dark:text-amber-300' : isPro ? 'text-slate-700 dark:text-slate-300' : 'text-primary'}`}>
                          개별 채용
                        </p>
                      )}
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {job.company?.industry || "미분류"} • {job.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-2xl font-bold mb-1 transition-colors duration-300 ${isPremium ? 'text-amber-800 dark:text-amber-200' : isPro ? 'text-slate-800 dark:text-slate-200' : 'text-foreground'}`}>
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                      <DollarSign className="w-3 h-3" />
                      연봉
                    </p>
                  </div>
                </div>

                {/* Job Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{getExperienceLabel(job.experienceLevel || "")}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{getJobTypeLabel(job.employmentType || "")}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">조회 {job.views}</span>
                  </div>
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">요구 기술</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>채용 상세</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>지원 자격</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-foreground leading-relaxed">{job.requirements}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>복리혜택</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit) => (
                      <Badge key={benefit} variant="outline">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <Card className={`sticky top-4 ${tierStyling.cardClass}`}>
              <CardContent className="p-6">
                {hasApplied ? (
                  <Button 
                    disabled
                    className="w-full mb-3 bg-green-600 hover:bg-green-600 text-white"
                    size="lg"
                  >
                    ✓ 지원 완료
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast({
                          title: "로그인 필요",
                          description: "로그인 후 지원하실 수 있습니다.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setApplyDialogOpen(true);
                    }}
                    className={`w-full mb-3 transition-all duration-300 ${
                      isPremium 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl' 
                        : isPro 
                        ? 'bg-gradient-to-r from-slate-600 to-zinc-600 hover:from-slate-700 hover:to-zinc-700 text-white border-0 shadow-md hover:shadow-lg'
                        : ''
                    }`}
                    size="lg"
                  >
                    {isPremium && <Sparkles className="w-4 h-4 mr-2" />}
                    {isPro && !isPremium && <TrendingUp className="w-4 h-4 mr-2" />}
                    지원하기
                  </Button>
                )}
                {isAuthenticated ? (
                  <Button 
                    variant="outline" 
                    onClick={() => saveJobMutation.mutate()}
                    disabled={saveJobMutation.isPending}
                    className="w-full mb-3"
                  >
                    <Heart className={`mr-2 h-4 w-4 ${isJobSaved ? 'fill-current text-red-500' : ''}`} />
                    {isJobSaved ? "저장됨" : "관심등록"}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      toast({
                        title: "로그인 필요",
                        description: "로그인 후 저장하실 수 있습니다.",
                        variant: "destructive",
                      });
                    }}
                    className="w-full mb-3"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    관심등록
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  공유하기
                </Button>
              </CardContent>
            </Card>

            {/* Company Info */}
            {job.company && (
              <Card>
                <CardHeader>
                  <CardTitle>회사 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{job.company.name}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {job.company.description || "회사 설명이 없습니다."}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">업종</span>
                      <span className="text-sm font-medium">{job.company.industry || "미분류"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">규모</span>
                      <span className="text-sm font-medium">
                        {job.company.employeeCount ? `${job.company.employeeCount}명` : "정보없음"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">위치</span>
                      <span className="text-sm font-medium">{job.company.location || "미정"}</span>
                    </div>
                    {job.company.website && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">웹사이트</span>
                        <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          <Globe className="inline mr-1 h-3 w-3" />
                          방문
                        </a>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <Link href={`/companies/${job.company.id}`}>
                    <Button variant="outline" className="w-full">
                      <Building className="mr-2 h-4 w-4" />
                      회사 상세보기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Related Jobs */}
            {relatedJobs && relatedJobs.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>같은 회사의 다른 채용</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedJobs
                    .filter(relatedJob => relatedJob.id !== job.id)
                    .slice(0, 3)
                    .map((relatedJob) => (
                      <Link key={relatedJob.id} href={`/jobs/${relatedJob.id}`}>
                        <div className="p-3 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                          <h4 className="font-medium text-sm mb-1 line-clamp-2">
                            {relatedJob.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {formatSalary(relatedJob.salaryMin, relatedJob.salaryMax)}
                          </p>
                        </div>
                      </Link>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Apply Dialog */}
      {job && (
        <ApplyDialog
          jobId={jobId}
          jobTitle={job.title}
          open={applyDialogOpen}
          onOpenChange={setApplyDialogOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/applications/user", user?.id] });
          }}
        />
      )}
    </div>
  );
}
