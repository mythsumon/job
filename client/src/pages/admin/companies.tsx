import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Building2, 
  Search, 
  MoreHorizontal, 
  Eye,
  Edit,
  Trash2,
  MapPin,
  Users,
  Calendar,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase
} from "lucide-react";

export default function AdminCompanies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/admin/companies", { search: searchQuery, industry: selectedIndustry, size: selectedSize, page }],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/companies/stats"],
  });

  const approveCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      return apiRequest("PATCH", `/api/admin/companies/${companyId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      toast({
        title: "성공",
        description: "기업이 승인되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "기업 승인에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const rejectCompanyMutation = useMutation({
    mutationFn: async (companyId: number) => {
      return apiRequest("PATCH", `/api/admin/companies/${companyId}/reject`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      toast({
        title: "성공",
        description: "기업이 거절되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "기업 거절에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const filteredCompanies = companies?.data || [];
  const totalPages = Math.ceil((companies?.total || 0) / 10);

  return (
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
              <div className="text-2xl font-bold">{stats?.totalCompanies || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인된 기업</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.approvedCompanies || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingCompanies || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 채용공고</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeJobs || 0}</div>
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
                        <TableCell><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company: any) => (
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
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(company.createdAt).toLocaleDateString('ko-KR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              company.status === "approved" ? "default" :
                              company.status === "pending" ? "secondary" : "destructive"
                            }
                          >
                            {company.status === "approved" ? "승인됨" :
                             company.status === "pending" ? "승인대기" : "거절됨"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {company.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => approveCompanyMutation.mutate(company.id)}
                                  disabled={approveCompanyMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => rejectCompanyMutation.mutate(company.id)}
                                  disabled={rejectCompanyMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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
      </div>
    </AdminLayout>
  );
}