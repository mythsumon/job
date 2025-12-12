import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Building, MapPin, Users, Filter } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CompanyCard from "@/components/companies/company-card";
import { useDisableRightClick } from "@/hooks/useDisableRightClick";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/queryClient";
import { INDUSTRIES, LOCATIONS, COMPANY_SIZES } from "@/lib/types";
import type { Company, JobWithCompany } from "@shared/schema";

interface CompanyFilters {
  search?: string;
  industry?: string;
  size?: string;
  location?: string;
}

export default function Companies() {
  // Apply security measures
  useDisableRightClick();
  
  const [filters, setFilters] = useState<CompanyFilters>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Build query parameters for API call
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.set(key, value.toString());
    }
  });

  const { data: companies, isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies", queryParams.toString()],
    queryFn: async () => {
      const url = queryParams.toString() 
        ? `/api/companies?${queryParams.toString()}` 
        : "/api/companies";
      const data = await apiGet<Company[]>(url);
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fetch job counts for each company
  const { data: allJobs } = useQuery<JobWithCompany[]>({
    queryKey: ["/api/jobs"],
  });

  const getJobCountForCompany = (companyId: number) => {
    return allJobs?.filter(job => job.companyId === companyId).length || 0;
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const getSizeLabel = (size: string) => {
    const sizeObj = COMPANY_SIZES.find(s => s.value === size);
    return sizeObj?.label || size;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              몽골의 선도 기업들을<br />만나보세요
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {companies?.length || 0}개의 기업이 인재를 찾고 있습니다
            </p>
          </div>
          
          <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="회사명, 업종을 검색하세요"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="search-input"
                />
              </div>
              
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Select
                  value={filters.industry || "all"}
                  onValueChange={(value) => setFilters({ ...filters, industry: value === "all" ? undefined : value })}
                >
                  <SelectTrigger className="search-input">
                    <SelectValue placeholder="업종 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 업종</SelectItem>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSearch} className="primary-button">
                <Search className="mr-2 h-4 w-4" />
                검색
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-80 flex-shrink-0">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">상세 필터</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Industry */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">업종</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {INDUSTRIES.map((industry) => (
                      <div key={industry} className="flex items-center space-x-2">
                        <Checkbox
                          id={`industry-${industry}`}
                          checked={filters.industry === industry}
                          onCheckedChange={(checked) => {
                            setFilters({
                              ...filters,
                              industry: checked ? industry : undefined
                            });
                          }}
                          className="filter-checkbox"
                        />
                        <label
                          htmlFor={`industry-${industry}`}
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          {industry}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Company Size */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">기업규모</h4>
                  <div className="space-y-2">
                    {COMPANY_SIZES.map((size) => (
                      <div key={size.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size.value}`}
                          checked={filters.size === size.value}
                          onCheckedChange={(checked) => {
                            setFilters({
                              ...filters,
                              size: checked ? size.value : undefined
                            });
                          }}
                          className="filter-checkbox"
                        />
                        <label
                          htmlFor={`size-${size.value}`}
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          {size.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">지역</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {LOCATIONS.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location}`}
                          checked={filters.location === location}
                          onCheckedChange={(checked) => {
                            setFilters({
                              ...filters,
                              location: checked ? location : undefined
                            });
                          }}
                          className="filter-checkbox"
                        />
                        <label
                          htmlFor={`location-${location}`}
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          {location}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleClearFilters} variant="outline" className="w-full">
                  필터 초기화
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">기업정보</h2>
                <p className="text-muted-foreground mt-1">
                  총 {companies?.length || 0}개의 기업
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Select defaultValue="newest">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">최신순</SelectItem>
                    <SelectItem value="name">이름순</SelectItem>
                    <SelectItem value="size">규모순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Company Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start mb-4">
                        <Skeleton className="w-12 h-12 rounded-lg mr-4" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-24 mb-2" />
                          <div className="flex gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : companies && companies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    jobCount={getJobCountForCompany(company.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  검색 조건에 맞는 기업이 없습니다
                </h3>
                <p className="text-muted-foreground mb-4">
                  다른 조건으로 검색해보세요.
                </p>
                <Button onClick={handleClearFilters} variant="outline">
                  필터 초기화
                </Button>
              </div>
            )}

            {/* Load More Button */}
            {companies && companies.length > 0 && !isLoading && (
              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    // 페이지네이션 또는 더 많은 결과 로드 로직
                    console.log("Load more companies");
                  }}
                >
                  더 많은 기업 보기
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