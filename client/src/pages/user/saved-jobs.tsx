import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { apiGet, apiRequest } from "@/lib/queryClient";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { RoleGuard } from "@/components/common/RoleGuard";
import { 
  Heart, 
  MapPin, 
  DollarSign, 
  Clock,
  Briefcase,
  Building,
  Trash2,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { JobWithCompany } from "@shared/schema";

interface SavedJob {
  id: number;
  userId: number;
  jobId: number;
  savedAt: string;
  job?: JobWithCompany;
}

const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return "협의";
  if (min && max) return `₮${min.toLocaleString()} - ₮${max.toLocaleString()}`;
  if (min) return `₮${min.toLocaleString()} 이상`;
  return `₮${max?.toLocaleString()} 이하`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function SavedJobs() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedJobs, isLoading } = useQuery<SavedJob[]>({
    queryKey: ["/api/saved-jobs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await apiGet<SavedJob[]>(`/api/saved-jobs?userId=${user.id}`);
    },
    enabled: isAuthenticated && !!user?.id,
  });

  const removeSavedJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      if (!user?.id) throw new Error("로그인이 필요합니다");
      await apiRequest("DELETE", `/api/saved-jobs/${user.id}/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs", user?.id] });
      toast({
        title: "저장 취소",
        description: "관심 목록에서 제거되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류 발생",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  return (
    <RoleGuard allowedUserTypes={['candidate']}>
      <ProtectedPage>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                저장된 채용공고
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                관심있는 채용공고를 저장하여 나중에 확인하실 수 있습니다.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-48 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !savedJobs || savedJobs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">저장된 채용공고가 없습니다</h3>
                  <p className="text-muted-foreground mb-6">
                    관심있는 채용공고를 저장하면 여기에 표시됩니다.
                  </p>
                  <Link href="/user/jobs">
                    <Button>
                      채용공고 둘러보기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedJobs.map((savedJob) => (
                  <Card key={savedJob.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                          {savedJob.job?.company?.name?.charAt(0) || "C"}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSavedJobMutation.mutate(savedJob.jobId)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {savedJob.job?.title || "채용공고 제목"}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Building className="w-4 h-4" />
                          <span className="truncate">{savedJob.job?.company?.name || "회사명"}</span>
                        </div>
                        {savedJob.job?.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>{savedJob.job.location}</span>
                          </div>
                        )}
                        {savedJob.job && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <DollarSign className="w-4 h-4" />
                            <span>{formatSalary(savedJob.job.salaryMin, savedJob.job.salaryMax)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>저장일: {formatDate(savedJob.savedAt)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/user/jobs/${savedJob.jobId}`} className="flex-1">
                          <Button className="w-full" size="sm">
                            상세보기
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
          <Footer />
        </div>
      </ProtectedPage>
    </RoleGuard>
  );
}

