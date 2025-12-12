import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, apiGet } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Loader2 } from "lucide-react";

interface ApplyDialogProps {
  jobId: number;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Resume {
  id: number;
  title: string;
  summary?: string;
  isDefault: boolean;
}

export function ApplyDialog({ jobId, jobTitle, open, onOpenChange, onSuccess }: ApplyDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  // Fetch user's resumes
  const { data: resumes, isLoading: resumesLoading } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
    queryFn: () => apiGet<Resume[]>("/api/resumes"),
    enabled: open && !!user,
  });

  // Check if user already applied
  const { data: existingApplication } = useQuery({
    queryKey: ["/api/applications/user", user?.id, jobId],
    queryFn: async () => {
      if (!user?.id) return null;
      const applications = await apiGet<any[]>(`/api/applications/user/${user.id}`);
      return applications.find((app: any) => app.jobId === jobId);
    },
    enabled: open && !!user?.id,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("로그인이 필요합니다");
      if (!selectedResumeId) throw new Error("이력서를 선택해주세요");

      return await apiRequest("POST", "/api/applications", {
        userId: user.id,
        jobId: jobId,
        resumeId: selectedResumeId,
        coverLetter: coverLetter || "지원서를 제출합니다.",
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({
        title: "지원 완료",
        description: "성공적으로 지원하였습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/user", user?.id] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "지원 실패",
        description: error.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  // Set default resume when resumes load
  useEffect(() => {
    if (resumes && resumes.length > 0 && !selectedResumeId) {
      const defaultResume = resumes.find((r) => r.isDefault) || resumes[0];
      setSelectedResumeId(defaultResume.id);
    }
  }, [resumes, selectedResumeId]);

  const hasApplied = !!existingApplication;

  if (hasApplied) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이미 지원하신 채용공고입니다</DialogTitle>
            <DialogDescription>
              이 채용공고에는 이미 지원하셨습니다. 지원 현황은 프로필 페이지에서 확인하실 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              닫기
            </Button>
            <Button onClick={() => {
              onOpenChange(false);
              window.location.href = "/user/profile?tab=applications";
            }}>
              지원 현황 보기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>지원하기</DialogTitle>
          <DialogDescription>
            {jobTitle}에 지원하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Resume Selection */}
          <div className="space-y-2">
            <Label htmlFor="resume">이력서 선택 *</Label>
            {resumesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : resumes && resumes.length > 0 ? (
              <Select
                value={selectedResumeId?.toString() || ""}
                onValueChange={(value) => setSelectedResumeId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="이력서를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id.toString()}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{resume.title}</span>
                        {resume.isDefault && (
                          <span className="text-xs text-muted-foreground">(기본)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-4 border border-dashed rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  등록된 이력서가 없습니다.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    window.location.href = "/user/resumes";
                  }}
                >
                  이력서 작성하기
                </Button>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">자기소개서 (선택사항)</Label>
            <Textarea
              id="coverLetter"
              placeholder="지원 동기와 자신을 어필할 수 있는 내용을 작성해주세요..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {coverLetter.length}자 / 1000자
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            onClick={() => applyMutation.mutate()}
            disabled={!selectedResumeId || applyMutation.isPending}
          >
            {applyMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                지원 중...
              </>
            ) : (
              "지원하기"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}