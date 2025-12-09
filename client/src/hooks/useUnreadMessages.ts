import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { apiGet } from "@/lib/queryClient";

export function useUnreadMessages() {
  const { user, isAuthenticated } = useAuth();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["/api/chat/unread-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      try {
        // Use apiGet to support mock mode
        const data = await apiGet<number | { count: number }>(`/api/chat/unread-count?userId=${user.id}`);
        // Handle both number and object responses
        if (typeof data === 'number') {
          return data;
        }
        return data?.count || 0;
      } catch (error) {
        console.error('[useUnreadMessages] Error fetching unread count:', error);
        return 0;
      }
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