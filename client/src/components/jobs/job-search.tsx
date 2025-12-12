import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Building, Filter, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LOCATIONS, INDUSTRIES } from "@/lib/types";
import type { JobFilters, SearchSuggestion } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface JobSearchProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onSearch: () => void;
}

export default function JobSearch({ filters, onFiltersChange, onSearch }: JobSearchProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Get search suggestions
  const { data: suggestions = [] } = useQuery<SearchSuggestion[]>({
    queryKey: ["/api/search/suggestions", { q: searchTerm }],
    enabled: searchTerm.length >= 2 && showSuggestions,
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Handle clicks outside search area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = () => {
    saveRecentSearch(searchTerm);
    onFiltersChange({ ...filters, search: searchTerm });
    onSearch();
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.title);
    saveRecentSearch(suggestion.title);
    onFiltersChange({ ...filters, search: suggestion.title });
    onSearch();
    setShowSuggestions(false);
  };

  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term);
    onFiltersChange({ ...filters, search: term });
    onSearch();
    setShowSuggestions(false);
  };

  const popularTags = [
    "#프론트엔드",
    "#백엔드", 
    "#마케팅",
    "#영업",
    "#디자인",
    "#데이터분석"
  ];

  const handleTagClick = (tag: string) => {
    const searchValue = tag.replace("#", "");
    setSearchTerm(searchValue);
    onFiltersChange({ ...filters, search: searchValue });
    onSearch();
  };

  return (
    <section className="hero-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            {t('jobSearch.hero.title')}
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            {t('jobSearch.hero.subtitle')}
          </p>
        </div>
        
        <div className="bg-white dark:bg-card rounded-2xl p-6 md:p-8 shadow-2xl max-w-5xl mx-auto border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative md:col-span-2" ref={searchRef}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                직무, 회사, 키워드 검색
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                <Input
                  type="text"
                  placeholder={t('jobSearch.form.searchPlaceholder') || "예: 프론트엔드 개발자, 네이버, React"}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-11 pr-4 h-12 text-base border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                />
              </div>
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && (searchTerm.length >= 2 || recentSearches.length > 0) && (
                <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
                  <CardContent className="p-2 max-h-80 overflow-y-auto">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && searchTerm.length < 2 && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground px-2 py-1 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {t('jobSearch.suggestions.recent')}
                        </p>
                        {recentSearches.map((term, index) => (
                          <button
                            key={index}
                            onClick={() => handleRecentSearchClick(term)}
                            className="w-full text-left px-2 py-2 hover:bg-muted rounded text-sm"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Search Suggestions */}
                    {suggestions.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground px-2 py-1">{t('jobSearch.suggestions.recommended')}</p>
                        {suggestions.map((suggestion) => (
                          <button
                            key={`${suggestion.type}-${suggestion.id}`}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-2 py-2 hover:bg-muted rounded"
                          >
                            <div className="text-sm font-medium">{suggestion.title}</div>
                            {suggestion.company && (
                              <div className="text-xs text-muted-foreground">{suggestion.company}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                지역
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Select
                  value={filters.location || "all"}
                  onValueChange={(value) => onFiltersChange({ ...filters, location: value === "all" ? undefined : value })}
                >
                  <SelectTrigger className="h-12 pl-11 pr-4 text-base border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg bg-white dark:bg-gray-800">
                    <SelectValue placeholder={t('jobSearch.form.locationPlaceholder') || "모든 지역"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('jobSearch.form.allLocations') || "모든 지역"}</SelectItem>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                업종
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <Select
                  value={filters.industry || "all"}
                  onValueChange={(value) => onFiltersChange({ ...filters, industry: value === "all" ? undefined : value })}
                >
                  <SelectTrigger className="h-12 pl-11 pr-4 text-base border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg bg-white dark:bg-gray-800">
                    <SelectValue placeholder={t('jobSearch.form.industryPlaceholder') || "모든 업종"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('jobSearch.form.allIndustries') || "모든 업종"}</SelectItem>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleSearch} 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
              >
                <Search className="mr-2 h-5 w-5" />
                {t('jobSearch.form.searchButton') || "검색"}
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              인기 검색어
            </p>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-full"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
