import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, apiGet } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompanyLayout } from "@/components/company/company-layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { ConvertToEmployeeDialog } from "@/components/company/convert-to-employee-dialog";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  UserCheck,
  UserX,
  Plus,
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Edit,
  Trash2,
  MoreVertical,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

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
    fullName?: string;
    email: string;
    phone?: string;
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState<EmploymentHistory | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);
  const [isUserSearchDialogOpen, setIsUserSearchDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserForConvert, setSelectedUserForConvert] = useState<any>(null);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [terminateReason, setTerminateReason] = useState("");
  
  const [evaluationForm, setEvaluationForm] = useState({
    rating: 5,
    feedback: "",
    skills: "",
    isPublic: true,
  });
  
  const [createUserFormData, setCreateUserFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    location: "",
    userType: "job_seeker",
  });

  // Fetch company employment history
  const { data: employmentHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["/api/employment/company", CURRENT_COMPANY_ID],
  });

  // Fetch company evaluations
  const { data: evaluations = [], isLoading: loadingEvaluations } = useQuery({
    queryKey: ["/api/evaluations/company", CURRENT_COMPANY_ID],
  });

  // Search users for employee creation
  const { data: searchedUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/talents", userSearchQuery],
    queryFn: async () => {
      if (!userSearchQuery.trim()) return [];
      try {
        const params = new URLSearchParams();
        params.append("search", userSearchQuery);
        const data = await apiGet(`/api/talents?${params.toString()}`);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Failed to search users:", error);
        return [];
      }
    },
    enabled: userSearchQuery.trim().length > 0 && isUserSearchDialogOpen,
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
      setIsTerminateDialogOpen(false);
      setTerminateReason("");
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
      setIsEvaluationDialogOpen(false);
      setSelectedEmployee(null);
      setEvaluationForm({ rating: 5, feedback: "", skills: "", isPublic: true });
      toast({
        title: t('companyEmployees.toast.evaluationSuccess.title'),
        description: t('companyEmployees.toast.evaluationSuccess.description'),
      });
    },
  });

  // Create new user
  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/users", {
        ...data,
        username: data.email.split("@")[0],
        isActive: true,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/talents"] });
      setIsCreateUserDialogOpen(false);
      setCreateUserFormData({
        email: "",
        password: "",
        fullName: "",
        phone: "",
        location: "",
        userType: "job_seeker",
      });
      toast({
        title: t('companyEmployees.toast.createUserSuccess.title') || "Success",
        description: t('companyEmployees.toast.createUserSuccess.description') || "User created successfully",
      });
      const createdUser = data.user || data;
      setSelectedUserForConvert({
        id: createdUser.id,
        name: createdUser.fullName || createdUser.name || "Unknown",
        email: createdUser.email,
        title: "",
      });
      setIsConvertDialogOpen(true);
    },
    onError: () => {
      toast({
        title: t('companyEmployees.toast.createUserError.title') || "Error",
        description: t('companyEmployees.toast.createUserError.description') || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Create employment request
  const createEmploymentRequest = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/employment/request", {
        userId: data.userId,
        companyId: CURRENT_COMPANY_ID,
        position: data.position,
        department: data.department,
        employmentType: data.employmentType,
        startDate: data.startDate,
        salary: data.salary ? parseFloat(data.salary) : undefined,
        notes: data.notes,
        requestedBy: CURRENT_COMPANY_ID,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employment/company"] });
      setIsUserSearchDialogOpen(false);
      setIsConvertDialogOpen(false);
      setUserSearchQuery("");
      setSelectedUserForConvert(null);
      toast({
        title: t('companyEmployees.toast.createSuccess.title') || "Success",
        description: t('companyEmployees.toast.createSuccess.description') || "Employee request created successfully",
      });
    },
    onError: () => {
      toast({
        title: t('companyEmployees.toast.createError.title') || "Error",
        description: t('companyEmployees.toast.createError.description') || "Failed to create employee request",
        variant: "destructive",
      });
    },
  });

  const handleUserSelect = (user: any) => {
    setSelectedUserForConvert({
      id: user.id,
      name: user.fullName || user.name || "Unknown",
      email: user.email,
      title: user.title || user.position || "",
    });
    setIsUserSearchDialogOpen(false);
    setIsConvertDialogOpen(true);
  };

  const handleCreateEmployeeSuccess = (formData?: any) => {
    if (formData && selectedUserForConvert) {
      createEmploymentRequest.mutate({
        userId: selectedUserForConvert.id,
        position: formData.position || "",
        department: formData.department || "",
        employmentType: formData.employmentType || "full_time",
        startDate: formData.startDate || "",
        salary: formData.salary || "",
        notes: formData.notes || "",
      });
    }
  };

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

  const handleViewDetails = (employment: EmploymentHistory) => {
    setSelectedEmployee(employment);
    setIsDetailDialogOpen(true);
  };

  const handleEvaluate = (employment: EmploymentHistory) => {
    setSelectedEmployee(employment);
    setIsEvaluationDialogOpen(true);
  };

  const handleTerminate = (employment: EmploymentHistory) => {
    setSelectedEmployee(employment);
    setIsTerminateDialogOpen(true);
  };

  const handleConfirmTerminate = () => {
    if (selectedEmployee) {
      terminateEmployment.mutate({
        employmentId: selectedEmployee.id,
        reason: terminateReason,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: t('companyEmployees.status.pending'), variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      approved: { label: t('companyEmployees.status.approved'), variant: "default" as const, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      rejected: { label: t('companyEmployees.status.rejected'), variant: "destructive" as const, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      terminated: { label: t('companyEmployees.status.terminated'), variant: "outline" as const, className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant} className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  const pendingRequests = Array.isArray(employmentHistory) ? employmentHistory.filter((emp: EmploymentHistory) => emp.status === "pending") : [];
  const currentEmployees = Array.isArray(employmentHistory) ? employmentHistory.filter((emp: EmploymentHistory) => emp.status === "approved") : [];
  const formerEmployees = Array.isArray(employmentHistory) ? employmentHistory.filter((emp: EmploymentHistory) => emp.status === "terminated") : [];

  // Filter employees
  const filterEmployees = (employees: EmploymentHistory[]) => {
    return employees.filter((emp: EmploymentHistory) => {
      const matchesSearch = searchQuery === "" || 
        (emp.user?.name || emp.user?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.user?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = departmentFilter === "all" || emp.department === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });
  };

  const filteredPendingRequests = filterEmployees(pendingRequests);
  const filteredCurrentEmployees = filterEmployees(currentEmployees);
  const filteredFormerEmployees = filterEmployees(formerEmployees);

  // Get unique departments
  const departments = Array.from(new Set(
    Array.isArray(employmentHistory) 
      ? employmentHistory.map((emp: EmploymentHistory) => emp.department).filter(Boolean)
      : []
  ));

  return (
    <CompanyLayout>
      <div className="space-y-6 p-6">
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
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t('common.download') || "Export"}
            </Button>
            <Button
              onClick={() => setIsUserSearchDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('companyEmployees.actions.addEmployee') || "Add Employee"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('companyEmployees.stats.pendingRequests')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('companyEmployees.stats.currentEmployees')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentEmployees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('companyEmployees.stats.averageRating')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">4.8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <UserCheck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('companyEmployees.stats.totalEvaluations')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{evaluations.length}</p>
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

          {/* Pending Requests - Card Style UI */}
          <TabsContent value="pending" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600" />
                      {t('companyEmployees.pendingRequests.title')}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {t('companyEmployees.pendingRequests.description') || "Review and approve pending employment requests"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {filteredPendingRequests.length} {t('companyEmployees.pendingRequests.pending') || "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={t('companyEmployees.searchPlaceholder') || "Search by name, email, position..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('companyEmployees.filterDepartment') || "Department"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all') || "All"}</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {loadingHistory ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-3 text-gray-600">{t('companyEmployees.loading')}</p>
                  </div>
                ) : filteredPendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('companyEmployees.pendingRequests.noPending') || "No Pending Requests"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {t('companyEmployees.pendingRequests.empty') || "There are no pending employment requests at this time."}
                    </p>
                    <Button
                      onClick={() => setIsUserSearchDialogOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('companyEmployees.actions.addEmployee') || "Add Employee"}
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {filteredPendingRequests.map((employment: EmploymentHistory) => (
                      <Card key={employment.id} className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <Avatar className="h-16 w-16">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold">
                                  {(employment.user?.name || employment.user?.fullName || "U").charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-3">
                                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {employment.user?.name || employment.user?.fullName || "Unknown"}
                                  </h3>
                                  {getStatusBadge(employment.status)}
                                </div>
                                
                                {/* Employment Request Info */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                      {t('companyEmployees.pendingRequests.employmentRequest') || "Employment Request"}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        {t('companyEmployees.pendingRequests.position') || "Position"}
                                      </p>
                                      <p className="font-semibold text-gray-900 dark:text-white">{employment.position}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        {t('companyEmployees.pendingRequests.department') || "Department"}
                                      </p>
                                      <p className="font-semibold text-gray-900 dark:text-white">{employment.department}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Contact Information */}
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {employment.user?.email || "-"}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Phone className="h-4 w-4 mr-2" />
                                    {employment.user?.phone || "-"}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {t('companyEmployees.pendingRequests.requestedOn') || "Requested on"}: {new Date(employment.createdAt).toLocaleDateString()}
                                  </div>
                                  {employment.salary && (
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                      <DollarSign className="h-4 w-4 mr-2" />
                                      ${employment.salary.toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(employment)}
                                className="w-full"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {t('companyEmployees.actions.view') || "View"}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => approveEmployment.mutate(employment.id)}
                                disabled={approveEmployment.isPending}
                                className="bg-green-600 hover:bg-green-700 w-full"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {approveEmployment.isPending 
                                  ? t('companyEmployees.actions.approving') || "Approving..." 
                                  : t('companyEmployees.actions.approve')}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectEmployment.mutate(employment.id)}
                                disabled={rejectEmployment.isPending}
                                className="w-full"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                {rejectEmployment.isPending 
                                  ? t('companyEmployees.actions.rejecting') || "Rejecting..." 
                                  : t('companyEmployees.actions.reject')}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Current Employees - Table Style UI */}
          <TabsContent value="current" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                      {t('companyEmployees.currentEmployees.title')}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {t('companyEmployees.currentEmployees.description') || "Manage active employees"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {filteredCurrentEmployees.length} {t('companyEmployees.currentEmployees.active') || "Active"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={t('companyEmployees.searchPlaceholder') || "Search by name, email, position..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('companyEmployees.filterDepartment') || "Department"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all') || "All"}</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {loadingHistory ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-3 text-gray-600">{t('companyEmployees.loading')}</p>
                  </div>
                ) : filteredCurrentEmployees.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('companyEmployees.currentEmployees.noEmployees') || "No Active Employees"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {t('companyEmployees.currentEmployees.empty') || "You don't have any active employees yet."}
                    </p>
                    <Button
                      onClick={() => setIsUserSearchDialogOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('companyEmployees.actions.addEmployee') || "Add Employee"}
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('companyEmployees.table.employee') || "Employee"}</TableHead>
                          <TableHead>{t('companyEmployees.table.position') || "Position"}</TableHead>
                          <TableHead>{t('companyEmployees.table.department') || "Department"}</TableHead>
                          <TableHead>{t('companyEmployees.table.startDate') || "Start Date"}</TableHead>
                          <TableHead>{t('companyEmployees.table.salary') || "Salary"}</TableHead>
                          <TableHead>{t('companyEmployees.table.status') || "Status"}</TableHead>
                          <TableHead className="text-right">{t('companyEmployees.table.actions') || "Actions"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCurrentEmployees.map((employment: EmploymentHistory) => (
                          <TableRow key={employment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                    {(employment.user?.name || employment.user?.fullName || "U").charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{employment.user?.name || employment.user?.fullName || "Unknown"}</div>
                                  <div className="text-sm text-gray-500">{employment.user?.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-gray-400" />
                                {employment.position}
                              </div>
                            </TableCell>
                            <TableCell>{employment.department}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(employment.startDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {employment.salary ? (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">${employment.salary.toLocaleString()}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(employment.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(employment)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  {t('companyEmployees.actions.view') || "View"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEvaluate(employment)}
                                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                                >
                                  <Star className="h-4 w-4 mr-1" />
                                  {t('companyEmployees.actions.evaluate')}
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleTerminate(employment)}>
                                      <UserX className="h-4 w-4 mr-2" />
                                      {t('companyEmployees.actions.terminate')}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Former Employees - Table Style UI */}
          <TabsContent value="former" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <UserX className="h-5 w-5 mr-2 text-gray-600" />
                      {t('companyEmployees.formerEmployees.title')}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {t('companyEmployees.formerEmployees.description') || "View terminated employees"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {filteredFormerEmployees.length} {t('companyEmployees.formerEmployees.terminated') || "Terminated"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={t('companyEmployees.searchPlaceholder') || "Search by name, email, position..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('companyEmployees.filterDepartment') || "Department"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all') || "All"}</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {loadingHistory ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600 mx-auto"></div>
                    <p className="mt-3 text-gray-600">{t('companyEmployees.loading')}</p>
                  </div>
                ) : filteredFormerEmployees.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserX className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('companyEmployees.formerEmployees.noFormer') || "No Former Employees"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('companyEmployees.formerEmployees.empty') || "You don't have any terminated employees."}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('companyEmployees.table.employee') || "Employee"}</TableHead>
                          <TableHead>{t('companyEmployees.table.position') || "Position"}</TableHead>
                          <TableHead>{t('companyEmployees.table.department') || "Department"}</TableHead>
                          <TableHead>{t('companyEmployees.table.period') || "Employment Period"}</TableHead>
                          <TableHead>{t('companyEmployees.table.terminationReason') || "Termination Reason"}</TableHead>
                          <TableHead>{t('companyEmployees.table.status') || "Status"}</TableHead>
                          <TableHead className="text-right">{t('companyEmployees.table.actions') || "Actions"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFormerEmployees.map((employment: EmploymentHistory) => (
                          <TableRow key={employment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 opacity-75">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-gray-400 text-white">
                                    {(employment.user?.name || employment.user?.fullName || "U").charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{employment.user?.name || employment.user?.fullName || "Unknown"}</div>
                                  <div className="text-sm text-gray-500">{employment.user?.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{employment.position}</TableCell>
                            <TableCell>{employment.department}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>
                                  {new Date(employment.startDate).toLocaleDateString()} - {employment.endDate ? new Date(employment.endDate).toLocaleDateString() : t('companyEmployees.present')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {employment.terminationReason ? (
                                <div className="max-w-xs">
                                  <p className="text-sm text-red-600 dark:text-red-400 truncate" title={employment.terminationReason}>
                                    {employment.terminationReason}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(employment.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(employment)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {t('companyEmployees.actions.view') || "View"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evaluations - Card Style UI */}
          <TabsContent value="evaluations" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-600" />
                      {t('companyEmployees.evaluations.title')}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {t('companyEmployees.evaluations.description') || "Employee performance evaluations"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    {evaluations.length} {t('companyEmployees.evaluations.total') || "Total"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loadingEvaluations ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-600 mx-auto"></div>
                    <p className="mt-3 text-gray-600">{t('companyEmployees.loading')}</p>
                  </div>
                ) : evaluations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('companyEmployees.evaluations.noEvaluations') || "No Evaluations"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {t('companyEmployees.evaluations.empty') || "You haven't created any employee evaluations yet."}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('companyEmployees.evaluations.hint') || "Evaluate employees from the Current Employees tab"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {evaluations.map((evaluation: Evaluation) => (
                      <Card key={evaluation.id} className="border-2 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                                  {(evaluation.employment?.user?.name || "E").charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {evaluation.employment?.user?.name || "Unknown Employee"}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {evaluation.employment?.position || "Position"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-5 w-5 ${
                                      i < evaluation.rating 
                                        ? "text-yellow-400 fill-current" 
                                        : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {evaluation.rating}/5
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(evaluation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {evaluation.feedback && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-3">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('companyEmployees.evaluations.feedback') || "Feedback"}
                              </p>
                              <p className="text-gray-700 dark:text-gray-300">{evaluation.feedback}</p>
                            </div>
                          )}
                          
                          {evaluation.skills && evaluation.skills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('companyEmployees.evaluations.skills') || "Skills"}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {evaluation.skills.map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {evaluation.isPublic && (
                            <div className="mt-3 pt-3 border-t">
                              <Badge variant="outline" className="text-xs">
                                {t('companyEmployees.evaluations.public') || "Public Evaluation"}
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Employee Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('companyEmployees.detail.title') || "Employee Details"}</DialogTitle>
              <DialogDescription>
                {selectedEmployee?.user?.name || selectedEmployee?.user?.fullName || "Employee"} 정보
              </DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {(selectedEmployee.user?.name || selectedEmployee.user?.fullName || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedEmployee.user?.name || selectedEmployee.user?.fullName || "Unknown"}</h3>
                    <p className="text-gray-600">{selectedEmployee.position} • {selectedEmployee.department}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">{t('companyEmployees.detail.email') || "Email"}</Label>
                    <p className="font-medium">{selectedEmployee.user?.email || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">{t('companyEmployees.detail.phone') || "Phone"}</Label>
                    <p className="font-medium">{selectedEmployee.user?.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">{t('companyEmployees.detail.startDate') || "Start Date"}</Label>
                    <p className="font-medium">{new Date(selectedEmployee.startDate).toLocaleDateString()}</p>
                  </div>
                  {selectedEmployee.endDate && (
                    <div>
                      <Label className="text-gray-500">{t('companyEmployees.detail.endDate') || "End Date"}</Label>
                      <p className="font-medium">{new Date(selectedEmployee.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedEmployee.salary && (
                    <div>
                      <Label className="text-gray-500">{t('companyEmployees.detail.salary') || "Salary"}</Label>
                      <p className="font-medium">${selectedEmployee.salary.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-500">{t('companyEmployees.detail.status') || "Status"}</Label>
                    <div className="mt-1">{getStatusBadge(selectedEmployee.status)}</div>
                  </div>
                </div>
                {selectedEmployee.terminationReason && (
                  <div>
                    <Label className="text-gray-500">{t('companyEmployees.detail.terminationReason') || "Termination Reason"}</Label>
                    <p className="font-medium text-red-600">{selectedEmployee.terminationReason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Evaluation Dialog */}
        <Dialog open={isEvaluationDialogOpen} onOpenChange={setIsEvaluationDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('companyEmployees.evaluation.title')}</DialogTitle>
              <DialogDescription>
                {selectedEmployee?.user?.name || selectedEmployee?.user?.fullName || "Employee"} 평가 작성
              </DialogDescription>
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
                  rows={4}
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
                  className="rounded"
                />
                <Label htmlFor="isPublic" className="cursor-pointer">{t('companyEmployees.evaluation.makePublic')}</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEvaluationDialogOpen(false);
                    setSelectedEmployee(null);
                    setEvaluationForm({ rating: 5, feedback: "", skills: "", isPublic: true });
                  }}
                >
                  {t('common.cancel') || "Cancel"}
                </Button>
                <Button type="submit" disabled={createEvaluation.isPending} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  {createEvaluation.isPending ? t('companyEmployees.evaluation.submitting') : t('companyEmployees.evaluation.submit')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Terminate Dialog */}
        <Dialog open={isTerminateDialogOpen} onOpenChange={setIsTerminateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('companyEmployees.terminate.title') || "Terminate Employee"}</DialogTitle>
              <DialogDescription>
                {selectedEmployee?.user?.name || selectedEmployee?.user?.fullName || "Employee"}의 고용을 종료하시겠습니까?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('companyEmployees.terminate.reason') || "Termination Reason"}</Label>
                <Textarea
                  value={terminateReason}
                  onChange={(e) => setTerminateReason(e.target.value)}
                  placeholder={t('companyEmployees.terminate.reasonPlaceholder') || "Enter termination reason..."}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTerminateDialogOpen(false);
                    setTerminateReason("");
                    setSelectedEmployee(null);
                  }}
                >
                  {t('common.cancel') || "Cancel"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmTerminate}
                  disabled={terminateEmployment.isPending}
                >
                  {terminateEmployment.isPending ? t('companyEmployees.terminate.terminating') || "Terminating..." : t('companyEmployees.terminate.confirm') || "Confirm Termination"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Search Dialog for Creating Employee */}
        <Dialog open={isUserSearchDialogOpen} onOpenChange={setIsUserSearchDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('companyEmployees.createEmployee.title') || "Add New Employee"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t('companyEmployees.createEmployee.searchPlaceholder') || "Search by name or email..."}
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => {
                    setIsUserSearchDialogOpen(false);
                    setIsCreateUserDialogOpen(true);
                  }}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('companyEmployees.createEmployee.createNewUser') || "Create New User"}
                </Button>
              </div>
              {isLoadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">{t('companyEmployees.loading')}</p>
                </div>
              ) : searchedUsers.length === 0 && userSearchQuery.trim().length > 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {t('companyEmployees.createEmployee.noResults') || "No users found"}
                  </p>
                </div>
              ) : userSearchQuery.trim().length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {t('companyEmployees.createEmployee.searchHint') || "Enter a name or email to search for users"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchedUsers.map((user: any) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <Avatar>
                        <AvatarFallback>
                          {(user.fullName || user.name || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{user.fullName || user.name || "Unknown"}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.title && (
                          <p className="text-xs text-gray-500">{user.title}</p>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        {t('companyEmployees.actions.select') || "Select"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('companyEmployees.createUser.title') || "Create New User"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createUserMutation.mutate(createUserFormData);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-email">{t('companyEmployees.createUser.email') || "Email"} *</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createUserFormData.email}
                    onChange={(e) => setCreateUserFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-password">{t('companyEmployees.createUser.password') || "Password"} *</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createUserFormData.password}
                    onChange={(e) => setCreateUserFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={t('companyEmployees.createUser.passwordPlaceholder') || "Minimum 6 characters"}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-fullName">{t('companyEmployees.createUser.fullName') || "Full Name"} *</Label>
                  <Input
                    id="create-fullName"
                    value={createUserFormData.fullName}
                    onChange={(e) => setCreateUserFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder={t('companyEmployees.createUser.fullNamePlaceholder') || "Enter full name"}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-phone">{t('companyEmployees.createUser.phone') || "Phone"}</Label>
                  <Input
                    id="create-phone"
                    type="tel"
                    value={createUserFormData.phone}
                    onChange={(e) => setCreateUserFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={t('companyEmployees.createUser.phonePlaceholder') || "+976 12345678"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-location">{t('companyEmployees.createUser.location') || "Location"}</Label>
                  <Input
                    id="create-location"
                    value={createUserFormData.location}
                    onChange={(e) => setCreateUserFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={t('companyEmployees.createUser.locationPlaceholder') || "City, Country"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-userType">{t('companyEmployees.createUser.userType') || "User Type"} *</Label>
                  <Select
                    value={createUserFormData.userType}
                    onValueChange={(value) => setCreateUserFormData(prev => ({ ...prev, userType: value }))}
                  >
                    <SelectTrigger id="create-userType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job_seeker">{t('companyEmployees.createUser.jobSeeker') || "Job Seeker"}</SelectItem>
                      <SelectItem value="employer">{t('companyEmployees.createUser.employer') || "Employer"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateUserDialogOpen(false);
                    setCreateUserFormData({
                      email: "",
                      password: "",
                      fullName: "",
                      phone: "",
                      location: "",
                      userType: "job_seeker",
                    });
                  }}
                >
                  {t('common.cancel') || "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {createUserMutation.isPending
                    ? (t('companyEmployees.createUser.creating') || "Creating...")
                    : (t('companyEmployees.createUser.create') || "Create User")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Convert to Employee Dialog */}
        {selectedUserForConvert && (
          <ConvertToEmployeeDialog
            open={isConvertDialogOpen}
            onOpenChange={setIsConvertDialogOpen}
            candidate={selectedUserForConvert}
            onSuccess={handleCreateEmployeeSuccess}
          />
        )}
      </div>
    </CompanyLayout>
  );
}
