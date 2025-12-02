import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  StarOff, 
  Download,
  Eye,
  Calendar,
  User,
  MapPin,
  Mail,
  Phone
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDisableRightClick } from "@/hooks/useDisableRightClick";
import { apiRequest } from "@/lib/queryClient";

const resumeSchema = z.object({
  title: z.string().min(1, "이력서 제목을 입력해주세요"),
  summary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  certifications: z.string().optional(),
  languages: z.string().optional(),
  projects: z.string().optional(),
  achievements: z.string().optional(),
  references: z.string().optional(),
  visibility: z.enum(["private", "public", "company_only"]).default("private"),
  templateStyle: z.enum(["modern", "classic", "minimal", "creative"]).default("modern"),
});

type ResumeForm = z.infer<typeof resumeSchema>;

interface Resume {
  id: number;
  userId: number;
  title: string;
  summary?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  certifications?: string;
  languages?: string;
  projects?: string;
  achievements?: string;
  references?: string;
  contactInfo?: {
    email: string;
    phone?: string;
    location?: string;
  };
  workHistory?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  educationHistory?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
  }>;
  visibility: string;
  templateStyle: string;
  isDefault: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

export default function ResumesPage() {
  useDisableRightClick();

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: resumes, isLoading } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
    enabled: !!user,
  });

  const form = useForm<ResumeForm>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      title: "",
      summary: "",
      skills: [],
      experience: "",
      education: "",
      certifications: "",
      languages: "",
      projects: "",
      achievements: "",
      references: "",
      visibility: "private",
      templateStyle: "modern",
    },
  });

  const createResumeMutation = useMutation({
    mutationFn: async (data: ResumeForm) => {
      return await apiRequest("POST", "/api/resumes", data);
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "이력서가 성공적으로 생성되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message || "이력서 생성에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateResumeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ResumeForm> }) => {
      return await apiRequest("PUT", `/api/resumes/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "이력서가 성공적으로 업데이트되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      setIsEditDialogOpen(false);
      setSelectedResume(null);
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message || "이력서 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteResumeMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/resumes/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "이력서가 성공적으로 삭제되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message || "이력서 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const setDefaultResumeMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("PUT", `/api/resumes/${id}/set-default`);
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "기본 이력서로 설정되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message || "기본 이력서 설정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (data: ResumeForm) => {
    createResumeMutation.mutate(data);
  };

  const onEditSubmit = (data: ResumeForm) => {
    if (selectedResume) {
      updateResumeMutation.mutate({
        id: selectedResume.id,
        data,
      });
    }
  };

  const handleEdit = (resume: Resume) => {
    setSelectedResume(resume);
    form.reset({
      title: resume.title,
      summary: resume.summary || "",
      skills: resume.skills || [],
      experience: resume.experience || "",
      education: resume.education || "",
      certifications: resume.certifications || "",
      languages: resume.languages || "",
      projects: resume.projects || "",
      achievements: resume.achievements || "",
      references: resume.references || "",
      visibility: resume.visibility as any,
      templateStyle: resume.templateStyle as any,
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (resume: Resume) => {
    setSelectedResume(resume);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteResumeMutation.mutate(id);
  };

  const handleSetDefault = (id: number) => {
    setDefaultResumeMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">이력서 관리</h1>
            <p className="text-muted-foreground mt-2">
              이력서를 생성하고 관리하세요. 기본 이력서를 설정하여 지원 시 자동으로 사용됩니다.
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                새 이력서 작성
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>새 이력서 작성</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이력서 제목 *</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 김철수의 개발자 이력서" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>자기소개</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="간단한 자기소개를 작성해주세요"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="visibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>공개 설정</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="공개 설정 선택" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="private">비공개</SelectItem>
                              <SelectItem value="public">공개</SelectItem>
                              <SelectItem value="company_only">기업에만 공개</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="templateStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>템플릿 스타일</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="템플릿 선택" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="modern">모던</SelectItem>
                              <SelectItem value="classic">클래식</SelectItem>
                              <SelectItem value="minimal">미니멀</SelectItem>
                              <SelectItem value="creative">크리에이티브</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>경력사항</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="주요 경력사항을 작성해주세요"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>학력</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="학력사항을 작성해주세요"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      disabled={createResumeMutation.isPending}
                    >
                      {createResumeMutation.isPending ? "생성 중..." : "이력서 생성"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resume Cards */}
        {resumes && resumes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Card key={resume.id} className="relative group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {resume.title}
                      </CardTitle>
                      {resume.isDefault && (
                        <Badge className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Star className="w-3 h-3 mr-1" />
                          기본 이력서
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>수정일: {new Date(resume.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="capitalize">{resume.visibility}</span>
                    </div>
                  </div>

                  {resume.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {resume.summary}
                    </p>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(resume)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        보기
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(resume)}
                        className="flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        수정
                      </Button>
                    </div>

                    <div className="flex space-x-1">
                      {!resume.isDefault && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetDefault(resume.id)}
                          className="p-1"
                          title="기본 이력서로 설정"
                        >
                          <StarOff className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1 text-destructive hover:text-destructive"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>이력서 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              정말로 이 이력서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(resume.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              아직 작성된 이력서가 없습니다
            </h3>
            <p className="text-muted-foreground mb-6">
              첫 번째 이력서를 작성하여 취업 활동을 시작해보세요.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              첫 이력서 작성하기
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>이력서 수정</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-6">
                {/* Same form fields as create, but with pre-filled data */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이력서 제목 *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>자기소개</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateResumeMutation.isPending}
                  >
                    {updateResumeMutation.isPending ? "업데이트 중..." : "업데이트"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                {selectedResume?.title}
                {selectedResume?.isDefault && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Star className="w-3 h-3 mr-1" />
                    기본 이력서
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedResume && (
              <div className="space-y-6">
                {/* Contact Info */}
                {selectedResume.contactInfo && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      연락처 정보
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedResume.contactInfo.email}</span>
                      </div>
                      {selectedResume.contactInfo.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedResume.contactInfo.phone}</span>
                        </div>
                      )}
                      {selectedResume.contactInfo.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedResume.contactInfo.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {selectedResume.summary && (
                  <div>
                    <h3 className="font-semibold mb-2">자기소개</h3>
                    <p className="text-muted-foreground">{selectedResume.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {selectedResume.experience && (
                  <div>
                    <h3 className="font-semibold mb-2">경력사항</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedResume.experience}</p>
                  </div>
                )}

                {/* Education */}
                {selectedResume.education && (
                  <div>
                    <h3 className="font-semibold mb-2">학력</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedResume.education}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedResume.skills && selectedResume.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">기술 스택</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedResume.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={() => setIsViewDialogOpen(false)}>
                    닫기
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}