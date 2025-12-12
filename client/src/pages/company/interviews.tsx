import { CompanyLayout } from "@/components/company/company-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageTemplateDialog } from "@/components/company/message-template-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Send, Bell, RotateCcw, Eye } from "lucide-react";

const interviews = [
  {
    id: 1,
    candidate: {
      name: "김민수",
      email: "minsu.kim@email.com",
      avatar: "KM",
      position: "프론트엔드 개발자",
    },
    interviewer: {
      name: "박팀장",
      email: "park@company.com",
      avatar: "PT",
    },
    scheduledAt: "2024-06-10T14:00:00",
    duration: 60,
    type: "화상면접",
    location: "Zoom 회의실",
    status: "scheduled",
    notes: "기술 면접 1차, React 경험 중점 확인",
    meetingLink: "https://zoom.us/j/123456789",
  },
  {
    id: 2,
    candidate: {
      name: "이지현",
      email: "jihyun.lee@email.com",
      avatar: "LJ",
      position: "백엔드 개발자",
    },
    interviewer: {
      name: "최CTO",
      email: "choi@company.com",
      avatar: "CC",
    },
    scheduledAt: "2024-06-11T10:00:00",
    duration: 90,
    type: "대면면접",
    location: "본사 2층 회의실 A",
    status: "scheduled",
    notes: "최종 면접, 문화 적합성 및 리더십 역량 평가",
    meetingLink: "",
  },
  {
    id: 3,
    candidate: {
      name: "박준호",
      email: "junho.park@email.com",
      avatar: "PJ",
      position: "데이터 분석가",
    },
    interviewer: {
      name: "김부장",
      email: "kim@company.com",
      avatar: "KB",
    },
    scheduledAt: "2024-06-11T16:00:00",
    duration: 45,
    type: "화상면접",
    location: "Google Meet",
    status: "completed",
    notes: "1차 기술 면접 완료, 2차 면접 진행 예정",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    feedback: "기술적 역량 우수, 커뮤니케이션 능력 좋음",
    rating: 4,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "rescheduled":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string, t: any) => {
  switch (status) {
    case "scheduled":
      return t('companyInterviews.status.scheduled');
    case "completed":
      return t('companyInterviews.status.completed');
    case "cancelled":
      return t('companyInterviews.status.cancelled');
    case "rescheduled":
      return t('companyInterviews.status.rescheduled');
    default:
      return status;
  }
};

const formatDate = (dateString: string, t: any) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return `${t('companyInterviews.time.today')} ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `${t('companyInterviews.time.tomorrow')} ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

export default function CompanyInterviews() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [interviewsState, setInterviewsState] = useState(interviews);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);
  const [isInterviewMessageDialogOpen, setIsInterviewMessageDialogOpen] = useState(false);
  const [selectedInterviewForMessage, setSelectedInterviewForMessage] = useState<any>(null);
  
  // Form state for adding new interview
  const [newInterviewForm, setNewInterviewForm] = useState({
    candidateId: "",
    interviewerId: "",
    date: "",
    time: "",
    duration: "60",
    type: "video",
    location: "",
    notes: "",
  });
  
  const upcomingInterviews = interviewsState.filter(i => i.status === "scheduled");
  const completedInterviews = interviewsState.filter(i => i.status === "completed");

  const handleJoinMeeting = (interview: any) => {
    if (interview.meetingLink) {
      window.open(interview.meetingLink, "_blank");
      toast({
        title: t("common.success") || "성공",
        description: "화상면접 링크를 열었습니다.",
      });
    }
  };

  const handleEditInterview = (interview: any) => {
    setSelectedInterview(interview);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    toast({
      title: t("common.success") || "성공",
      description: "면접 정보가 수정되었습니다.",
    });
    setIsEditDialogOpen(false);
    setSelectedInterview(null);
  };

  const handleCancelInterview = (interview: any) => {
    setSelectedInterview(interview);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedInterview) {
      setInterviewsState(prev => 
        prev.map(i => 
          i.id === selectedInterview.id 
            ? { ...i, status: "cancelled" }
            : i
        )
      );
      toast({
        title: t("common.success") || "성공",
        description: "면접이 취소되었습니다.",
      });
    }
    setIsCancelDialogOpen(false);
    setSelectedInterview(null);
  };

  const handleReschedule = (interview: any) => {
    setSelectedInterview(interview);
    setIsRescheduleDialogOpen(true);
  };

  const handleSaveReschedule = () => {
    toast({
      title: t("common.success") || "성공",
      description: "면접 일정이 변경되었습니다.",
    });
    setIsRescheduleDialogOpen(false);
    setSelectedInterview(null);
  };

  const handleAddFeedback = (interview: any) => {
    setSelectedInterview(interview);
    setFeedbackText(interview.feedback || "");
    setRating(interview.rating || 0);
    setIsFeedbackDialogOpen(true);
  };

  const handleSaveFeedback = () => {
    if (selectedInterview) {
      setInterviewsState(prev => 
        prev.map(i => 
          i.id === selectedInterview.id 
            ? { ...i, feedback: feedbackText, rating: rating }
            : i
        )
      );
      toast({
        title: t("common.success") || "성공",
        description: "피드백이 저장되었습니다.",
      });
    }
    setIsFeedbackDialogOpen(false);
    setSelectedInterview(null);
    setFeedbackText("");
    setRating(0);
  };

  const handleViewDetails = (interview: any) => {
    setSelectedInterview(interview);
    setIsViewDetailsDialogOpen(true);
  };

  const handleDeleteInterview = (interview: any) => {
    if (confirm("정말 이 면접을 삭제하시겠습니까?")) {
      setInterviewsState(prev => prev.filter(i => i.id !== interview.id));
      toast({
        title: t("common.success") || "성공",
        description: "면접이 삭제되었습니다.",
      });
    }
  };

  const handleSendReminder = (interview: any) => {
    setSelectedInterviewForMessage(interview);
    setIsInterviewMessageDialogOpen(true);
  };

  const sendInterviewMessageMutation = useMutation({
    mutationFn: async (data: { interviewId: number; sendEmail: boolean; emailSubject?: string; emailBody?: string }) => {
      return await apiRequest("POST", `/api/company/interviews/${data.interviewId}/send-notification`, {
        sendEmail: data.sendEmail,
        emailSubject: data.emailSubject,
        emailBody: data.emailBody,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/interviews"] });
      setIsInterviewMessageDialogOpen(false);
      setSelectedInterviewForMessage(null);
      toast({
        title: t("common.success") || "성공",
        description: "면접 안내 메시지가 전송되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "면접 안내 메시지 전송에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleAddInterview = () => {
    if (!newInterviewForm.candidateId || !newInterviewForm.interviewerId || !newInterviewForm.date || !newInterviewForm.time) {
      toast({
        title: t("common.error") || "오류",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const candidate = interviews.find(i => i.candidate.email.includes("minsu")) || interviews[0];
    const interviewer = interviews.find(i => i.interviewer.email.includes("park")) || interviews[0].interviewer;
    
    const newInterview = {
      id: interviewsState.length + 1,
      candidate: {
        name: candidate.candidate.name,
        email: candidate.candidate.email,
        avatar: candidate.candidate.avatar,
        position: candidate.candidate.position,
      },
      interviewer: {
        name: interviewer.name,
        email: interviewer.email,
        avatar: interviewer.avatar,
      },
      scheduledAt: `${newInterviewForm.date}T${newInterviewForm.time}:00`,
      duration: parseInt(newInterviewForm.duration),
      type: newInterviewForm.type === "video" ? "화상면접" : newInterviewForm.type === "inPerson" ? "대면면접" : "전화면접",
      location: newInterviewForm.location,
      status: "scheduled",
      notes: newInterviewForm.notes,
      meetingLink: newInterviewForm.type === "video" ? "https://zoom.us/j/123456789" : "",
    };

    setInterviewsState(prev => [...prev, newInterview]);
    setIsAddDialogOpen(false);
    
    // Show option to send interview notification
    const shouldSendNotification = window.confirm("면접 일정 안내 메시지를 전송하시겠습니까?");
    if (shouldSendNotification) {
      setSelectedInterviewForMessage(newInterview);
      setIsInterviewMessageDialogOpen(true);
    }
    
    setNewInterviewForm({
      candidateId: "",
      interviewerId: "",
      date: "",
      time: "",
      duration: "60",
      type: "video",
      location: "",
      notes: "",
    });
    toast({
      title: t("common.success") || "성공",
      description: "면접이 일정에 추가되었습니다.",
    });
  };

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('companyInterviews.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('companyInterviews.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('companyInterviews.addInterview')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('companyInterviews.addInterviewDialog.title')}</DialogTitle>
                  <DialogDescription>
                    {t('companyInterviews.addInterviewDialog.description')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">{t('companyInterviews.form.candidate')}</Label>
                      <Select value={newInterviewForm.candidateId} onValueChange={(value) => setNewInterviewForm(prev => ({ ...prev, candidateId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('companyInterviews.form.candidatePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">{t('companyInterviews.form.candidateExample1')}</SelectItem>
                          <SelectItem value="2">{t('companyInterviews.form.candidateExample2')}</SelectItem>
                          <SelectItem value="3">{t('companyInterviews.form.candidateExample3')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">{t('companyInterviews.form.interviewer')}</Label>
                      <Select value={newInterviewForm.interviewerId} onValueChange={(value) => setNewInterviewForm(prev => ({ ...prev, interviewerId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('companyInterviews.form.interviewerPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">{t('companyInterviews.form.interviewerExample1')}</SelectItem>
                          <SelectItem value="2">{t('companyInterviews.form.interviewerExample2')}</SelectItem>
                          <SelectItem value="3">{t('companyInterviews.form.interviewerExample3')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">{t('companyInterviews.form.date')}</Label>
                      <Input 
                        type="date" 
                        value={newInterviewForm.date}
                        onChange={(e) => setNewInterviewForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">{t('companyInterviews.form.time')}</Label>
                      <Input 
                        type="time" 
                        value={newInterviewForm.time}
                        onChange={(e) => setNewInterviewForm(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">{t('companyInterviews.form.duration')}</Label>
                      <Select value={newInterviewForm.duration} onValueChange={(value) => setNewInterviewForm(prev => ({ ...prev, duration: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('companyInterviews.form.durationPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">{t('companyInterviews.form.duration30')}</SelectItem>
                          <SelectItem value="60">{t('companyInterviews.form.duration60')}</SelectItem>
                          <SelectItem value="90">{t('companyInterviews.form.duration90')}</SelectItem>
                          <SelectItem value="120">{t('companyInterviews.form.duration120')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">{t('companyInterviews.form.type')}</Label>
                      <Select value={newInterviewForm.type} onValueChange={(value) => setNewInterviewForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('companyInterviews.form.typePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">{t('companyInterviews.types.video')}</SelectItem>
                          <SelectItem value="inPerson">{t('companyInterviews.types.inPerson')}</SelectItem>
                          <SelectItem value="phone">{t('companyInterviews.types.phone')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('companyInterviews.form.location')}</Label>
                    <Input 
                      placeholder={t('companyInterviews.form.locationPlaceholder')}
                      value={newInterviewForm.location}
                      onChange={(e) => setNewInterviewForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('companyInterviews.form.notes')}</Label>
                    <Textarea 
                      placeholder={t('companyInterviews.form.notesPlaceholder')}
                      value={newInterviewForm.notes}
                      onChange={(e) => setNewInterviewForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t('companyInterviews.form.cancel')}</Button>
                    <Button onClick={handleAddInterview} className="bg-gradient-to-r from-blue-600 to-purple-600">{t('companyInterviews.form.schedule')}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyInterviews.stats.totalInterviews')}</p>
                  <p className="text-2xl font-bold text-blue-600">{interviews.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyInterviews.stats.upcomingInterviews')}</p>
                  <p className="text-2xl font-bold text-green-600">{upcomingInterviews.length}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyInterviews.stats.completedInterviews')}</p>
                  <p className="text-2xl font-bold text-purple-600">{completedInterviews.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyInterviews.stats.successRate')}</p>
                  <p className="text-2xl font-bold text-orange-600">85%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t('companyInterviews.search.placeholder')}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('companyInterviews.filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('companyInterviews.filters.allStatuses')}</SelectItem>
                  <SelectItem value="scheduled">{t('companyInterviews.status.scheduled')}</SelectItem>
                  <SelectItem value="completed">{t('companyInterviews.status.completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('companyInterviews.status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('companyInterviews.filters.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('companyInterviews.filters.allTypes')}</SelectItem>
                  <SelectItem value="video">{t('companyInterviews.types.video')}</SelectItem>
                  <SelectItem value="inPerson">{t('companyInterviews.types.inPerson')}</SelectItem>
                  <SelectItem value="phone">{t('companyInterviews.types.phone')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Interview Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">{t('companyInterviews.tabs.upcoming')} ({upcomingInterviews.length})</TabsTrigger>
            <TabsTrigger value="completed">{t('companyInterviews.tabs.completed')} ({completedInterviews.length})</TabsTrigger>
            <TabsTrigger value="all">{t('companyInterviews.tabs.all')} ({interviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            <div className="grid gap-6">
              {upcomingInterviews.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('companyInterviews.emptyStates.noUpcoming.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('companyInterviews.emptyStates.noUpcoming.description')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                upcomingInterviews.map((interview) => (
                  <Card key={interview.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                              {interview.candidate.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {interview.candidate.name}
                              </h3>
                              <Badge className={getStatusColor(interview.status)}>
                                {getStatusText(interview.status, t)}
                              </Badge>
                            </div>
                            
                            <p className="text-blue-600 font-medium mb-2">
                              {interview.candidate.position}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                {formatDate(interview.scheduledAt, t)}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                {interview.duration} {t('companyInterviews.minutes')}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Video className="h-4 w-4 mr-2" />
                                {interview.type}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                {interview.location}
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('companyInterviews.interviewer')}:
                              </p>
                              <p className="text-sm text-gray-600">{interview.interviewer.name}</p>
                            </div>
                            
                            {interview.notes && (
                              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  <strong>{t('companyInterviews.notes')}:</strong> {interview.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          {interview.meetingLink && (
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-blue-500 to-purple-600"
                              onClick={() => handleJoinMeeting(interview)}
                            >
                              <Video className="h-4 w-4 mr-1" />
                              {t('companyInterviews.actions.joinMeeting') || '회의 참여'}
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditInterview(interview)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {t('companyInterviews.actions.edit') || '수정'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReschedule(interview)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            {t('companyInterviews.actions.reschedule') || '일정 변경'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSendReminder(interview)}
                          >
                            <Bell className="h-4 w-4 mr-1" />
                            {t('companyInterviews.actions.sendReminder') || '알림 전송'}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleAddFeedback(interview)}>
                                <Star className="h-4 w-4 mr-2" />
                                {t('companyInterviews.actions.addFeedback') || '피드백 추가'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleCancelInterview(interview)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                {t('companyInterviews.actions.cancel') || '취소'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteInterview(interview)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('companyInterviews.actions.delete') || '삭제'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid gap-6">
              {completedInterviews.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('companyInterviews.emptyStates.noCompleted.title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('companyInterviews.emptyStates.noCompleted.description')}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                completedInterviews.map((interview) => (
                  <Card key={interview.id} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                              {interview.candidate.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {interview.candidate.name}
                              </h3>
                              <Badge className={getStatusColor(interview.status)}>
                                {getStatusText(interview.status, t)}
                              </Badge>
                              {interview.rating && (
                                <div className="flex items-center space-x-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < interview.rating!
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                  <span className="text-sm text-gray-600 ml-1">
                                    {interview.rating}/5
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-blue-600 font-medium mb-2">
                              {interview.candidate.position}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                {formatDate(interview.scheduledAt, t)}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="h-4 w-4 mr-2" />
                                {interview.interviewer.name}
                              </div>
                            </div>
                            
                            {interview.feedback && (
                              <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  <strong>{t('companyInterviews.feedback')}:</strong> {interview.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(interview)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t('companyInterviews.actions.viewDetails') || '상세 보기'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAddFeedback(interview)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            {t('companyInterviews.actions.editFeedback') || '피드백 수정'}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleDeleteInterview(interview)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('companyInterviews.actions.delete') || '삭제'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6">
              {interviews.map((interview) => (
                <Card key={interview.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                            {interview.candidate.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {interview.candidate.name}
                            </h3>
                            <Badge className={getStatusColor(interview.status)}>
                              {getStatusText(interview.status, t)}
                            </Badge>
                          </div>
                          
                          <p className="text-blue-600 font-medium mb-2">
                            {interview.candidate.position}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDate(interview.scheduledAt, t)}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="h-4 w-4 mr-2" />
                              {interview.interviewer.name}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {interview.status === "scheduled" && interview.meetingLink && (
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-blue-500 to-purple-600"
                            onClick={() => handleJoinMeeting(interview)}
                          >
                            <Video className="h-4 w-4 mr-1" />
                            {t('companyInterviews.actions.joinMeeting') || '회의 참여'}
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(interview)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {t('companyInterviews.actions.viewDetails') || '상세 보기'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditInterview(interview)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {t('companyInterviews.actions.edit') || '수정'}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {interview.status === "scheduled" && (
                              <>
                                <DropdownMenuItem onClick={() => handleReschedule(interview)}>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  {t('companyInterviews.actions.reschedule') || '일정 변경'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendReminder(interview)}>
                                  <Bell className="h-4 w-4 mr-2" />
                                  {t('companyInterviews.actions.sendReminder') || '알림 전송'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleCancelInterview(interview)}
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  {t('companyInterviews.actions.cancel') || '취소'}
                                </DropdownMenuItem>
                              </>
                            )}
                            {interview.status === "completed" && (
                              <DropdownMenuItem onClick={() => handleAddFeedback(interview)}>
                                <Star className="h-4 w-4 mr-2" />
                                {t('companyInterviews.actions.editFeedback') || '피드백 수정'}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteInterview(interview)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('companyInterviews.actions.delete') || '삭제'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Interview Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('companyInterviews.editDialog.title') || '면접 정보 수정'}</DialogTitle>
              <DialogDescription>
                {selectedInterview && `${selectedInterview.candidate.name}님의 면접 정보를 수정합니다.`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('companyInterviews.form.date')}</Label>
                  <Input 
                    type="date" 
                    defaultValue={selectedInterview?.scheduledAt?.split('T')[0]}
                  />
                </div>
                <div>
                  <Label>{t('companyInterviews.form.time')}</Label>
                  <Input 
                    type="time" 
                    defaultValue={selectedInterview?.scheduledAt?.split('T')[1]?.slice(0, 5)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('companyInterviews.form.duration')}</Label>
                  <Select defaultValue={selectedInterview?.duration?.toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 {t('companyInterviews.minutes')}</SelectItem>
                      <SelectItem value="60">60 {t('companyInterviews.minutes')}</SelectItem>
                      <SelectItem value="90">90 {t('companyInterviews.minutes')}</SelectItem>
                      <SelectItem value="120">120 {t('companyInterviews.minutes')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('companyInterviews.form.type')}</Label>
                  <Select defaultValue={selectedInterview?.type === "화상면접" ? "video" : selectedInterview?.type === "대면면접" ? "inPerson" : "phone"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">{t('companyInterviews.types.video')}</SelectItem>
                      <SelectItem value="inPerson">{t('companyInterviews.types.inPerson')}</SelectItem>
                      <SelectItem value="phone">{t('companyInterviews.types.phone')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{t('companyInterviews.form.location')}</Label>
                <Input defaultValue={selectedInterview?.location} />
              </div>
              <div>
                <Label>{t('companyInterviews.form.notes')}</Label>
                <Textarea defaultValue={selectedInterview?.notes} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  {t('companyInterviews.form.cancel')}
                </Button>
                <Button onClick={handleSaveEdit} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  {t('common.save') || '저장'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cancel Interview Dialog */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('companyInterviews.cancelDialog.title') || '면접 취소 확인'}</DialogTitle>
              <DialogDescription>
                {selectedInterview && `${selectedInterview.candidate.name}님의 면접을 취소하시겠습니까?`}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                {t('companyInterviews.form.cancel')}
              </Button>
              <Button onClick={handleConfirmCancel} className="bg-red-600 hover:bg-red-700">
                {t('companyInterviews.actions.confirmCancel') || '취소 확인'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reschedule Interview Dialog */}
        <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('companyInterviews.rescheduleDialog.title') || '면접 일정 변경'}</DialogTitle>
              <DialogDescription>
                {selectedInterview && `${selectedInterview.candidate.name}님의 면접 일정을 변경합니다.`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('companyInterviews.form.date')}</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>{t('companyInterviews.form.time')}</Label>
                  <Input type="time" />
                </div>
              </div>
              <div>
                <Label>{t('companyInterviews.rescheduleDialog.reason') || '변경 사유'}</Label>
                <Textarea placeholder={t('companyInterviews.rescheduleDialog.reasonPlaceholder') || '일정 변경 사유를 입력해주세요...'} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
                  {t('companyInterviews.form.cancel')}
                </Button>
                <Button onClick={handleSaveReschedule} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  {t('companyInterviews.actions.reschedule') || '일정 변경'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('companyInterviews.feedbackDialog.title') || '면접 피드백'}</DialogTitle>
              <DialogDescription>
                {selectedInterview && `${selectedInterview.candidate.name}님의 면접 피드백을 작성합니다.`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>{t('companyInterviews.feedbackDialog.rating') || '평점'}</Label>
                <div className="flex items-center space-x-2 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-8 w-8 cursor-pointer ${
                        i < rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                      onClick={() => setRating(i + 1)}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">{rating}/5</span>
                </div>
              </div>
              <div>
                <Label>{t('companyInterviews.feedback')}</Label>
                <Textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={t('companyInterviews.feedbackDialog.placeholder') || '면접 피드백을 입력해주세요...'}
                  rows={6}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsFeedbackDialogOpen(false)}>
                  {t('companyInterviews.form.cancel')}
                </Button>
                <Button onClick={handleSaveFeedback} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  {t('common.save') || '저장'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{t('companyInterviews.detailsDialog.title') || '면접 상세 정보'}</DialogTitle>
              <DialogDescription>
                {selectedInterview && `${selectedInterview.candidate.name}님의 면접 상세 정보입니다.`}
              </DialogDescription>
            </DialogHeader>
            {selectedInterview && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('companyInterviews.form.candidate')}</Label>
                    <p className="text-lg font-semibold">{selectedInterview.candidate.name}</p>
                    <p className="text-sm text-gray-600">{selectedInterview.candidate.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('companyInterviews.interviewer')}</Label>
                    <p className="text-lg font-semibold">{selectedInterview.interviewer.name}</p>
                    <p className="text-sm text-gray-600">{selectedInterview.interviewer.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('companyInterviews.form.date')}</Label>
                    <p>{formatDate(selectedInterview.scheduledAt, t)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('companyInterviews.form.duration')}</Label>
                    <p>{selectedInterview.duration} {t('companyInterviews.minutes')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('companyInterviews.form.type')}</Label>
                    <p>{selectedInterview.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('companyInterviews.form.location')}</Label>
                    <p>{selectedInterview.location}</p>
                  </div>
                </div>
                {selectedInterview.meetingLink && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('companyInterviews.actions.joinMeeting')}</Label>
                    <a 
                      href={selectedInterview.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedInterview.meetingLink}
                    </a>
                  </div>
                )}
                {selectedInterview.notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('companyInterviews.notes')}</Label>
                    <p className="text-sm">{selectedInterview.notes}</p>
                  </div>
                )}
                {selectedInterview.feedback && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('companyInterviews.feedback')}</Label>
                    <p className="text-sm">{selectedInterview.feedback}</p>
                  </div>
                )}
                {selectedInterview.rating && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('companyInterviews.feedbackDialog.rating')}</Label>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < selectedInterview.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">{selectedInterview.rating}/5</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={() => setIsViewDetailsDialogOpen(false)}>
                    {t('common.close') || '닫기'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Interview Message Template Dialog */}
        <MessageTemplateDialog
          open={isInterviewMessageDialogOpen}
          onOpenChange={setIsInterviewMessageDialogOpen}
          type="interview"
          candidateName={selectedInterviewForMessage?.candidate?.name}
          candidateEmail={selectedInterviewForMessage?.candidate?.email}
          jobTitle={selectedInterviewForMessage?.candidate?.position}
          interviewDate={selectedInterviewForMessage?.scheduledAt ? new Date(selectedInterviewForMessage.scheduledAt).toLocaleDateString('ko-KR') : ""}
          interviewTime={selectedInterviewForMessage?.scheduledAt ? new Date(selectedInterviewForMessage.scheduledAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ""}
          interviewLocation={selectedInterviewForMessage?.location || selectedInterviewForMessage?.meetingLink || ""}
          onSend={(message) => {
            if (selectedInterviewForMessage) {
              sendInterviewMessageMutation.mutate({
                interviewId: selectedInterviewForMessage.id,
                sendEmail: message.autoSend,
                emailSubject: message.subject,
                emailBody: message.body,
              });
            }
          }}
        />
      </div>
    </CompanyLayout>
  );
}