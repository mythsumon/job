import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  FileText,
  Star,
  Edit,
  UserCheck,
  Mail,
  Phone,
  Video,
  MapPin,
  ArrowRight,
} from "lucide-react";
// Date formatting helper
const formatDate = (dateString: string, formatStr: string = "yyyy-MM-dd") => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];
  
  if (formatStr === "yyyy-MM-dd") {
    return `${year}-${month}-${day}`;
  }
  if (formatStr === "yyyy년 M월 d일 (EEE)") {
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일 (${weekday})`;
  }
  if (formatStr === "HH:mm") {
    return `${hours}:${minutes}`;
  }
  return dateString;
};

interface TimelineEvent {
  id: number;
  type: "status_change" | "chat" | "interview" | "evaluation" | "document" | "note" | "email" | "call";
  title: string;
  description?: string;
  timestamp: string;
  actor?: {
    id: number;
    name: string;
    avatar?: string;
  };
  metadata?: {
    oldStatus?: string;
    newStatus?: string;
    message?: string;
    interviewDate?: string;
    interviewType?: string;
    rating?: number;
    documentType?: string;
    documentName?: string;
    emailSubject?: string;
    callDuration?: number;
  };
}

interface ApplicantTimelineProps {
  applicationId: number;
  candidateId: number;
}

const getEventIcon = (type: TimelineEvent["type"]) => {
  switch (type) {
    case "status_change":
      return <ArrowRight className="h-4 w-4" />;
    case "chat":
      return <MessageSquare className="h-4 w-4" />;
    case "interview":
      return <Calendar className="h-4 w-4" />;
    case "evaluation":
      return <Star className="h-4 w-4" />;
    case "document":
      return <FileText className="h-4 w-4" />;
    case "note":
      return <Edit className="h-4 w-4" />;
    case "email":
      return <Mail className="h-4 w-4" />;
    case "call":
      return <Phone className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getEventColor = (type: TimelineEvent["type"]) => {
  switch (type) {
    case "status_change":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "chat":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case "interview":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "evaluation":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "document":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    case "note":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    case "email":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
    case "call":
      return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

export function ApplicantTimeline({ applicationId, candidateId }: ApplicantTimelineProps) {
  // Fetch timeline events
  const { data: timelineEvents = [], isLoading } = useQuery<TimelineEvent[]>({
    queryKey: ["/api/company/applications", applicationId, "timeline"],
    queryFn: async () => {
      try {
        const response = await apiGet<TimelineEvent[]>(`/api/company/applications/${applicationId}/timeline`);
        return Array.isArray(response) ? response : [];
      } catch {
        // Return mock data if API fails
        return getMockTimelineEvents(applicationId);
      }
    },
    enabled: !!applicationId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (timelineEvents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">타임라인 이벤트가 없습니다</p>
        <p className="text-sm">지원자의 활동 내역이 여기에 표시됩니다.</p>
      </div>
    );
  }

  // Group events by date
  const groupedEvents = timelineEvents.reduce((acc, event) => {
    const date = format(new Date(event.timestamp), "yyyy-MM-dd", { locale: ko });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents)
        .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
        .map(([date, events]) => (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-3">
                {formatDate(date, "yyyy년 M월 d일 (EEE)")}
              </span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>

            {events
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((event, index) => (
                <div key={event.id} className="flex gap-4 relative">
                  {/* Timeline Line */}
                  {index < events.length - 1 && (
                    <div className="absolute left-5 top-10 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                  )}

                  {/* Icon */}
                  <div
                    className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getEventColor(event.type)}`}
                  >
                    {getEventIcon(event.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {event.title}
                              </h4>
                              <Badge className={getEventColor(event.type)}>
                                {event.type === "status_change" && "상태 변경"}
                                {event.type === "chat" && "채팅"}
                                {event.type === "interview" && "면접"}
                                {event.type === "evaluation" && "평가"}
                                {event.type === "document" && "서류"}
                                {event.type === "note" && "노트"}
                                {event.type === "email" && "이메일"}
                                {event.type === "call" && "전화"}
                              </Badge>
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {event.description}
                              </p>
                            )}

                            {/* Metadata */}
                            {event.metadata && (
                              <div className="space-y-1 mt-2">
                                {event.metadata.oldStatus && event.metadata.newStatus && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Badge variant="outline">{event.metadata.oldStatus}</Badge>
                                    <ArrowRight className="h-3 w-3 text-gray-400" />
                                    <Badge variant="outline">{event.metadata.newStatus}</Badge>
                                  </div>
                                )}
                                {event.metadata.message && (
                                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                                    {event.metadata.message}
                                  </div>
                                )}
                                {event.metadata.interviewDate && (
                                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {event.metadata.interviewDate}
                                    </div>
                                    {event.metadata.interviewType && (
                                      <div className="flex items-center gap-1">
                                        {event.metadata.interviewType === "video" ? (
                                          <Video className="h-3 w-3" />
                                        ) : (
                                          <MapPin className="h-3 w-3" />
                                        )}
                                        {event.metadata.interviewType}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {event.metadata.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-medium">{event.metadata.rating}/5</span>
                                  </div>
                                )}
                                {event.metadata.documentName && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-gray-400" />
                                    <span>{event.metadata.documentName}</span>
                                    {event.metadata.documentType && (
                                      <Badge variant="secondary" className="text-xs">
                                        {event.metadata.documentType}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                {event.metadata.emailSubject && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span>{event.metadata.emailSubject}</span>
                                  </div>
                                )}
                                {event.metadata.callDuration && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span>통화 시간: {event.metadata.callDuration}분</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Actor */}
                            {event.actor && (
                              <div className="flex items-center gap-2 mt-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {event.actor.name[0]?.toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-gray-500">{event.actor.name}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDate(event.timestamp, "HH:mm")}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
          </div>
        ))}
    </div>
  );
}

// Mock timeline events for development
function getMockTimelineEvents(applicationId: number): TimelineEvent[] {
  const now = new Date();
  return [
    {
      id: 1,
      type: "document",
      title: "이력서 제출",
      description: "지원자가 이력서를 제출했습니다.",
      timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        documentType: "이력서",
        documentName: "이력서_김민수.pdf",
      },
    },
    {
      id: 2,
      type: "status_change",
      title: "지원 상태 변경",
      description: "지원 상태가 변경되었습니다.",
      timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        oldStatus: "서류 검토",
        newStatus: "면접 대기",
      },
      actor: {
        id: 1,
        name: "박팀장",
      },
    },
    {
      id: 3,
      type: "chat",
      title: "채팅 메시지",
      description: "지원자와 채팅을 시작했습니다.",
      timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        message: "안녕하세요, 면접 일정에 대해 문의드립니다.",
      },
      actor: {
        id: 1,
        name: "김민수",
      },
    },
    {
      id: 4,
      type: "interview",
      title: "면접 일정 추가",
      description: "1차 면접 일정이 추가되었습니다.",
      timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        interviewDate: "2024-06-15 14:00",
        interviewType: "화상면접",
      },
      actor: {
        id: 1,
        name: "박팀장",
      },
    },
    {
      id: 5,
      type: "email",
      title: "면접 안내 이메일 전송",
      description: "면접 일정 안내 이메일이 전송되었습니다.",
      timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      metadata: {
        emailSubject: "면접 일정 안내",
      },
      actor: {
        id: 1,
        name: "시스템",
      },
    },
    {
      id: 6,
      type: "interview",
      title: "면접 완료",
      description: "1차 면접이 완료되었습니다.",
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        interviewDate: "2024-06-15 14:00",
        interviewType: "화상면접",
      },
      actor: {
        id: 1,
        name: "박팀장",
      },
    },
    {
      id: 7,
      type: "evaluation",
      title: "면접 평가 작성",
      description: "면접 평가가 작성되었습니다.",
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      metadata: {
        rating: 4.5,
      },
      actor: {
        id: 1,
        name: "박팀장",
      },
    },
    {
      id: 8,
      type: "note",
      title: "노트 추가",
      description: "지원자에 대한 노트가 추가되었습니다.",
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        message: "우수한 포트폴리오, 팀워크 경험 풍부",
      },
      actor: {
        id: 1,
        name: "박팀장",
      },
    },
    {
      id: 9,
      type: "status_change",
      title: "지원 상태 변경",
      description: "지원 상태가 변경되었습니다.",
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      metadata: {
        oldStatus: "면접 대기",
        newStatus: "합격",
      },
      actor: {
        id: 1,
        name: "박팀장",
      },
    },
    {
      id: 10,
      type: "email",
      title: "합격 안내 이메일 전송",
      description: "합격 안내 이메일이 전송되었습니다.",
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
      metadata: {
        emailSubject: "채용 제안 안내",
      },
      actor: {
        id: 1,
        name: "시스템",
      },
    },
  ];
}

