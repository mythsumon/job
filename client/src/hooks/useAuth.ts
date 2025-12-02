import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AuthManager } from "@/utils/auth";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  user_type: string;
  role?: string;
  profile_picture?: string;
  location?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  // Computed properties for backward compatibility
  fullName?: string;
  userType?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const token = AuthManager.getToken();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async (): Promise<User | null> => {
      console.log('[AUTH] Starting authentication check');
      console.log('[AUTH] Token exists:', !!token);
      console.log('[AUTH] Token valid:', AuthManager.isTokenValid());
      
      // Check token validity before making request
      if (!AuthManager.isTokenValid()) {
        console.log('[AUTH] Token invalid, clearing auth');
        AuthManager.clearAuth();
        return null;
      }

      try {
        console.log('[AUTH] Making authenticated request to /api/auth/user');
        const response = await AuthManager.authenticatedRequest("/api/auth/user");
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const userData = await response.json();
        console.log('[AUTH] Raw user data from API:', userData);
        
        // Normalize user data for backward compatibility
        const normalizedUser = {
          ...userData,
          fullName: userData.fullName || userData.full_name,
          userType: userData.userType || userData.user_type,
          isActive: userData.isActive || userData.is_active,
          profilePicture: userData.profilePicture || userData.profile_picture,
          lastLogin: userData.lastLogin || userData.last_login,
          createdAt: userData.createdAt || userData.created_at
        };
        
        console.log('[AUTH] Normalized user data:', normalizedUser);
        
        // Update localStorage with fresh user data
        localStorage.setItem("user_data", JSON.stringify(normalizedUser));
        console.log('User authenticated successfully:', normalizedUser.userType);
        
        return normalizedUser;
      } catch (error: any) {
        console.error('[AUTH] Authentication error:', error);
        if (error.message.includes('401') || error.message.includes('403')) {
          console.log('Authentication failed, token may be expired');
          AuthManager.clearAuth();
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: !!token,
  });

  // Check localStorage on mount for immediate user state
  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    
    if (storedUser && !user && !isLoading && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Normalize stored user data as well
        const normalizedUser = {
          ...parsedUser,
          fullName: parsedUser.full_name || parsedUser.fullName,
          userType: parsedUser.user_type || parsedUser.userType,
          isActive: parsedUser.is_active !== undefined ? parsedUser.is_active : parsedUser.isActive,
          profilePicture: parsedUser.profile_picture || parsedUser.profilePicture,
          lastLogin: parsedUser.last_login || parsedUser.lastLogin,
          createdAt: parsedUser.created_at || parsedUser.createdAt
        };
        queryClient.setQueryData(["/api/auth/user"], normalizedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user_data");
      }
    }
  }, [user, isLoading, queryClient, token]);

  const logout = async () => {
    await AuthManager.logout();
    queryClient.setQueryData(["/api/auth/user"], null);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    window.location.href = "/";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!token,
    error,
    logout,
    token,
  };
}