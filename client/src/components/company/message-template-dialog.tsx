import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, apiGet } from "@/lib/queryClient";
import { Mail, Save, Edit, Trash2, Send, FileText, CheckCircle, XCircle, Calendar, Gift } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface MessageTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "reject" | "offer" | "interview";
  candidateName?: string;
  candidateEmail?: string;
  jobTitle?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewLocation?: string;
  onSend?: () => void;
}

interface Template {
  id: number;
  type: "reject" | "offer" | "interview";
  name: string;
  subject: string;
  body: string;
  isDefault: boolean;
  variables: string[];
}

const defaultTemplates = {
  reject: {
    subject: "지원해주신 채용공고에 대한 안내",
    body: `안녕하세요 {candidateName}님,

{candidateName}님께서 지원해주신 "{jobTitle}" 포지션에 대해 검토한 결과, 이번 기회에는 함께하지 못하게 되었습니다.

많은 지원자 중에서 {candidateName}님의 이력서를 검토할 기회를 주셔서 감사합니다. 앞으로 더 좋은 기회가 있을 때 다시 지원해주시기 바랍니다.

감사합니다.
{companyName}`,
  },
  offer: {
    subject: "채용 제안 안내",
    body: `안녕하세요 {candidateName}님,

축하합니다! {candidateName}님께서 지원해주신 "{jobTitle}" 포지션에 최종 합격하셨습니다.

저희 회사와 함께 성장하실 {candidateName}님을 환영합니다. 입사 관련 세부 사항은 추후 별도로 안내드리겠습니다.

감사합니다.
{companyName}`,
  },
  interview: {
    subject: "면접 일정 안내",
    body: `안녕하세요 {candidateName}님,

{candidateName}님께서 지원해주신 "{jobTitle}" 포지션의 면접 일정을 안내드립니다.

📅 면접 일시: {interviewDate} {interviewTime}
📍 면접 장소: {interviewLocation}
⏱ 소요 시간: 약 {duration}분

면접 준비에 참고하시기 바랍니다. 추가 문의사항이 있으시면 언제든지 연락주세요.

감사합니다.
{companyName}`,
  },
};

export function MessageTemplateDialog({
  open,
  onOpenChange,
  type,
  candidateName = "",
  candidateEmail = "",
  jobTitle = "",
  interviewDate = "",
  interviewTime = "",
  interviewLocation = "",
  onSend,
}: MessageTemplateDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [useTemplate, setUseTemplate] = useState(true);
  const [autoSend, setAutoSend] = useState(false);

  // Fetch templates
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/company/message-templates", type],
    queryFn: async () => {
      try {
        const response = await apiGet<Template[]>(`/api/company/message-templates?type=${type}`);
        return Array.isArray(response) ? response : [];
      } catch {
        return [];
      }
    },
    enabled: open,
  });

  // Load default template on open
  useEffect(() => {
    if (open) {
      const defaultTemplate = defaultTemplates[type];
      if (!subject || !body) {
        setSubject(defaultTemplate.subject);
        setBody(defaultTemplate.body);
      }
    } else {
      // Reset when dialog closes
      setSubject("");
      setBody("");
      setSelectedTemplateId(null);
    }
  }, [open, type]);

  const replaceVariables = (text: string) => {
    return text
      .replace(/{candidateName}/g, candidateName || "[지원자 이름]")
      .replace(/{jobTitle}/g, jobTitle || "[채용공고 제목]")
      .replace(/{companyName}/g, "우리 회사")
      .replace(/{interviewDate}/g, interviewDate || "[면접 날짜]")
      .replace(/{interviewTime}/g, interviewTime || "[면접 시간]")
      .replace(/{interviewLocation}/g, interviewLocation || "[면접 장소]")
      .replace(/{duration}/g, "60");
  };

  const handleLoadTemplate = (template: Template) => {
    setSelectedTemplateId(template.id);
    setSubject(template.subject);
    setBody(template.body);
  };

  const handleLoadDefault = () => {
    const defaultTemplate = defaultTemplates[type];
    setSubject(defaultTemplate.subject);
    setBody(defaultTemplate.body);
    setSelectedTemplateId(null);
  };

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const finalSubject = replaceVariables(subject);
      const finalBody = replaceVariables(body);
      
      return await apiRequest("POST", "/api/company/send-message", {
        type,
        recipientEmail: candidateEmail,
        recipientName: candidateName,
        subject: finalSubject,
        body: finalBody,
        jobTitle,
        interviewDate,
        interviewTime,
        interviewLocation,
      });
    },
    onSuccess: () => {
      toast({
        title: "메시지 전송 완료",
        description: `${candidateName}님에게 메시지가 전송되었습니다.`,
      });
      onOpenChange(false);
      if (onSend) onSend();
    },
    onError: (error: any) => {
      toast({
        title: "전송 실패",
        description: error?.message || "메시지 전송에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (data: { name: string; subject: string; body: string; isDefault: boolean }) => {
      return await apiRequest("POST", "/api/company/message-templates", {
        ...data,
        type,
      });
    },
    onSuccess: () => {
      toast({
        title: "템플릿 저장 완료",
        description: "템플릿이 저장되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/company/message-templates"] });
    },
    onError: (error: any) => {
      toast({
        title: "저장 실패",
        description: error?.message || "템플릿 저장에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      toast({
        title: "입력 필요",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    sendMessageMutation.mutate();
  };

  const getTypeLabel = () => {
    switch (type) {
      case "reject":
        return "거절 메시지";
      case "offer":
        return "합격 안내";
      case "interview":
        return "면접 안내";
      default:
        return "메시지";
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "reject":
        return <XCircle className="h-5 w-5" />;
      case "offer":
        return <Gift className="h-5 w-5" />;
      case "interview":
        return <Calendar className="h-5 w-5" />;
      default:
        return <Mail className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon()}
            {getTypeLabel()} 전송
          </DialogTitle>
          <DialogDescription>
            {candidateName && `${candidateName}님에게 ${getTypeLabel()}를 전송합니다.`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="compose" className="w-full">
          <TabsList>
            <TabsTrigger value="compose">작성</TabsTrigger>
            <TabsTrigger value="templates">템플릿 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4">
            {/* Template Selection */}
            {templates.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Label className="text-sm font-medium">템플릿 사용:</Label>
                <Switch checked={useTemplate} onCheckedChange={setUseTemplate} />
                {useTemplate && (
                  <Select
                    value={selectedTemplateId?.toString() || ""}
                    onValueChange={(value) => {
                      const template = templates.find((t) => t.id === parseInt(value));
                      if (template) handleLoadTemplate(template);
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="템플릿 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">기본 템플릿</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name} {template.isDefault && <Badge variant="secondary" className="ml-2">기본</Badge>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button variant="outline" size="sm" onClick={handleLoadDefault}>
                  기본 템플릿 불러오기
                </Button>
              </div>
            )}

            {/* Recipient Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">수신자:</span> {candidateName || "[지원자 이름]"}
                </div>
                <div>
                  <span className="font-medium">이메일:</span> {candidateEmail || "[이메일]"}
                </div>
                {jobTitle && (
                  <div>
                    <span className="font-medium">채용공고:</span> {jobTitle}
                  </div>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">제목</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="메시지 제목을 입력하세요"
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body">내용</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="메시지 내용을 입력하세요"
                className="min-h-[300px]"
              />
              <div className="text-xs text-gray-500">
                사용 가능한 변수: {"{candidateName}"}, {"{jobTitle}"}, {"{companyName}"}
                {type === "interview" && ", {interviewDate}, {interviewTime}, {interviewLocation}, {duration}"}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>미리보기</Label>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <div className="font-semibold mb-2">{replaceVariables(subject)}</div>
                <div className="text-sm whitespace-pre-wrap">{replaceVariables(body)}</div>
              </div>
            </div>

            {/* Auto Send Option */}
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Switch checked={autoSend} onCheckedChange={setAutoSend} />
              <Label className="text-sm">
                자동 전송 활성화 (상태 변경 시 자동으로 메시지 전송)
              </Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const templateName = prompt("템플릿 이름을 입력하세요:");
                  if (templateName) {
                    saveTemplateMutation.mutate({
                      name: templateName,
                      subject,
                      body,
                      isDefault: false,
                    });
                  }
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                템플릿 저장
              </Button>
              <Button
                onClick={handleSend}
                disabled={sendMessageMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendMessageMutation.isPending ? "전송 중..." : "전송하기"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">템플릿 관리</h3>
              <Button
                variant="outline"
                onClick={() => {
                  handleLoadDefault();
                  setSubject(defaultTemplates[type].subject);
                  setBody(defaultTemplates[type].body);
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                새 템플릿 만들기
              </Button>
            </div>

            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{template.name}</h4>
                        {template.isDefault && (
                          <Badge variant="secondary">기본</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{template.subject}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{template.body}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoadTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("템플릿을 삭제하시겠습니까?")) {
                            apiRequest("DELETE", `/api/company/message-templates/${template.id}`)
                              .then(() => {
                                toast({
                                  title: "삭제 완료",
                                  description: "템플릿이 삭제되었습니다.",
                                });
                                queryClient.invalidateQueries({ queryKey: ["/api/company/message-templates"] });
                              });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {templates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  저장된 템플릿이 없습니다.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

