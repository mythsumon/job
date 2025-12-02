import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import JobFilters from "@/components/jobs/job-filters";
import JobCard from "@/components/jobs/job-card";
import AdvertisementBanner from "@/components/banners/advertisement-banner";
import { useDisableRightClick } from "@/hooks/useDisableRightClick";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobWithCompany } from "@shared/schema";
import type { JobFilters as JobFiltersType } from "@/lib/types";

export default function Jobs() {
  // Apply security measures
  useDisableRightClick();
  
  const [location] = useLocation();
  const [filters, setFilters] = useState<JobFiltersType>(() => {
    // Parse URL parameters on component mount
    const urlParams = new URLSearchParams(window.location.search);
    return {
      search: urlParams.get("search") || undefined,
      location: urlParams.get("location") || undefined,
      industry: urlParams.get("industry") || undefined,
      experience: urlParams.get("experience") || undefined,
      type: urlParams.get("type") || undefined,
      isRemote: urlParams.get("isRemote") === "true" ? true : undefined,
      isFeatured: urlParams.get("isFeatured") === "true" ? true : undefined,
    };
  });
  const [sortBy, setSortBy] = useState("newest");

  // Build query parameters for API call
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.set(key, value.toString());
    }
  });

  const { data: jobs, isLoading, refetch } = useQuery<JobWithCompany[]>({
    queryKey: ["/api/jobs", queryParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/jobs?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
  });

  const handleFiltersChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Update URL and refetch data
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        newParams.set(key, value.toString());
      }
    });
    
    const newUrl = newParams.toString() ? `${location}?${newParams.toString()}` : location;
    window.history.replaceState({}, "", newUrl);
    refetch();
  };

  const handleClearFilters = () => {
    setFilters({});
    window.history.replaceState({}, "", location);
    refetch();
  };

  const handleSaveToggle = (jobId: number, isSaved: boolean) => {
    // In a real app, this would make an API call to save/unsave the job
    console.log(`Job ${jobId} ${isSaved ? "saved" : "unsaved"}`);
  };

  // Filter featured jobs
  const featuredJobs = jobs?.filter(job => job.isFeatured) || [];
  const regularJobs = jobs?.filter(job => !job.isFeatured) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <JobFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Advertisement Banner */}
            <AdvertisementBanner position="jobs_header" className="mb-6" />
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">채용정보</h1>
                <p className="text-muted-foreground mt-1">
                  총 {jobs?.length || 0}개의 채용정보
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">최신순</SelectItem>
                    <SelectItem value="popular">인기순</SelectItem>
                    <SelectItem value="salary">연봉순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Featured Jobs */}
            {featuredJobs.length > 0 && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <span className="text-amber-500 mr-2">⭐</span>
                    프리미엄 채용
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {featuredJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/20 border-2 border-amber-300/70 dark:border-amber-700/70 shadow-lg shadow-amber-500/20"
                        onSaveToggle={handleSaveToggle}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Regular Jobs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {isLoading ? (
                // Loading skeletons
                [...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <Skeleton className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-3 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full mb-3" />
                    <div className="flex gap-1 mb-3">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-10" />
                    </div>
                    <div className="flex justify-between items-end">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))
              ) : regularJobs.length > 0 ? (
                regularJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                    onSaveToggle={handleSaveToggle}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg mb-4">
                    검색 조건에 맞는 채용정보가 없습니다.
                  </p>
                  <Button onClick={handleClearFilters} variant="outline">
                    필터 초기화
                  </Button>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {regularJobs.length > 0 && !isLoading && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  더 많은 채용정보 보기
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
