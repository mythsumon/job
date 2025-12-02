import { CompanyLayout } from "@/components/company/company-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  TrendingUp,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Briefcase,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const jobs = [
  {
    id: 1,
    title: "시니어 프론트엔드 개발자",
    department: "개발팀",
    location: "서울시 강남구",
    type: "정규직",
    experience: "3-5년",
    salary: "4000-6000만원",
    isRemote: true,
    status: "active",
    postedAt: "2024-06-01",
    deadline: "2024-06-30",
    views: 1250,
    applications: 45,
    saves: 28,
    description: "React, TypeScript를 활용한 웹 애플리케이션 개발",
    requirements: ["React", "TypeScript", "Next.js", "3년 이상 경력"],
    benefits: ["재택근무", "유연근무", "교육비 지원", "건강검진"],
  },
  {
    id: 2,
    title: "백엔드 개발자",
    department: "개발팀",
    location: "서울시 서초구",
    type: "정규직",
    experience: "2-4년",
    salary: "3500-5500만원",
    isRemote: false,
    status: "active",
    postedAt: "2024-06-03",
    deadline: "2024-07-03",
    views: 980,
    applications: 38,
    saves: 22,
    description: "Java Spring 기반 서버 개발 및 API 설계",
    requirements: ["Java", "Spring Boot", "MySQL", "2년 이상 경력"],
    benefits: ["점심 제공", "커피/간식", "도서 구입비", "야근택시"],
  },
  {
    id: 3,
    title: "데이터 분석가",
    department: "데이터팀",
    location: "서울시 용산구",
    type: "계약직",
    experience: "1-3년",
    salary: "3000-4500만원",
    isRemote: true,
    status: "draft",
    postedAt: "2024-06-05",
    deadline: "2024-07-05",
    views: 720,
    applications: 32,
    saves: 15,
    description: "데이터 분석 및 머신러닝 모델 개발",
    requirements: ["Python", "SQL", "Tableau", "1년 이상 경력"],
    benefits: ["재택근무", "교육비 지원", "컨퍼런스 참가"],
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "draft":
      return "bg-yellow-100 text-yellow-800";
    case "closed":
      return "bg-red-100 text-red-800";
    case "paused":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string, t: any) => {
  switch (status) {
    case "active":
      return t('companyJobs.status.active');
    case "draft":
      return t('companyJobs.status.draft');
    case "closed":
      return t('companyJobs.status.closed');
    case "paused":
      return t('companyJobs.status.paused');
    default:
      return status;
  }
};

export default function CompanyJobs() {
  const { t } = useLanguage();
  const activeJobs = jobs.filter(job => job.status === "active");
  const draftJobs = jobs.filter(job => job.status === "draft");

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('companyJobs.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('companyJobs.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('companyJobs.createJob')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('companyJobs.createJob')}</DialogTitle>
                  <DialogDescription>
                    {t('companyJobs.createJobDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">{t('companyJobs.form.jobTitle')}</label>
                      <Input placeholder={t('companyJobs.form.jobTitlePlaceholder')} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t('companyJobs.form.department')}</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={t('companyJobs.form.departmentPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dev">{t('companyJobs.departments.development')}</SelectItem>
                          <SelectItem value="design">{t('companyJobs.departments.design')}</SelectItem>
                          <SelectItem value="marketing">{t('companyJobs.departments.marketing')}</SelectItem>
                          <SelectItem value="data">{t('companyJobs.departments.data')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">{t('companyJobs.form.employmentType')}</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={t('companyJobs.form.employmentTypePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fulltime">{t('companyJobs.employmentTypes.fullTime')}</SelectItem>
                          <SelectItem value="contract">{t('companyJobs.employmentTypes.contract')}</SelectItem>
                          <SelectItem value="parttime">{t('companyJobs.employmentTypes.partTime')}</SelectItem>
                          <SelectItem value="intern">{t('companyJobs.employmentTypes.intern')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t('companyJobs.form.experience')}</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={t('companyJobs.form.experiencePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">{t('companyJobs.experience.entry')}</SelectItem>
                          <SelectItem value="1-3">{t('companyJobs.experience.junior')}</SelectItem>
                          <SelectItem value="3-5">{t('companyJobs.experience.mid')}</SelectItem>
                          <SelectItem value="5+">{t('companyJobs.experience.senior')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t('companyJobs.form.location')}</label>
                      <Input placeholder={t('companyJobs.form.locationPlaceholder')} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">{t('companyJobs.form.salaryRange')}</label>
                      <Input placeholder={t('companyJobs.form.salaryRangePlaceholder')} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t('companyJobs.form.deadline')}</label>
                      <Input type="date" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">{t('companyJobs.form.jobDescription')}</label>
                    <Textarea placeholder={t('companyJobs.form.jobDescriptionPlaceholder')} rows={4} />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">{t('companyJobs.form.requirements')}</label>
                    <Textarea placeholder={t('companyJobs.form.requirementsPlaceholder')} rows={3} />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">{t('companyJobs.form.preferred')}</label>
                    <Textarea placeholder={t('companyJobs.form.preferredPlaceholder')} rows={3} />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">{t('companyJobs.form.benefits')}</label>
                    <Textarea placeholder={t('companyJobs.form.benefitsPlaceholder')} rows={3} />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">{t('companyJobs.form.saveDraft')}</Button>
                    <Button>{t('companyJobs.form.publish')}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyJobs.stats.totalJobs')}</p>
                  <p className="text-2xl font-bold text-blue-600">{jobs.length}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyJobs.stats.activeJobs')}</p>
                  <p className="text-2xl font-bold text-green-600">{activeJobs.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyJobs.stats.totalApplicants')}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {jobs.reduce((sum, job) => sum + job.applications, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('companyJobs.stats.totalViews')}</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {jobs.reduce((sum, job) => sum + job.views, 0).toLocaleString()}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-orange-600" />
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
                  <Input placeholder={t('companyJobs.search.placeholder')} className="pl-10" />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('companyJobs.filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('companyJobs.filters.allStatuses')}</SelectItem>
                  <SelectItem value="active">{t('companyJobs.status.active')}</SelectItem>
                  <SelectItem value="draft">{t('companyJobs.status.draft')}</SelectItem>
                  <SelectItem value="closed">{t('companyJobs.status.closed')}</SelectItem>
                  <SelectItem value="paused">{t('companyJobs.status.paused')}</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('companyJobs.filters.department')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('companyJobs.filters.allDepartments')}</SelectItem>
                  <SelectItem value="dev">{t('companyJobs.departments.development')}</SelectItem>
                  <SelectItem value="design">{t('companyJobs.departments.design')}</SelectItem>
                  <SelectItem value="marketing">{t('companyJobs.departments.marketing')}</SelectItem>
                  <SelectItem value="data">{t('companyJobs.departments.data')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Job Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">{t('companyJobs.tabs.all')} ({jobs.length})</TabsTrigger>
            <TabsTrigger value="active">{t('companyJobs.tabs.active')} ({activeJobs.length})</TabsTrigger>
            <TabsTrigger value="draft">{t('companyJobs.tabs.draft')} ({draftJobs.length})</TabsTrigger>
            <TabsTrigger value="analytics">{t('companyJobs.tabs.analytics')}</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {job.title}
                          </h3>
                          <Badge className={getStatusColor(job.status)}>
                            {getStatusText(job.status, t)}
                          </Badge>
                          {job.isRemote && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              {t('companyJobs.remote')}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {job.department}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.salary}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.experience}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mt-3 line-clamp-2">
                          {job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.requirements.slice(0, 4).map((req, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {job.requirements.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{job.requirements.length - 4}{t('companyJobs.moreItems')}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-center">
                            <p className="text-lg font-bold text-blue-600">{job.views.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{t('companyJobs.metrics.views')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">{job.applications}</p>
                            <p className="text-xs text-gray-500">{t('companyJobs.metrics.applicants')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-purple-600">{job.saves}</p>
                            <p className="text-xs text-gray-500">{t('companyJobs.metrics.saves')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-orange-600">
                              {Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                            </p>
                            <p className="text-xs text-gray-500">{t('companyJobs.metrics.daysLeft')}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-6">
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                          <Eye className="h-4 w-4 mr-1" />
                          {t('companyJobs.actions.viewApplicants')}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          {t('companyJobs.actions.edit')}
                        </Button>
                        <Button variant="outline" size="sm">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {t('companyJobs.actions.analytics')}
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t('companyJobs.actions.delete')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="grid gap-6">
              {activeJobs.map((job) => (
                <Card key={job.id} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {job.title}
                        </h3>
                        <p className="text-gray-600">{job.department} • {job.location}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{t('companyJobs.status.active')}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="draft" className="mt-6">
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('companyJobs.emptyStates.draft.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('companyJobs.emptyStates.draft.description')}</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('companyJobs.emptyStates.analytics.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('companyJobs.emptyStates.analytics.description')}</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CompanyLayout>
  );
}