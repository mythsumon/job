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
      const currentToken = AuthManager.getToken();
      
      // If no token, return null immediately
      if (!currentToken) {
        console.log('[AUTH] No token found, returning null');
        return null;
      }
      
      console.log('[AUTH] Starting authentication check');
      console.log('[AUTH] Token exists:', !!currentToken);
      console.log('[AUTH] Token valid:', AuthManager.isTokenValid());
      
      // MOCK MODE: Skip token validation
      const MOCK_MODE = true;
      
      if (!MOCK_MODE && !AuthManager.isTokenValid()) {
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
    staleTime: 0, // Always refetch to ensure fresh state
    enabled: true, // Always enabled in mock mode
  });

  // Check localStorage on mount for immediate user state
  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    const currentToken = AuthManager.getToken();
    
    // If there's user data but no token, clear the stale user data
    if (storedUser && !currentToken) {
      console.log('[AUTH] Found stale user data without token, clearing...');
      localStorage.removeItem("user_data");
      queryClient.setQueryData(["/api/auth/user"], null);
      return;
    }
    
    if (storedUser && !user && !isLoading && currentToken) {
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
    try {
      console.log('[AUTH] Starting logout process');
      
      // Clear auth data first
      AuthManager.clearAuth();
      
      // Clear all query cache and reset immediately
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.removeQueries();
      queryClient.resetQueries();
      queryClient.clear();
      
      // Cancel any ongoing queries
      queryClient.cancelQueries();
      
      // Auto-login as John Doe (job seeker) after logout
      const johnDoe = {
        id: 1,
        email: "wizar.temuujin1@gmail.com",
        fullName: "John Doe",
        full_name: "John Doe",
        userType: "candidate",
        user_type: "candidate",
        profilePicture: null,
        profile_picture: null,
        location: "Ulaanbaatar",
        bio: "Experienced software developer with 5 years of React and TypeScript experience. Passionate about building scalable web applications.",
        skills: ["React", "TypeScript", "Node.js", "Next.js", "GraphQL"],
        experience: "5년",
        education: "KAIST 컴퓨터공학과",
        major: "Computer Science",
        preferredIndustry: ["Technology", "Software"],
        dreamCompany: "네이버",
        careerLevel: "senior",
        salaryExpectation: "6000-8000만원",
        workAvailability: "immediate",
        isActive: true,
        is_active: true,
        username: "johndoe",
        role: "user",
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      // Set token and user data for John Doe
      AuthManager.setToken("mock-token-john-doe");
      localStorage.setItem("user_data", JSON.stringify(johnDoe));
      localStorage.setItem("auth_token", "mock-token-john-doe");
      
      // Update query cache with John Doe
      queryClient.setQueryData(["/api/auth/user"], johnDoe);
      
      console.log('[AUTH] Logout complete, auto-logged in as John Doe (job seeker)');
      
      // Force redirect to home page
      // Use replace instead of href to prevent back button issues
      // Small delay to ensure state is updated
      setTimeout(() => {
        window.location.replace("/");
      }, 100);
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
      // Even if there's an error, try to auto-login as John Doe
      try {
        const johnDoe = {
          id: 1,
          email: "wizar.temuujin1@gmail.com",
          fullName: "John Doe",
          full_name: "John Doe",
          userType: "candidate",
          user_type: "candidate",
          profilePicture: null,
          profile_picture: null,
          location: "Ulaanbaatar",
          bio: "Experienced software developer with 5 years of React and TypeScript experience. Passionate about building scalable web applications.",
          skills: ["React", "TypeScript", "Node.js", "Next.js", "GraphQL"],
          experience: "5년",
          education: "KAIST 컴퓨터공학과",
          major: "Computer Science",
          preferredIndustry: ["Technology", "Software"],
          dreamCompany: "네이버",
          careerLevel: "senior",
          salaryExpectation: "6000-8000만원",
          workAvailability: "immediate",
          isActive: true,
          is_active: true,
          username: "johndoe",
          role: "user",
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        
        AuthManager.setToken("mock-token-john-doe");
        localStorage.setItem("user_data", JSON.stringify(johnDoe));
        localStorage.setItem("auth_token", "mock-token-john-doe");
        queryClient.setQueryData(["/api/auth/user"], johnDoe);
      } catch (autoLoginError) {
        console.error('[AUTH] Auto-login error:', autoLoginError);
      }
      setTimeout(() => {
        window.location.replace("/");
      }, 100);
    }
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