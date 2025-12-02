import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredUserType?: 'candidate' | 'employer' | 'admin';
  allowedUserTypes?: ('candidate' | 'employer' | 'admin')[];
}

export function AuthGuard({ 
  children, 
  requiredUserType, 
  allowedUserTypes 
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Don't redirect during loading
    if (isLoading) return;

    // Add a longer delay to allow authentication state to settle completely
    const timer = setTimeout(() => {
      // If not authenticated after delay, redirect to login
      if (!isAuthenticated || !user) {
        console.log('AuthGuard: No auth or user, redirecting to login');
        setLocation("/login");
        return;
      }

      console.log('AuthGuard: User authenticated', user);

      // Check specific user type requirement
      if (requiredUserType && user.userType !== requiredUserType) {
        console.log('AuthGuard: User type mismatch', user.userType, 'required:', requiredUserType);
        // Only redirect to login for access denied, don't auto-redirect to other sections
        setLocation("/login");
        return;
      }

      // Check allowed user types
      if (allowedUserTypes && !allowedUserTypes.includes(user.userType as any)) {
        console.log('AuthGuard: User type not allowed', user.userType, 'allowed:', allowedUserTypes);
        // Only redirect to login for access denied, don't auto-redirect to other sections
        setLocation("/login");
        return;
      }

      console.log('AuthGuard: Access granted');
    }, 300); // Longer delay to allow state to settle

    return () => clearTimeout(timer);
  }, [user, isAuthenticated, isLoading, requiredUserType, allowedUserTypes, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Check access permissions
  if (requiredUserType && user.userType !== requiredUserType) {
    return null;
  }

  if (allowedUserTypes && !allowedUserTypes.includes(user.userType as any)) {
    return null;
  }

  return <>{children}</>;
}