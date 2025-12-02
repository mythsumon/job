import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, Star, MessageCircle, BookOpen, Award, Users } from "lucide-react";
import type { User } from "@shared/schema";

interface TalentFilters {
  search?: string;
  experience?: string;
  location?: string;
  skills?: string;
}

export default function Talent() {
  const [filters, setFilters] = useState<TalentFilters>({});

  // Fetch talent profiles (candidates)
  const { data: talents = [], isLoading } = useQuery({
    queryKey: ['/api/talents', filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (filters.search) searchParams.append('search', filters.search);
      if (filters.experience) searchParams.append('experience', filters.experience);
      if (filters.location) searchParams.append('location', filters.location);
      if (filters.skills) searchParams.append('skills', filters.skills);
      
      const response = await apiRequest('GET', `/api/talents?${searchParams.toString()}`);
      return response.json();
    },
  });

  const handleFiltersChange = (key: keyof TalentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // Trigger refetch by updating filters
    setFilters(prev => ({ ...prev }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              몽골 최고의 인재들
            </h1>
            <p className="text-xl opacity-90 mb-8">
              뛰어난 전문가들과 연결되어 성공적인 팀을 구축하세요
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
                  <Input
                    placeholder="인재 검색..."
                    value={filters.search || ''}
                    onChange={(e) => handleFiltersChange('search', e.target.value)}
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  />
                </div>
                
                <Select value={filters.experience || undefined} onValueChange={(value) => handleFiltersChange('experience', value)}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="경력" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1년">1년</SelectItem>
                    <SelectItem value="3년">3년</SelectItem>
                    <SelectItem value="4년">4년</SelectItem>
                    <SelectItem value="5년">5년</SelectItem>
                    <SelectItem value="6년">6년</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filters.location || undefined} onValueChange={(value) => handleFiltersChange('location', value)}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="지역" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="울란바토르">울란바토르</SelectItem>
                    <SelectItem value="다르한">다르한</SelectItem>
                    <SelectItem value="에르데네트">에르데네트</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={handleSearch}
                  className="bg-white text-blue-600 hover:bg-white/90 font-semibold"
                >
                  검색
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              인재 목록
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {talents.length}명의 전문가를 찾았습니다
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              인재풀 저장
            </Button>
          </div>
        </div>

        {/* Talent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talents.map((talent: User) => (
            <Card key={talent.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white dark:bg-card">
              <CardHeader className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex items-start gap-4">
                  <Avatar className="w-16 h-16 ring-4 ring-white shadow-lg">
                    <AvatarImage src={talent.profilePicture || undefined} />
                    <AvatarFallback className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {talent.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">
                      {talent.fullName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {talent.experience || '경력 정보 없음'}
                    </p>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{talent.location || '위치 정보 없음'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">4.8</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Bio */}
                {talent.bio && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {talent.bio}
                  </p>
                )}
                
                {/* Skills */}
                {talent.skills && talent.skills.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-1">
                      {talent.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {talent.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{talent.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Education */}
                {talent.education && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <BookOpen className="w-4 h-4" />
                    <span className="truncate">{talent.education}</span>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Briefcase className="w-4 h-4 mr-2" />
                    채용 제안
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {talents.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              다른 검색 조건을 시도해보세요
            </p>
            <Button onClick={() => setFilters({})}>
              모든 필터 초기화
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}