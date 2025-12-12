import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSelector } from "@/components/common/language-selector";
import { useTranslation } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useDisableRightClick } from "@/hooks/useDisableRightClick";
import { useNotifications } from "@/hooks/useNotifications";
import {
  BarChart3,
  Users,
  Calendar,
  Search,
  Settings,
  Bell,
  Crown,
  Building2,
  PlusCircle,
  TrendingUp,
  UserCheck,
  Target,
  Home,
  LogOut,
  MessageCircle,
  Shield,
} from "lucide-react";

interface CompanyLayoutProps {
  children: React.ReactNode;
}

function CompanyLayout({ children }: CompanyLayoutProps) {
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const { unreadCount: notificationUnreadCount } = useNotifications();
  
  // Apply security measures
  useDisableRightClick();

  const handleNavigateToUser = () => {
    window.location.href = '/user/home';
  };

  const handleNavigateToAdmin = () => {
    window.location.href = '/admin/dashboard';
  };

  const isAdmin = user?.userType === 'admin' || user?.role === 'admin';

  const navigation = [
    { name: t("companyNav.dashboard"), href: "/company/dashboard", icon: BarChart3 },
    { name: t("companyNav.jobs"), href: "/company/jobs", icon: PlusCircle },
    { name: t("companyNav.applications"), href: "/company/applications", icon: Users },
    { name: t("companyNav.talents"), href: "/company/talents", icon: Users },
    { name: t("companyNav.chat"), href: "/company/chat", icon: MessageCircle },
    { name: t("companyNav.employees"), href: "/company/employees", icon: UserCheck },
    { name: t("companyNav.pipeline"), href: "/company/pipeline", icon: Target },
    { name: t("companyNav.interviews"), href: "/company/interviews", icon: Calendar },
    { name: t("companyNav.recommendations"), href: "/company/recommendations", icon: UserCheck },
    { name: t("companyNav.analytics"), href: "/company/analytics", icon: TrendingUp },
    { name: t("companyNav.branding"), href: "/company/branding", icon: Crown },
    { name: t("companyNav.companyInfo"), href: "/company/info", icon: Building2 },
    { name: t("companyNav.settings"), href: "/company/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    return location === href || (href !== "/company/dashboard" && location.startsWith(href));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 shadow-xl">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-800">
            <Link href="/company/dashboard" className="flex items-center group">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg group-hover:scale-105 transition-transform">
                <Building2 className="text-white h-5 w-5" />
              </div>
              <span className="ml-3 font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {t("nav.dashboard")}
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 ${
                          isActive(item.href)
                            ? "text-white"
                            : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                        }`}
                      />
                      {item.name}
                      {item.name === t("companyNav.applications") && (
                        <Badge className="ml-auto bg-red-500 text-white text-xs">12</Badge>
                      )}
                      {item.name === t("companyNav.interviews") && (
                        <Badge className="ml-auto bg-orange-500 text-white text-xs">3</Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-2">
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  onClick={handleNavigateToAdmin}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  관리자 대시보드로
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={handleNavigateToUser}
              >
                <Home className="mr-2 h-4 w-4" />
                {t("companyNav.backToUser")}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("companyNav.logout")}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Header */}
          <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("company.centerTitle")}
                </h1>
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  Premium
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Search className="h-5 w-5" />
                </Button>
                <Link href="/company/notifications">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notificationUnreadCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                        {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <LanguageSelector />
                {isAdmin && (
                  <Link href="/admin/dashboard">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      관리자
                    </Button>
                  </Link>
                )}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">테크스타트</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Premium 플랜</div>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default CompanyLayout;
export { CompanyLayout };


