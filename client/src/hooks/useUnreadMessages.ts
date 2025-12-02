import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export function useUnreadMessages() {
  const { user, isAuthenticated } = useAuth();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["/api/chat/unread-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const token = localStorage.getItem('auth_token');
      if (!token) return 0;
      
      const res = await fetch(`/api/chat/unread-count?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!res.ok) return 0;
      const data = await res.json();
      return data.count || 0;
    },
    enabled: isAuthenticated && !!user?.id,
    refetchInterval: 30000, // Check every 30 seconds
    retry: false,
  });

  return {
    unreadCount: Number(unreadCount) || 0,
    hasUnread: Number(unreadCount) > 0,
  };
}