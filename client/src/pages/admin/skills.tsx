import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Code, 
  Plus, 
  Edit,
  Trash2,
  X,
  Check,
  Search,
  Power,
  PowerOff
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

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

export default function AdminSkills() {
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
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">스킬 마스터 관리</h1>
            <p className="text-muted-foreground mt-1">
              채용공고와 사용자 프로필에서 사용할 스킬을 관리합니다.
            </p>
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

        <Card>
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
    </AdminLayout>
  );
}

