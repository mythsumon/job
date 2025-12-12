import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { apiGet } from "@/lib/queryClient";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { RoleGuard } from "@/components/common/RoleGuard";
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  Hourglass,
  FileText,
  Building,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Eye
} from "lucide-react";
import type { JobWithCompany } from "@shared/schema";

interface Application {
  id: number;
  userId: number;
  jobId: number;
  resumeId: number;
  status: "pending" | "reviewed" | "interview" | "accepted" | "rejected";
  coverLetter?: string;
  appliedAt: string;
  job?: JobWithCompany;
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
      return <Badge variant="destructive" className="flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" />불합격</Badge>;
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

export default function UserApplications() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await apiGet<Application[]>(`/api/applications/user/${user.id}`);
    },
    enabled: isAuthenticated && !!user?.id,
  });

  const filteredApplications = applications?.filter((app) => {
    if (activeTab === "all") return true;
    return app.status === activeTab;
  }) || [];

  const statusCounts = {
    all: applications?.length || 0,
    pending: applications?.filter((app) => app.status === "pending").length || 0,
    reviewed: applications?.filter((app) => app.status === "reviewed").length || 0,
    interview: applications?.filter((app) => app.status === "interview").length || 0,
    accepted: applications?.filter((app) => app.status === "accepted").length || 0,
    rejected: applications?.filter((app) => app.status === "rejected").length || 0,
  };

  return (
    <RoleGuard allowedUserTypes={['candidate']}>
      <ProtectedPage>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/user/home")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  뒤로가기
                </Button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                지원 현황
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                지원하신 채용공고의 진행 상황을 확인하실 수 있습니다.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">전체 ({statusCounts.all})</TabsTrigger>
                <TabsTrigger value="pending">대기중 ({statusCounts.pending})</TabsTrigger>
                <TabsTrigger value="reviewed">검토중 ({statusCounts.reviewed})</TabsTrigger>
                <TabsTrigger value="interview">면접 ({statusCounts.interview})</TabsTrigger>
                <TabsTrigger value="accepted">합격 ({statusCounts.accepted})</TabsTrigger>
                <TabsTrigger value="rejected">불합격 ({statusCounts.rejected})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <Skeleton className="h-6 w-64 mb-4" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">지원 내역이 없습니다</h3>
                      <p className="text-muted-foreground mb-6">
                        {activeTab === "all" 
                          ? "아직 지원하신 채용공고가 없습니다."
                          : `이 상태의 지원 내역이 없습니다.`}
                      </p>
                      <Link href="/user/jobs">
                        <Button>
                          채용공고 둘러보기
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredApplications.map((application) => (
                      <Card key={application.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                  {application.job?.company?.name?.charAt(0) || "C"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                      {application.job?.title || "채용공고 제목"}
                                    </h3>
                                    {getStatusBadge(application.status)}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3 flex-wrap">
                                    <div className="flex items-center gap-1">
                                      <Building className="w-4 h-4" />
                                      <span>{application.job?.company?.name || "회사명"}</span>
                                    </div>
                                    {application.job?.location && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{application.job.location}</span>
                                      </div>
                                    )}
                                    {application.job && (
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        <span>
                                          {formatSalary(application.job.salaryMin, application.job.salaryMax)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>지원일: {formatDate(application.appliedAt)}</span>
                                  </div>
                                </div>
                              </div>
                              {application.coverLetter && (
                                <div className="mt-4 p-4 bg-muted rounded-lg">
                                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                    {application.coverLetter}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="ml-4 flex flex-col gap-2">
                              <Link href={`/user/jobs/${application.jobId}`}>
                                <Button variant="outline" size="sm">
                                  채용공고 보기
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                              {application.job?.company?.id && (
                                <>
                                  <Link href={`/user/companies/${application.job.company.id}`}>
                                    <Button variant="outline" size="sm">
                                      <Eye className="mr-2 h-4 w-4" />
                                      기업 보기
                                    </Button>
                                  </Link>
                                  {/* 채팅은 Company가 시작한 경우만 표시 */}
                                  {application.status !== "pending" && (
                                    <Link href={`/user/chat?job=${application.jobId}&company=${application.job.company.id}`}>
                                      <Button variant="default" size="sm">
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        채팅하기
                                      </Button>
                                    </Link>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
          <Footer />
        </div>
      </ProtectedPage>
    </RoleGuard>
  );
}