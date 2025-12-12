import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Briefcase, 
  Search, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Flag,
  Calendar,
  Building2,
  Filter,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { Link, useLocation } from "wouter";

// Job Status Types
type JobStatus = "public" | "private" | "closed" | "pending" | "rejected";

interface Job {
  id: number;
  companyId: number;
  company: {
    id: number;
    name: string;
  };
  title: string;
  description: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  status: JobStatus;
  isFeatured: boolean;
  isPro: boolean;
  isActive: boolean;
  isRemote: boolean;
  views: number;
  applicationsCount: number;
  createdAt: string;
  postedAt: string;
  expiresAt?: string;
  reportedCount?: number;
  reportedReasons?: string[];
}

export default function AdminJobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Local state for job statuses (UI only)
  const [jobStatuses, setJobStatuses] = useState<Record<number, JobStatus>>({});
  const [jobFeatured, setJobFeatured] = useState<Record<number, boolean>>({});
  const [localStats, setLocalStats] = useState({
    totalJobs: 0,
    publicJobs: 0,
    pendingJobs: 0,
    closedJobs: 0,
    reportedJobs: 0,
  });

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/admin/jobs", { 
      search: searchQuery, 
      company: companyFilter, 
      status: statusFilter,
      type: typeFilter,
      dateRange: dateRangeFilter 
    }],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/jobs/stats"],
  });

  // Initialize local stats
  useEffect(() => {
    if (stats) {
      setLocalStats({
        totalJobs: stats.totalJobs || 0,
        publicJobs: stats.publicJobs || 0,
        pendingJobs: stats.pendingJobs || 0,
        closedJobs: stats.closedJobs || 0,
        reportedJobs: stats.reportedJobs || 0,
      });
    }
  }, [stats]);

  // Get job status (from API or local override)
  const getJobStatus = (job: Job): JobStatus => {
    return jobStatuses[job.id] || job.status || "pending";
  };

  // Get job featured status
  const getJobFeatured = (job: Job): boolean => {
    return jobFeatured[job.id] !== undefined ? jobFeatured[job.id] : job.isFeatured;
  };

  const approveJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await apiRequest("POST", `/api/admin/jobs/${jobId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      setLocalStats(prev => ({
        ...prev,
        publicJobs: prev.publicJobs + 1,
        pendingJobs: Math.max(0, prev.pendingJobs - 1),
      }));
      toast({
        title: "승인 완료",
        description: "채용공고가 승인되어 웹사이트에 게시되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "채용공고 승인에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const rejectJobMutation = useMutation({
    mutationFn: async ({ jobId, reason }: { jobId: number; reason: string }) => {
      return await apiRequest("POST", `/api/admin/jobs/${jobId}/reject`, { reason });
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      setJobStatuses(prev => ({ ...prev, [jobId]: "rejected" }));
      setLocalStats(prev => ({
        ...prev,
        pendingJobs: Math.max(0, prev.pendingJobs - 1),
      }));
      toast({
        title: "거부 완료",
        description: "채용공고가 거부되었습니다.",
      });
      setIsRejectDialogOpen(false);
      setRejectReason("");
      setSelectedJob(null);
    },
    onError: () => {
      toast({
        title: "오류",
        description: "채용공고 거부에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Handle approve (change status to public)
  const handleApprove = (job: Job) => {
    const currentStatus = getJobStatus(job);
    if (currentStatus === "pending" || currentStatus === "rejected") {
      approveJobMutation.mutate(job.id);
      setJobStatuses(prev => ({ ...prev, [job.id]: "public" }));
    }
  };

  // Handle reject (change status to private)
  const handleReject = (job: Job) => {
    setSelectedJob(job);
    setIsRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedJob) {
      rejectJobMutation.mutate({ 
        jobId: selectedJob.id, 
        reason: rejectReason || "No reason provided" 
      });
    }
  };

  // Handle close job
  const handleClose = (job: Job) => {
    const currentStatus = getJobStatus(job);
    setJobStatuses(prev => ({ ...prev, [job.id]: "closed" }));
    if (currentStatus === "public") {
      setLocalStats(prev => ({
        ...prev,
        publicJobs: Math.max(0, prev.publicJobs - 1),
        closedJobs: prev.closedJobs + 1,
      }));
    }
    toast({
      title: "마감 처리 완료",
      description: "채용공고가 마감되었습니다.",
    });
  };

  // Handle toggle featured
  const handleToggleFeatured = (job: Job) => {
    const currentFeatured = getJobFeatured(job);
    setJobFeatured(prev => ({ ...prev, [job.id]: !currentFeatured }));
    toast({
      title: currentFeatured ? "추천 해제" : "추천 설정",
      description: `채용공고가 ${currentFeatured ? "추천 해제" : "추천"}되었습니다.`,
    });
  };

  // Handle view reports
  const handleViewReports = (job: Job) => {
    setSelectedJob(job);
    setIsReportDialogOpen(true);
  };

  // Handle resolve reports
  const handleResolveReports = (job: Job) => {
    // In real app, this would call API to resolve reports
    toast({
      title: "신고 처리 완료",
      description: "신고가 처리되었습니다.",
    });
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: JobStatus) => {
    switch (status) {
      case "public":
        return "default";
      case "private":
        return "secondary";
      case "closed":
        return "destructive";
      case "pending":
        return "outline";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Get status label
  const getStatusLabel = (status: JobStatus) => {
    switch (status) {
      case "public":
        return "공개";
      case "private":
        return "비공개";
      case "closed":
        return "마감";
      case "pending":
        return "검수중";
      case "rejected":
        return "거부됨";
      default:
        return status;
    }
  };

  // Filter jobs
  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany = companyFilter === "all" || job.companyId.toString() === companyFilter;
    const matchesStatus = statusFilter === "all" || getJobStatus(job) === statusFilter;
    const matchesType = typeFilter === "all" || job.employmentType === typeFilter;
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRangeFilter !== "all" && job.postedAt) {
      const postedDate = new Date(job.postedAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateRangeFilter) {
        case "today":
          matchesDateRange = daysDiff === 0;
          break;
        case "week":
          matchesDateRange = daysDiff <= 7;
          break;
        case "month":
          matchesDateRange = daysDiff <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesCompany && matchesStatus && matchesType && matchesDateRange;
  }) || [];

  // Get unique companies for filter
  const companies = Array.from(new Set(jobs?.map(job => ({ id: job.companyId, name: job.company.name })) || []));

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                채용공고 관리
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                전체 채용공고를 관리하고 승인/비승인 처리를 합니다
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                전체 공고
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{localStats.totalJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                공개 공고
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{localStats.publicJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                검수중
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{localStats.pendingJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                마감 공고
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{localStats.closedJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                신고된 공고
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{localStats.reportedJobs}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
          <CardContent className="p-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="제목 또는 기업명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="기업명" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 기업</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="public">공개</SelectItem>
                  <SelectItem value="private">비공개</SelectItem>
                  <SelectItem value="closed">마감</SelectItem>
                  <SelectItem value="pending">검수중</SelectItem>
                  <SelectItem value="rejected">거부됨</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="고용형태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="full_time">정규직</SelectItem>
                  <SelectItem value="contract">계약직</SelectItem>
                  <SelectItem value="freelance">프리랜서</SelectItem>
                  <SelectItem value="internship">인턴십</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="기간" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 기간</SelectItem>
                  <SelectItem value="today">오늘</SelectItem>
                  <SelectItem value="week">최근 7일</SelectItem>
                  <SelectItem value="month">최근 30일</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>기업명</TableHead>
                    <TableHead>위치</TableHead>
                    <TableHead>고용형태</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead>조회수</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        로딩 중...
                      </TableCell>
                    </TableRow>
                  ) : filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        채용공고가 없습니다
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobs.map((job) => {
                      const currentStatus = getJobStatus(job);
                      const isFeatured = getJobFeatured(job);
                      return (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{job.title}</span>
                              {isFeatured && (
                                <Badge variant="default" className="bg-yellow-500">
                                  <Star className="h-3 w-3 mr-1" />
                                  추천
                                </Badge>
                              )}
                              {job.reportedCount && job.reportedCount > 0 && (
                                <Badge variant="destructive">
                                  <Flag className="h-3 w-3 mr-1" />
                                  신고 {job.reportedCount}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Link 
                                href={`/admin/companies/${job.companyId}`}
                                className="font-medium hover:underline text-primary"
                              >
                                {job.company.name}
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setLocation(`/company/jobs?id=${job.id}`)}
                                title="회사 채용공고 페이지로 이동"
                                className="h-6 px-2"
                              >
                                <Building2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setLocation(`/jobs/${job.id}`)}
                                title="웹사이트 채용공고 상세 페이지로 이동"
                                className="h-6 px-2"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {job.isRemote && <Badge variant="outline">원격</Badge>}
                              <span>{job.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{job.employmentType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(currentStatus)}>
                              {getStatusLabel(currentStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(job.postedAt || job.createdAt).toLocaleDateString("ko-KR")}
                          </TableCell>
                          <TableCell>{job.views || 0}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedJob(job);
                                  setIsDetailDialogOpen(true);
                                }}
                                title="상세보기"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {(currentStatus === "pending" || currentStatus === "rejected") && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(job)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    disabled={approveJobMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    {currentStatus === "rejected" ? "재승인" : "승인"}
                                  </Button>
                                  {currentStatus === "pending" && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleReject(job)}
                                      disabled={rejectJobMutation.isPending}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      거부
                                    </Button>
                                  )}
                                </>
                              )}
                              {currentStatus === "public" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleClose(job)}
                                    className="text-gray-600 hover:text-gray-700"
                                    title="마감"
                                  >
                                    <Clock className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleToggleFeatured(job)}
                                    className={isFeatured ? "text-yellow-600" : ""}
                                    title={isFeatured ? "추천 해제" : "추천 설정"}
                                  >
                                    <Star className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {job.reportedCount && job.reportedCount > 0 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewReports(job)}
                                  className="text-orange-600 hover:text-orange-700"
                                  title="신고 확인"
                                >
                                  <Flag className="h-4 w-4" />
                                </Button>
                              )}
                              <Link href={`/user/jobs/${job.id}`}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  title="공고 보기"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Job Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>채용공고 상세 정보</DialogTitle>
              <DialogDescription>
                채용공고의 상세 정보를 확인합니다
              </DialogDescription>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>제목</Label>
                    <p className="font-medium">{selectedJob.title}</p>
                  </div>
                  <div>
                    <Label>기업명</Label>
                    <p className="font-medium">{selectedJob.company.name}</p>
                  </div>
                  <div>
                    <Label>위치</Label>
                    <p>{selectedJob.location} {selectedJob.isRemote && "(원격근무 가능)"}</p>
                  </div>
                  <div>
                    <Label>고용형태</Label>
                    <p>{selectedJob.employmentType}</p>
                  </div>
                  <div>
                    <Label>경력수준</Label>
                    <p>{selectedJob.experienceLevel}</p>
                  </div>
                  <div>
                    <Label>급여</Label>
                    <p>
                      {selectedJob.salaryMin && selectedJob.salaryMax
                        ? `${selectedJob.salaryMin.toLocaleString()}원 - ${selectedJob.salaryMax.toLocaleString()}원`
                        : "면접 후 결정"}
                    </p>
                  </div>
                  <div>
                    <Label>상태</Label>
                    <Badge variant={getStatusBadgeVariant(getJobStatus(selectedJob))}>
                      {getStatusLabel(getJobStatus(selectedJob))}
                    </Badge>
                  </div>
                  <div>
                    <Label>등록일</Label>
                    <p>{new Date(selectedJob.postedAt || selectedJob.createdAt).toLocaleString("ko-KR")}</p>
                  </div>
                </div>
                <div>
                  <Label>설명</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {selectedJob.description}
                  </p>
                </div>
                <div>
                  <Label>요구사항</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {selectedJob.requirements || "없음"}
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">조회수: </span>
                    <span className="font-medium">{selectedJob.views || 0}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">지원자 수: </span>
                    <span className="font-medium">{selectedJob.applicationsCount || 0}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t">
                  {getJobStatus(selectedJob) === "pending" && (
                    <>
                      <Button
                        onClick={() => {
                          handleApprove(selectedJob);
                          setIsDetailDialogOpen(false);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={approveJobMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {approveJobMutation.isPending ? "승인 중..." : "승인"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleReject(selectedJob);
                          setIsDetailDialogOpen(false);
                        }}
                        disabled={rejectJobMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        거부
                      </Button>
                    </>
                  )}
                  {getJobStatus(selectedJob) === "rejected" && (
                    <Button
                      onClick={() => {
                        handleApprove(selectedJob);
                        setIsDetailDialogOpen(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={approveJobMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {approveJobMutation.isPending ? "승인 중..." : "재승인"}
                    </Button>
                  )}
                  {getJobStatus(selectedJob) === "public" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleClose(selectedJob);
                        setIsDetailDialogOpen(false);
                      }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      마감 처리
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Report Dialog */}
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>신고 내역</DialogTitle>
              <DialogDescription>
                이 채용공고에 대한 신고 내역을 확인합니다
              </DialogDescription>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-4">
                <div>
                  <Label>신고 횟수</Label>
                  <p className="font-medium text-red-600">{selectedJob.reportedCount || 0}건</p>
                </div>
                {selectedJob.reportedReasons && selectedJob.reportedReasons.length > 0 && (
                  <div>
                    <Label>신고 사유</Label>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {selectedJob.reportedReasons.map((reason, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsReportDialogOpen(false)}
                  >
                    닫기
                  </Button>
                  <Button
                    onClick={() => {
                      handleResolveReports(selectedJob);
                      setIsReportDialogOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    신고 처리 완료
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>채용공고 비공개 처리</AlertDialogTitle>
              <AlertDialogDescription>
                채용공고를 비공개 처리하시겠습니까? 비공개 처리된 공고는 사용자에게 노출되지 않습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="reject-reason">사유 (선택사항)</Label>
                <Textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="비공개 처리 사유를 입력하세요"
                  className="mt-2"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setSelectedJob(null);
                setRejectReason("");
              }}>
                취소
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRejectConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                거부 처리
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}

