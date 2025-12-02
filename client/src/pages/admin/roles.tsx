import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Shield, 
  Plus, 
  Edit,
  Trash2,
  Users,
  Settings,
  Eye,
  FileText
} from "lucide-react";

const roleSchema = z.object({
  name: z.string().min(1, "역할명을 입력해주세요"),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "최소 하나의 권한을 선택해주세요"),
});

const availablePermissions = [
  { id: "users.read", name: "사용자 조회", category: "사용자 관리" },
  { id: "users.write", name: "사용자 편집", category: "사용자 관리" },
  { id: "users.delete", name: "사용자 삭제", category: "사용자 관리" },
  { id: "companies.read", name: "기업 조회", category: "기업 관리" },
  { id: "companies.write", name: "기업 편집", category: "기업 관리" },
  { id: "companies.approve", name: "기업 승인", category: "기업 관리" },
  { id: "jobs.read", name: "채용공고 조회", category: "채용공고 관리" },
  { id: "jobs.write", name: "채용공고 편집", category: "채용공고 관리" },
  { id: "jobs.delete", name: "채용공고 삭제", category: "채용공고 관리" },
  { id: "payments.read", name: "결제 조회", category: "정산 관리" },
  { id: "payments.write", name: "결제 처리", category: "정산 관리" },
  { id: "reports.read", name: "리포트 조회", category: "리포트" },
  { id: "system.admin", name: "시스템 관리", category: "시스템" },
];

export default function AdminRoles() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roles, isLoading } = useQuery({
    queryKey: ["/api/admin/roles"],
  });

  const form = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof roleSchema>) => {
      return apiRequest("POST", "/api/admin/roles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "성공",
        description: "역할이 생성되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "역할 생성에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof roleSchema> & { id: number }) => {
      return apiRequest("PATCH", `/api/admin/roles/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      setEditingRole(null);
      form.reset();
      toast({
        title: "성공",
        description: "역할이 수정되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "역할 수정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: number) => {
      return apiRequest("DELETE", `/api/admin/roles/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({
        title: "성공",
        description: "역할이 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "역할 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof roleSchema>) => {
    if (editingRole) {
      updateRoleMutation.mutate({ ...data, id: editingRole.id });
    } else {
      createRoleMutation.mutate(data);
    }
  };

  const handleEdit = (role: any) => {
    setEditingRole(role);
    form.reset({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || [],
    });
    setIsCreateDialogOpen(true);
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof availablePermissions>);

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                권한 관리
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                관리자 역할과 권한을 설정합니다
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingRole(null);
                  form.reset();
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  새 역할 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRole ? "역할 수정" : "새 역할 생성"}
                  </DialogTitle>
                  <DialogDescription>
                    관리자 역할과 해당 권한을 설정합니다.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>역할명</FormLabel>
                          <FormControl>
                            <Input placeholder="예: 사용자 관리자" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>설명</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="역할에 대한 설명을 입력하세요..."
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="permissions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>권한</FormLabel>
                          <div className="space-y-4">
                            {Object.entries(groupedPermissions).map(([category, permissions]) => (
                              <div key={category} className="border rounded-lg p-4">
                                <h4 className="font-medium mb-3">{category}</h4>
                                <div className="grid grid-cols-1 gap-2">
                                  {permissions.map((permission) => (
                                    <div key={permission.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={permission.id}
                                        checked={field.value?.includes(permission.id)}
                                        onCheckedChange={(checked) => {
                                          const updatedPermissions = checked
                                            ? [...(field.value || []), permission.id]
                                            : (field.value || []).filter((p) => p !== permission.id);
                                          field.onChange(updatedPermissions);
                                        }}
                                      />
                                      <label htmlFor={permission.id} className="text-sm">
                                        {permission.name}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        취소
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                      >
                        {editingRole ? "수정" : "생성"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Roles Table */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              관리자 역할 목록
            </CardTitle>
            <CardDescription>
              등록된 관리자 역할과 권한을 확인할 수 있습니다
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="rounded-md border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>역할명</TableHead>
                    <TableHead>설명</TableHead>
                    <TableHead>권한 수</TableHead>
                    <TableHead>사용자 수</TableHead>
                    <TableHead>생성일</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></TableCell>
                      </TableRow>
                    ))
                  ) : roles?.length > 0 ? (
                    roles.map((role: any) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{role.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600 dark:text-gray-400">
                            {role.description || "설명 없음"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {role.permissions?.length || 0}개
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            {role.userCount || 0}명
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(role.createdAt).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(role)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRoleMutation.mutate(role.id)}
                              disabled={deleteRoleMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        등록된 역할이 없습니다
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}