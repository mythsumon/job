import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CompanyLayout } from "@/components/company/company-layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Award,
  TrendingUp,
  FileText,
  Send,
  UserCheck,
  UserX,
  Eye,
  DollarSign,
  MapPin,
  Briefcase,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from "lucide-react";

const CURRENT_COMPANY_ID = 1;

interface EmploymentHistory {
  id: number;
  userId: number;
  companyId: number;
  position: string;
  department: string;
  startDate: string;
  endDate?: string;
  salary?: number;
  status: "pending" | "approved" | "rejected" | "terminated";
  requestedBy: number;
  approvedBy?: number;
  terminatedBy?: number;
  terminationReason?: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
  };
}

interface Evaluation {
  id: number;
  employmentId: number;
  evaluatorId: number;
  evaluatorType: "company" | "employee";
  rating: number;
  feedback?: string;
  skills?: string[];
  isPublic: boolean;
  createdAt: string;
  evaluator?: {
    id: number;
    name: string;
  };
  employment?: {
    position: string;
    company?: { name: string };
    user?: { name: string };
  };
}

export default function CompanyEmployees() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState<EmploymentHistory | null>(null);
  const [evaluationForm, setEvaluationForm] = useState({
    rating: 5,
    feedback: "",
    skills: "",
    isPublic: true,
  });

  // Fetch company employment history
  const { data: employmentHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["/api/employment/company", CURRENT_COMPANY_ID],
  });

  // Fetch company evaluations
  const { data: evaluations = [], isLoading: loadingEvaluations } = useQuery({
    queryKey: ["/api/evaluations/company", CURRENT_COMPANY_ID],
  });

  // Approve employment request
  const approveEmployment = useMutation({
    mutationFn: async (employmentId: number) => {
      return apiRequest("POST", `/api/employment/${employmentId}/approve`, {
        approverId: CURRENT_COMPANY_ID,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employment/company"] });
      toast({
        title: t('companyEmployees.toast.approveSuccess.title'),
        description: t('companyEmployees.toast.approveSuccess.description'),
      });
    },
  });

  // Reject employment request
  const rejectEmployment = useMutation({
    mutationFn: async (employmentId: number) => {
      return apiRequest("POST", `/api/employment/${employmentId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employment/company"] });
      toast({
        title: t('companyEmployees.toast.rejectSuccess.title'),
        description: t('companyEmployees.toast.rejectSuccess.description'),
      });
    },
  });

  // Terminate employment
  const terminateEmployment = useMutation({
    mutationFn: async ({ employmentId, reason }: { employmentId: number; reason?: string }) => {
      return apiRequest("POST", `/api/employment/${employmentId}/terminate`, {
        terminatedBy: CURRENT_COMPANY_ID,
        terminationReason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employment/company"] });
      toast({
        title: t('companyEmployees.toast.terminateSuccess.title'),
        description: t('companyEmployees.toast.terminateSuccess.description'),
      });
    },
  });

  // Create evaluation
  const createEvaluation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/evaluations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluations/company"] });
      setSelectedEmployee(null);
      setEvaluationForm({ rating: 5, feedback: "", skills: "", isPublic: true });
      toast({
        title: t('companyEmployees.toast.evaluationSuccess.title'),
        description: t('companyEmployees.toast.evaluationSuccess.description'),
      });
    },
  });

  const handleEvaluationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    createEvaluation.mutate({
      employmentId: selectedEmployee.id,
      evaluatorId: CURRENT_COMPANY_ID,
      evaluatorType: "company",
      rating: evaluationForm.rating,
      feedback: evaluationForm.feedback,
      skills: evaluationForm.skills.split(",").map(s => s.trim()).filter(Boolean),
      isPublic: evaluationForm.isPublic,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: t('companyEmployees.status.pending'), variant: "secondary" as const },
      approved: { label: t('companyEmployees.status.approved'), variant: "default" as const },
      rejected: { label: t('companyEmployees.status.rejected'), variant: "destructive" as const },
      terminated: { label: t('companyEmployees.status.terminated'), variant: "outline" as const },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const pendingRequests = Array.isArray(employmentHistory) ? employmentHistory.filter((emp: EmploymentHistory) => emp.status === "pending") : [];
  const currentEmployees = Array.isArray(employmentHistory) ? employmentHistory.filter((emp: EmploymentHistory) => emp.status === "approved") : [];
  const formerEmployees = Array.isArray(employmentHistory) ? employmentHistory.filter((emp: EmploymentHistory) => emp.status === "terminated") : [];

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Users className="h-8 w-8 mr-3 text-gray-600" />
              {t('companyEmployees.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('companyEmployees.subtitle')}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('companyEmployees.stats.pendingRequests')}</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('companyEmployees.stats.currentEmployees')}</p>
                  <p className="text-2xl font-bold text-gray-900">{currentEmployees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('companyEmployees.stats.averageRating')}</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('companyEmployees.stats.totalEvaluations')}</p>
                  <p className="text-2xl font-bold text-gray-900">{evaluations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {t('companyEmployees.tabs.pending')} ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="current" className="flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              {t('companyEmployees.tabs.current')} ({currentEmployees.length})
            </TabsTrigger>
            <TabsTrigger value="former" className="flex items-center">
              <UserX className="h-4 w-4 mr-2" />
              {t('companyEmployees.tabs.former')} ({formerEmployees.length})
            </TabsTrigger>
            <TabsTrigger value="evaluations" className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              {t('companyEmployees.tabs.evaluations')} ({evaluations.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Requests */}
          <TabsContent value="pending" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  {t('companyEmployees.pendingRequests.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">{t('companyEmployees.loading')}</p>
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('companyEmployees.pendingRequests.empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((employment: EmploymentHistory) => (
                      <div key={employment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {employment.user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{employment.user?.name}</h3>
                            <p className="text-sm text-gray-600">{employment.position}</p>
                            <p className="text-sm text-gray-500">{employment.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(employment.status)}
                          <Button
                            size="sm"
                            onClick={() => approveEmployment.mutate(employment.id)}
                            disabled={approveEmployment.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t('companyEmployees.actions.approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectEmployment.mutate(employment.id)}
                            disabled={rejectEmployment.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            {t('companyEmployees.actions.reject')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Current Employees */}
          <TabsContent value="current" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                  {t('companyEmployees.currentEmployees.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">{t('companyEmployees.loading')}</p>
                  </div>
                ) : currentEmployees.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('companyEmployees.currentEmployees.empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentEmployees.map((employment: EmploymentHistory) => (
                      <div key={employment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {employment.user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{employment.user?.name}</h3>
                            <p className="text-sm text-gray-600">{employment.position}</p>
                            <p className="text-sm text-gray-500">{employment.department}</p>
                            <p className="text-xs text-gray-400">
                              {t('companyEmployees.startDate')}: {new Date(employment.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(employment.status)}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedEmployee(employment)}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                {t('companyEmployees.actions.evaluate')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t('companyEmployees.evaluation.title')}</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleEvaluationSubmit} className="space-y-4">
                                <div>
                                  <Label>{t('companyEmployees.evaluation.rating')}</Label>
                                  <Select
                                    value={evaluationForm.rating.toString()}
                                    onValueChange={(value) => setEvaluationForm(prev => ({ ...prev, rating: parseInt(value) }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="5">5 - {t('companyEmployees.evaluation.ratings.excellent')}</SelectItem>
                                      <SelectItem value="4">4 - {t('companyEmployees.evaluation.ratings.good')}</SelectItem>
                                      <SelectItem value="3">3 - {t('companyEmployees.evaluation.ratings.average')}</SelectItem>
                                      <SelectItem value="2">2 - {t('companyEmployees.evaluation.ratings.poor')}</SelectItem>
                                      <SelectItem value="1">1 - {t('companyEmployees.evaluation.ratings.terrible')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>{t('companyEmployees.evaluation.feedback')}</Label>
                                  <Textarea
                                    value={evaluationForm.feedback}
                                    onChange={(e) => setEvaluationForm(prev => ({ ...prev, feedback: e.target.value }))}
                                    placeholder={t('companyEmployees.evaluation.feedbackPlaceholder')}
                                  />
                                </div>
                                <div>
                                  <Label>{t('companyEmployees.evaluation.skills')}</Label>
                                  <Input
                                    value={evaluationForm.skills}
                                    onChange={(e) => setEvaluationForm(prev => ({ ...prev, skills: e.target.value }))}
                                    placeholder={t('companyEmployees.evaluation.skillsPlaceholder')}
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={evaluationForm.isPublic}
                                    onChange={(e) => setEvaluationForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                                  />
                                  <Label htmlFor="isPublic">{t('companyEmployees.evaluation.makePublic')}</Label>
                                </div>
                                <Button type="submit" disabled={createEvaluation.isPending}>
                                  {createEvaluation.isPending ? t('companyEmployees.evaluation.submitting') : t('companyEmployees.evaluation.submit')}
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => terminateEmployment.mutate({ employmentId: employment.id })}
                            disabled={terminateEmployment.isPending}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            {t('companyEmployees.actions.terminate')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Former Employees */}
          <TabsContent value="former" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserX className="h-5 w-5 mr-2 text-gray-600" />
                  {t('companyEmployees.formerEmployees.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">{t('companyEmployees.loading')}</p>
                  </div>
                ) : formerEmployees.length === 0 ? (
                  <div className="text-center py-8">
                    <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('companyEmployees.formerEmployees.empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formerEmployees.map((employment: EmploymentHistory) => (
                      <div key={employment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {employment.user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{employment.user?.name}</h3>
                            <p className="text-sm text-gray-600">{employment.position}</p>
                            <p className="text-sm text-gray-500">{employment.department}</p>
                            <p className="text-xs text-gray-400">
                              {t('companyEmployees.period')}: {new Date(employment.startDate).toLocaleDateString()} - {employment.endDate ? new Date(employment.endDate).toLocaleDateString() : t('companyEmployees.present')}
                            </p>
                            {employment.terminationReason && (
                              <p className="text-xs text-red-500">
                                {t('companyEmployees.terminationReason')}: {employment.terminationReason}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(employment.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evaluations */}
          <TabsContent value="evaluations" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-600" />
                  {t('companyEmployees.evaluations.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEvaluations ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">{t('companyEmployees.loading')}</p>
                  </div>
                ) : evaluations.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('companyEmployees.evaluations.empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {evaluations.map((evaluation: Evaluation) => (
                      <div key={evaluation.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < evaluation.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-medium">{evaluation.rating}/5</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(evaluation.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="mb-2">
                          <p className="font-medium">{evaluation.employment?.user?.name}</p>
                          <p className="text-sm text-gray-600">{evaluation.employment?.position}</p>
                        </div>
                        {evaluation.feedback && (
                          <p className="text-gray-700 mb-2">{evaluation.feedback}</p>
                        )}
                        {evaluation.skills && evaluation.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {evaluation.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CompanyLayout>
  );
}