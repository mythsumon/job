import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, apiGet } from "@/lib/queryClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Building2, 
  MapPin,
  Users,
  Calendar,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  User as UserIcon,
  LayoutDashboard,
  ExternalLink,
  UserPlus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Shield,
  Ban,
  CheckCircle2,
  Save,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function AdminCompanyDetail() {
  const [location, setLocation] = useLocation();
  const companyId = location.split("/").pop();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedCompanyUser, setSelectedCompanyUser] = useState<any>(null);
  const [createUserFormData, setCreateUserFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "member",
  });
  // TODO: Connect to backend when available
  // Local UI state for company plan (no API calls)
  const [companyPlan, setCompanyPlan] = useState<"basic" | "professional" | "enterprise">("basic");

  // Fetch company details
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ["/api/admin/companies", companyId],
    queryFn: async () => {
      return apiGet(`/api/admin/companies/${companyId}`);
    },
    enabled: !!companyId,
  });

  // Initialize company plan from API or default to basic
  // TODO: Replace with backend plan value when available
  useEffect(() => {
    if (company?.plan) {
      setCompanyPlan(company.plan);
    } else {
      setCompanyPlan("basic");
    }
  }, [company]);

  // Fetch company users
  const { data: companyUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/companies", companyId, "users"],
    queryFn: async () => {
      return apiGet(`/api/admin/companies/${companyId}/users`);
    },
    enabled: !!companyId,
  });

  // Create company user mutation
  const createCompanyUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/admin/companies/${companyId}/users`, {
        ...data,
        userType: "employer",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies", companyId, "users"] });
      setIsCreateUserDialogOpen(false);
      setCreateUserFormData({
        email: "",
        password: "",
        fullName: "",
        phone: "",
        role: "member",
      });
      toast({
        title: "성공",
        description: "회사 사용자가 생성되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "회사 사용자 생성에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Update company user role mutation
  const updateCompanyUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      return apiRequest("PUT", `/api/admin/companies/${companyId}/users/${userId}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies", companyId, "users"] });
      setIsEditUserDialogOpen(false);
      setSelectedCompanyUser(null);
      toast({
        title: "성공",
        description: "사용자 역할이 업데이트되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "사용자 역할 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Toggle company user active status
  const toggleCompanyUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/admin/companies/${companyId}/users/${userId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies", companyId, "users"] });
      toast({
        title: "성공",
        description: "사용자 상태가 변경되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "사용자 상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Delete company user mutation
  const deleteCompanyUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("DELETE", `/api/admin/companies/${companyId}/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies", companyId, "users"] });
      toast({
        title: "성공",
        description: "회사 사용자가 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "회사 사용자 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = () => {
    if (!createUserFormData.email || !createUserFormData.password || !createUserFormData.fullName) {
      toast({
        title: "입력 오류",
        description: "이메일, 비밀번호, 이름은 필수 항목입니다.",
        variant: "destructive",
      });
      return;
    }
    createCompanyUserMutation.mutate(createUserFormData);
  };

  const handleEditUser = (companyUser: any) => {
    setSelectedCompanyUser(companyUser);
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateRole = () => {
    if (!selectedCompanyUser) return;
    updateCompanyUserRoleMutation.mutate({
      userId: selectedCompanyUser.userId,
      role: selectedCompanyUser.role,
    });
  };

  const handleToggleStatus = (companyUser: any) => {
    toggleCompanyUserStatusMutation.mutate({
      userId: companyUser.userId,
      isActive: !companyUser.isActive,
    });
  };

  const handleDeleteUser = (companyUser: any) => {
    if (window.confirm(`정말로 ${companyUser.user?.fullName || companyUser.user?.email} 사용자를 이 회사에서 제거하시겠습니까?`)) {
      deleteCompanyUserMutation.mutate(companyUser.userId);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      owner: { label: "소유자", variant: "default" },
      admin: { label: "관리자", variant: "secondary" },
      hr: { label: "HR", variant: "outline" },
      member: { label: "멤버", variant: "outline" },
    };
    const roleInfo = roleMap[role] || roleMap.member;
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return <Badge className="bg-green-500 hover:bg-green-600">승인됨</Badge>;
    } else if (status === "pending") {
      return <Badge variant="secondary">승인대기</Badge>;
    } else if (status === "rejected") {
      return <Badge variant="destructive">거절됨</Badge>;
    }
    return <Badge variant="outline">중지됨</Badge>;
  };

  if (isLoadingCompany) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/admin/companies")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              뒤로가기
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {company?.name || "기업 상세 정보"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                회사 정보 및 사용자 계정 관리
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/user/companies/${companyId}`} target="_blank">
                <Button variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  웹사이트 프로필
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href={`/company/dashboard?company=${companyId}`} target="_blank">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  기업 대시보드
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Company Info and Users Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">회사 정보</TabsTrigger>
            <TabsTrigger value="users">
              회사 사용자 ({companyUsers.length})
            </TabsTrigger>
          </TabsList>

          {/* Company Info Tab */}
          <TabsContent value="info" className="mt-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>기업 정보</CardTitle>
                <CardDescription>
                  기업의 기본 정보 및 상태
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                      {company?.logo ? (
                        <img src={company.logo} alt={company.name} className="h-16 w-16 rounded object-cover" />
                      ) : (
                        <Building2 className="h-10 w-10 text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{company?.name}</h2>
                      <p className="text-gray-600 dark:text-gray-400">{company?.description || "설명 없음"}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">기본 정보</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>위치: {company?.location || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>규모: {company?.size || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span>웹사이트: {company?.website || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>등록일: {company?.createdAt ? new Date(company.createdAt).toLocaleDateString() : "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <span>업종: {company?.industry || "-"}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">상태 정보</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          상태: {company?.status ? getStatusBadge(company.status) : "-"}
                        </div>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span>직원 수: {company?.employeeCount || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>이메일: {company?.email || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>전화: {company?.phone || "-"}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Company Plan Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Company Plan</CardTitle>
                      <CardDescription>
                        기업의 플랜을 설정합니다
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="company-plan">Company Plan</Label>
                        <Select
                          value={companyPlan}
                          onValueChange={(value: "basic" | "professional" | "enterprise") => {
                            setCompanyPlan(value);
                            // TODO: Save plan to backend when API is ready
                          }}
                        >
                          <SelectTrigger id="company-plan" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="professional">Professional (Pro)</SelectItem>
                            <SelectItem value="enterprise">Enterprise (Premium)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500 mt-2">
                          {/* TODO: Replace with backend plan value when available */}
                          현재 선택된 플랜은 로컬 상태에만 저장됩니다. 백엔드 API 연결 시 자동으로 동기화됩니다.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>회사 사용자 관리</CardTitle>
                    <CardDescription>
                      이 회사에 속한 모든 사용자 계정을 관리합니다
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsCreateUserDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    사용자 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">로딩 중...</p>
                  </div>
                ) : companyUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">등록된 사용자가 없습니다.</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>사용자</TableHead>
                          <TableHead>이메일</TableHead>
                          <TableHead>전화번호</TableHead>
                          <TableHead>역할</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>가입일</TableHead>
                          <TableHead>작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companyUsers.map((companyUser: any) => (
                          <TableRow key={companyUser.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {(companyUser.user?.fullName || "U").charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{companyUser.user?.fullName || "이름 없음"}</div>
                                  {companyUser.isPrimary && (
                                    <Badge variant="outline" className="text-xs">기본 계정</Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{companyUser.user?.email || "-"}</TableCell>
                            <TableCell>{companyUser.user?.phone || "-"}</TableCell>
                            <TableCell>{getRoleBadge(companyUser.role)}</TableCell>
                            <TableCell>
                              {companyUser.isActive ? (
                                <Badge className="bg-green-500">활성</Badge>
                              ) : (
                                <Badge variant="destructive">비활성</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {companyUser.joinedAt ? new Date(companyUser.joinedAt).toLocaleDateString() : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditUser(companyUser)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(companyUser)}
                                >
                                  {companyUser.isActive ? (
                                    <Ban className="h-4 w-4 text-orange-500" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  )}
                                </Button>
                                {!companyUser.isPrimary && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteUser(companyUser)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create User Dialog */}
        <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>회사 사용자 추가</DialogTitle>
              <DialogDescription>
                이 회사에 새로운 사용자 계정을 생성합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-email">이메일 *</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createUserFormData.email}
                    onChange={(e) => setCreateUserFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-password">비밀번호 *</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createUserFormData.password}
                    onChange={(e) => setCreateUserFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="최소 6자 이상"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-fullName">이름 *</Label>
                  <Input
                    id="create-fullName"
                    value={createUserFormData.fullName}
                    onChange={(e) => setCreateUserFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="이름 입력"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-phone">전화번호</Label>
                  <Input
                    id="create-phone"
                    type="tel"
                    value={createUserFormData.phone}
                    onChange={(e) => setCreateUserFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+976 12345678"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="create-role">역할 *</Label>
                  <Select
                    value={createUserFormData.role}
                    onValueChange={(value) => setCreateUserFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger id="create-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">소유자</SelectItem>
                      <SelectItem value="admin">관리자</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="member">멤버</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateUserDialogOpen(false);
                    setCreateUserFormData({
                      email: "",
                      password: "",
                      fullName: "",
                      phone: "",
                      role: "member",
                    });
                  }}
                >
                  취소
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={createCompanyUserMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {createCompanyUserMutation.isPending ? "생성 중..." : "생성"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>사용자 역할 수정</DialogTitle>
              <DialogDescription>
                {selectedCompanyUser?.user?.fullName || selectedCompanyUser?.user?.email}의 역할을 변경합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>역할</Label>
                <Select
                  value={selectedCompanyUser?.role || "member"}
                  onValueChange={(value) => setSelectedCompanyUser((prev: any) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">소유자</SelectItem>
                    <SelectItem value="admin">관리자</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="member">멤버</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditUserDialogOpen(false);
                    setSelectedCompanyUser(null);
                  }}
                >
                  취소
                </Button>
                <Button
                  onClick={handleUpdateRole}
                  disabled={updateCompanyUserRoleMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {updateCompanyUserRoleMutation.isPending ? "저장 중..." : "저장"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
