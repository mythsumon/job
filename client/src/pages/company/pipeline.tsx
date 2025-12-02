import { CompanyLayout } from "@/components/company/company-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Star,
  Calendar,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Target,
  TrendingUp,
  Clock,
  UserPlus,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const getPipelineStages = (t: any) => [
  { id: "sourced", name: t('companyPipeline.stages.sourced'), color: "bg-gray-100 text-gray-800", count: 8 },
  { id: "contacted", name: t('companyPipeline.stages.contacted'), color: "bg-blue-100 text-blue-800", count: 5 },
  { id: "interested", name: t('companyPipeline.stages.interested'), color: "bg-green-100 text-green-800", count: 3 },
  { id: "interviewing", name: t('companyPipeline.stages.interviewing'), color: "bg-yellow-100 text-yellow-800", count: 2 },
  { id: "offered", name: t('companyPipeline.stages.offered'), color: "bg-purple-100 text-purple-800", count: 1 },
  { id: "hired", name: t('companyPipeline.stages.hired'), color: "bg-green-100 text-green-800", count: 0 },
];

const talentCandidates = [
  {
    id: 1,
    name: "김소연",
    email: "soyeon.kim@email.com",
    phone: "010-1111-2222",
    location: "서울시 강남구",
    avatar: "KS",
    currentRole: "시니어 프론트엔드 개발자",
    company: "네이버",
    experience: "6년",
    skills: ["React", "Vue.js", "TypeScript", "GraphQL"],
    stage: "sourced",
    priority: "high",
    addedDate: "2024-06-01",
    lastContact: "2024-06-03",
    nextFollowUp: "2024-06-10",
    notes: "포트폴리오 우수, 이직 의향 있음",
    rating: 4.8,
    tags: ["프리미엄", "즉시채용가능"],
  },
  {
    id: 2,
    name: "이준석",
    email: "junseok.lee@email.com",
    phone: "010-2222-3333",
    location: "서울시 서초구",
    avatar: "LJ",
    currentRole: "백엔드 개발자",
    company: "카카오",
    experience: "4년",
    skills: ["Java", "Spring Boot", "Kubernetes", "AWS"],
    stage: "contacted",
    priority: "medium",
    addedDate: "2024-05-28",
    lastContact: "2024-06-05",
    nextFollowUp: "2024-06-12",
    notes: "스타트업 경험 관심, 연봉 협상 필요",
    rating: 4.5,
    tags: ["협상중"],
  },
  {
    id: 3,
    name: "박지영",
    email: "jiyoung.park@email.com",
    phone: "010-3333-4444",
    location: "경기도 판교",
    avatar: "PJ",
    currentRole: "데이터 사이언티스트",
    company: "쿠팡",
    experience: "3년",
    skills: ["Python", "TensorFlow", "SQL", "Spark"],
    stage: "interested",
    priority: "high",
    addedDate: "2024-05-25",
    lastContact: "2024-06-04",
    nextFollowUp: "2024-06-08",
    notes: "AI/ML 전문성 뛰어남, 리모트 근무 선호",
    rating: 4.7,
    tags: ["AI전문가", "리모트"],
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityText = (priority: string, t: any) => {
  switch (priority) {
    case "high":
      return t('companyPipeline.priority.high');
    case "medium":
      return t('companyPipeline.priority.medium');
    case "low":
      return t('companyPipeline.priority.low');
    default:
      return t('companyPipeline.priority.undefined');
  }
};

export default function CompanyPipeline() {
  const { t } = useLanguage();
  const pipelineStages = getPipelineStages(t);

  const getStageColor = (stageId: string) => {
    const stage = pipelineStages.find(s => s.id === stageId);
    return stage?.color || "bg-gray-100 text-gray-800";
  };

  const getStageName = (stageId: string) => {
    const stage = pipelineStages.find(s => s.id === stageId);
    return stage?.name || stageId;
  };

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('companyPipeline.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('companyPipeline.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('companyPipeline.addTalent')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('companyPipeline.addTalentDialog.title')}</DialogTitle>
                  <DialogDescription>
                    {t('companyPipeline.addTalentDialog.description')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">{t('companyPipeline.form.name')}</label>
                      <Input placeholder={t('companyPipeline.form.namePlaceholder')} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t('companyPipeline.form.email')}</label>
                      <Input placeholder={t('companyPipeline.form.emailPlaceholder')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">{t('companyPipeline.form.currentRole')}</label>
                      <Input placeholder={t('companyPipeline.form.currentRolePlaceholder')} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t('companyPipeline.form.company')}</label>
                      <Input placeholder={t('companyPipeline.form.companyPlaceholder')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">{t('companyPipeline.form.stage')}</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={t('companyPipeline.form.stagePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {pipelineStages.map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t('companyPipeline.form.priority')}</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={t('companyPipeline.form.priorityPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">{t('companyPipeline.priority.high')}</SelectItem>
                          <SelectItem value="medium">{t('companyPipeline.priority.medium')}</SelectItem>
                          <SelectItem value="low">{t('companyPipeline.priority.low')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('companyPipeline.form.notes')}</label>
                    <Textarea placeholder={t('companyPipeline.form.notesPlaceholder')} />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">{t('companyPipeline.form.cancel')}</Button>
                    <Button>{t('companyPipeline.form.save')}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {pipelineStages.map((stage) => (
            <Card key={stage.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stage.color} mb-2`}>
                  {stage.name}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stage.count}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('companyPipeline.candidates')}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t('companyPipeline.search.placeholder')}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('companyPipeline.filters.stage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('companyPipeline.filters.allStages')}</SelectItem>
                  {pipelineStages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('companyPipeline.filters.priority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('companyPipeline.filters.allPriorities')}</SelectItem>
                  <SelectItem value="high">{t('companyPipeline.priority.high')}</SelectItem>
                  <SelectItem value="medium">{t('companyPipeline.priority.medium')}</SelectItem>
                  <SelectItem value="low">{t('companyPipeline.priority.low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Talent Cards */}
        <div className="grid gap-6">
          {talentCandidates.map((talent) => (
            <Card key={talent.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold">
                        {talent.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {talent.name}
                        </h3>
                        <Badge className={getStageColor(talent.stage)}>
                          {getStageName(talent.stage)}
                        </Badge>
                        <Badge className={getPriorityColor(talent.priority)}>
                          {getPriorityText(talent.priority, t)}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(talent.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">
                            {talent.rating}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-lg text-blue-600 font-medium mb-2">
                        {talent.currentRole} @ {talent.company}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {talent.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {talent.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {talent.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {t('companyPipeline.experience')}: {talent.experience}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('companyPipeline.skills')}:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {talent.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('companyPipeline.tags')}:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {talent.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {talent.notes && (
                        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>{t('companyPipeline.notes')}:</strong> {talent.notes}
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">{t('companyPipeline.addedDate')}:</span> {talent.addedDate}
                        </div>
                        <div>
                          <span className="font-medium">{t('companyPipeline.lastContact')}:</span> {talent.lastContact}
                        </div>
                        <div>
                          <span className="font-medium">{t('companyPipeline.nextFollowUp')}:</span> {talent.nextFollowUp}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {t('companyPipeline.actions.contact')}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      {t('companyPipeline.actions.edit')}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {t('companyPipeline.actions.schedule')}
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t('companyPipeline.actions.remove')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
          </CompanyLayout>
    );
}