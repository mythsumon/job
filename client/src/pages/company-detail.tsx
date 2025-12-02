import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Building, MapPin, Users, Globe, Calendar, ArrowLeft, Briefcase } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import JobCard from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Company, JobWithCompany } from "@shared/schema";

export default function CompanyDetail() {
  const { id } = useParams();

  const { data: company, isLoading: companyLoading, error } = useQuery<Company>({
    queryKey: [`/api/companies/${id}`],
    enabled: !!id,
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery<JobWithCompany[]>({
    queryKey: [`/api/companies/${id}/jobs`],
    enabled: !!id,
  });

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start mb-6">
                    <Skeleton className="w-20 h-20 rounded-xl mr-6" />
                    <div className="flex-1">
                      <Skeleton className="h-8 w-64 mb-2" />
                      <Skeleton className="h-5 w-32 mb-4" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">기업 정보를 찾을 수 없습니다</h1>
              <p className="text-muted-foreground mb-6">요청하신 기업 정보가 존재하지 않거나 삭제되었습니다.</p>
              <Link href="/companies">
                <Button>기업 목록으로 돌아가기</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const getSizeLabel = (size: string) => {
    const labels: Record<string, string> = {
      startup: "스타트업",
      small: "중소기업",
      medium: "중견기업",
      large: "대기업"
    };
    return labels[size] || size;
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

  const logo = generateCompanyLogo(company.name);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/companies">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            기업 목록으로 돌아가기
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${logo.color} rounded-xl flex items-center justify-center text-white font-bold text-xl mr-6 flex-shrink-0`}>
                    {logo.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold text-foreground mb-2">{company.name}</h1>
                    <p className="text-lg text-primary font-medium mb-4">{company.industry}</p>
                    <div className="flex items-center gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        <span>{company.location}</span>
                      </div>
                      {company.employeeCount && (
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          <span>{company.employeeCount}명</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Building className="mr-1 h-4 w-4" />
                        <span>{getSizeLabel(company.size)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{company.industry}</Badge>
                      <Badge variant="outline">{getSizeLabel(company.size)}</Badge>
                      {company.founded && (
                        <Badge variant="outline">설립 {company.founded}년</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Description */}
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <h3 className="text-lg font-semibold mb-3">회사 소개</h3>
                  <p className="text-foreground leading-relaxed">{company.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Company Culture */}
            {company.culture && (
              <Card>
                <CardHeader>
                  <CardTitle>기업 문화</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">{company.culture}</p>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {company.benefits && company.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>복리혜택</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {company.benefits.map((benefit) => (
                      <Badge key={benefit} variant="secondary">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Open Positions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  채용중인 포지션 ({jobs?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="job-card">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start flex-1">
                            <Skeleton className="w-14 h-14 rounded-xl mr-4" />
                            <div className="flex-1">
                              <Skeleton className="h-6 w-48 mb-2" />
                              <Skeleton className="h-4 w-32 mb-1" />
                              <Skeleton className="h-4 w-40" />
                            </div>
                          </div>
                          <div className="text-right">
                            <Skeleton className="w-6 h-6 mb-2 ml-auto" />
                            <Skeleton className="h-5 w-20 mb-1" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-4" />
                        <div className="flex gap-2 mb-4">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-14" />
                        </div>
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : jobs && jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">현재 채용중인 포지션이 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>기업 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">업종</span>
                    <span className="text-sm font-medium">{company.industry}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">규모</span>
                    <span className="text-sm font-medium">{getSizeLabel(company.size)}</span>
                  </div>
                  {company.employeeCount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">직원 수</span>
                      <span className="text-sm font-medium">{company.employeeCount}명</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">위치</span>
                    <span className="text-sm font-medium">{company.location}</span>
                  </div>
                  {company.founded && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">설립년도</span>
                      <span className="text-sm font-medium">{company.founded}년</span>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">웹사이트</span>
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-primary hover:underline flex items-center"
                      >
                        <Globe className="mr-1 h-3 w-3" />
                        방문
                      </a>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  {company.website && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={company.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="mr-2 h-4 w-4" />
                        회사 웹사이트
                      </a>
                    </Button>
                  )}
                  <Link href={`/jobs?companyId=${company.id}`}>
                    <Button className="w-full">
                      <Briefcase className="mr-2 h-4 w-4" />
                      전체 채용공고 보기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Job Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>채용 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">전체 채용공고</span>
                    <span className="text-lg font-bold text-primary">{jobs?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">신규 채용</span>
                    <span className="text-sm font-medium">
                      {jobs?.filter(job => {
                        const daysDiff = job.createdAt ? 
                          Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 
                          0;
                        return daysDiff <= 7;
                      }).length || 0}개
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">긴급 채용</span>
                    <span className="text-sm font-medium">
                      {jobs?.filter(job => job.isUrgent).length || 0}개
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
