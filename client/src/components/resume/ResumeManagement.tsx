import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, Star, FileText, Download, Copy, X, Calendar, Building, GraduationCap, Award, Languages, Briefcase, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Resume } from "@shared/schema";
import { EnhancedResumeForm } from "./EnhancedResumeForm";
import { ResumeViewer } from "./ResumeViewer";

function ResumeManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch resumes
  const { data: resumeResponse, isLoading, error } = useQuery({
    queryKey: ['/api/resumes'],
  });

  const resumes: Resume[] = Array.isArray(resumeResponse) ? resumeResponse : 
    (resumeResponse as any)?.success ? (resumeResponse as any).data : [];

  // Automatically set the first resume as main if only one exists and none is set as default
  useEffect(() => {
    if (resumes.length === 1 && !resumes[0].isDefault) {
      setMainResumeMutation.mutate(resumes[0].id);
    }
  }, [resumes]);

  // Create resume mutation
  const createResumeMutation = useMutation({
    mutationFn: (resumeData: any) => apiRequest('POST', '/api/resumes', resumeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/resumes/default'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "성공",
        description: "이력서가 생성되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "이력서 생성에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Update resume mutation
  const updateResumeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest('PUT', `/api/resumes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/resumes/default'] });
      setIsEditDialogOpen(false);
      setEditingResume(null);
      toast({
        title: "성공",
        description: "이력서가 수정되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "이력서 수정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Delete resume mutation
  const deleteResumeMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/resumes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/resumes/default'] });
      toast({
        title: "성공",
        description: "이력서가 삭제되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "이력서 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Set main resume mutation
  const setMainResumeMutation = useMutation({
    mutationFn: (resumeId: number) => apiRequest('PUT', `/api/resumes/${resumeId}/default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/resumes/default'] });
      toast({
        title: "성공",
        description: "메인 이력서가 설정되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "메인 이력서 설정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleCreateResume = async (resumeData: any) => {
    createResumeMutation.mutate(resumeData);
  };

  const handleUpdateResume = async (resumeData: any) => {
    if (editingResume) {
      updateResumeMutation.mutate({ id: editingResume.id, data: resumeData });
    }
  };

  const handleDeleteResume = async (id: number) => {
    deleteResumeMutation.mutate(id);
  };

  const handleDownload = async (resume: Resume) => {
    try {
      const response = await fetch(`/api/resumes/${resume.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resume.title}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "오류",
        description: "다운로드에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEditResume = (resume: Resume) => {
    // Convert database resume format to form format
    const formData = {
      ...resume,
      education: resume.education || [],
      workHistory: resume.workHistory || [],
      skillsAndLanguages: resume.skillsAndLanguages || { 
        technicalSkills: [], 
        softSkills: [],
        languages: [],
        certifications: []
      },
      summary: resume.summary || ""
    };
    setEditingResume(formData);
    setIsEditDialogOpen(true);
  };

  const handleViewResume = (resume: Resume) => {
    setSelectedResume(resume);
    setIsViewDialogOpen(true);
  };

  const formatSkills = (skills: string[]) => {
    if (!skills || skills.length === 0) return "없음";
    return skills.slice(0, 3).join(", ") + (skills.length > 3 ? ` 외 ${skills.length - 3}개` : "");
  };

  const getMainEducation = (resume: Resume) => {
    const education = resume.education;
    if (!education || !Array.isArray(education) || education.length === 0) return "없음";
    
    const latest = education.find(edu => edu.current) || education[0];
    return `${latest.institution} ${latest.degree}`;
  };

  const getMainExperience = (resume: Resume) => {
    const experience = resume.workHistory;
    if (!experience || !Array.isArray(experience) || experience.length === 0) return "신입";
    
    const current = experience.find(exp => exp.current);
    if (current) {
      return `${current.company} ${current.position}`;
    }
    
    const latest = experience[0];
    return `${latest.company} ${latest.position}`;
  };

  const getTotalExperience = (resume: Resume) => {
    const experience = resume.workHistory;
    if (!experience || !Array.isArray(experience) || experience.length === 0) return "신입";
    
    let totalMonths = 0;
    experience.forEach(exp => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.current ? new Date() : new Date(exp.endDate || new Date());
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
      totalMonths += months;
    });
    
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    
    if (years === 0) return `${months}개월`;
    if (months === 0) return `${years}년`;
    return `${years}년 ${months}개월`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">이력서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">이력서를 불러오는데 실패했습니다.</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/resumes'] })}>
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">이력서 관리</h2>
          <p className="text-gray-600 mt-1">나의 이력서를 생성하고 관리하세요</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 이력서 작성
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 이력서 작성</DialogTitle>
              <DialogDescription>
                새로운 이력서를 작성하세요. 모든 정보를 입력하여 완성도 높은 이력서를 만들어보세요.
              </DialogDescription>
            </DialogHeader>
            <EnhancedResumeForm
              onSubmit={handleCreateResume}
              isLoading={createResumeMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumes && resumes.length > 0 ? (
          resumes.map((resume) => (
            <Card key={resume.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{resume.title}</CardTitle>
                    {resume.isDefault && (
                      <Badge variant="secondary" className="mt-2">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        메인 이력서
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium">학력:</span>
                    <span className="ml-1">{getMainEducation(resume)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">경력:</span>
                    <span className="ml-1">{getMainExperience(resume)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="font-medium">총 경력:</span>
                    <span className="ml-1">{getTotalExperience(resume)}</span>
                  </div>
                  
                  <div className="flex items-start text-gray-600">
                    <Code className="h-4 w-4 mr-2 text-orange-500 mt-0.5" />
                    <div>
                      <span className="font-medium">기술:</span>
                      <span className="ml-1">{formatSkills(resume.skillsAndLanguages?.technicalSkills?.flatMap(cat => cat.skills.map(s => s.name)) || [])}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    수정일: {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString('ko-KR') : '날짜 없음'}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewResume(resume)}
                    className="w-full justify-start"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    보기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditResume(resume)}
                    className="w-full justify-start"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    편집
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(resume)}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    다운로드
                  </Button>
                  
                  {!resume.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMainResumeMutation.mutate(resume.id)}
                      disabled={setMainResumeMutation.isPending}
                      className="w-full justify-start"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      메인 설정
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </Button>
                    </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>이력서 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{resume.title}" 이력서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteResume(resume.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">아직 이력서가 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 이력서를 작성해 보세요.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              이력서 작성하기
            </Button>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>이력서 편집</DialogTitle>
            <DialogDescription>
              이력서 정보를 수정하세요.
            </DialogDescription>
          </DialogHeader>
          {editingResume && (
            <EnhancedResumeForm
              onSubmit={handleUpdateResume}
              initialData={editingResume}
              isLoading={updateResumeMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          {selectedResume && (
            <ResumeViewer
              resume={selectedResume}
              onEdit={() => {
                setIsViewDialogOpen(false);
                handleEditResume(selectedResume);
              }}
              onClose={() => setIsViewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ResumeManagement;