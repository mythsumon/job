import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedUserTypes: Array<'candidate' | 'employer' | 'admin'>;
  fallbackPath?: string;
}

export function RoleGuard({ children, allowedUserTypes, fallbackPath = "/" }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const userType = user.userType;
      
      // 권한 체크:
      // candidate: /user 페이지만 접근 가능
      // employer: /user + /company 페이지 접근 가능  
      // admin: /user + /admin 페이지 접근 가능 (관리자는 /company 접근 불가)
      
      if (!allowedUserTypes.includes(userType as any)) {
        console.log(`[RoleGuard] User ${userType} not authorized for: ${allowedUserTypes.join(', ')}`);
        setLocation(fallbackPath);
      }
    }
  }, [user, isAuthenticated, isLoading, allowedUserTypes, fallbackPath, setLocation]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!allowedUserTypes.includes(user.userType as any)) {
    return null;
  }

  return <>{children}</>;
}