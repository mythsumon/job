import { CompanyLayout } from "@/components/company/company-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Star,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const applications = [
  {
    id: 1,
    candidate: {
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
    candidate: {
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
    candidate: {
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

const getStageIcon = (stage: string) => {
  switch (stage) {
    case "review":
      return <Clock className="h-4 w-4" />;
    case "interview":
      return <Calendar className="h-4 w-4" />;
    case "passed":
      return <CheckCircle className="h-4 w-4" />;
    case "rejected":
      return <XCircle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
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

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
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
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Filter className="h-4 w-4 mr-2" />
              {t('companyApplications.filterSettings')}
            </Button>
          </div>
        </div>

        {/* Filters */}
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

        {/* Application Stages */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">{t('companyApplications.tabs.all')} ({applications.length})</TabsTrigger>
            <TabsTrigger value="review">{t('companyApplications.tabs.review')} (1)</TabsTrigger>
            <TabsTrigger value="interview">{t('companyApplications.tabs.interview')} (1)</TabsTrigger>
            <TabsTrigger value="passed">{t('companyApplications.tabs.passed')} (1)</TabsTrigger>
            <TabsTrigger value="rejected">{t('companyApplications.tabs.rejected')} (0)</TabsTrigger>
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
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Briefcase className="h-4 w-4 mr-2" />
                              {application.job.title} • {application.job.department}
                            </div>
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
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                          <Eye className="h-4 w-4 mr-1" />
                          {t('companyApplications.actions.viewProfile')}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-1" />
                          {t('companyApplications.actions.contact')}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          {t('companyApplications.actions.schedule')}
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="review">
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">서류 검토 중인 지원자</h3>
              <p className="text-gray-600 dark:text-gray-400">서류 검토가 필요한 지원자들을 확인하세요</p>
            </div>
          </TabsContent>

          <TabsContent value="interview">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">면접 대기 중인 지원자</h3>
              <p className="text-gray-600 dark:text-gray-400">면접 일정을 잡을 지원자들입니다</p>
            </div>
          </TabsContent>

          <TabsContent value="passed">
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">통과한 지원자</h3>
              <p className="text-gray-600 dark:text-gray-400">최종 단계를 진행할 지원자들입니다</p>
            </div>
          </TabsContent>

          <TabsContent value="rejected">
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">불합격 처리된 지원자</h3>
              <p className="text-gray-600 dark:text-gray-400">아직 불합격 처리된 지원자가 없습니다</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
          </CompanyLayout>
    );
}