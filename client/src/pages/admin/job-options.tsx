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
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Building2, Briefcase, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiGet, apiRequest } from "@/lib/queryClient";

interface JobOption {
  id: number;
  name: string;
  nameKo?: string;
  nameEn?: string;
  nameMn?: string;
  order: number;
  isActive: boolean;
}

export default function AdminJobOptions() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isEmploymentTypeDialogOpen, setIsEmploymentTypeDialogOpen] = useState(false);
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<JobOption | null>(null);
  const [optionType, setOptionType] = useState<"department" | "employmentType" | "experience">("department");

  // Fetch options
  const { data: departments = [], isLoading: departmentsLoading } = useQuery<JobOption[]>({
    queryKey: ["/api/admin/job-options/departments"],
  });

  const { data: employmentTypes = [], isLoading: employmentTypesLoading } = useQuery<JobOption[]>({
    queryKey: ["/api/admin/job-options/employment-types"],
  });

  const { data: experienceLevels = [], isLoading: experienceLevelsLoading } = useQuery<JobOption[]>({
    queryKey: ["/api/admin/job-options/experience-levels"],
  });

  // Create/Update mutation
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

  const getCurrentOptions = () => {
    if (optionType === "department") return departments;
    if (optionType === "employmentType") return employmentTypes;
    return experienceLevels;
  };

  const getTypeLabel = (type: string) => {
    if (type === "department") return "부서";
    if (type === "employmentType") return "고용형태";
    return "경력 수준";
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            채용공고 옵션 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            채용공고 작성 시 사용되는 부서, 고용형태, 경력 수준 옵션을 관리합니다
          </p>
        </div>

        {/* Departments */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg mb-6">
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
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg mb-6">
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
    </AdminLayout>
  );
}

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

