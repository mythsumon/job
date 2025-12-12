import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiGet, apiRequest } from "@/lib/queryClient";

interface PreferredIndustry {
  id: number;
  nameKo: string;
  nameEn: string;
  nameMn: string;
  order: number;
  isActive: boolean;
}

export default function AdminPreferredIndustries() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<PreferredIndustry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    nameKo: "",
    nameEn: "",
    nameMn: "",
    order: 0,
    isActive: true,
  });

  // Fetch industries
  const { data: industries = [], isLoading } = useQuery<PreferredIndustry[]>({
    queryKey: ["/api/admin/job-options/preferred-industries"],
  });

  // Filter industries by search query
  const filteredIndustries = industries.filter((industry) => {
    const query = searchQuery.toLowerCase();
    return (
      industry.nameKo.toLowerCase().includes(query) ||
      industry.nameEn.toLowerCase().includes(query) ||
      industry.nameMn.toLowerCase().includes(query)
    );
  });

  // Create/Update mutation
  const createIndustryMutation = useMutation({
    mutationFn: async (data: { nameKo: string; nameEn: string; nameMn: string; order: number; isActive: boolean }) => {
      return await apiRequest("POST", "/api/admin/job-options/preferred-industries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-options/preferred-industries"] });
      toast({
        title: t("common.success") || "성공",
        description: "희망 근무 분야가 추가되었습니다.",
      });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateIndustryMutation = useMutation({
    mutationFn: async (data: { id: number; nameKo: string; nameEn: string; nameMn: string; order: number; isActive: boolean }) => {
      return await apiRequest("PUT", `/api/admin/job-options/preferred-industries/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-options/preferred-industries"] });
      toast({
        title: t("common.success") || "성공",
        description: "희망 근무 분야가 수정되었습니다.",
      });
      setIsDialogOpen(false);
      setEditingIndustry(null);
      resetForm();
    },
  });

  const deleteIndustryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/job-options/preferred-industries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-options/preferred-industries"] });
      toast({
        title: t("common.success") || "성공",
        description: "희망 근무 분야가 삭제되었습니다.",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (data: { id: number; isActive: boolean }) => {
      return await apiRequest("PUT", `/api/admin/job-options/preferred-industries/${data.id}`, { isActive: data.isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-options/preferred-industries"] });
    },
  });

  const resetForm = () => {
    setFormData({
      nameKo: "",
      nameEn: "",
      nameMn: "",
      order: industries.length + 1,
      isActive: true,
    });
    setEditingIndustry(null);
  };

  const handleOpenDialog = (industry?: PreferredIndustry) => {
    if (industry) {
      setEditingIndustry(industry);
      setFormData({
        nameKo: industry.nameKo,
        nameEn: industry.nameEn,
        nameMn: industry.nameMn,
        order: industry.order,
        isActive: industry.isActive,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!formData.nameKo || !formData.nameEn || !formData.nameMn) {
      toast({
        title: "오류",
        description: "모든 언어의 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (editingIndustry) {
      updateIndustryMutation.mutate({
        id: editingIndustry.id,
        ...formData,
      });
    } else {
      createIndustryMutation.mutate(formData);
    }
  };

  const handleDelete = (industry: PreferredIndustry) => {
    deleteIndustryMutation.mutate(industry.id);
  };

  const handleToggleActive = (industry: PreferredIndustry) => {
    toggleActiveMutation.mutate({
      id: industry.id,
      isActive: !industry.isActive,
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                희망 근무 분야 관리
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                구직자가 선택할 수 있는 희망 근무 분야 옵션을 관리합니다
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  새 분야 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingIndustry ? "분야 수정" : "새 분야 추가"}
                  </DialogTitle>
                  <DialogDescription>
                    희망 근무 분야 정보를 입력하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameKo">한국어 이름 *</Label>
                    <Input
                      id="nameKo"
                      value={formData.nameKo}
                      onChange={(e) => setFormData({ ...formData, nameKo: e.target.value })}
                      placeholder="예: IT/소프트웨어"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">영어 이름 *</Label>
                    <Input
                      id="nameEn"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="예: IT/Software"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameMn">몽골어 이름 *</Label>
                    <Input
                      id="nameMn"
                      value={formData.nameMn}
                      onChange={(e) => setFormData({ ...formData, nameMn: e.target.value })}
                      placeholder="예: IT/Программ хангамж"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">순서</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      placeholder="표시 순서"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">활성화</Label>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={handleCloseDialog}>
                      취소
                    </Button>
                    <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-purple-600">
                      {editingIndustry ? "수정" : "추가"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle>희망 근무 분야 목록</CardTitle>
            <CardDescription>
              총 {filteredIndustries.length}개의 분야
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="분야 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>순서</TableHead>
                    <TableHead>한국어</TableHead>
                    <TableHead>영어</TableHead>
                    <TableHead>몽골어</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        로딩 중...
                      </TableCell>
                    </TableRow>
                  ) : filteredIndustries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        분야가 없습니다
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIndustries
                      .sort((a, b) => a.order - b.order)
                      .map((industry) => (
                        <TableRow key={industry.id}>
                          <TableCell>{industry.order}</TableCell>
                          <TableCell className="font-medium">{industry.nameKo}</TableCell>
                          <TableCell>{industry.nameEn}</TableCell>
                          <TableCell>{industry.nameMn}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={industry.isActive}
                                onCheckedChange={() => handleToggleActive(industry)}
                              />
                              <Badge variant={industry.isActive ? "default" : "secondary"}>
                                {industry.isActive ? "활성" : "비활성"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenDialog(industry)}
                                title="수정"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    title="삭제"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>분야 삭제</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      정말로 "{industry.nameKo}" 분야를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(industry)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      삭제
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
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
