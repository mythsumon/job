import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiGet, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Building2,
  Briefcase,
  Clock,
  Code,
  List,
} from "lucide-react";

// ============================================================================
// Tab 1: Job Options (채용공고 옵션)
// ============================================================================

interface JobOption {
  id: number;
  name: string;
  nameKo?: string;
  nameEn?: string;
  nameMn?: string;
  order: number;
  isActive: boolean;
}

function JobOptionsTab() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isEmploymentTypeDialogOpen, setIsEmploymentTypeDialogOpen] = useState(false);
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<JobOption | null>(null);
  const [optionType, setOptionType] = useState<"department" | "employmentType" | "experience">("department");

  const { data: departments = [], isLoading: departmentsLoading } = useQuery<JobOption[]>({
    queryKey: ["/api/admin/job-options/departments"],
  });

  const { data: employmentTypes = [], isLoading: employmentTypesLoading } = useQuery<JobOption[]>({
    queryKey: ["/api/admin/job-options/employment-types"],
  });

  const { data: experienceLevels = [], isLoading: experienceLevelsLoading } = useQuery<JobOption[]>({
    queryKey: ["/api/admin/job-options/experience-levels"],
  });

  const createOptionMutation = useMutation({
    mutationFn: async (data: { type: string; name: string; nameKo?: string; nameEn?: string; nameMn?: string }) => {
      return await apiRequest("POST", `/api/admin/job-options/${data.type}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-options"] });
      toast({
        title: t("common.success") || "성공",
        description: "옵션이 추가되었습니다.",
      });
      setIsDepartmentDialogOpen(false);
      setIsEmploymentTypeDialogOpen(false);
      setIsExperienceDialogOpen(false);
      setEditingOption(null);
    },
  });

  const updateOptionMutation = useMutation({
    mutationFn: async (data: { type: string; id: number; name: string; nameKo?: string; nameEn?: string; nameMn?: string; isActive: boolean }) => {
      return await apiRequest("PUT", `/api/admin/job-options/${data.type}/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-options"] });
      toast({
        title: t("common.success") || "성공",
        description: "옵션이 수정되었습니다.",
      });
      setIsDepartmentDialogOpen(false);
      setIsEmploymentTypeDialogOpen(false);
      setIsExperienceDialogOpen(false);
      setEditingOption(null);
    },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: async (data: { type: string; id: number }) => {
      return await apiRequest("DELETE", `/api/admin/job-options/${data.type}/${data.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-options"] });
      toast({
        title: t("common.success") || "성공",
        description: "옵션이 삭제되었습니다.",
      });
    },
  });

  const handleAddOption = (type: "department" | "employmentType" | "experience") => {
    setOptionType(type);
    setEditingOption(null);
    if (type === "department") setIsDepartmentDialogOpen(true);
    else if (type === "employmentType") setIsEmploymentTypeDialogOpen(true);
    else setIsExperienceDialogOpen(true);
  };

  const handleEditOption = (option: JobOption, type: "department" | "employmentType" | "experience") => {
    setOptionType(type);
    setEditingOption(option);
    if (type === "department") setIsDepartmentDialogOpen(true);
    else if (type === "employmentType") setIsEmploymentTypeDialogOpen(true);
    else setIsExperienceDialogOpen(true);
  };

  const handleDeleteOption = (id: number, type: "department" | "employmentType" | "experience") => {
    if (confirm("정말 이 옵션을 삭제하시겠습니까?")) {
      deleteOptionMutation.mutate({ type, id });
    }
  };

  return (
    <div className="space-y-6">
      {/* Departments */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <CardTitle>부서 옵션</CardTitle>
            </div>
            <Dialog open={isDepartmentDialogOpen} onOpenChange={setIsDepartmentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => handleAddOption("department")}>
                  <Plus className="h-4 w-4 mr-2" />
                  부서 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingOption ? "부서 수정" : "부서 추가"}</DialogTitle>
                  <DialogDescription>
                    채용공고 작성 시 사용할 부서 옵션을 추가하거나 수정합니다.
                  </DialogDescription>
                </DialogHeader>
                <OptionForm
                  type="department"
                  option={editingOption}
                  onSubmit={(data) => {
                    if (editingOption) {
                      updateOptionMutation.mutate({ ...data, type: "department", id: editingOption.id, isActive: editingOption.isActive });
                    } else {
                      createOptionMutation.mutate({ ...data, type: "department" });
                    }
                  }}
                  onCancel={() => {
                    setIsDepartmentDialogOpen(false);
                    setEditingOption(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {departmentsLoading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : departments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">부서 옵션이 없습니다.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <Card key={dept.id} className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{dept.name}</h3>
                          <Badge variant={dept.isActive ? "default" : "secondary"} className="mt-1">
                            {dept.isActive ? "활성" : "비활성"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOption(dept, "department")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOption(dept.id, "department")}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">한국어:</span> {dept.nameKo || "-"}
                        </div>
                        <div>
                          <span className="font-medium">영어:</span> {dept.nameEn || "-"}
                        </div>
                        <div>
                          <span className="font-medium">몽골어:</span> {dept.nameMn || "-"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employment Types */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              <CardTitle>고용형태 옵션</CardTitle>
            </div>
            <Dialog open={isEmploymentTypeDialogOpen} onOpenChange={setIsEmploymentTypeDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => handleAddOption("employmentType")}>
                  <Plus className="h-4 w-4 mr-2" />
                  고용형태 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingOption ? "고용형태 수정" : "고용형태 추가"}</DialogTitle>
                  <DialogDescription>
                    채용공고 작성 시 사용할 고용형태 옵션을 추가하거나 수정합니다.
                  </DialogDescription>
                </DialogHeader>
                <OptionForm
                  type="employmentType"
                  option={editingOption}
                  onSubmit={(data) => {
                    if (editingOption) {
                      updateOptionMutation.mutate({ ...data, type: "employmentType", id: editingOption.id, isActive: editingOption.isActive });
                    } else {
                      createOptionMutation.mutate({ ...data, type: "employmentType" });
                    }
                  }}
                  onCancel={() => {
                    setIsEmploymentTypeDialogOpen(false);
                    setEditingOption(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {employmentTypesLoading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : employmentTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">고용형태 옵션이 없습니다.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employmentTypes.map((type) => (
                <Card key={type.id} className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{type.name}</h3>
                          <Badge variant={type.isActive ? "default" : "secondary"} className="mt-1">
                            {type.isActive ? "활성" : "비활성"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOption(type, "employmentType")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOption(type.id, "employmentType")}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">한국어:</span> {type.nameKo || "-"}
                        </div>
                        <div>
                          <span className="font-medium">영어:</span> {type.nameEn || "-"}
                        </div>
                        <div>
                          <span className="font-medium">몽골어:</span> {type.nameMn || "-"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience Levels */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <CardTitle>경력 수준 옵션</CardTitle>
            </div>
            <Dialog open={isExperienceDialogOpen} onOpenChange={setIsExperienceDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => handleAddOption("experience")}>
                  <Plus className="h-4 w-4 mr-2" />
                  경력 수준 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingOption ? "경력 수준 수정" : "경력 수준 추가"}</DialogTitle>
                  <DialogDescription>
                    채용공고 작성 시 사용할 경력 수준 옵션을 추가하거나 수정합니다.
                  </DialogDescription>
                </DialogHeader>
                <OptionForm
                  type="experience"
                  option={editingOption}
                  onSubmit={(data) => {
                    if (editingOption) {
                      updateOptionMutation.mutate({ ...data, type: "experience", id: editingOption.id, isActive: editingOption.isActive });
                    } else {
                      createOptionMutation.mutate({ ...data, type: "experience" });
                    }
                  }}
                  onCancel={() => {
                    setIsExperienceDialogOpen(false);
                    setEditingOption(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {experienceLevelsLoading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : experienceLevels.length === 0 ? (
            <div className="text-center py-8 text-gray-500">경력 수준 옵션이 없습니다.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {experienceLevels.map((level) => (
                <Card key={level.id} className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{level.name}</h3>
                          <Badge variant={level.isActive ? "default" : "secondary"} className="mt-1">
                            {level.isActive ? "활성" : "비활성"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOption(level, "experience")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOption(level.id, "experience")}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">한국어:</span> {level.nameKo || "-"}
                        </div>
                        <div>
                          <span className="font-medium">영어:</span> {level.nameEn || "-"}
                        </div>
                        <div>
                          <span className="font-medium">몽골어:</span> {level.nameMn || "-"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Tab 2: Preferred Industries (희망 근무 분야)
// ============================================================================

interface PreferredIndustry {
  id: number;
  nameKo: string;
  nameEn: string;
  nameMn: string;
  order: number;
  isActive: boolean;
}

function PreferredIndustriesTab() {
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

  const { data: industries = [], isLoading } = useQuery<PreferredIndustry[]>({
    queryKey: ["/api/admin/job-options/preferred-industries"],
  });

  const filteredIndustries = industries.filter((industry) => {
    const query = searchQuery.toLowerCase();
    return (
      industry.nameKo.toLowerCase().includes(query) ||
      industry.nameEn.toLowerCase().includes(query) ||
      industry.nameMn.toLowerCase().includes(query)
    );
  });

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
    <div className="space-y-6">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>희망 근무 분야 목록</CardTitle>
              <CardDescription>
                총 {filteredIndustries.length}개의 분야
              </CardDescription>
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
  );
}

// ============================================================================
// Tab 3: Skills (스킬)
// ============================================================================

const skillSchema = z.object({
  name: z.string().min(1, "스킬명을 입력해주세요"),
  description: z.string().optional(),
});

interface Skill {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function SkillsTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: skills = [], isLoading } = useQuery<Skill[]>({
    queryKey: ["/api/admin/skills"],
  });

  const form = useForm({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createSkillMutation = useMutation({
    mutationFn: async (data: z.infer<typeof skillSchema>) => {
      return apiRequest("POST", "/api/admin/skills", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/all"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "성공",
        description: "스킬이 생성되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "스킬 생성에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: async (data: z.infer<typeof skillSchema> & { id: number }) => {
      return apiRequest("PUT", `/api/admin/skills/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/all"] });
      setEditingSkill(null);
      form.reset();
      setIsCreateDialogOpen(false);
      toast({
        title: "성공",
        description: "스킬이 수정되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "스킬 수정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const toggleSkillStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/admin/skills/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/all"] });
      toast({
        title: "성공",
        description: "스킬 상태가 변경되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "스킬 상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      return apiRequest("DELETE", `/api/admin/skills/${skillId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/all"] });
      toast({
        title: "성공",
        description: "스킬이 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "스킬 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof skillSchema>) => {
    if (editingSkill) {
      updateSkillMutation.mutate({ ...data, id: editingSkill.id });
    } else {
      createSkillMutation.mutate(data);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    form.reset({
      name: skill.name,
      description: skill.description || "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (skillId: number) => {
    if (confirm("정말 이 스킬을 삭제하시겠습니까?")) {
      deleteSkillMutation.mutate(skillId);
    }
  };

  const handleToggleStatus = (skill: Skill) => {
    toggleSkillStatusMutation.mutate({ id: skill.id, isActive: !skill.isActive });
  };

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>스킬 목록</CardTitle>
              <CardDescription>
                총 {filteredSkills.length}개의 스킬이 등록되어 있습니다.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="스킬 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingSkill(null); form.reset(); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    스킬 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSkill ? "스킬 수정" : "새 스킬 추가"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingSkill 
                        ? "스킬 정보를 수정합니다." 
                        : "새로운 스킬을 추가합니다."}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>스킬명 *</FormLabel>
                            <FormControl>
                              <Input placeholder="예: React, TypeScript, Python" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>설명 (선택사항)</FormLabel>
                            <FormControl>
                              <Input placeholder="스킬에 대한 간단한 설명" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsCreateDialogOpen(false);
                            setEditingSkill(null);
                            form.reset();
                          }}
                        >
                          취소
                        </Button>
                        <Button type="submit" disabled={createSkillMutation.isPending || updateSkillMutation.isPending}>
                          {editingSkill ? "수정" : "추가"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : filteredSkills.length === 0 ? (
            <div className="text-center py-8">
              <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">등록된 스킬이 없습니다.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>스킬명</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSkills.map((skill) => (
                  <TableRow key={skill.id}>
                    <TableCell className="font-medium">{skill.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{skill.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {skill.description || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={skill.isActive}
                          onCheckedChange={() => handleToggleStatus(skill)}
                        />
                        <Badge variant={skill.isActive ? "default" : "secondary"}>
                          {skill.isActive ? "활성" : "비활성"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(skill)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(skill.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Option Form Component (shared)
// ============================================================================

interface OptionFormProps {
  type: "department" | "employmentType" | "experience";
  option?: JobOption | null;
  onSubmit: (data: { name: string; nameKo?: string; nameEn?: string; nameMn?: string }) => void;
  onCancel: () => void;
}

function OptionForm({ type, option, onSubmit, onCancel }: OptionFormProps) {
  const [name, setName] = useState(option?.name || "");
  const [nameKo, setNameKo] = useState(option?.nameKo || "");
  const [nameEn, setNameEn] = useState(option?.nameEn || "");
  const [nameMn, setNameMn] = useState(option?.nameMn || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    onSubmit({ name, nameKo, nameEn, nameMn });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>이름 (기본값)</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 개발팀"
          required
        />
      </div>
      <div>
        <Label>한국어</Label>
        <Input
          value={nameKo}
          onChange={(e) => setNameKo(e.target.value)}
          placeholder="한국어 이름"
        />
      </div>
      <div>
        <Label>영어</Label>
        <Input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder="English name"
        />
      </div>
      <div>
        <Label>몽골어</Label>
        <Input
          value={nameMn}
          onChange={(e) => setNameMn(e.target.value)}
          placeholder="Монгол нэр"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">
          {option ? "수정" : "추가"}
        </Button>
      </div>
    </form>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AdminRecruitmentMaster() {
  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            채용 마스터 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            채용공고와 구직자 프로필에서 사용하는 분류·옵션을 한 곳에서 관리합니다.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="options" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="options">
              <List className="h-4 w-4 mr-2" />
              공고 옵션
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Briefcase className="h-4 w-4 mr-2" />
              직무 분야
            </TabsTrigger>
            <TabsTrigger value="skills">
              <Code className="h-4 w-4 mr-2" />
              스킬
            </TabsTrigger>
          </TabsList>

          <TabsContent value="options" className="mt-6">
            <JobOptionsTab />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <PreferredIndustriesTab />
          </TabsContent>

          <TabsContent value="skills" className="mt-6">
            <SkillsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

