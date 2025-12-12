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
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Copy, Pause, Play, Archive, BarChart3, Link as LinkIcon, X, XCircle, Repeat, Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { JobCreateForm } from "@/components/jobs/JobCreateForm";

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
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
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
    case "pending":
      return "승인 대기중";
    case "rejected":
      return "거부됨";
    default:
      return status;
  }
};

export default function CompanyJobs() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExtendDeadlineDialogOpen, setIsExtendDeadlineDialogOpen] = useState(false);
  const [isReportDetailDialogOpen, setIsReportDetailDialogOpen] = useState(false);
  const [isRepostDialogOpen, setIsRepostDialogOpen] = useState(false);
  const [isSchedulePostDialogOpen, setIsSchedulePostDialogOpen] = useState(false);
  const [selectedJobForRepost, setSelectedJobForRepost] = useState<any>(null);
  const [selectedJobForSchedule, setSelectedJobForSchedule] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch reports for jobs
  const { data: allReports = [] } = useQuery({
    queryKey: ["/api/company/job-reports"],
    queryFn: async () => {
      try {
        // Fetch reports for this company's jobs
        const reports = await apiGet<any[]>(`/api/admin/reports?type=job`);
        return Array.isArray(reports) ? reports : [];
      } catch {
        return [];
      }
    },
    enabled: true,
  });

  // Fetch jobs from API
  const { data: jobsData = [], isLoading } = useQuery({
    queryKey: ["/api/company/jobs", { search: searchQuery, status: statusFilter, department: departmentFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (departmentFilter !== "all") params.append("department", departmentFilter);
      const url = params.toString() ? `/api/company/jobs?${params.toString()}` : "/api/company/jobs";
      const jobs = await apiGet<any[]>(url);
      
      // Attach reports to jobs
      const jobsWithReports = jobs.map(job => {
        const jobReports = allReports.filter((r: any) => r.targetId === job.id);
        return {
          ...job,
          reports: jobReports,
          reportedCount: jobReports.length,
          reportedReasons: jobReports.map((r: any) => r.reason),
        };
      });
      
      return jobsWithReports;
    },
    enabled: true,
  });

  const jobsState = jobsData;

  const activeJobs = jobsState.filter(job => job.status === "active");
  const draftJobs = jobsState.filter(job => job.status === "draft");
  const closedJobs = jobsState.filter(job => job.status === "closed");
  const pausedJobs = jobsState.filter(job => job.status === "paused");
  const pendingJobs = jobsState.filter(job => job.status === "pending");
  const rejectedJobs = jobsState.filter(job => job.status === "rejected");
  const reportedJobs = jobsState.filter(job => (job.reportedCount && job.reportedCount > 0) || (job.reportedReasons && job.reportedReasons.length > 0));

  // Group jobs by deadline
  const groupJobsByDeadline = (jobs: any[]) => {
    const now = new Date();
    const groups: { [key: string]: any[] } = {
      'expired': [],
      'thisWeek': [],
      'nextWeek': [],
      'thisMonth': [],
      'later': [],
      'noDeadline': []
    };

    jobs.forEach(job => {
      if (!job.deadline) {
        groups.noDeadline.push(job);
        return;
      }

      const deadline = new Date(job.deadline);
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDeadline < 0) {
        groups.expired.push(job);
      } else if (daysUntilDeadline <= 7) {
        groups.thisWeek.push(job);
      } else if (daysUntilDeadline <= 14) {
        groups.nextWeek.push(job);
      } else if (daysUntilDeadline <= 30) {
        groups.thisMonth.push(job);
      } else {
        groups.later.push(job);
      }
    });

    return groups;
  };

  const deadlineGroups = groupJobsByDeadline(jobsState);

  // Filter jobs based on search and filters
  const filteredJobs = jobsState.filter(job => {
    const matchesSearch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      // TODO: department field removed - not in domain spec
      // job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    // TODO: department filter removed - not in domain spec
    const matchesDepartment = departmentFilter === "all"; // || job.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getTabJobs = (tab: string) => {
    switch (tab) {
      case "active":
        return filteredJobs.filter(j => j.status === "active");
      case "draft":
        return filteredJobs.filter(j => j.status === "draft");
      case "closed":
        return filteredJobs.filter(j => j.status === "closed");
      case "paused":
        return filteredJobs.filter(j => j.status === "paused");
      case "pending":
        return filteredJobs.filter(j => j.status === "pending");
      case "rejected":
        return filteredJobs.filter(j => j.status === "rejected");
      case "reported":
        return filteredJobs.filter(j => (j.reportedCount && j.reportedCount > 0) || (j.reportedReasons && j.reportedReasons.length > 0));
      default:
        return filteredJobs;
    }
  };

  const handleEditJob = (job: any) => {
    setSelectedJob(job);
    setIsEditDialogOpen(true);
  };

  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, data }: { jobId: number; data: any }) => {
      return await apiRequest("PUT", `/api/company/jobs/${jobId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      setIsEditDialogOpen(false);
      setSelectedJob(null);
      toast({
        title: t("common.success") || "성공",
        description: "채용공고가 수정되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "채용공고 수정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSaveEdit = (data: any) => {
    if (!selectedJob) return;
    updateJobMutation.mutate({
      jobId: selectedJob.id,
      data: {
        ...data,
        companyId: user?.companyId || 1,
      },
    });
  };

  const handleDeleteJob = (job: any) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await apiRequest("DELETE", `/api/company/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({
        title: t("common.success") || "성공",
        description: "채용공고가 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "채용공고 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleConfirmDelete = () => {
    if (selectedJob) {
      deleteJobMutation.mutate(selectedJob.id);
    }
    setIsDeleteDialogOpen(false);
    setSelectedJob(null);
  };

  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: number; status: string }) => {
      return await apiRequest("PATCH", `/api/company/jobs/${jobId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({
        title: t("common.success") || "성공",
        description: "채용공고 상태가 변경되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleChangeStatus = (job: any, newStatus: string) => {
    updateJobStatusMutation.mutate({ jobId: job.id, status: newStatus });
  };

  const handleViewApplicants = (job: any) => {
    setLocation(`/company/applications?jobId=${job.id}`);
  };

  const handleViewAnalytics = (job: any) => {
    setActiveTab("analytics");
    setSelectedJob(job);
  };

  const handleViewReports = (job: any) => {
    setSelectedJob(job);
    setIsReportDetailDialogOpen(true);
  };

  const duplicateJobMutation = useMutation({
    mutationFn: async (job: any) => {
      return await apiRequest("POST", "/api/company/jobs", {
        title: `${job.title} (복사본)`, // Domain: title
        location: job.location,
        employmentType: job.employmentType || "full_time", // Domain: employmentType
        experienceLevel: job.experienceLevel, // Domain: experienceLevel
        salary: job.salary, // Domain: salary (string format)
        deadline: job.deadline,
        description: job.description, // Domain: description
        requiredSkills: job.requiredSkills || job.skills || [], // Domain: requiredSkills
        status: "draft",
        companyId: user?.companyId || 1,
        // TODO: Removed fields not in domain: department, isRemote, requirements, benefits
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      toast({
        title: t("common.success") || "성공",
        description: "채용공고가 복제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "채용공고 복제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleDuplicateJob = (job: any) => {
    duplicateJobMutation.mutate(job);
  };

  // Reopen closed job mutation
  const reopenJobMutation = useMutation({
    mutationFn: async (job: any) => {
      return await apiRequest("PUT", `/api/company/jobs/${job.id}/reopen`, {
        deadline: job.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default 30 days from now
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      setIsRepostDialogOpen(false);
      setSelectedJobForRepost(null);
      toast({
        title: t("common.success") || "성공",
        description: "채용공고가 다시 열렸습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "채용공고 재공고에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleReopenJob = (job: any) => {
    setSelectedJobForRepost(job);
    setIsRepostDialogOpen(true);
  };

  // Schedule post mutation
  const schedulePostMutation = useMutation({
    mutationFn: async ({ jobId, scheduledAt }: { jobId: number; scheduledAt: string }) => {
      return await apiRequest("PUT", `/api/company/jobs/${jobId}/schedule`, {
        scheduledAt,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      setIsSchedulePostDialogOpen(false);
      setSelectedJobForSchedule(null);
      setScheduledDate("");
      setScheduledTime("");
      toast({
        title: t("common.success") || "성공",
        description: "채용공고가 예약되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "예약 게시에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSchedulePost = (job: any) => {
    setSelectedJobForSchedule(job);
    setIsSchedulePostDialogOpen(true);
  };

  const handleSchedulePostSubmit = () => {
    if (!selectedJobForSchedule) return;
    if (!scheduledDate || !scheduledTime) {
      toast({
        title: "입력 필요",
        description: "날짜와 시간을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    schedulePostMutation.mutate({ jobId: selectedJobForSchedule.id, scheduledAt });
  };

  const handleCopyLink = (job: any) => {
    const link = `${window.location.origin}/user/jobs/${job.id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: t("common.success") || "성공",
      description: "링크가 클립보드에 복사되었습니다.",
    });
  };

  // Resubmit rejected job mutation
  const resubmitJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await apiRequest("POST", `/api/company/jobs/${jobId}/resubmit`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({
        title: t("common.success") || "성공",
        description: "채용공고가 재제출되었습니다. 관리자 승인을 기다려주세요.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "채용공고 재제출에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleResubmitJob = (job: any) => {
    if (window.confirm(`"${job.title}" 채용공고를 재제출하시겠습니까? 관리자 승인이 필요합니다.`)) {
      resubmitJobMutation.mutate(job.id);
    }
  };

  // Extend deadline mutation
  const extendDeadlineMutation = useMutation({
    mutationFn: async ({ jobId, deadline }: { jobId: number; deadline: string }) => {
      return await apiRequest("POST", `/api/company/jobs/${jobId}/extend-deadline`, { deadline });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      toast({
        title: t("common.success") || "성공",
        description: "마감일이 연장되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "마감일 연장에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleExtendDeadline = (job: any) => {
    const currentDeadline = job.deadline ? new Date(job.deadline) : new Date();
    const newDeadline = new Date(currentDeadline);
    newDeadline.setDate(newDeadline.getDate() + 30); // Extend by 30 days
    
    if (window.confirm(`"${job.title}" 채용공고의 마감일을 ${newDeadline.toLocaleDateString('ko-KR')}로 연장하시겠습니까?`)) {
      extendDeadlineMutation.mutate({
        jobId: job.id,
        deadline: newDeadline.toISOString(),
      });
    }
  };

  // Pause job mutation
  const pauseJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await apiRequest("POST", `/api/company/jobs/${jobId}/pause`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: t("common.success") || "성공",
        description: "채용공고가 일시정지되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "채용공고 일시정지에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Resume job mutation
  const resumeJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await apiRequest("POST", `/api/company/jobs/${jobId}/resume`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: t("common.success") || "성공",
        description: "채용공고가 재개되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "채용공고 재개에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handlePauseJob = (job: any) => {
    if (window.confirm(`"${job.title}" 채용공고를 일시정지하시겠습니까?`)) {
      pauseJobMutation.mutate(job.id);
    }
  };

  const handleResumeJob = (job: any) => {
    resumeJobMutation.mutate(job.id);
  };

  // Batch operations mutation
  const batchJobMutation = useMutation({
    mutationFn: async ({ jobIds, action, data: actionData }: { jobIds: number[]; action: string; data?: any }) => {
      return await apiRequest("POST", "/api/company/jobs/batch", { jobIds, action, data: actionData });
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({
        title: t("common.success") || "성공",
        description: `${result.successCount}개의 채용공고가 처리되었습니다.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error?.message || "일괄 작업에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleBatchAction = (jobIds: number[], action: string) => {
    if (jobIds.length === 0) {
      toast({
        title: "알림",
        description: "선택된 채용공고가 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const actionNames: Record<string, string> = {
      delete: "삭제",
      pause: "일시정지",
      resume: "재개",
      close: "마감",
      resubmit: "재제출",
    };

    if (window.confirm(`${jobIds.length}개의 채용공고를 ${actionNames[action] || action}하시겠습니까?`)) {
      batchJobMutation.mutate({ jobIds, action });
    }
  };

  // Render job card component
  const renderJobCard = (job: any) => (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {job.title}
          </h3>
          <Badge className={getStatusColor(job.status)}>
            {getStatusText(job.status, t)}
          </Badge>
          {job.status === "pending" && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              <Clock className="h-3 w-3 mr-1" />
              승인 대기중
            </Badge>
          )}
          {/* TODO: isRemote field removed - not in domain spec */}
        </div>
        
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
          {/* TODO: department field removed - not in domain spec */}
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
            {job.experienceLevel || job.experience} {/* Domain: experienceLevel */}
          </span>
          {job.deadline && (
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              마감: {new Date(job.deadline).toLocaleDateString('ko-KR')}
            </span>
          )}
          {job.status === "pending" && (
            <span className="flex items-center text-yellow-600">
              <Clock className="h-4 w-4 mr-1" />
              관리자 승인 대기중
            </span>
          )}
          {job.status === "rejected" && (
            <span className="flex items-center text-red-600">
              <X className="h-4 w-4 mr-1" />
              승인 거부됨
            </span>
          )}
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mt-3 line-clamp-2">
          {job.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {/* Domain: requiredSkills (not requirements) */}
          {(job.requiredSkills || job.skills || [])?.slice(0, 4).map((skill: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {(job.requiredSkills || job.skills || []).length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{(job.requiredSkills || job.skills || []).length - 4}{t('companyJobs.moreItems')}
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{job.views?.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-500">{t('companyJobs.metrics.views')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{job.applications || 0}</p>
            <p className="text-xs text-gray-500">{t('companyJobs.metrics.applicants')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600">{job.saves || 0}</p>
            <p className="text-xs text-gray-500">{t('companyJobs.metrics.saves')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-orange-600">
              {job.deadline ? Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : '-'}
            </p>
            <p className="text-xs text-gray-500">{t('companyJobs.metrics.daysLeft')}</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-2 ml-6">
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-blue-500 to-purple-600"
          onClick={() => handleViewApplicants(job)}
        >
          <Eye className="h-4 w-4 mr-1" />
          {t('companyJobs.actions.viewApplicants') || '지원자 보기'}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleEditJob(job)}
        >
          <Edit className="h-4 w-4 mr-1" />
          {t('companyJobs.actions.edit') || '수정'}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleViewAnalytics(job)}
        >
          <BarChart3 className="h-4 w-4 mr-1" />
          {t('companyJobs.actions.analytics') || '분석'}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {job.status === "active" && (
              <DropdownMenuItem onClick={() => handlePauseJob(job)}>
                <Pause className="h-4 w-4 mr-2" />
                {t('companyJobs.actions.pause') || '일시정지'}
              </DropdownMenuItem>
            )}
            {job.status === "paused" && (
              <DropdownMenuItem onClick={() => handleResumeJob(job)}>
                <Play className="h-4 w-4 mr-2" />
                {t('companyJobs.actions.activate') || '재개'}
              </DropdownMenuItem>
            )}
            {job.status === "rejected" && (
              <DropdownMenuItem onClick={() => handleResubmitJob(job)}>
                <Play className="h-4 w-4 mr-2" />
                재제출
              </DropdownMenuItem>
            )}
            {job.status !== "closed" && job.status !== "rejected" && (
              <DropdownMenuItem onClick={() => handleChangeStatus(job, "closed")}>
                <Archive className="h-4 w-4 mr-2" />
                {t('companyJobs.actions.close') || '마감'}
              </DropdownMenuItem>
            )}
            {job.status === "closed" && (
              <DropdownMenuItem onClick={() => handleReopenJob(job)}>
                <Repeat className="h-4 w-4 mr-2" />
                재공고하기
              </DropdownMenuItem>
            )}
            {job.deadline && job.status === "active" && (
              <DropdownMenuItem onClick={() => handleExtendDeadline(job)}>
                <Calendar className="h-4 w-4 mr-2" />
                마감일 연장
              </DropdownMenuItem>
            )}
            {(job.status === "draft" || job.status === "pending") && (
              <DropdownMenuItem onClick={() => handleSchedulePost(job)}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                예약 게시
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleDuplicateJob(job)}>
              <Copy className="h-4 w-4 mr-2" />
              {t('companyJobs.actions.duplicate') || '복제'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyLink(job)}>
              <LinkIcon className="h-4 w-4 mr-2" />
              {t('companyJobs.actions.copyLink') || '링크 복사'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDeleteJob(job)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('companyJobs.actions.delete') || '삭제'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/company/jobs", {
        ...data,
        companyId: user?.companyId || 1, // In real app, from auth
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      setIsCreateDialogOpen(false); // Close dialog on success
      toast({
        title: t("common.success") || "성공",
        description: "채용공고가 생성되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "채용공고 생성에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleCreateJob = (data: any) => {
    createJobMutation.mutate(data);
  };

  const saveDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/company/jobs", {
        ...data,
        status: "draft",
        companyId: user?.companyId || 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/jobs"] });
      setIsCreateDialogOpen(false); // Close dialog on success
      toast({
        title: t("common.success") || "성공",
        description: "초안이 저장되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "초안 저장에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSaveDraft = (data: any) => {
    saveDraftMutation.mutate(data);
  };

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
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                <JobCreateForm
                  onSubmit={handleCreateJob}
                  onSaveDraft={handleSaveDraft}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
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
                  <p className="text-2xl font-bold text-blue-600">{jobsState.length}</p>
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
                    {jobsState.reduce((sum, job) => sum + (job.applications || 0), 0)}
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
                    {jobsState.reduce((sum, job) => sum + (job.views || 0), 0).toLocaleString()}
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
                  <Input 
                    placeholder={t('companyJobs.search.placeholder')} 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('companyJobs.filters.department')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('companyJobs.filters.allDepartments')}</SelectItem>
                  <SelectItem value="개발팀">{t('companyJobs.departments.development')}</SelectItem>
                  <SelectItem value="디자인팀">{t('companyJobs.departments.design')}</SelectItem>
                  <SelectItem value="마케팅팀">{t('companyJobs.departments.marketing')}</SelectItem>
                  <SelectItem value="데이터팀">{t('companyJobs.departments.data')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Job Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="inline-flex">
              <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                {t('companyJobs.tabs.all')} ({jobsState.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                {t('companyJobs.tabs.active')} ({activeJobs.length})
              </TabsTrigger>
              <TabsTrigger 
                value="closed" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                마감 ({closedJobs.length})
              </TabsTrigger>
              {reportedJobs.length > 0 && (
                <TabsTrigger 
                  value="reported" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-red-600"
                >
                  <AlertTriangle className="h-4 w-4 mr-1.5" />
                  리포트 ({reportedJobs.length})
                </TabsTrigger>
              )}
            </TabsList>
            
            {/* More Options Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  더보기
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setActiveTab("pending")}>
                  승인 대기 ({pendingJobs.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("draft")}>
                  {t('companyJobs.tabs.draft')} ({draftJobs.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("paused")}>
                  {t('companyJobs.status.paused')} ({pausedJobs.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("rejected")}>
                  거부됨 ({rejectedJobs.length})
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab("analytics")}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t('companyJobs.tabs.analytics')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Expired Jobs Alert */}
          {(() => {
            const deadlineGroups = groupJobsByDeadline(jobsState);
            return deadlineGroups.expired.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                <Calendar className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  마감된 공고 ({deadlineGroups.expired.length})
                </span>
              </div>
            );
          })()}

          <TabsContent value="all" className="mt-6">
            <div className="space-y-6">
              {getTabJobs("all").length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('companyJobs.emptyStates.noJobs.title') || '채용공고가 없습니다'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('companyJobs.emptyStates.noJobs.description') || '새로운 채용공고를 작성해보세요'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Deadline Groups */}
                  {(() => {
                    const deadlineGroups = groupJobsByDeadline(getTabJobs("all"));
                    return (
                      <>
                        {deadlineGroups.thisWeek.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-orange-600 dark:text-orange-400 flex items-center">
                              <Calendar className="h-5 w-5 mr-2" />
                              이번 주 마감 ({deadlineGroups.thisWeek.length})
                            </h3>
                            <div className="space-y-4">
                              {deadlineGroups.thisWeek.map((job) => (
                                <Card key={job.id} className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
                                  <CardContent className="p-6">
                                    {renderJobCard(job)}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                        {deadlineGroups.nextWeek.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-yellow-600 dark:text-yellow-400 flex items-center">
                              <Calendar className="h-5 w-5 mr-2" />
                              다음 주 마감 ({deadlineGroups.nextWeek.length})
                            </h3>
                            <div className="space-y-4">
                              {deadlineGroups.nextWeek.map((job) => (
                                <Card key={job.id} className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
                                  <CardContent className="p-6">
                                    {renderJobCard(job)}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                        {deadlineGroups.thisMonth.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400 flex items-center">
                              <Calendar className="h-5 w-5 mr-2" />
                              이번 달 마감 ({deadlineGroups.thisMonth.length})
                            </h3>
                            <div className="space-y-4">
                              {deadlineGroups.thisMonth.map((job) => (
                                <Card key={job.id} className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                                  <CardContent className="p-6">
                                    {renderJobCard(job)}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                        {deadlineGroups.later.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-gray-600 dark:text-gray-400 flex items-center">
                              <Calendar className="h-5 w-5 mr-2" />
                              이후 마감 ({deadlineGroups.later.length})
                            </h3>
                            <div className="space-y-4">
                              {deadlineGroups.later.map((job) => (
                                <Card key={job.id} className="border-gray-200 dark:border-gray-800">
                                  <CardContent className="p-6">
                                    {renderJobCard(job)}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                        {deadlineGroups.noDeadline.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-gray-600 dark:text-gray-400 flex items-center">
                              <Calendar className="h-5 w-5 mr-2" />
                              마감일 없음 ({deadlineGroups.noDeadline.length})
                            </h3>
                            <div className="space-y-4">
                              {deadlineGroups.noDeadline.map((job) => (
                                <Card key={job.id} className="border-gray-200 dark:border-gray-800">
                                  <CardContent className="p-6">
                                    {renderJobCard(job)}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="active" className="mt-6">
            <div className="grid gap-6">
              {getTabJobs("active").length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('companyJobs.emptyStates.active.title') || '활성 채용공고가 없습니다'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('companyJobs.emptyStates.active.description') || '새로운 채용공고를 작성하거나 초안을 게시하세요'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getTabJobs("active").map((job) => (
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
                          {/* TODO: isRemote field removed - not in domain spec */}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          {/* TODO: department field removed - not in domain spec */}
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
                            {job.experienceLevel || job.experience} {/* Domain: experienceLevel */}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mt-3 line-clamp-2">
                          {job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {/* Domain: requiredSkills (not requirements) */}
                          {(job.requiredSkills || job.skills || []).slice(0, 4).map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {(job.requiredSkills || job.skills || []).length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(job.requiredSkills || job.skills || []).length - 4}{t('companyJobs.moreItems')}
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
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-blue-500 to-purple-600"
                          onClick={() => handleViewApplicants(job)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {t('companyJobs.actions.viewApplicants') || '지원자 보기'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditJob(job)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {t('companyJobs.actions.edit') || '수정'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewAnalytics(job)}
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          {t('companyJobs.actions.analytics') || '분석'}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                        </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {job.status === "active" && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(job, "paused")}>
                                <Pause className="h-4 w-4 mr-2" />
                                {t('companyJobs.actions.pause') || '일시정지'}
                              </DropdownMenuItem>
                            )}
                            {job.status === "paused" && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(job, "active")}>
                                <Play className="h-4 w-4 mr-2" />
                                {t('companyJobs.actions.activate') || '활성화'}
                              </DropdownMenuItem>
                            )}
                            {job.status !== "closed" && (
                              <DropdownMenuItem onClick={() => handleChangeStatus(job, "closed")}>
                                <Archive className="h-4 w-4 mr-2" />
                                {t('companyJobs.actions.close') || '마감'}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicateJob(job)}>
                              <Copy className="h-4 w-4 mr-2" />
                              {t('companyJobs.actions.duplicate') || '복제'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyLink(job)}>
                              <LinkIcon className="h-4 w-4 mr-2" />
                              {t('companyJobs.actions.copyLink') || '링크 복사'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteJob(job)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('companyJobs.actions.delete') || '삭제'}
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

          <TabsContent value="active" className="mt-6">
            <div className="grid gap-6">
              {getTabJobs("active").length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('companyJobs.emptyStates.active.title') || '활성 채용공고가 없습니다'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('companyJobs.emptyStates.active.description') || '새로운 채용공고를 작성하거나 초안을 게시하세요'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getTabJobs("active").map((job) => (
                  <Card key={job.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {job.title}
                            </h3>
                            <Badge className={getStatusColor(job.status)}>
                              {getStatusText(job.status, t)}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{job.location}</p> {/* TODO: department removed */}
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
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-blue-500 to-purple-600"
                            onClick={() => handleViewApplicants(job)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t('companyJobs.actions.viewApplicants') || '지원자 보기'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditJob(job)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {t('companyJobs.actions.edit') || '수정'}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {job.status === "active" && (
                                <DropdownMenuItem onClick={() => handlePauseJob(job)}>
                                  <Pause className="h-4 w-4 mr-2" />
                                  {t('companyJobs.actions.pause') || '일시정지'}
                                </DropdownMenuItem>
                              )}
                              {job.status === "paused" && (
                                <DropdownMenuItem onClick={() => handleResumeJob(job)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  {t('companyJobs.actions.activate') || '재개'}
                                </DropdownMenuItem>
                              )}
                              {job.status !== "closed" && job.status !== "rejected" && (
                                <DropdownMenuItem onClick={() => handleChangeStatus(job, "closed")}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  {t('companyJobs.actions.close') || '마감'}
                                </DropdownMenuItem>
                              )}
                              {job.deadline && job.status === "active" && (
                                <DropdownMenuItem onClick={() => handleExtendDeadline(job)}>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  마감일 연장
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDuplicateJob(job)}>
                                <Copy className="h-4 w-4 mr-2" />
                                {t('companyJobs.actions.duplicate') || '복제'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyLink(job)}>
                                <LinkIcon className="h-4 w-4 mr-2" />
                                {t('companyJobs.actions.copyLink') || '링크 복사'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteJob(job)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('companyJobs.actions.delete') || '삭제'}
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

          <TabsContent value="draft" className="mt-6">
            <div className="grid gap-6">
              {getTabJobs("draft").length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('companyJobs.emptyStates.draft.title') || '초안이 없습니다'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {t('companyJobs.emptyStates.draft.description') || '새로운 채용공고를 작성해보세요'}
                    </p>
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
                              <Label>{t('companyJobs.form.jobTitle')}</Label>
                              <Input placeholder={t('companyJobs.form.jobTitlePlaceholder')} />
                            </div>
                            <div>
                              <Label>{t('companyJobs.form.department')}</Label>
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
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline">{t('companyJobs.form.saveDraft')}</Button>
                            <Button>{t('companyJobs.form.publish')}</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ) : (
                getTabJobs("draft").map((job) => (
                  <Card key={job.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {job.title}
                            </h3>
                            <Badge className={getStatusColor(job.status)}>
                              {getStatusText(job.status, t)}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{job.location}</p> {/* TODO: department removed */}
                          <p className="text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2 ml-6">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditJob(job)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {t('companyJobs.actions.edit') || '수정'}
                          </Button>
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-green-600"
                            onClick={() => handleChangeStatus(job, "active")}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            {t('companyJobs.actions.publish') || '게시'}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDuplicateJob(job)}>
                                <Copy className="h-4 w-4 mr-2" />
                                {t('companyJobs.actions.duplicate') || '복제'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteJob(job)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('companyJobs.actions.delete') || '삭제'}
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

          <TabsContent value="paused" className="mt-6">
            <div className="grid gap-6">
              {getTabJobs("paused").length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Pause className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('companyJobs.emptyStates.paused.title') || '일시정지된 채용공고가 없습니다'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('companyJobs.emptyStates.paused.description') || '일시정지된 채용공고가 여기에 표시됩니다'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getTabJobs("paused").map((job) => (
                  <Card key={job.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {job.title}
                            </h3>
                            <Badge className={getStatusColor(job.status)}>
                              {getStatusText(job.status, t)}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{job.location}</p> {/* TODO: department removed */}
                        </div>
                        <div className="flex flex-col space-y-2 ml-6">
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-green-600"
                            onClick={() => handleResumeJob(job)}
                            disabled={resumeJobMutation.isPending}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            {t('companyJobs.actions.activate') || '재개'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditJob(job)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {t('companyJobs.actions.edit') || '수정'}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {job.deadline && job.status === "paused" && (
                                <DropdownMenuItem onClick={() => handleExtendDeadline(job)}>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  마감일 연장
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleChangeStatus(job, "closed")}>
                                <Archive className="h-4 w-4 mr-2" />
                                {t('companyJobs.actions.close') || '마감'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateJob(job)}>
                                <Copy className="h-4 w-4 mr-2" />
                                {t('companyJobs.actions.duplicate') || '복제'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteJob(job)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('companyJobs.actions.delete') || '삭제'}
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

          <TabsContent value="closed" className="mt-6">
            <div className="space-y-6">
              {getTabJobs("closed").length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      마감된 채용공고가 없습니다
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      마감된 채용공고가 없습니다
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getTabJobs("closed").map((job) => (
                  <Card key={job.id} className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      {renderJobCard(job)}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reported" className="mt-6">
            <div className="space-y-6">
              {getTabJobs("reported").length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      리포트된 채용공고가 없습니다
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      신고된 채용공고가 없습니다
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getTabJobs("reported").map((job) => (
                  <Card key={job.id} className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          <Badge variant="destructive">
                            리포트 {job.reportedCount || (job.reports?.length || 0) || 0}건
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReports(job)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          리포트 상세보기
                        </Button>
                      </div>
                      {job.reports && job.reports.length > 0 && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">신고 사유:</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {job.reports.slice(0, 3).map((report: any, index: number) => (
                              <Badge key={index} variant="outline" className="text-red-700 dark:text-red-300">
                                {report.reason}
                              </Badge>
                            ))}
                            {job.reports.length > 3 && (
                              <Badge variant="outline" className="text-red-700 dark:text-red-300">
                                +{job.reports.length - 3}건 더보기
                              </Badge>
                            )}
                          </div>
                          {job.reports.some((r: any) => r.description) && (
                            <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                              {job.reports.find((r: any) => r.description)?.description?.substring(0, 100)}
                              {job.reports.find((r: any) => r.description)?.description?.length > 100 ? "..." : ""}
                            </p>
                          )}
                        </div>
                      )}
                      {renderJobCard(job)}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <div className="grid gap-6">
              {getTabJobs("rejected").length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      거부된 채용공고가 없습니다
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      거부된 채용공고가 여기에 표시됩니다
                    </p>
                  </CardContent>
                </Card>
              ) : (
                getTabJobs("rejected").map((job) => (
                  <Card key={job.id} className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {job.title}
                            </h3>
                            <Badge className={getStatusColor(job.status)}>
                              {getStatusText(job.status, t)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{job.location}</p>
                          {job.rejectionReason && (
                            <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">거부 사유:</p>
                              <p className="text-sm text-red-700 dark:text-red-300">{job.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2 ml-6">
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-purple-600"
                            onClick={() => handleResubmitJob(job)}
                            disabled={resubmitJobMutation.isPending}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            {resubmitJobMutation.isPending ? "재제출 중..." : "재제출"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditJob(job)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {t('companyJobs.actions.edit') || '수정'}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDuplicateJob(job)}>
                                <Copy className="h-4 w-4 mr-2" />
                                {t('companyJobs.actions.duplicate') || '복제'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteJob(job)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('companyJobs.actions.delete') || '삭제'}
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

          <TabsContent value="analytics" className="mt-6">
            {selectedJob ? (
              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>{selectedJob.title} - {t('companyJobs.tabs.analytics')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">{selectedJob.views.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-1">{t('companyJobs.metrics.views')}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">{selectedJob.applications}</p>
                        <p className="text-sm text-gray-600 mt-1">{t('companyJobs.metrics.applicants')}</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-3xl font-bold text-purple-600">
                          {selectedJob.applications > 0 ? ((selectedJob.applications / selectedJob.views) * 100).toFixed(2) : 0}%
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{t('companyJobs.metrics.conversionRate') || '전환율'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Button variant="outline" onClick={() => setSelectedJob(null)}>
                  {t('common.back') || '뒤로'}
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {jobsState.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {t('companyJobs.emptyStates.analytics.title') || '분석 데이터가 없습니다'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t('companyJobs.emptyStates.analytics.description') || '채용공고를 작성하고 게시하면 분석 데이터를 확인할 수 있습니다'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  jobsState.map((job) => (
                    <Card key={job.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleViewAnalytics(job)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {job.title}
                        </h3>
                        <p className="text-gray-600">{job.department} • {job.location}</p>
                      </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{job.views.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">{t('companyJobs.metrics.views')}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{job.applications}</p>
                              <p className="text-xs text-gray-500">{t('companyJobs.metrics.applicants')}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <BarChart3 className="h-4 w-4 mr-1" />
                              {t('companyJobs.actions.viewAnalytics') || '상세 분석'}
                            </Button>
                          </div>
                    </div>
                  </CardContent>
                </Card>
                  ))
                )}
            </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Job Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('companyJobs.editDialog.title') || '채용공고 수정'}</DialogTitle>
              <DialogDescription>
                {selectedJob && `${selectedJob.title} 채용공고를 수정합니다.`}
              </DialogDescription>
            </DialogHeader>
            {selectedJob && (
              <JobCreateForm
                mode="edit"
                initialData={{
                  title: selectedJob.title,
                  employmentType: selectedJob.employmentType || selectedJob.type,
                  experienceLevel: selectedJob.experienceLevel || selectedJob.experience,
                  location: selectedJob.location,
                  salary: selectedJob.salary,
                  deadline: selectedJob.deadline,
                  description: selectedJob.description,
                  requiredSkills: selectedJob.requiredSkills || selectedJob.skills || [],
                  requirements: selectedJob.requirements || "",
                  benefits: selectedJob.benefits || [],
                }}
                onSubmit={handleSaveEdit}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Report Detail Dialog */}
        <Dialog open={isReportDetailDialogOpen} onOpenChange={setIsReportDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedJob && selectedJob.reports && selectedJob.reports.length > 0 && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    리포트 상세 정보
                  </DialogTitle>
                  <DialogDescription>
                    "{selectedJob.title}" 채용공고에 대한 리포트입니다
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-medium">총 {selectedJob.reports.length}건의 리포트</span>
                  </div>

                  {selectedJob.reports.map((report: any, index: number) => (
                    <Card key={index} className="border-red-200 dark:border-red-800">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="destructive">{report.reason}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(report.createdAt).toLocaleString('ko-KR')}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              <span className="font-medium">신고자:</span> {report.reporterName} ({report.reporterEmail})
                            </div>
                            {report.description && (
                              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <p className="text-sm whitespace-pre-wrap">{report.description}</p>
                              </div>
                            )}
                          </div>
                          <Badge 
                            variant={
                              report.status === "resolved" ? "default" :
                              report.status === "dismissed" ? "outline" :
                              "secondary"
                            }
                            className="ml-2"
                          >
                            {report.status === "pending" ? "대기중" :
                             report.status === "reviewed" ? "검토중" :
                             report.status === "resolved" ? "처리완료" :
                             report.status === "dismissed" ? "기각됨" : report.status}
                          </Badge>
                        </div>
                        {report.resolutionNote && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                            <span className="font-medium">처리 메모:</span> {report.resolutionNote}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Reopen Job Dialog */}
        <Dialog open={isRepostDialogOpen} onOpenChange={setIsRepostDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>채용공고 재공고</DialogTitle>
              <DialogDescription>
                {selectedJobForRepost && `"${selectedJobForRepost.title}" 채용공고를 다시 열겠습니까?`}
              </DialogDescription>
            </DialogHeader>
            {selectedJobForRepost && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reopen-deadline" className="text-right">
                    새 마감일
                  </Label>
                  <Input
                    id="reopen-deadline"
                    type="date"
                    className="col-span-3"
                    defaultValue={selectedJobForRepost.deadline ? new Date(selectedJobForRepost.deadline).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (selectedJobForRepost) {
                        setSelectedJobForRepost({
                          ...selectedJobForRepost,
                          deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                        });
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsRepostDialogOpen(false);
                    setSelectedJobForRepost(null);
                  }}>
                    취소
                  </Button>
                  <Button
                    onClick={() => reopenJobMutation.mutate(selectedJobForRepost)}
                    disabled={reopenJobMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {reopenJobMutation.isPending ? "처리 중..." : "재공고하기"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Schedule Post Dialog */}
        <Dialog open={isSchedulePostDialogOpen} onOpenChange={setIsSchedulePostDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>예약 게시</DialogTitle>
              <DialogDescription>
                {selectedJobForSchedule && `"${selectedJobForSchedule.title}" 채용공고를 예약하여 게시하시겠습니까?`}
              </DialogDescription>
            </DialogHeader>
            {selectedJobForSchedule && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="schedule-date" className="text-right">
                    게시 날짜
                  </Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    className="col-span-3"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="schedule-time" className="text-right">
                    게시 시간
                  </Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    className="col-span-3"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    예약된 시간에 자동으로 채용공고가 게시됩니다. 게시 전까지는 수정하거나 취소할 수 있습니다.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsSchedulePostDialogOpen(false);
                    setScheduledDate("");
                    setScheduledTime("");
                  }}>
                    취소
                  </Button>
                  <Button
                    onClick={handleSchedulePostSubmit}
                    disabled={schedulePostMutation.isPending || !scheduledDate || !scheduledTime}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {schedulePostMutation.isPending ? "예약 중..." : "예약하기"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('companyJobs.deleteDialog.title') || '채용공고 삭제 확인'}</DialogTitle>
              <DialogDescription>
                {selectedJob && `정말 "${selectedJob.title}" 채용공고를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                {t('common.delete')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CompanyLayout>
  );
}