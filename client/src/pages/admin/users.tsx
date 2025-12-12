import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Ban, 
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Filter,
  User,
  Building2,
  LayoutDashboard,
  Eye,
  ExternalLink,
  Info,
  Briefcase,
  FileText,
  Activity,
  Clock,
  Shield,
  Edit,
  Save,
  X,
  MessageSquare,
  Trash2,
  Key,
  Lock,
  Unlock
} from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    isActive: true,
    userType: "",
    role: "",
  });
  const [createFormData, setCreateFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    location: "",
    bio: "",
    userType: "job_seeker",
    role: "user", // For admin: "admin" or "super_admin"
    isActive: true,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users", { search: searchQuery, userType: selectedUserType, status: selectedStatus, page }],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/users/stats"],
  });

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setEditFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
      bio: user.bio || "",
      isActive: user.isActive ?? true,
      userType: user.userType || "",
      role: user.role || (user.userType === "admin" ? "admin" : "user"),
    });
    setIsEditing(false);
    setIsDetailDialogOpen(true);
  };

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: any }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}`, data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditing(false);
      toast({
        title: "성공",
        description: "사용자 정보가 성공적으로 업데이트되었습니다.",
      });
      // Refresh selected user data
      if (selectedUser?.id) {
        try {
          const response = await fetch(`/api/admin/users/${selectedUser.id}`);
          if (response.ok) {
            const updatedUser = await response.json();
            setSelectedUser(updatedUser);
            setEditFormData({
              fullName: updatedUser.fullName || "",
              email: updatedUser.email || "",
              phone: updatedUser.phone || "",
              location: updatedUser.location || "",
              bio: updatedUser.bio || "",
              isActive: updatedUser.isActive ?? true,
              userType: updatedUser.userType || "",
              role: updatedUser.role || (updatedUser.userType === "admin" ? "admin" : "user"),
            });
            
            // If current user was deactivated, force logout
            const currentUserData = localStorage.getItem('user_data');
            if (currentUserData) {
              try {
                const currentUser = JSON.parse(currentUserData);
                if (currentUser.id === updatedUser.id && updatedUser.isActive === false) {
                  toast({
                    title: "계정 비활성화",
                    description: "계정이 비활성화되어 로그아웃됩니다.",
                    variant: "destructive",
                  });
                  setTimeout(() => {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_data');
                    queryClient.setQueryData(["/api/auth/user"], null);
                    window.location.href = "/login";
                  }, 2000);
                }
              } catch (e) {
                console.error("Failed to check current user:", e);
              }
            }
          }
        } catch (error) {
          console.error("Failed to refresh user data:", error);
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "사용자 정보 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSaveEdit = () => {
    if (!selectedUser) return;
    updateUserMutation.mutate({
      userId: selectedUser.id,
      data: editFormData,
    });
  };

  const handleCancelEdit = () => {
    if (selectedUser) {
      setEditFormData({
        fullName: selectedUser.fullName || "",
        email: selectedUser.email || "",
        phone: selectedUser.phone || "",
        location: selectedUser.location || "",
        bio: selectedUser.bio || "",
        isActive: selectedUser.isActive ?? true,
        userType: selectedUser.userType || "",
        role: selectedUser.role || (selectedUser.userType === "admin" ? "admin" : "user"),
      });
    }
    setIsEditing(false);
  };

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/admin/users/${userId}`, { isActive });
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }); // Refresh current user if updated
      
      toast({
        title: "성공",
        description: "사용자 상태가 변경되었습니다.",
      });
      
      // If current user was deactivated, force logout
      const currentUserData = localStorage.getItem('user_data');
      if (currentUserData) {
        try {
          const currentUser = JSON.parse(currentUserData);
          if (currentUser.id === variables.userId && variables.isActive === false) {
            toast({
              title: "계정 비활성화",
              description: "계정이 비활성화되어 로그아웃됩니다.",
              variant: "destructive",
            });
            setTimeout(() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
              queryClient.setQueryData(["/api/auth/user"], null);
              window.location.href = "/login";
            }, 2000);
          }
        } catch (e) {
          console.error("Failed to check current user:", e);
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "사용자 상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleToggleUserStatus = (userId: number, currentStatus: boolean) => {
    toggleUserStatusMutation.mutate({ userId, isActive: !currentStatus });
  };

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/stats"] });
      setIsCreateDialogOpen(false);
      setCreateFormData({
        username: "",
        email: "",
        password: "",
        fullName: "",
        phone: "",
        location: "",
        bio: "",
        userType: "job_seeker",
        role: "user",
        isActive: true,
      });
      toast({
        title: "성공",
        description: "사용자가 성공적으로 생성되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "사용자 생성에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/stats"] });
      setIsDetailDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "성공",
        description: "사용자가 성공적으로 삭제되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "사용자 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: number; newPassword: string }) => {
      return apiRequest("POST", `/api/admin/users/${userId}/reset-password`, { newPassword });
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "비밀번호가 성공적으로 재설정되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "비밀번호 재설정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = () => {
    if (!createFormData.email || !createFormData.password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호는 필수 항목입니다.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password strength
    if (createFormData.password.length < 6) {
      toast({
        title: "입력 오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }
    
    // If creating admin, ensure role is set
    if (createFormData.userType === "admin" && !createFormData.role) {
      setCreateFormData(prev => ({ ...prev, role: "admin" }));
    }
    
    createUserMutation.mutate(createFormData);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    if (window.confirm(`정말로 ${selectedUser.fullName || selectedUser.username} 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const handleResetPassword = () => {
    if (!selectedUser) return;
    const newPassword = prompt("새 비밀번호를 입력하세요:");
    if (newPassword && newPassword.length >= 6) {
      resetPasswordMutation.mutate({ userId: selectedUser.id, newPassword });
    } else if (newPassword) {
      toast({
        title: "입력 오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users?.data || [];
  const totalPages = Math.ceil((users?.total || 0) / 10);

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            사용자 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            플랫폼 사용자들을 관리하고 모니터링합니다
          </p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            사용자 추가
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">구직자</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.jobSeekers || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">채용담당자</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.employers || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
              <CheckCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle>사용자 목록</CardTitle>
            <CardDescription>
              등록된 모든 사용자를 확인하고 관리할 수 있습니다
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="사용자 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="사용자 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="job_seeker">구직자</SelectItem>
                  <SelectItem value="employer">채용담당자</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="rounded-md border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>위치</TableHead>
                    <TableHead>가입일</TableHead>
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
                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                        </TableCell>
                        <TableCell><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {user.fullName?.charAt(0) || user.username?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{user.fullName || user.username}</div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.userType === "admin" ? "destructive" : "secondary"}
                          >
                            {user.userType === "job_seeker" ? "구직자" : 
                             user.userType === "employer" ? "채용담당자" : "관리자"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {user.location || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.isActive ? "default" : "secondary"}
                          >
                            {user.isActive ? "활성" : "비활성"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(user)}
                              title="상세 정보 보기"
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              상세
                            </Button>
                            {user.userType === "job_seeker" && (
                              <>
                                <Link href={`/user/profile/${user.id}`} target="_blank">
                                  <Button variant="ghost" size="sm" title="웹사이트 프로필 보기">
                                  <User className="h-4 w-4" />
                                </Button>
                              </Link>
                                <Link href={`/user/home?userId=${user.id}`} target="_blank">
                                  <Button variant="ghost" size="sm" title="구직자 대시보드 보기">
                                    <LayoutDashboard className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </>
                            )}
                            {user.userType === "employer" && user.companyId && (
                              <>
                                <Link href={`/user/companies/${user.companyId}`} target="_blank">
                                  <Button variant="ghost" size="sm" title="웹사이트 기업 프로필 보기">
                                    <Building2 className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link href={`/company/dashboard?company=${user.companyId}`} target="_blank">
                                  <Button 
                                    variant="default" 
                                    size="sm" 
                                    title="기업 대시보드 보기"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                  >
                                    <LayoutDashboard className="h-4 w-4 mr-1" />
                                    대시보드
                                  </Button>
                                </Link>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                              disabled={toggleUserStatusMutation.isPending}
                              title={user.isActive ? "비활성화" : "활성화"}
                            >
                              {user.isActive ? (
                                <Ban className="h-4 w-4 text-red-500" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        사용자가 없습니다
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

        {/* User Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={(open) => {
          setIsDetailDialogOpen(open);
          if (!open) {
            setIsEditing(false);
            setSelectedUser(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedUser && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        사용자 상세 정보
                      </DialogTitle>
                      <DialogDescription>
                        사용자의 상세 정보를 확인하고 관리할 수 있습니다
                      </DialogDescription>
                    </div>
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          편집
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={updateUserMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-2" />
                            취소
                          </Button>
                          <Button
                            onClick={handleSaveEdit}
                            disabled={updateUserMutation.isPending}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            저장
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* User Profile Header */}
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800">
                            <AvatarImage src={selectedUser.profilePicture} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold">
                              {selectedUser.fullName?.charAt(0) || selectedUser.username?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  value={editFormData.fullName}
                                  onChange={(e) => setEditFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                  className="text-2xl font-bold"
                                  placeholder="이름"
                                />
                                <p className="text-gray-600 dark:text-gray-400">@{selectedUser.username}</p>
                              </div>
                            ) : (
                              <>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {selectedUser.fullName || selectedUser.username || "이름 없음"}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">@{selectedUser.username}</p>
                              </>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                variant={selectedUser.userType === "admin" ? "destructive" : 
                                        selectedUser.userType === "employer" ? "default" : "secondary"}
                                className="text-sm"
                              >
                                {selectedUser.userType === "job_seeker" ? "구직자" : 
                                 selectedUser.userType === "employer" ? "채용담당자" : "관리자"}
                              </Badge>
                              <Badge 
                                variant={selectedUser.isActive ? "default" : "secondary"}
                                className="text-sm"
                              >
                                {selectedUser.isActive ? "활성" : "비활성"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {selectedUser.userType === "employer" && selectedUser.companyId && (
                            <Link href={`/company/dashboard?company=${selectedUser.companyId}`} target="_blank">
                              <Button 
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full"
                              >
                                <LayoutDashboard className="h-4 w-4 mr-2" />
                                기업 대시보드 보기
                                <ExternalLink className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => handleToggleUserStatus(selectedUser.id, selectedUser.isActive)}
                            disabled={toggleUserStatusMutation.isPending}
                          >
                            {selectedUser.isActive ? (
                              <>
                                <Ban className="h-4 w-4 mr-2 text-red-500" />
                                비활성화
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                활성화
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-blue-600" />
                          기본 정보
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <Label className="text-sm text-gray-500">이메일</Label>
                            {isEditing ? (
                              <Input
                                value={editFormData.email}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                                type="email"
                                className="mt-1"
                              />
                            ) : (
                              <p className="font-medium">{selectedUser.email || "-"}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <Label className="text-sm text-gray-500">전화번호</Label>
                            {isEditing ? (
                              <Input
                                value={editFormData.phone}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                                type="tel"
                                className="mt-1"
                                placeholder="전화번호를 입력하세요"
                              />
                            ) : (
                              <p className="font-medium">{selectedUser.phone || "-"}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <Label className="text-sm text-gray-500">위치</Label>
                            {isEditing ? (
                              <Input
                                value={editFormData.location}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                                className="mt-1"
                                placeholder="위치를 입력하세요"
                              />
                            ) : (
                              <p className="font-medium">{selectedUser.location || "-"}</p>
                            )}
                          </div>
                        </div>
                        {isEditing && (
                          <div className="flex items-start gap-3">
                            <FileText className="h-4 w-4 text-gray-400 mt-1" />
                            <div className="flex-1">
                              <Label className="text-sm text-gray-500">소개</Label>
                              <Textarea
                                value={editFormData.bio}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
                                className="mt-1"
                                rows={3}
                                placeholder="소개를 입력하세요"
                              />
                            </div>
                          </div>
                        )}
                        {!isEditing && selectedUser.bio && (
                          <div className="flex items-start gap-3">
                            <FileText className="h-4 w-4 text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm text-gray-500">소개</p>
                              <p className="font-medium whitespace-pre-wrap">{selectedUser.bio}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">가입일</p>
                            <p className="font-medium">
                              {new Date(selectedUser.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        {selectedUser.lastLoginAt && (
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">최근 로그인</p>
                              <p className="font-medium">
                                {new Date(selectedUser.lastLoginAt).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-purple-600" />
                          계정 정보
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">사용자 유형</p>
                          <Badge 
                            variant={selectedUser.userType === "admin" ? "destructive" : 
                                    selectedUser.userType === "employer" ? "default" : "secondary"}
                            className="text-sm"
                          >
                            {selectedUser.userType === "job_seeker" ? "구직자" : 
                             selectedUser.userType === "employer" ? "채용담당자" : "관리자"}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500 mb-1 block">계정 상태</Label>
                          {isEditing ? (
                            <div className="flex items-center space-x-2 mt-2">
                              <input
                                type="checkbox"
                                id="isActive"
                                checked={editFormData.isActive}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                                {editFormData.isActive ? "활성" : "비활성"}
                              </Label>
                            </div>
                          ) : (
                            <Badge 
                              variant={selectedUser.isActive ? "default" : "secondary"}
                              className="text-sm"
                            >
                              {selectedUser.isActive ? "활성" : "비활성"}
                            </Badge>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500 mb-1 block">권한 레벨</Label>
                          {isEditing && selectedUser.userType === "admin" ? (
                            <Select
                              value={editFormData.role}
                              onValueChange={(value) => setEditFormData(prev => ({ ...prev, role: value }))}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">일반 관리자</SelectItem>
                                <SelectItem value="super_admin">슈퍼 관리자</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge 
                              variant={selectedUser.role === "super_admin" ? "destructive" : "default"}
                              className="text-sm"
                            >
                              {selectedUser.role === "super_admin" ? "슈퍼 관리자" : 
                               selectedUser.role === "admin" ? "일반 관리자" : "사용자"}
                            </Badge>
                          )}
                        </div>
                        {selectedUser.userType === "employer" && selectedUser.companyId && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">소속 회사 ID</p>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{selectedUser.companyId}</p>
                              <Link href={`/user/companies/${selectedUser.companyId}`} target="_blank">
                                <Button variant="ghost" size="sm">
                                  <Building2 className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Company Dashboard Link for Employers */}
                  {selectedUser.userType === "employer" && selectedUser.companyId && (
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          기업 대시보드
                        </CardTitle>
                        <CardDescription>
                          이 사용자가 소속된 기업의 대시보드를 확인할 수 있습니다
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Link href={`/company/dashboard?company=${selectedUser.companyId}`} target="_blank" className="flex-1">
                            <Button 
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              size="lg"
                            >
                              <LayoutDashboard className="h-5 w-5 mr-2" />
                              기업 대시보드 열기
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                          <Link href={`/user/companies/${selectedUser.companyId}`} target="_blank" className="flex-1">
                            <Button 
                              variant="outline"
                              className="w-full"
                              size="lg"
                            >
                              <Building2 className="h-5 w-5 mr-2" />
                              기업 프로필 보기
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-600" />
                        빠른 작업
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {selectedUser.userType === "job_seeker" && (
                          <>
                            <Link href={`/user/profile/${selectedUser.id}`} target="_blank">
                              <Button variant="outline" className="w-full">
                                <User className="h-4 w-4 mr-2" />
                                웹사이트 프로필 보기
                              </Button>
                            </Link>
                            {selectedUser.userType === "job_seeker" && (
                              <Link href={`/user/home?userId=${selectedUser.id}`} target="_blank">
                                <Button variant="outline" className="w-full">
                                  <LayoutDashboard className="h-4 w-4 mr-2" />
                                  구직자 대시보드 보기
                                </Button>
                              </Link>
                            )}
                          </>
                        )}
                        {selectedUser.userType === "employer" && selectedUser.companyId && (
                          <>
                            <Link href={`/user/companies/${selectedUser.companyId}`} target="_blank">
                              <Button variant="outline" className="w-full">
                                <Building2 className="h-4 w-4 mr-2" />
                                기업 프로필
                              </Button>
                            </Link>
                            <Link href={`/company/dashboard?company=${selectedUser.companyId}`} target="_blank">
                              <Button variant="outline" className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                                <LayoutDashboard className="h-4 w-4 mr-2" />
                                기업 대시보드
                              </Button>
                            </Link>
                          </>
                        )}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedUser.email);
                            toast({
                              title: "복사됨",
                              description: "이메일이 클립보드에 복사되었습니다.",
                            });
                          }}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          이메일 복사
                        </Button>
                        {(selectedUser.userType === "job_seeker" || selectedUser.userType === "employer") && (
                          <Link href={`/admin/chat?userId=${selectedUser.id}`}>
                            <Button variant="outline" className="w-full">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              채팅 보기
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleResetPassword}
                          disabled={resetPasswordMutation.isPending}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          비밀번호 재설정
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleToggleUserStatus(selectedUser.id, selectedUser.isActive)}
                          disabled={toggleUserStatusMutation.isPending}
                        >
                          {selectedUser.isActive ? (
                            <>
                              <Ban className="h-4 w-4 mr-2 text-red-500" />
                              비활성화
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              활성화
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={handleDeleteUser}
                          disabled={deleteUserMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                새 사용자 추가
              </DialogTitle>
              <DialogDescription>
                새로운 사용자를 생성합니다. 필수 정보를 입력해주세요.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-username">사용자명 *</Label>
                  <Input
                    id="create-username"
                    value={createFormData.username}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="사용자명"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-email">이메일 *</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-password">비밀번호 *</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="최소 6자 이상"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-fullName">이름</Label>
                  <Input
                    id="create-fullName"
                    value={createFormData.fullName}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="이름"
                  />
                </div>
                <div>
                  <Label htmlFor="create-phone">전화번호</Label>
                  <Input
                    id="create-phone"
                    type="tel"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="010-1234-5678"
                  />
                </div>
                <div>
                  <Label htmlFor="create-location">위치</Label>
                  <Input
                    id="create-location"
                    value={createFormData.location}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="서울시 강남구"
                  />
                </div>
                <div>
                  <Label htmlFor="create-userType">사용자 유형 *</Label>
                  <Select
                    value={createFormData.userType}
                    onValueChange={(value) => setCreateFormData(prev => ({ ...prev, userType: value }))}
                  >
                    <SelectTrigger id="create-userType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job_seeker">구직자</SelectItem>
                      <SelectItem value="employer">채용담당자</SelectItem>
                      <SelectItem value="admin">관리자</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="create-isActive"
                    checked={createFormData.isActive}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="create-isActive" className="text-sm font-medium cursor-pointer">
                    계정 활성화
                  </Label>
                </div>
              </div>
              <div>
                <Label htmlFor="create-bio">소개</Label>
                <Textarea
                  id="create-bio"
                  value={createFormData.bio}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="사용자 소개를 입력하세요"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={createUserMutation.isPending}
              >
                취소
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={createUserMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {createUserMutation.isPending ? "생성 중..." : "생성"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}