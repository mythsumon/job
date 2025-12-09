import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Calendar,
  FileText,
  MessageSquare,
  Download,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CandidateProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    avatar?: string;
    experience?: string;
    education?: string;
    skills?: string[];
    rating?: number;
    appliedAt?: string;
    resumeUrl?: string;
  };
  jobTitle?: string;
}

export function CandidateProfileDialog({
  open,
  onOpenChange,
  candidate,
  jobTitle,
}: CandidateProfileDialogProps) {
  const { t } = useLanguage();

  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {t("companyApplications.candidateProfile") || "지원자 프로필"}
          </DialogTitle>
          <DialogDescription>
            {jobTitle && `${jobTitle} - `}
            {candidate.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start space-x-4 pb-6 border-b">
            <Avatar className="h-20 w-20">
              <AvatarImage src={candidate.avatar} />
              <AvatarFallback className="text-lg">
                {candidate.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {candidate.name}
                  </h3>
                  {candidate.rating && (
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="text-sm font-medium">
                        {candidate.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t("common.actions.message") || "메시지"}
                  </Button>
                  {candidate.resumeUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      {t("common.download") || "이력서 다운로드"}
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidate.email && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4 mr-2" />
                    {candidate.email}
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4 mr-2" />
                    {candidate.phone}
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-2" />
                    {candidate.location}
                  </div>
                )}
                {candidate.experience && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {candidate.experience}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                {t("common.view") || "개요"}
              </TabsTrigger>
              <TabsTrigger value="experience">
                {t("common.experience") || "경력"}
              </TabsTrigger>
              <TabsTrigger value="education">
                {t("common.education") || "학력"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {candidate.skills && candidate.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">
                    {t("common.skills") || "기술 스택"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {candidate.appliedAt && (
                <div>
                  <h4 className="font-semibold mb-2">
                    {t("companyApplications.appliedAt") || "지원일"}
                  </h4>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    {candidate.appliedAt}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="experience" className="mt-4">
              <div className="text-center py-8 text-gray-500">
                {t("common.noData") || "경력 정보가 없습니다."}
              </div>
            </TabsContent>

            <TabsContent value="education" className="mt-4">
              {candidate.education ? (
                <div className="flex items-start space-x-3">
                  <GraduationCap className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium">{candidate.education}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {t("common.noData") || "학력 정보가 없습니다."}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

