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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Building2, 
  Search, 
  Eye,
  MapPin,
  Users,
  Calendar,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  LayoutDashboard,
  Ban,
  User
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function AdminCompanies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Local UI state for company statuses (no API calls)
  const [companyStatuses, setCompanyStatuses] = useState<Record<number, string>>({});
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedCompanyForReject, setSelectedCompanyForReject] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Local UI state for stats (updates visually only)
  const [localStats, setLocalStats] = useState({
    totalCompanies: 0,
    approvedCompanies: 0,
    pendingCompanies: 0,
    activeJobs: 0,
  });

  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/admin/companies", { search: searchQuery, industry: selectedIndustry, size: selectedSize, page }],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/companies/stats"],
  });

  // Initialize local stats from API data
  useEffect(() => {
    if (stats) {
      setLocalStats({
        totalCompanies: stats.totalCompanies || 0,
        approvedCompanies: stats.approvedCompanies || 0,
        pendingCompanies: stats.pendingCompanies || 0,
        activeJobs: stats.activeJobs || 0,
      });
    }
  }, [stats]);

  // Get company status (from API or local override)
  const getCompanyStatus = (company: any): string => {
    return companyStatuses[company.id] || company.status || "pending";
  };

  const queryClient = useQueryClient();

  // Approve company mutation
  const approveCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      return apiRequest("POST", `/api/admin/companies/${companyId}/approve`, {});
    },
    onSuccess: (_, companyId) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      
      // Update local state
      setCompanyStatuses(prev => ({ ...prev, [companyId]: "approved" }));
      
      // Update local stats
      setLocalStats(prev => ({
        ...prev,
        approvedCompanies: prev.approvedCompanies + 1,
        pendingCompanies: Math.max(0, prev.pendingCompanies - 1),
      }));

      toast({
        title: "성공",
        description: "기업이 승인되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "기업 승인에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Handle approve (works for both pending and rejected companies)
  const handleApprove = (company: any) => {
    const currentStatus = getCompanyStatus(company);
    if (currentStatus === "pending" || currentStatus === "rejected") {
      approveCompanyMutation.mutate(company.id);
    }
  };

  // Handle reject (opens modal)
  const handleRejectClick = (company: any) => {
    setSelectedCompanyForReject(company);
    setIsRejectDialogOpen(true);
  };

  // Reject company mutation
  const rejectCompanyMutation = useMutation({
    mutationFn: async ({ companyId, reason }: { companyId: number; reason: string }) => {
      return apiRequest("POST", `/api/admin/companies/${companyId}/reject`, { reason });
    },
    onSuccess: (_, { companyId }) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      
      // Update local state
      setCompanyStatuses(prev => ({ ...prev, [companyId]: "rejected" }));
      
      // Update local stats
      setLocalStats(prev => ({
        ...prev,
        pendingCompanies: Math.max(0, prev.pendingCompanies - 1),
      }));

      toast({
        title: "성공",
        description: "기업이 거절되었습니다.",
      });

      // Close modal and reset
      setIsRejectDialogOpen(false);
      setRejectReason("");
      setSelectedCompanyForReject(null);
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "기업 거절에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Handle reject confirmation
  const handleRejectConfirm = () => {
    if (!selectedCompanyForReject) return;

    const currentStatus = getCompanyStatus(selectedCompanyForReject);
    if (currentStatus === "pending") {
      rejectCompanyMutation.mutate({
        companyId: selectedCompanyForReject.id,
        reason: rejectReason || "관리자에 의해 거절됨",
      });
    }
  };

  // Suspend company mutation
  const suspendCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      return apiRequest("POST", `/api/admin/companies/${companyId}/suspend`, {});
    },
    onSuccess: (_, companyId) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      
      setCompanyStatuses(prev => ({ ...prev, [companyId]: "suspended" }));
      setLocalStats(prev => ({
        ...prev,
        approvedCompanies: Math.max(0, prev.approvedCompanies - 1),
      }));
      toast({
        title: "성공",
        description: "기업이 중지되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "기업 중지에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Reactivate company mutation
  const reactivateCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      return apiRequest("POST", `/api/admin/companies/${companyId}/reactivate`, {});
    },
    onSuccess: (_, companyId) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      
      setCompanyStatuses(prev => ({ ...prev, [companyId]: "approved" }));
      setLocalStats(prev => ({
        ...prev,
        approvedCompanies: prev.approvedCompanies + 1,
      }));
      toast({
        title: "성공",
        description: "기업이 재활성화되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "기업 재활성화에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      return apiRequest("DELETE", `/api/admin/companies/${companyId}`);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      
      toast({
        title: "성공",
        description: "기업이 삭제되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "기업 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Handle suspend (for approved companies)
  const handleSuspend = (company: any) => {
    const currentStatus = getCompanyStatus(company);
    if (currentStatus === "approved") {
      if (window.confirm(`정말로 "${company.name}" 기업을 중지하시겠습니까? 모든 채용공고가 비활성화됩니다.`)) {
        suspendCompanyMutation.mutate(company.id);
      }
    }
  };

  // Handle reactivate (for suspended companies)
  const handleReactivate = (company: any) => {
    const currentStatus = getCompanyStatus(company);
    if (currentStatus === "suspended") {
      reactivateCompanyMutation.mutate(company.id);
    }
  };

  // Handle delete
  const handleDelete = (company: any) => {
    if (window.confirm(`정말로 "${company.name}" 기업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 관련 데이터(채용공고, 사용자 등)가 삭제됩니다.`)) {
      deleteCompanyMutation.mutate(company.id);
    }
  };

  // Handle detail view redirect
  const handleViewDetail = (companyId: number) => {
    setLocation(`/admin/companies/${companyId}`);
  };

  const filteredCompanies = companies?.data || [];
  const totalPages = Math.ceil((companies?.total || 0) / 10);

  // Use local stats if available, otherwise fall back to API stats
  const displayStats = {
    totalCompanies: localStats.totalCompanies || stats?.totalCompanies || 0,
    approvedCompanies: localStats.approvedCompanies || stats?.approvedCompanies || 0,
    pendingCompanies: localStats.pendingCompanies || stats?.pendingCompanies || 0,
    activeJobs: localStats.activeJobs || stats?.activeJobs || 0,
  };

  return (
    <TooltipProvider>
      <AdminLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              기업 관리
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              등록된 기업들을 관리하고 승인/거절을 처리합니다
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전체 기업</CardTitle>
                <Building2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.totalCompanies}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">승인된 기업</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.approvedCompanies}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.pendingCompanies}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">활성 채용공고</CardTitle>
                <Briefcase className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.activeJobs}</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>기업 목록</CardTitle>
              <CardDescription>
                등록된 모든 기업을 확인하고 관리할 수 있습니다
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="기업 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="업종" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Finance">금융</SelectItem>
                    <SelectItem value="Manufacturing">제조업</SelectItem>
                    <SelectItem value="Healthcare">의료</SelectItem>
                    <SelectItem value="Education">교육</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="규모" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="startup">스타트업</SelectItem>
                    <SelectItem value="small">중소기업</SelectItem>
                    <SelectItem value="medium">중견기업</SelectItem>
                    <SelectItem value="large">대기업</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Companies Table */}
              <div className="rounded-md border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>기업</TableHead>
                      <TableHead>업종</TableHead>
                      <TableHead>규모</TableHead>
                      <TableHead>위치</TableHead>
                      <TableHead>소유자</TableHead>
                      <TableHead>등록일</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                          </TableCell>
                          <TableCell><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                          <TableCell><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                          <TableCell><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                          <TableCell><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                          <TableCell><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                          <TableCell><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                          <TableCell><div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredCompanies.length > 0 ? (
                      filteredCompanies.map((company: any) => {
                        const status = getCompanyStatus(company);
                        return (
                          <TableRow key={company.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                                  {company.logo ? (
                                    <img src={company.logo} alt={company.name} className="h-8 w-8 rounded object-cover" />
                                  ) : (
                                    <Building2 className="h-5 w-5 text-white" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">{company.name}</div>
                                  <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {company.website || "웹사이트 없음"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {company.industry}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                {company.size === "startup" ? "스타트업" :
                                 company.size === "small" ? "중소기업" :
                                 company.size === "medium" ? "중견기업" : "대기업"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                {company.location}
                              </div>
                            </TableCell>
                            <TableCell>
                              {company.ownerUser ? (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{company.ownerUser.fullName || company.ownerUser.username || company.ownerUser.email}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(company.createdAt).toLocaleDateString('ko-KR')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  status === "approved" ? "default" :
                                  status === "pending" ? "secondary" : "destructive"
                                }
                                className={
                                  status === "approved" ? "bg-green-500 hover:bg-green-600" :
                                  status === "pending" ? "" :
                                  "bg-red-500 hover:bg-red-600"
                                }
                              >
                                {status === "approved" ? "승인됨" :
                                 status === "pending" ? "승인대기" : 
                                 status === "rejected" ? "거절됨" : "중지됨"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {(status === "pending" || status === "rejected") && (
                                  <>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleApprove(company)}
                                          className="hover:bg-green-50 dark:hover:bg-green-900/20 border-green-500 text-green-600 hover:text-green-700"
                                          disabled={approveCompanyMutation.isPending}
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{status === "rejected" ? "재승인" : "승인"}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    {status === "pending" && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRejectClick(company)}
                                            className="hover:bg-red-50 dark:hover:bg-red-900/20 border-red-500 text-red-600 hover:text-red-700"
                                            disabled={rejectCompanyMutation.isPending}
                                          >
                                            <XCircle className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>거절</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </>
                                )}
                                {status === "approved" && (
                                  <>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleSuspend(company)}
                                          className="hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                          disabled={suspendCompanyMutation.isPending}
                                        >
                                          <Ban className="h-4 w-4 text-orange-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>중지</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </>
                                )}
                                {status === "suspended" && (
                                  <>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleReactivate(company)}
                                          className="hover:bg-green-50 dark:hover:bg-green-900/20 border-green-500 text-green-600 hover:text-green-700"
                                          disabled={reactivateCompanyMutation.isPending}
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>재활성화</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/admin/companies/${company.id}`}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>상세보기</p>
                                  </TooltipContent>
                                </Tooltip>
                                {status === "approved" && (
                                  <>
                                    <Link href={`/user/companies/${company.id}`} target="_blank">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="sm" title="웹사이트 기업 프로필 보기">
                                            <Building2 className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>웹사이트 프로필</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </Link>
                                    <Link href={`/company/dashboard?company=${company.id}`} target="_blank">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="sm" title="기업 대시보드 보기">
                                            <LayoutDashboard className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>대시보드</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </Link>
                                  </>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(company)}
                                      className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700"
                                      disabled={deleteCompanyMutation.isPending}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>삭제</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          기업이 없습니다
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      이전
                    </Button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={page === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      다음
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reject Modal */}
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  기업 거절
                </DialogTitle>
                <DialogDescription>
                  {selectedCompanyForReject && (
                    <span>"{selectedCompanyForReject.name}" 기업을 거절하시겠습니까?</span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="reject-reason">사유를 입력하세요</Label>
                  <Textarea
                    id="reject-reason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="거절 사유를 입력하세요..."
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRejectDialogOpen(false);
                    setRejectReason("");
                    setSelectedCompanyForReject(null);
                  }}
                >
                  취소
                </Button>
                <Button
                  onClick={handleRejectConfirm}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  거절하기
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </TooltipProvider>
  );
}