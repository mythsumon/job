import { Clock, MapPin, Building2, Bookmark, BookmarkCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { JobWithCompany } from "@shared/schema";

interface MobileJobCardProps {
  job: JobWithCompany;
  isSaved?: boolean;
  onSave?: (jobId: number) => void;
  onUnsave?: (jobId: number) => void;
  onClick?: () => void;
}

export function MobileJobCard({ job, isSaved, onSave, onUnsave, onClick }: MobileJobCardProps) {
  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      onUnsave?.(job.id);
    } else {
      onSave?.(job.id);
    }
  };

  return (
    <Card className="w-full mb-3 active:scale-95 transition-transform" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
              {job.title}
            </h3>
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2">
              <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{job.company.name}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 ml-2 flex-shrink-0"
            onClick={handleSaveClick}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-blue-600" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {job.type}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {job.experience}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center ml-4">
            <Clock className="h-3 w-3 mr-1" />
            <span className="whitespace-nowrap">
              {formatDistanceToNow(new Date(job.createdAt!), { 
                addSuffix: true,
                locale: ko 
              })}
            </span>
          </div>
        </div>

        {job.salaryMin && job.salaryMax && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {job.salaryMin.toLocaleString()}만원 ~ {job.salaryMax.toLocaleString()}만원
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}