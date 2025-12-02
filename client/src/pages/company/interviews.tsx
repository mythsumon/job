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
  const upcomingInterviews = interviews.filter(i => i.status === "scheduled");
  const completedInterviews = interviews.filter(i => i.status === "completed");

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
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
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
                      <label className="text-sm font-medium">{t('companyInterviews.form.candidate')}</label>
                      <Select>
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
                      <label className="text-sm font-medium">{t('companyInterviews.form.interviewer')}</label>
                      <Select>
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
                      <label className="text-sm font-medium">{t('companyInterviews.form.date')}</label>
                      <Input type="date" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t('companyInterviews.form.time')}</label>
                      <Input type="time" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">{t('companyInterviews.form.duration')}</label>
                      <Select>
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
                      <label className="text-sm font-medium">{t('companyInterviews.form.type')}</label>
                      <Select>
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
                    <label className="text-sm font-medium">{t('companyInterviews.form.location')}</label>
                    <Input placeholder={t('companyInterviews.form.locationPlaceholder')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('companyInterviews.form.notes')}</label>
                    <Input placeholder={t('companyInterviews.form.notesPlaceholder')} />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">{t('companyInterviews.form.cancel')}</Button>
                    <Button>{t('companyInterviews.form.schedule')}</Button>
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
                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                              <Video className="h-4 w-4 mr-1" />
                              {t('companyInterviews.actions.joinMeeting')}
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            {t('companyInterviews.actions.edit')}
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <XCircle className="h-4 w-4 mr-1" />
                            {t('companyInterviews.actions.cancel')}
                          </Button>
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
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            {t('companyInterviews.actions.viewDetails')}
                          </Button>
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
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          {t('companyInterviews.actions.edit')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CompanyLayout>
  );
}