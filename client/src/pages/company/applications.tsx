import { CompanyLayout } from "@/components/company/company-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  MessageCircle,
  Trash2,
  Copy,
  Archive,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CandidateProfileDialog } from "@/components/company/candidate-profile-dialog";
import { ConvertToEmployeeDialog } from "@/components/company/convert-to-employee-dialog";
import { MessageTemplateDialog } from "@/components/company/message-template-dialog";
import { useLocation, Link } from "wouter";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const applications = [
  {
    id: 1,
    resumeId: 1,
    candidateUserId: 1,
    candidate: {
      id: 1,
      name: "김민수",
      email: "minsu.kim@email.com",
      phone: "010-1234-5678",
      location: "서울시 강남구",
      avatar: "KM",
      experience: "3년",
      education: "서울대학교 컴퓨터공학과",
      skills: ["React", "TypeScript", "Node.js", "AWS"],
    },
    job: {
      title: "프론트엔드 개발자",
      department: "개발팀",
    },
    status: "면접 대기",
    rating: 4.5,
    appliedAt: "2024-06-01",
    notes: "우수한 포트폴리오, 팀워크 경험 풍부",
    stage: "interview",
  },
  {
    id: 2,
    resumeId: 2,
    candidateUserId: 2,
    candidate: {
      id: 2,
      name: "이지현",
      email: "jihyun.lee@email.com",
      phone: "010-2345-6789",
      location: "서울시 서초구",
      avatar: "LJ",
      experience: "5년",
      education: "연세대학교 정보시스템학과",
      skills: ["Java", "Spring", "MySQL", "Docker"],
    },
    job: {
      id: 2,
      title: "백엔드 개발자",
      department: "개발팀",
    },
    status: "서류 검토",
    rating: 4.2,
    appliedAt: "2024-06-02",
    notes: "대기업 경력, 시스템 설계 경험",
    stage: "review",
  },
  {
    id: 3,
    resumeId: 3,
    candidateUserId: 3,
    candidate: {
      id: 3,
      name: "박준호",
      email: "junho.park@email.com",
      phone: "010-3456-7890",
      location: "경기도 성남시",
      avatar: "PJ",
      experience: "2년",
      education: "고려대학교 통계학과",
      skills: ["Python", "SQL", "R", "Tableau"],
    },
    job: {
      id: 3,
      title: "데이터 분석가",
      department: "데이터팀",
    },
    status: "1차 통과",
    rating: 4.0,
    appliedAt: "2024-06-03",
    notes: "데이터 분석 프로젝트 경험 다수",
    stage: "passed",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "면접 대기":
      return "bg-yellow-100 text-yellow-800";
    case "서류 검토":
      return "bg-blue-100 text-blue-800";
    case "1차 통과":
      return "bg-green-100 text-green-800";
    case "최종 통과":
      return "bg-purple-100 text-purple-800";
    case "불합격":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string, t: any) => {
  switch (status) {
    case "면접 대기":
      return t('companyApplications.status.interview');
    case "서류 검토":
      return t('companyApplications.status.review');
    case "1차 통과":
      return t('companyApplications.status.passed');
    case "최종 통과":
      return t('companyApplications.status.finalPassed');
    case "불합격":
      return t('companyApplications.status.rejected');
    default:
      return status;
  }
};

export default function CompanyApplications() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedApplicationForSchedule, setSelectedApplicationForSchedule] = useState<any>(null);
  const [isConvertToEmployeeDialogOpen, setIsConvertToEmployeeDialogOpen] = useState(false);
  const [selectedApplicationForConvert, setSelectedApplicationForConvert] = useState<any>(null);

  // Helper function to filter applications by stage/status
  const filterApplicationsByStage = (stage: string) => {
    switch (stage) {
      case "review":
        return applications.filter(app => 
          app.status === "서류 검토" || app.stage === "review"
        );
      case "interview":
        return applications.filter(app => 
          app.status === "면접 대기" || app.stage === "interview"
        );
      case "passed":
        return applications.filter(app => 
          app.status === "1차 통과" || 
          app.status === "최종 통과" || 
          app.status === "합격" ||
          app.stage === "passed"
        );
      case "rejected":
        return applications.filter(app => 
          app.status === "불합격" || app.stage === "rejected"
        );
      default:
        return applications;
    }
  };

  // Calculate counts for each tab
  const reviewCount = filterApplicationsByStage("review").length;
  const interviewCount = filterApplicationsByStage("interview").length;
  const passedCount = filterApplicationsByStage("passed").length;
  const rejectedCount = filterApplicationsByStage("rejected").length;
  
  const handleStartChat = (candidateId: number, applicationId: number) => {
    setLocation(`/company/chat?application=${applicationId}&candidate=${candidateId}`);
  };

  const handleScheduleInterview = (application: any) => {
    setSelectedApplicationForSchedule(application);
    setIsScheduleDialogOpen(true);
  };

  const handleScheduleSubmit = () => {
    toast({
      title: t("common.success") || "성공",
      description: "면접 일정이 추가되었습니다.",
    });
    setIsScheduleDialogOpen(false);
    setLocation("/company/interviews");
  };

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const queryClient = useQueryClient();

  const rejectApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, sendEmail }: { applicationId: number; sendEmail: boolean }) => {
      return await apiRequest("PUT", `/api/company/applications/${applicationId}/reject`, {
        sendEmail,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/applications"] });
      setIsRejectDialogOpen(false);
      setSelectedApplication(null);
      toast({
        title: "지원자 불합격 처리",
        description: "지원자가 불합격 처리되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "처리 실패",
        description: error?.message || "불합격 처리에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const acceptApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, sendEmail }: { applicationId: number; sendEmail: boolean }) => {
      return await apiRequest("PUT", `/api/company/applications/${applicationId}/accept`, {
        sendEmail,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/applications"] });
      setIsOfferDialogOpen(false);
      setSelectedApplication(null);
      toast({
        title: "지원자 합격 처리",
        description: "지원자가 합격 처리되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "처리 실패",
        description: error?.message || "합격 처리에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleRejectApplication = (application: any) => {
    setSelectedApplication(application);
    setIsRejectDialogOpen(true);
  };

  const handleAcceptApplication = (application: any) => {
    setSelectedApplication(application);
    setIsOfferDialogOpen(true);
  };

  const handleRejectWithEmail = (sendEmail: boolean) => {
    if (selectedApplication) {
      rejectApplicationMutation.mutate({
        applicationId: selectedApplication.id,
        sendEmail,
      });
    }
  };

  const handleAcceptWithEmail = (sendEmail: boolean) => {
    if (selectedApplication) {
      acceptApplicationMutation.mutate({
        applicationId: selectedApplication.id,
        sendEmail,
      });
    }
  };

  const handleArchiveApplication = (application: any) => {
    toast({
      title: "지원자 보관",
      description: `${application.candidate.name}님이 보관되었습니다.`,
    });
  };

  const handleDuplicateApplication = (application: any) => {
    toast({
      title: "지원서 복제",
      description: "지원서가 복제되었습니다.",
    });
  };

  const handleDeleteApplication = (application: any) => {
    toast({
      title: "지원서 삭제",
      description: `${application.candidate.name}님의 지원서가 삭제되었습니다.`,
      variant: "destructive",
    });
  };

  return (
    <CompanyLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('companyApplications.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('companyApplications.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t('companyApplications.export')}
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t('companyApplications.search.placeholder')}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('companyApplications.filters.position')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('companyApplications.filters.allPositions')}</SelectItem>
                  <SelectItem value="frontend">{t('companyApplications.positions.frontend')}</SelectItem>
                  <SelectItem value="backend">{t('companyApplications.positions.backend')}</SelectItem>
                  <SelectItem value="data">{t('companyApplications.positions.dataAnalyst')}</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('companyApplications.filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('companyApplications.filters.allStatuses')}</SelectItem>
                  <SelectItem value="review">{t('companyApplications.status.review')}</SelectItem>
                  <SelectItem value="interview">{t('companyApplications.status.interview')}</SelectItem>
                  <SelectItem value="passed">{t('companyApplications.status.passed')}</SelectItem>
                  <SelectItem value="rejected">{t('companyApplications.status.rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">{t('companyApplications.tabs.all')} ({applications.length})</TabsTrigger>
            <TabsTrigger value="review">{t('companyApplications.tabs.review')} ({reviewCount})</TabsTrigger>
            <TabsTrigger value="interview">{t('companyApplications.tabs.interview')} ({interviewCount})</TabsTrigger>
            <TabsTrigger value="passed">{t('companyApplications.tabs.passed')} ({passedCount})</TabsTrigger>
            <TabsTrigger value="rejected">{t('companyApplications.tabs.rejected')} ({rejectedCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6">
              {applications.map((application) => (
                <Card key={application.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.candidate.avatar} />
                          <AvatarFallback>{application.candidate.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {application.candidate.name}
                            </h3>
                            <Badge className={getStatusColor(application.status)}>
                              {getStatusText(application.status, t)}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(application.rating)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-1">
                                {application.rating}
                              </span>
                            </div>
                          </div>
                          
                          {/* 채용공고 정보 강조 */}
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">지원한 채용공고</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {application.job.title}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">•</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {application.job.department}
                              </span>
                              {application.job.id && (
                                <Link href={`/company/jobs?id=${application.job.id}`}>
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                    공고 보기
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              {t('companyApplications.appliedAt')}: {application.appliedAt}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-4 w-4 mr-2" />
                              {application.candidate.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {application.candidate.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {application.candidate.location}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              {t('companyApplications.experience')}: {application.candidate.experience}
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {t('companyApplications.education')}:
                            </p>
                            <p className="text-sm text-gray-600">{application.candidate.education}</p>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {t('companyApplications.skills')}:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {application.candidate.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {application.notes && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('companyApplications.notes')}:
                              </p>
                              <p className="text-sm text-gray-600">{application.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <CandidateProfileDialog
                          candidate={{
                            id: application.candidate.id,
                            name: application.candidate.name,
                            email: application.candidate.email,
                            phone: application.candidate.phone,
                            location: application.candidate.location,
                            avatar: application.candidate.avatar,
                            experience: application.candidate.experience,
                            education: application.candidate.education,
                            skills: application.candidate.skills,
                            rating: application.rating,
                            appliedAt: application.appliedAt,
                          }}
                          jobTitle={application.job.title}
                          applicationId={application.id}
                          resumeId={application.resumeId}
                          candidateUserId={application.candidateUserId}
                          trigger={
                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                              <Eye className="h-4 w-4 mr-1" />
                              {t('companyApplications.actions.viewProfile') || '프로필 보기'}
                            </Button>
                          }
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStartChat(application.candidate.id, application.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {t('companyApplications.actions.chat') || '채팅 시작'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleScheduleInterview(application)}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          {t('companyApplications.actions.schedule')}
                        </Button>
                        {(application.status === "합격" || application.status === "passed" || application.stage === "passed") && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            onClick={() => {
                              setSelectedApplicationForConvert({
                                id: application.id,
                                userId: application.candidateUserId,
                                name: application.candidate.name,
                                email: application.candidate.email,
                                phone: application.candidate.phone,
                                jobTitle: application.job.title,
                                department: application.job.department,
                                applicationId: application.id,
                              });
                              setIsConvertToEmployeeDialogOpen(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            직원으로 전환
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAcceptApplication(application)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              합격 처리
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRejectApplication(application)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              불합격 처리
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleArchiveApplication(application)}>
                              <Archive className="h-4 w-4 mr-2" />
                              보관하기
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateApplication(application)}>
                              <Copy className="h-4 w-4 mr-2" />
                              지원서 복제
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteApplication(application)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              삭제
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

          <TabsContent value="review">
            <div className="grid gap-6">
              {filterApplicationsByStage("review").map((application) => (
                <Card key={application.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.candidate.avatar} />
                          <AvatarFallback>{application.candidate.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {application.candidate.name}
                            </h3>
                            <Badge className={getStatusColor(application.status)}>
                              {getStatusText(application.status, t)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{application.candidate.email}</p>
                          <p className="text-sm text-gray-600">{application.job.title}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <CandidateProfileDialog
                          candidate={{
                            id: application.candidate.id,
                            name: application.candidate.name,
                            email: application.candidate.email,
                            phone: application.candidate.phone,
                            location: application.candidate.location,
                            avatar: application.candidate.avatar,
                            experience: application.candidate.experience,
                            education: application.candidate.education,
                            skills: application.candidate.skills,
                            rating: application.rating,
                            appliedAt: application.appliedAt,
                          }}
                          jobTitle={application.job.title}
                          applicationId={application.id}
                          resumeId={application.resumeId}
                          candidateUserId={application.candidateUserId}
                          trigger={
                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                              <Eye className="h-4 w-4 mr-1" />
                              {t('companyApplications.actions.viewProfile') || '프로필 보기'}
                            </Button>
                          }
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStartChat(application.candidate.id, application.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {t('companyApplications.actions.chat') || '채팅 시작'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {reviewCount === 0 && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">서류 검토 중인 지원자</h3>
                  <p className="text-gray-600 dark:text-gray-400">서류 검토가 필요한 지원자들을 확인하세요</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="interview">
            <div className="grid gap-6">
              {filterApplicationsByStage("interview").map((application) => (
                <Card key={application.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.candidate.avatar} />
                          <AvatarFallback>{application.candidate.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {application.candidate.name}
                            </h3>
                            <Badge className={getStatusColor(application.status)}>
                              {getStatusText(application.status, t)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{application.candidate.email}</p>
                          <p className="text-sm text-gray-600">{application.job.title}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <CandidateProfileDialog
                          candidate={{
                            id: application.candidate.id,
                            name: application.candidate.name,
                            email: application.candidate.email,
                            phone: application.candidate.phone,
                            location: application.candidate.location,
                            avatar: application.candidate.avatar,
                            experience: application.candidate.experience,
                            education: application.candidate.education,
                            skills: application.candidate.skills,
                            rating: application.rating,
                            appliedAt: application.appliedAt,
                          }}
                          jobTitle={application.job.title}
                          applicationId={application.id}
                          resumeId={application.resumeId}
                          candidateUserId={application.candidateUserId}
                          trigger={
                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                              <Eye className="h-4 w-4 mr-1" />
                              {t('companyApplications.actions.viewProfile') || '프로필 보기'}
                            </Button>
                          }
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleScheduleInterview(application)}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          {t('companyApplications.actions.schedule')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {interviewCount === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">면접 대기 중인 지원자</h3>
                  <p className="text-gray-600 dark:text-gray-400">면접 일정을 잡을 지원자들입니다</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="passed">
            <div className="grid gap-6">
              {filterApplicationsByStage("passed").map((application) => (
                <Card key={application.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.candidate.avatar} />
                          <AvatarFallback>{application.candidate.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {application.candidate.name}
                            </h3>
                            <Badge className={getStatusColor(application.status)}>
                              {getStatusText(application.status, t)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{application.candidate.email}</p>
                          <p className="text-sm text-gray-600">{application.job.title}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <CandidateProfileDialog
                          candidate={{
                            id: application.candidate.id,
                            name: application.candidate.name,
                            email: application.candidate.email,
                            phone: application.candidate.phone,
                            location: application.candidate.location,
                            avatar: application.candidate.avatar,
                            experience: application.candidate.experience,
                            education: application.candidate.education,
                            skills: application.candidate.skills,
                            rating: application.rating,
                            appliedAt: application.appliedAt,
                          }}
                          jobTitle={application.job.title}
                          applicationId={application.id}
                          resumeId={application.resumeId}
                          candidateUserId={application.candidateUserId}
                          trigger={
                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                              <Eye className="h-4 w-4 mr-1" />
                              {t('companyApplications.actions.viewProfile') || '프로필 보기'}
                            </Button>
                          }
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={() => {
                            setSelectedApplicationForConvert({
                              id: application.id,
                              userId: application.candidateUserId,
                              name: application.candidate.name,
                              email: application.candidate.email,
                              phone: application.candidate.phone,
                              jobTitle: application.job.title,
                              department: application.job.department,
                              applicationId: application.id,
                            });
                            setIsConvertToEmployeeDialogOpen(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          직원으로 전환
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {passedCount === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">통과한 지원자</h3>
                  <p className="text-gray-600 dark:text-gray-400">최종 단계를 진행할 지원자들입니다</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rejected">
            <div className="grid gap-6">
              {filterApplicationsByStage("rejected").map((application) => (
                <Card key={application.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.candidate.avatar} />
                          <AvatarFallback>{application.candidate.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {application.candidate.name}
                            </h3>
                            <Badge className={getStatusColor(application.status)}>
                              {getStatusText(application.status, t)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{application.candidate.email}</p>
                          <p className="text-sm text-gray-600">{application.job.title}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <CandidateProfileDialog
                          candidate={{
                            id: application.candidate.id,
                            name: application.candidate.name,
                            email: application.candidate.email,
                            phone: application.candidate.phone,
                            location: application.candidate.location,
                            avatar: application.candidate.avatar,
                            experience: application.candidate.experience,
                            education: application.candidate.education,
                            skills: application.candidate.skills,
                            rating: application.rating,
                            appliedAt: application.appliedAt,
                          }}
                          jobTitle={application.job.title}
                          applicationId={application.id}
                          resumeId={application.resumeId}
                          candidateUserId={application.candidateUserId}
                          trigger={
                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                              <Eye className="h-4 w-4 mr-1" />
                              {t('companyApplications.actions.viewProfile') || '프로필 보기'}
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {rejectedCount === 0 && (
                <div className="text-center py-12">
                  <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">불합격 처리된 지원자</h3>
                  <p className="text-gray-600 dark:text-gray-400">아직 불합격 처리된 지원자가 없습니다</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Schedule Interview Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('companyInterviews.addInterviewDialog.title') || '면접 일정 추가'}</DialogTitle>
              <DialogDescription>
                {selectedApplicationForSchedule && (
                  <>
                    {selectedApplicationForSchedule.candidate.name}님과의 면접 일정을 잡아주세요.
                    <br />
                    채용공고: {selectedApplicationForSchedule.job.title}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t('companyInterviews.form.interviewer') || '면접관'}</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('companyInterviews.form.interviewerPlaceholder') || '면접관 선택'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t('companyInterviews.form.interviewerExample1') || '박팀장'}</SelectItem>
                      <SelectItem value="2">{t('companyInterviews.form.interviewerExample2') || '최CTO'}</SelectItem>
                      <SelectItem value="3">{t('companyInterviews.form.interviewerExample3') || '김부장'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('companyInterviews.form.type') || '면접 유형'}</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('companyInterviews.form.typePlaceholder') || '유형 선택'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">{t('companyInterviews.types.video') || '화상면접'}</SelectItem>
                      <SelectItem value="inPerson">{t('companyInterviews.types.inPerson') || '대면면접'}</SelectItem>
                      <SelectItem value="phone">{t('companyInterviews.types.phone') || '전화면접'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t('companyInterviews.form.date') || '날짜'}</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('companyInterviews.form.time') || '시간'}</label>
                  <Input type="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t('companyInterviews.form.duration') || '소요시간'}</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('companyInterviews.form.durationPlaceholder') || '시간 선택'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">{t('companyInterviews.form.duration30') || '30분'}</SelectItem>
                      <SelectItem value="60">{t('companyInterviews.form.duration60') || '60분'}</SelectItem>
                      <SelectItem value="90">{t('companyInterviews.form.duration90') || '90분'}</SelectItem>
                      <SelectItem value="120">{t('companyInterviews.form.duration120') || '120분'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('companyInterviews.form.location') || '장소 / 링크'}</label>
                  <Input placeholder={t('companyInterviews.form.locationPlaceholder') || '회의실 또는 화상회의 링크'} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">{t('companyInterviews.form.notes') || '메모'}</label>
                <Textarea placeholder={t('companyInterviews.form.notesPlaceholder') || '면접에 대한 메모...'} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                  {t('companyInterviews.form.cancel') || '취소'}
                </Button>
                <Button onClick={handleScheduleSubmit} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  {t('companyInterviews.form.schedule') || '일정 추가'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Convert to Employee Dialog */}
        {selectedApplicationForConvert && (
          <ConvertToEmployeeDialog
            open={isConvertToEmployeeDialogOpen}
            onOpenChange={setIsConvertToEmployeeDialogOpen}
            candidate={selectedApplicationForConvert}
            onSuccess={() => {
              // Refresh applications list
              setSelectedApplicationForConvert(null);
            }}
          />
        )}
      </div>
        {/* Reject Message Template Dialog */}
        <MessageTemplateDialog
          open={isRejectDialogOpen}
          onOpenChange={setIsRejectDialogOpen}
          type="reject"
          candidateName={selectedApplication?.candidate?.name}
          candidateEmail={selectedApplication?.candidate?.email}
          jobTitle={selectedApplication?.job?.title}
          onSend={() => handleRejectWithEmail(true)}
        />

        {/* Offer Message Template Dialog */}
        <MessageTemplateDialog
          open={isOfferDialogOpen}
          onOpenChange={setIsOfferDialogOpen}
          type="offer"
          candidateName={selectedApplication?.candidate?.name}
          candidateEmail={selectedApplication?.candidate?.email}
          jobTitle={selectedApplication?.job?.title}
          onSend={() => handleAcceptWithEmail(true)}
        />
    </CompanyLayout>
  );
}