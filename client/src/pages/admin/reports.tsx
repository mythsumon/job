import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, apiGet } from "@/lib/queryClient";
import { 
  AlertTriangle,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  User,
  Briefcase,
  Building2,
  Calendar,
  MessageSquare,
  Ban,
  Trash2,
  FileText,
} from "lucide-react";
import { Link } from "wouter";

interface Report {
  id: number;
  type: "user" | "job" | "company";
  targetId: number;
  targetName: string;
  reporterId: number;
  reporterName: string;
  reporterEmail: string;
  reason: string;
  description: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: number;
  resolvedByName?: string;
  resolutionNote?: string;
}

export default function AdminReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "user" | "job" | "company">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "reviewed" | "resolved" | "dismissed">("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [activeTab, setActiveTab] = useState<"user" | "job" | "company">("user");

  // Fetch reports
  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["/api/admin/reports", { type: typeFilter, status: statusFilter, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      try {
        const response = await apiGet<Report[]>(`/api/admin/reports?${params.toString()}`);
        return Array.isArray(response) ? response : [];
      } catch {
        return [];
      }
    },
  });

  // Filter reports by type
  const userReports = reports.filter(r => r.type === "user");
  const jobReports = reports.filter(r => r.type === "job");
  const companyReports = reports.filter(r => r.type === "company");

  const getDisplayReports = () => {
    switch (activeTab) {
      case "user":
        return userReports;
      case "job":
        return jobReports;
      case "company":
        return companyReports;
      default:
        return reports;
    }
  };

  const displayReports = getDisplayReports();

  // Resolve report
  const resolveReportMutation = useMutation({
    mutationFn: async ({ reportId, action, note }: { reportId: number; action: string; note?: string }) => {
      return apiRequest("PUT", `/api/admin/reports/${reportId}/resolve`, { action, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      setIsDetailDialogOpen(false);
      setResolutionNote("");
      toast({
        title: "성공",
        description: "리포트가 처리되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "리포트 처리에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleResolveReport = (action: "resolved" | "dismissed") => {
    if (!selectedReport) return;
    resolveReportMutation.mutate({
      reportId: selectedReport.id,
      action,
      note: resolutionNote || undefined,
    });
  };

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setResolutionNote("");
    setIsDetailDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="destructive">대기중</Badge>;
      case "reviewed":
        return <Badge variant="secondary">검토중</Badge>;
      case "resolved":
        return <Badge variant="default" className="bg-green-600">처리완료</Badge>;
      case "dismissed":
        return <Badge variant="outline">기각됨</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />;
      case "job":
        return <Briefcase className="h-4 w-4" />;
      case "company":
        return <Building2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "user":
        return "구직자";
      case "job":
        return "채용공고";
      case "company":
        return "회사";
      default:
        return type;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                리포트 관리
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                신고된 구직자, 채용공고, 회사를 관리하고 처리합니다
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                전체 리포트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                구직자 리포트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{userReports.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                채용공고 리포트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{jobReports.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                회사 리포트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{companyReports.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle>리포트 목록</CardTitle>
            <CardDescription>
              신고된 항목들을 확인하고 처리할 수 있습니다
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="리포트 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="reviewed">검토중</SelectItem>
                  <SelectItem value="resolved">처리완료</SelectItem>
                  <SelectItem value="dismissed">기각됨</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="mb-6">
              <TabsList>
                <TabsTrigger value="user">
                  <User className="h-4 w-4 mr-2" />
                  구직자 ({userReports.length})
                </TabsTrigger>
                <TabsTrigger value="job">
                  <Briefcase className="h-4 w-4 mr-2" />
                  채용공고 ({jobReports.length})
                </TabsTrigger>
                <TabsTrigger value="company">
                  <Building2 className="h-4 w-4 mr-2" />
                  회사 ({companyReports.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Reports Table */}
            <div className="rounded-md border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>유형</TableHead>
                    <TableHead>대상</TableHead>
                    <TableHead>신고자</TableHead>
                    <TableHead>사유</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>신고일</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                      </TableRow>
                    ))
                  ) : displayReports.length > 0 ? (
                    displayReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(report.type)}
                            <span className="text-sm">{getTypeLabel(report.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{report.targetName}</div>
                          <div className="text-xs text-gray-500">ID: {report.targetId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{report.reporterName}</div>
                          <div className="text-xs text-gray-500">{report.reporterEmail}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {report.reason}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(report.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(report)}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            상세
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        리포트가 없습니다
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Report Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedReport && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    리포트 상세 정보
                  </DialogTitle>
                  <DialogDescription>
                    리포트의 상세 정보를 확인하고 처리할 수 있습니다
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Report Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        리포트 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-500">유형</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {getTypeIcon(selectedReport.type)}
                            <span className="font-medium">{getTypeLabel(selectedReport.type)}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">상태</Label>
                          <div className="mt-1">
                            {getStatusBadge(selectedReport.status)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">대상</Label>
                          <div className="mt-1">
                            <p className="font-medium">{selectedReport.targetName}</p>
                            <p className="text-xs text-gray-500">ID: {selectedReport.targetId}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">신고일</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(selectedReport.createdAt).toLocaleString('ko-KR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reporter Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        신고자 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-sm text-gray-500">이름</Label>
                        <p className="font-medium">{selectedReport.reporterName}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">이메일</Label>
                        <p className="font-medium">{selectedReport.reporterEmail}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">사유</Label>
                        <Badge variant="outline" className="mt-1">
                          {selectedReport.reason}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">상세 설명</Label>
                        <p className="mt-1 text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded">
                          {selectedReport.description || "설명 없음"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resolution Info */}
                  {selectedReport.status !== "pending" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          처리 정보
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedReport.resolvedAt && (
                          <div>
                            <Label className="text-sm text-gray-500">처리일</Label>
                            <p className="font-medium">
                              {new Date(selectedReport.resolvedAt).toLocaleString('ko-KR')}
                            </p>
                          </div>
                        )}
                        {selectedReport.resolvedByName && (
                          <div>
                            <Label className="text-sm text-gray-500">처리자</Label>
                            <p className="font-medium">{selectedReport.resolvedByName}</p>
                          </div>
                        )}
                        {selectedReport.resolutionNote && (
                          <div>
                            <Label className="text-sm text-gray-500">처리 메모</Label>
                            <p className="mt-1 text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded">
                              {selectedReport.resolutionNote}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  {selectedReport.status === "pending" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>리포트 처리</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="resolutionNote">처리 메모 (선택사항)</Label>
                          <Textarea
                            id="resolutionNote"
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            placeholder="처리 메모를 입력하세요..."
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleResolveReport("resolved")}
                            disabled={resolveReportMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            처리 완료
                          </Button>
                          <Button
                            onClick={() => handleResolveReport("dismissed")}
                            disabled={resolveReportMutation.isPending}
                            variant="outline"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            기각
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Links */}
                  <Card>
                    <CardHeader>
                      <CardTitle>빠른 링크</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.type === "user" && (
                          <Link href={`/admin/users`} target="_blank">
                            <Button variant="outline" size="sm">
                              <User className="h-4 w-4 mr-2" />
                              사용자 관리
                            </Button>
                          </Link>
                        )}
                        {selectedReport.type === "job" && (
                          <Link href={`/admin/jobs`} target="_blank">
                            <Button variant="outline" size="sm">
                              <Briefcase className="h-4 w-4 mr-2" />
                              채용공고 관리
                            </Button>
                          </Link>
                        )}
                        {selectedReport.type === "company" && (
                          <Link href={`/admin/companies`} target="_blank">
                            <Button variant="outline" size="sm">
                              <Building2 className="h-4 w-4 mr-2" />
                              회사 관리
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}


