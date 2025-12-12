import { useState } from "react";
import { CompanyLayout } from "@/components/company/company-layout";
import { useNotifications } from "@/hooks/useNotifications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Briefcase,
  MessageSquare,
  UserCheck,
  Calendar,
  AlertCircle,
  Info,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
// Date formatting helper
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "방금 전";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  return date.toLocaleDateString('ko-KR');
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "new_application":
    case "application_status":
      return Briefcase;
    case "message":
    case "chat":
      return MessageSquare;
    case "interview":
    case "interview_scheduled":
      return Calendar;
    case "candidate_recommendation":
      return UserCheck;
    case "team_member":
      return Users;
    case "alert":
    case "urgent":
      return AlertCircle;
    default:
      return Info;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "new_application":
    case "application_status":
      return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
    case "message":
    case "chat":
      return "text-purple-600 bg-purple-50 dark:bg-purple-900/20";
    case "interview":
    case "interview_scheduled":
      return "text-green-600 bg-green-50 dark:bg-green-900/20";
    case "candidate_recommendation":
      return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
    case "team_member":
      return "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20";
    case "alert":
    case "urgent":
      return "text-red-600 bg-red-50 dark:bg-red-900/20";
    default:
      return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
  }
};

export default function CompanyNotifications() {
  const { t } = useLanguage();
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = filter === "unread" 
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
  };

  const handleDelete = (id: number) => {
    if (confirm("알림을 삭제하시겠습니까?")) {
      deleteNotification(id);
    }
  };

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600" />
              알림
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {unreadCount > 0 ? `${unreadCount}개의 읽지 않은 알림이 있습니다` : "모든 알림을 확인했습니다"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={() => markAllAsRead()} variant="outline" size="sm">
              <CheckCheck className="h-4 w-4 mr-2" />
              모두 읽음 처리
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            전체 ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
            size="sm"
          >
            읽지 않음 ({unreadCount})
          </Button>
        </div>

        {/* Notifications List */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                알림을 불러오는 중...
              </div>
            ) : sortedNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {filter === "unread" ? "읽지 않은 알림이 없습니다" : "알림이 없습니다"}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const iconColor = getNotificationColor(notification.type);
                    const timeAgo = formatTimeAgo(notification.createdAt);

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${iconColor}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={`font-semibold ${!notification.isRead ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                                    {notification.title}
                                  </h3>
                                  {!notification.isRead && (
                                    <Badge variant="default" className="h-2 w-2 p-0 rounded-full bg-blue-600" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                  <span>{timeAgo}</span>
                                  {notification.link && (
                                    <Link href={notification.link}>
                                      <Button variant="ghost" size="sm" className="h-6 text-xs p-0">
                                        자세히 보기 →
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    title="읽음 처리"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={() => handleDelete(notification.id)}
                                  title="삭제"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </CompanyLayout>
  );
}