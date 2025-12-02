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
        
        <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder={t('jobSearch.form.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowSuggestions(true)}
                className="search-input"
              />
              
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
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Select
                value={filters.location || "all"}
                onValueChange={(value) => onFiltersChange({ ...filters, location: value === "all" ? undefined : value })}
              >
                <SelectTrigger className="search-input">
                  <SelectValue placeholder={t('jobSearch.form.locationPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('jobSearch.form.allLocations')}</SelectItem>
                  {LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Select
                value={filters.industry || "all"}
                onValueChange={(value) => onFiltersChange({ ...filters, industry: value === "all" ? undefined : value })}
              >
                <SelectTrigger className="search-input">
                  <SelectValue placeholder={t('jobSearch.form.industryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('jobSearch.form.allIndustries')}</SelectItem>
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
              {t('jobSearch.form.searchButton')}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
