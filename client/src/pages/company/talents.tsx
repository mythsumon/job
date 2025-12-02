import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CompanyLayout } from "@/components/company/company-layout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Search,
  MapPin,
  Briefcase,
  Star,
  Clock,
  MessageCircle,
  Users,
  Award,
  TrendingUp,
  Eye,
  Heart,
  Download
} from "lucide-react";

interface Talent {
  id: number;
  name: string;
  email: string;
  profileImage?: string;
  title: string;
  location: string;
  experience: string;
  skills: string[];
  rating: number;
  availability: string;
  expectedSalary?: number;
  lastActive: string;
  bio: string;
  education: string;
  portfolio?: string;
  verified: boolean;
}

export default function CompanyTalents() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch talents
  const { data: talents = [], isLoading } = useQuery({
    queryKey: ["/api/talents"],
  });

  const handleStartChat = (talentId: number) => {
    window.location.href = `/company/chat?talent=${talentId}`;
  };

  const handleViewProfile = (talentId: number) => {
    window.location.href = `/company/talents/${talentId}`;
  };

  const handleSaveTalent = (talentId: number) => {
    console.log("Saving talent:", talentId);
  };

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('companyTalents.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('companyTalents.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t('companyTalents.downloadList')}
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('companyTalents.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('companyTalents.stats.totalTalents')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{Array.isArray(talents) ? talents.length : 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('companyTalents.stats.activeTalents')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(talents) ? talents.filter((t: Talent) => t.availability === "available").length : 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('companyTalents.stats.verifiedTalents')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(talents) ? talents.filter((t: Talent) => t.verified).length : 0}
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('companyTalents.stats.averageRating')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(talents) && talents.length > 0 ? (talents.reduce((acc: number, t: Talent) => acc + t.rating, 0) / talents.length).toFixed(1) : "0.0"}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Talent Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !Array.isArray(talents) || talents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('companyTalents.emptyState.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('companyTalents.emptyState.description')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(talents) && talents.map((talent: Talent) => (
              <Card key={talent.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={talent.profileImage} />
                        <AvatarFallback>{talent.name?.[0] || 'T'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{talent.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{talent.title}</p>
                      </div>
                    </div>
                    {talent.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {t('companyTalents.verified')}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {talent.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {talent.experience} {t('companyTalents.experience')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {t('companyTalents.lastActive')}: {talent.lastActive}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(talent.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">{talent.rating}</span>
                    </div>
                    <Badge 
                      variant={talent.availability === "available" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {talent.availability === "available" ? t('companyTalents.availability.available') : t('companyTalents.availability.busy')}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {talent.bio}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {talent.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {talent.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{talent.skills.length - 3} {t('companyTalents.moreSkills')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleStartChat(talent.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {t('companyTalents.actions.chat')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewProfile(talent.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSaveTalent(talent.id)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CompanyLayout>
  );
}