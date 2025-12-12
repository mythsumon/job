import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Briefcase, Building, Users, TrendingUp, Star, ArrowRight, Zap, Award, Trophy, LayoutDashboard } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import JobSearch from "@/components/jobs/job-search";
import JobCard from "@/components/jobs/job-card";
import CompanyCard from "@/components/companies/company-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useDisableRightClick } from "@/hooks/useDisableRightClick";
import type { JobWithCompany, Company } from "@shared/schema";
import type { JobFilters, Stats } from "@/lib/types";
import { useState, useEffect } from "react";
import { CareerSection } from "@/components/career/career-section";
import { FeedSection } from "@/components/feed/feed-section";
import AdvertisementBanner from "@/components/banners/advertisement-banner";
import { apiGet } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { JobCreateForm } from "@/components/jobs/JobCreateForm";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<JobFilters>({});
  const [isCreateJobDialogOpen, setIsCreateJobDialogOpen] = useState(false);
  const { toast } = useToast();

  // Apply security measures
  useDisableRightClick();

  // Auto-redirect authenticated users to their dashboard
  useEffect(() => {
    // Don't redirect if user is not authenticated or still loading
    if (isLoading) return;
    if (!isAuthenticated || !user) return;
    
    const userType = user.userType || user.user_type;
    const currentPath = window.location.pathname;
    
    // Only redirect if on root path or /user/home
    if (currentPath === "/" || currentPath === "/user/home") {
      // Small delay to prevent redirect during logout
      const timer = setTimeout(() => {
        // Double check authentication state before redirecting
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        const userData = localStorage.getItem('user_data');
        
        if (!token || !userData) {
          // User logged out, don't redirect
          return;
        }
        
        if (userType === "employer") {
          console.log('[HOME] Redirecting employer to /company/dashboard');
          setLocation("/company/dashboard");
        } else if (userType === "admin" || user.role === "admin") {
          console.log('[HOME] Redirecting admin to /admin/dashboard');
          setLocation("/admin/dashboard");
        }
        // candidate stays on home page
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [user, isAuthenticated, isLoading, setLocation]);

  const { data: featuredJobs, isLoading: featuredLoading } = useQuery<JobWithCompany[]>({
    queryKey: ["/api/jobs/featured"],
    queryFn: () => apiGet<JobWithCompany[]>("/api/jobs/featured"),
  });

  const { data: proJobs, isLoading: proJobsLoading } = useQuery<JobWithCompany[]>({
    queryKey: ["/api/jobs/pro"],
    queryFn: () => apiGet<JobWithCompany[]>("/api/jobs/pro"),
  });

  const { data: companies, isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    queryFn: () => apiGet<Company[]>("/api/companies"),
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    queryFn: () => apiGet<Stats>("/api/stats"),
  });

  const [displayedJobsCount, setDisplayedJobsCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data: allRecentJobs, isLoading: recentLoading } = useQuery<JobWithCompany[]>({
    queryKey: ["/api/jobs"],
    queryFn: () => apiGet<JobWithCompany[]>("/api/jobs"),
  });

  const displayedRecentJobs = allRecentJobs?.slice(0, displayedJobsCount);
  const hasMoreJobs = allRecentJobs && allRecentJobs.length > displayedJobsCount;

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setDisplayedJobsCount(prev => prev + 4);
    setIsLoadingMore(false);
  };

  const handleSearch = () => {
    // Navigate to jobs page with filters
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, value.toString());
      }
    });
    setLocation(`/user/jobs?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {t('home.hero.badge')}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
              {t('home.hero.title1')} 
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> {t('home.hero.title2')}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 sm:px-0">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
              <Link href="/user/jobs">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {t('home.hero.browsJobs')}
                </Button>
              </Link>
              <Link href="/user/companies">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg">
                  {t('home.hero.companyServices')}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <JobSearch 
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
      />

      {/* Home Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AdvertisementBanner position="home_top" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Quick Stats Bar */}
        <section className="mb-12 sm:mb-16 -mt-6 sm:-mt-8">
          <div className="bg-white dark:bg-card rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-border/50 p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <div className="text-center group">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {stats?.totalJobs.toLocaleString() || "6"}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('home.stats.totalJobs')}</div>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Building className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {stats?.totalCompanies.toLocaleString() || "6"}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('home.stats.companies')}</div>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {stats?.featuredJobs.toLocaleString() || "2"}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('home.stats.premium')}</div>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">98%</div>
                <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('home.stats.matchRate')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Jobs Section */}
        <section className="mb-12 sm:mb-16 lg:mb-20">
          <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30 border-2 border-amber-200/60 dark:border-amber-800/60 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden shadow-2xl shadow-amber-500/10">
            {/* Luxury overlay effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/3 via-yellow-400/3 to-orange-400/3 rounded-2xl sm:rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-yellow-400/20 to-amber-400/20 rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-br from-amber-300/5 to-orange-300/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-spin" style={{animationDuration: '20s'}}></div>
            
            <div className="relative">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8 lg:mb-10 space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="relative bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl sm:rounded-2xl animate-pulse opacity-60"></div>
                    <Star className="relative w-6 h-6 sm:w-7 sm:h-7 drop-shadow-lg" />
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-700 via-yellow-700 to-orange-700 dark:from-amber-300 dark:via-yellow-300 dark:to-orange-300 bg-clip-text text-transparent drop-shadow-sm">{t('home.sections.featured.title')}</h2>
                      <Badge className="relative bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white px-3 py-1 text-xs sm:text-sm w-fit font-bold shadow-lg border border-amber-300/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-md animate-pulse opacity-40"></div>
                        <span className="relative tracking-wide">PREMIUM</span>
                      </Badge>
                    </div>
                    <p className="text-sm sm:text-base lg:text-lg text-amber-800 dark:text-amber-200 font-medium">{t('home.sections.featured.subtitle')}</p>
                  </div>
                </div>
                <Link href="/user/jobs?isFeatured=true">
                  <Button className="group relative w-full sm:w-auto bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white px-6 py-3 text-base font-semibold shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300 transform hover:scale-105 border border-amber-300/30">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center">
                      {t('home.buttons.viewAll')}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
            
            {featuredLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="h-80">
                    <CardContent className="p-4 lg:p-6 h-full flex flex-col">
                      <div className="flex items-start mb-4">
                        <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg mr-3 lg:mr-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 lg:h-5 w-full mb-2" />
                          <Skeleton className="h-3 lg:h-4 w-3/4 mb-1" />
                          <Skeleton className="h-3 lg:h-4 w-1/2" />
                        </div>
                      </div>
                      <Skeleton className="h-3 lg:h-4 w-full mb-2" />
                      <Skeleton className="h-3 lg:h-4 w-5/6 mb-4" />
                      <div className="flex gap-1 lg:gap-2 mb-4 flex-wrap">
                        <Skeleton className="h-5 lg:h-6 w-12 lg:w-16" />
                        <Skeleton className="h-5 lg:h-6 w-16 lg:w-20" />
                        <Skeleton className="h-5 lg:h-6 w-10 lg:w-14" />
                      </div>
                      <div className="mt-auto flex justify-between">
                        <Skeleton className="h-3 lg:h-4 w-20 lg:w-24" />
                        <Skeleton className="h-3 lg:h-4 w-16 lg:w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredJobs && featuredJobs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {featuredJobs.slice(0, 8).map((job) => (
                  <div key={job.id} className="h-80">
                    <JobCard job={job} isFeatured className="h-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-16 h-16 mx-auto mb-4 text-amber-300 dark:text-amber-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  프리미엄 채용공고가 없습니다
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  곧 새로운 프리미엄 채용공고가 등록될 예정입니다.
                </p>
                <Link href="/user/jobs">
                  <Button variant="outline" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                    전체 채용공고 보기
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Pro Jobs Section */}
        <section className="mb-12 sm:mb-16 lg:mb-20">
          <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 dark:from-indigo-950/25 dark:via-purple-950/25 dark:to-violet-950/25 border-2 border-indigo-200/50 dark:border-indigo-800/50 rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden shadow-xl shadow-indigo-500/8">
            {/* Pro overlay effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/2 via-purple-400/2 to-violet-400/2 rounded-2xl lg:rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-indigo-400/15 to-purple-400/15 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-14 sm:translate-x-14 animate-pulse delay-500"></div>
            <div className="absolute bottom-0 left-0 w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-tr from-purple-400/15 to-violet-400/15 rounded-full translate-y-7 -translate-x-7 sm:translate-y-10 sm:-translate-x-10 animate-pulse delay-700"></div>
            <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-gradient-to-br from-indigo-300/3 to-violet-300/3 rounded-full animate-spin" style={{animationDuration: '15s'}}></div>
            
            <div className="relative">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 sm:mb-10 lg:mb-12 space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-500 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl sm:rounded-2xl animate-pulse opacity-50"></div>
                    <Trophy className="relative w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" />
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-700 via-purple-700 to-violet-700 dark:from-indigo-300 dark:via-purple-300 dark:to-violet-300 bg-clip-text text-transparent drop-shadow-sm">Pro Jobs</h2>
                      <Badge className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 text-white px-3 py-1 text-xs sm:text-sm w-fit font-bold shadow-md border border-indigo-300/40">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-md animate-pulse opacity-30"></div>
                        <span className="relative tracking-wide">PRO</span>
                      </Badge>
                    </div>
                    <p className="text-sm sm:text-base lg:text-lg text-indigo-800 dark:text-indigo-200 font-medium">{t('home.sections.pro.subtitle')}</p>
                  </div>
                </div>
                <Link href="/user/jobs?isPro=true">
                  <Button className="group relative w-full sm:w-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 hover:from-indigo-600 hover:via-purple-600 hover:to-violet-600 text-white px-6 py-3 text-base font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105 border border-indigo-300/25">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center">
                      {t('home.buttons.viewAll')}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
            
            {proJobsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="h-80">
                    <CardContent className="p-4 lg:p-6 h-full flex flex-col">
                      <div className="flex items-start mb-4">
                        <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg mr-3 lg:mr-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 lg:h-5 w-full mb-2" />
                          <Skeleton className="h-3 lg:h-4 w-3/4 mb-1" />
                          <Skeleton className="h-3 lg:h-4 w-1/2" />
                        </div>
                      </div>
                      <Skeleton className="h-3 lg:h-4 w-full mb-2" />
                      <Skeleton className="h-3 lg:h-4 w-5/6 mb-4" />
                      <div className="flex gap-1 lg:gap-2 mb-4 flex-wrap">
                        <Skeleton className="h-5 lg:h-6 w-12 lg:w-16" />
                        <Skeleton className="h-5 lg:h-6 w-16 lg:w-20" />
                        <Skeleton className="h-5 lg:h-6 w-10 lg:w-14" />
                      </div>
                      <div className="mt-auto flex justify-between">
                        <Skeleton className="h-3 lg:h-4 w-20 lg:w-24" />
                        <Skeleton className="h-3 lg:h-4 w-16 lg:w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : proJobs && proJobs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {proJobs.slice(0, 8).map((job) => (
                  <div key={job.id} className="h-80">
                    <JobCard job={job} className="h-full bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-800 dark:via-slate-800 dark:to-gray-900 border-2 border-gray-300/60 dark:border-gray-600/60 hover:border-gray-400/80 dark:hover:border-gray-500/80 shadow-lg shadow-gray-500/10 hover:shadow-xl hover:shadow-gray-500/20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-indigo-300 dark:text-indigo-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Pro 채용공고가 없습니다
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  곧 새로운 Pro 채용공고가 등록될 예정입니다.
                </p>
                <Link href="/user/jobs">
                  <Button variant="outline" className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600">
                    전체 채용공고 보기
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Recent Jobs Section */}
        <section className="mb-12 sm:mb-16 lg:mb-20">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 sm:mb-10 lg:mb-12 space-y-4 lg:space-y-0">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">{t('home.sections.recent.title')}</h2>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">{t('home.sections.recent.subtitle')}</p>
            </div>
            <Link href="/user/jobs">
              <Button className="group relative w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 border border-blue-300/25">
                <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center">
                  {t('home.buttons.viewAll')}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
          </div>
          
          {recentLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start mb-4">
                      <Skeleton className="w-14 h-14 rounded-xl mr-4" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayedRecentJobs && displayedRecentJobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {displayedRecentJobs.map((job) => (
                  <JobCard key={job.id} job={job} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md" />
                ))}
              </div>
              
              {hasMoreJobs && (
                <div className="flex justify-center mt-8 lg:mt-12">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-base shadow-lg"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        {t('home.buttons.loading')}
                      </>
                    ) : (
                      <>
                        {t('home.buttons.loadMore')} ({allRecentJobs!.length - displayedJobsCount}{t('home.text.moreJobs')})
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-blue-300 dark:text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                채용공고가 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                새로운 채용공고가 등록되면 여기에 표시됩니다.
              </p>
              <Link href="/user/jobs">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                  채용공고 검색하기
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Companies Section */}
        <section className="mb-12 sm:mb-16 lg:mb-20">
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-gray-900/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-slate-200/50 dark:border-slate-700/50">
            <div className="text-center mb-10 sm:mb-12 lg:mb-16">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto sm:mx-0">
                  <Building className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">{t('home.sections.companies.title')}</h2>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
                {t('home.sections.companies.subtitle')}
              </p>
            </div>
            
            {companiesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <Skeleton className="w-16 h-16 rounded-lg mx-auto mb-4" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : companies && companies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {companies.slice(0, 6).map((company) => {
                const generateCompanyLogo = (name: string) => {
                  const colors = [
                    "from-blue-500 to-blue-600",
                    "from-green-500 to-green-600", 
                    "from-purple-500 to-purple-600",
                    "from-red-500 to-red-600",
                    "from-orange-500 to-orange-600",
                    "from-cyan-500 to-cyan-600"
                  ];
                  const colorIndex = name.length % colors.length;
                  const initials = name
                    .split(" ")
                    .map(word => word[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  
                  return { color: colors[colorIndex], initials };
                };

                const logo = generateCompanyLogo(company.name);
                
                return (
                  <Link key={company.id} href={`/user/companies/${company.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 bg-gradient-to-br ${logo.color} rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-4`}>
                          {logo.initials}
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {company.name}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="w-16 h-16 mx-auto mb-4 text-purple-300 dark:text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                등록된 기업이 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                곧 새로운 기업들이 등록될 예정입니다.
              </p>
              <Link href="/user/companies">
                <Button variant="outline" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                  전체 기업 보기
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
          
            <div className="text-center mt-8 sm:mt-10 lg:mt-12">
              <Link href="/user/companies">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg">
                  {t('home.sections.companies.viewAll')}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-white/10 rounded-full -translate-y-16 translate-x-16 sm:-translate-y-24 sm:translate-x-24 lg:-translate-y-32 lg:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 bg-white/10 rounded-full translate-y-12 -translate-x-12 sm:translate-y-18 sm:-translate-x-18 lg:translate-y-24 lg:-translate-x-24"></div>
          
          <div className="relative text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              {t('home.cta.title')}
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 sm:px-0">
              {t('home.cta.subtitle')}
            </p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 mb-2 sm:mb-4">
                  <Building className="text-white h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-2 sm:mb-3 lg:mb-4" />
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
                    {stats?.totalCompanies.toLocaleString() || "15,000+"}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-100">{t('home.cta.stats.companies')}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 mb-2 sm:mb-4">
                  <Users className="text-white h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-2 sm:mb-3 lg:mb-4" />
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">200,000+</div>
                  <div className="text-xs sm:text-sm text-blue-100">{t('home.cta.stats.users')}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 mb-2 sm:mb-4">
                  <Briefcase className="text-white h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-2 sm:mb-3 lg:mb-4" />
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
                    {stats?.totalJobs.toLocaleString() || "50,000+"}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-100">{t('home.cta.stats.jobs')}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 mb-2 sm:mb-4">
                  <TrendingUp className="text-white h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-2 sm:mb-3 lg:mb-4" />
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">98%</div>
                  <div className="text-xs sm:text-sm text-blue-100">{t('home.cta.stats.satisfaction')}</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Link href="/user/jobs">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold">
                  <Briefcase className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  {t('home.cta.buttons.jobSeeker')}
                </Button>
              </Link>
              {isAuthenticated && user?.userType === 'employer' ? (
                <>
                  <Dialog open={isCreateJobDialogOpen} onOpenChange={setIsCreateJobDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg">
                        {t('companyJobs.createJob') || '채용공고 작성'}
                        <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{t('companyJobs.createJob') || '새 채용공고 작성'}</DialogTitle>
                        <DialogDescription>
                          {t('companyJobs.createJobDescription') || '새로운 채용공고를 작성합니다'}
                        </DialogDescription>
                      </DialogHeader>
                      <JobCreateForm
                        onSubmit={(data) => {
                          toast({
                            title: t("common.success") || "성공",
                            description: "채용공고가 생성되었습니다.",
                          });
                          setIsCreateJobDialogOpen(false);
                          setLocation("/company/jobs");
                        }}
                        onSaveDraft={(data) => {
                          toast({
                            title: t("common.success") || "성공",
                            description: "초안이 저장되었습니다.",
                          });
                          setIsCreateJobDialogOpen(false);
                          setLocation("/company/jobs");
                        }}
                        onCancel={() => setIsCreateJobDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Link href="/company/dashboard">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg">
                      {t('home.cta.buttons.employer')}
                      <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/register?type=employer">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg">
                    {t('home.cta.buttons.employer')}
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>
              )}
              {isAuthenticated && (user?.userType === 'admin' || user?.role === 'admin') && (
                <Link href="/admin/dashboard">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg">
                    <LayoutDashboard className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    관리자 대시보드
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Career & Community Section - Only for authenticated users */}
        {isAuthenticated && user && (
          <section className="mb-12 sm:mb-16 lg:mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-border/50 p-6">
                <CareerSection compact={true} showHeader={false} />
              </div>
              <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-border/50 p-6">
                <FeedSection compact={true} showCreatePost={false} />
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}