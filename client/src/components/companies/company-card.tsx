import { Building, MapPin, Users, Globe, TrendingUp, Star, Calendar, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Company } from "@shared/schema";

interface CompanyCardProps {
  company: Company;
  jobCount?: number;
}

export default function CompanyCard({ company, jobCount = 0 }: CompanyCardProps) {
  const generateCompanyLogo = (name: string) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600", 
      "from-purple-500 to-purple-600",
      "from-red-500 to-red-600",
      "from-orange-500 to-orange-600",
      "from-cyan-500 to-cyan-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600"
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

  const getSizeLabel = (size: string) => {
    const labels: Record<string, string> = {
      startup: "스타트업",
      small: "중소기업", 
      medium: "중견기업",
      large: "대기업"
    };
    return labels[size] || size;
  };

  const logo = generateCompanyLogo(company.name);

  const isPopular = jobCount > 3;
  const isEstablished = company.founded && company.founded < 2015;

  return (
    <Link href={`/user/companies/${company.id}`}>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-card/80 shadow-sm h-full">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full group-hover:scale-110 transition-transform duration-300"></div>
        
        {/* Popular/Trending Badge */}
        {isPopular && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium z-10 animate-pulse">
            <TrendingUp className="w-3 h-3" />
            인기기업
          </div>
        )}

        <CardContent className="relative p-4 sm:p-6 h-full flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
            {/* Enhanced Company Logo */}
            <div className="relative flex-shrink-0 self-center sm:self-start">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className={`relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${logo.color} rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {logo.initials}
              </div>
              {isEstablished && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-2 truncate">
                {company.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-3 font-medium">
                {company.industry}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge className={`text-xs font-medium px-2 sm:px-3 py-1 transition-all duration-200 group-hover:scale-105 ${
                  company.size === 'large' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : company.size === 'medium'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {getSizeLabel(company.size)}
                </Badge>
                {jobCount > 0 && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium px-2 sm:px-3 py-1 group-hover:scale-105 transition-transform duration-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {jobCount}개 채용중
                  </Badge>
                )}
                {isEstablished && (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs group-hover:scale-105 transition-transform duration-200">
                    설립 {company.founded}년
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-4 line-clamp-3 text-xs sm:text-sm leading-relaxed flex-1">
            {company.description}
          </p>
          
          {/* Company Info Grid */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 group-hover:scale-125 transition-transform duration-200"></div>
              <MapPin className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="font-medium truncate">{company.location}</span>
            </div>
            {company.employeeCount && (
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 group-hover:scale-125 transition-transform duration-200"></div>
                <Users className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="font-medium">{company.employeeCount.toLocaleString()}명</span>
              </div>
            )}
            {company.website && (
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 group-hover:scale-125 transition-transform duration-200"></div>
                <Globe className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="font-medium">웹사이트 보유</span>
              </div>
            )}
          </div>

          {/* Company Benefits Preview */}
          {company.benefits && company.benefits.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                {company.benefits.slice(0, 3).map((benefit, index) => (
                  <Badge 
                    key={benefit} 
                    variant="outline" 
                    className="text-xs px-2 py-1 border-dashed group-hover:scale-105 transition-transform duration-200"
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    {benefit}
                  </Badge>
                ))}
                {company.benefits.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-1 border-dashed">
                    +{company.benefits.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Animated Bottom Border */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </CardContent>
      </Card>
    </Link>
  );
}
