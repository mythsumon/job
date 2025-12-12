import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Eye,
  Edit,
  BarChart3,
  MoreVertical,
  Pause,
  Play,
  Copy,
  AlertTriangle,
  Trash2,
  Archive,
  Users,
  Heart,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CompanyJobCardProps {
  job: {
    id: number;
    title: string;
    status: string;
    location: string;
    salary?: string;
    salaryMin?: number;
    salaryMax?: number;
    experienceLevel?: string;
    deadline?: string;
    description: string;
    views?: number;
    applications?: number;
    saves?: number;
    [key: string]: any;
  };
  onViewApplicants?: (job: any) => void;
  onEdit?: (job: any) => void;
  onAnalytics?: (job: any) => void;
  onPause?: (job: any) => void;
  onResume?: (job: any) => void;
  onClose?: (job: any) => void;
  onDuplicate?: (job: any) => void;
  onReport?: (job: any) => void;
  onDelete?: (job: any) => void;
}

export function CompanyJobCard({
  job,
  onViewApplicants,
  onEdit,
  onAnalytics,
  onPause,
  onResume,
  onClose,
  onDuplicate,
  onReport,
  onDelete,
}: CompanyJobCardProps) {
  const { t } = useLanguage();

  const formatSalary = () => {
    if (job.salary) return job.salary;
    if (job.salaryMin && job.salaryMax) {
      return `${(job.salaryMin / 10000000).toFixed(0)}-${(job.salaryMax / 10000000).toFixed(0)}천만원`;
    }
    return "협의";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "활성", variant: "default" },
      draft: { label: "임시저장", variant: "secondary" },
      paused: { label: "일시정지", variant: "outline" },
      closed: { label: "마감", variant: "secondary" },
      pending: { label: "승인 대기", variant: "outline" },
      rejected: { label: "거부됨", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getExperienceLabel = (experience?: string) => {
    if (!experience) return "-";
    const labels: Record<string, string> = {
      entry: "신입",
      junior: "주니어",
      mid: "미드",
      senior: "시니어",
      expert: "전문가",
    };
    return labels[experience] || experience;
  };

  const getDaysLeft = () => {
    if (!job.deadline) return "-";
    const deadline = new Date(job.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        {/* Left: Job Title and Status Badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {job.title}
            </h3>
            {getStatusBadge(job.status)}
          </div>
        </div>

        {/* Right: Actions Button Group */}
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewApplicants?.(job)}
            className="hidden sm:flex"
          >
            <Users className="h-4 w-4 mr-1" />
            지원자
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(job)}
            className="hidden sm:flex"
          >
            <Edit className="h-4 w-4 mr-1" />
            수정
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAnalytics?.(job)}
            className="hidden sm:flex"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            분석
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {job.status === "active" && (
                <DropdownMenuItem onClick={() => onPause?.(job)}>
                  <Pause className="h-4 w-4 mr-2" />
                  일시정지
                </DropdownMenuItem>
              )}
              {job.status === "paused" && (
                <DropdownMenuItem onClick={() => onResume?.(job)}>
                  <Play className="h-4 w-4 mr-2" />
                  재개
                </DropdownMenuItem>
              )}
              {job.status !== "closed" && (
                <DropdownMenuItem onClick={() => onClose?.(job)}>
                  <Archive className="h-4 w-4 mr-2" />
                  마감하기
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDuplicate?.(job)}>
                <Copy className="h-4 w-4 mr-2" />
                복제
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReport?.(job)}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                신고
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete?.(job)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Subinfo Row */}
      <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          <span>{formatSalary()}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          <span>{getExperienceLabel(job.experienceLevel)}</span>
        </div>
        {job.deadline && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>마감: {new Date(job.deadline).toLocaleDateString('ko-KR')}</span>
          </div>
        )}
      </div>

      {/* Summary Row */}
      <div className="mb-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
          {job.description}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {job.views?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">조회수</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {job.applications?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">지원자</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {job.saves?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">저장</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {getDaysLeft()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">남은 일수</p>
        </div>
      </div>
    </div>
  );
}

