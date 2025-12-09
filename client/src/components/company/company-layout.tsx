import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard,
  BarChart3,
  FileText,
  Users,
  UserSearch,
  MessageSquare,
  GitBranch,
  Briefcase,
  Calendar,
  Sparkles,
  Palette,
  Building2,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSelector } from "@/components/common/language-selector";

interface CompanyLayoutProps {
  children: React.ReactNode;
}

export function CompanyLayout({ children }: CompanyLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  // Mock notification count - replace with actual API call
  const notificationCount = 3;

  const navigation = [
    { name: t("companyNav.dashboard"), href: "/company/dashboard", icon: LayoutDashboard },
    { name: t("companyNav.analytics"), href: "/company/analytics", icon: BarChart3 },
    { name: t("companyNav.applications"), href: "/company/applications", icon: FileText },
    { name: t("companyNav.employees"), href: "/company/employees", icon: Users },
    { name: t("companyNav.talents"), href: "/company/talents", icon: UserSearch },
    { name: t("companyNav.chat"), href: "/company/chat", icon: MessageSquare },
    { name: t("companyNav.pipeline"), href: "/company/pipeline", icon: GitBranch },
    { name: t("companyNav.jobs"), href: "/company/jobs", icon: Briefcase },
    { name: t("companyNav.interviews"), href: "/company/interviews", icon: Calendar },
    { name: t("companyNav.recommendations"), href: "/company/recommendations", icon: Sparkles },
    { name: t("companyNav.branding"), href: "/company/branding", icon: Palette },
    { name: t("companyNav.companyInfo"), href: "/company/info", icon: Building2 },
    { name: t("companyNav.settings"), href: "/company/settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/company/dashboard" && location === "/company/dashboard") return true;
    if (path !== "/company/dashboard" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Building2 className="text-white h-6 w-6" />
              </div>
              <span className="ml-3 font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("company.centerTitle")}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("common.search.placeholder") || "검색..."}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    // Navigate to search results or filter current page
                    if (location.startsWith("/company/jobs")) {
                      setLocation(`/company/jobs?search=${encodeURIComponent(searchQuery)}`);
                    } else if (location.startsWith("/company/applications")) {
                      setLocation(`/company/applications?search=${encodeURIComponent(searchQuery)}`);
                    } else if (location.startsWith("/company/talents")) {
                      setLocation(`/company/talents?search=${encodeURIComponent(searchQuery)}`);
                    } else {
                      // Default: search in jobs
                      setLocation(`/company/jobs?search=${encodeURIComponent(searchQuery)}`);
                    }
                  }
                }}
              />
            </div>
            {searchQuery && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {t("common.search.pressEnter") || "Enter 키를 눌러 검색"}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive(item.href) 
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium">{user?.name || "User"}</div>
                <div className="text-xs text-gray-500">{user?.email || ""}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-200 ease-in-out ${
        sidebarOpen ? 'lg:ml-64' : ''
      }`}>
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <Link href="/company/applications?status=pending">
              <Button variant="ghost" size="sm" className="relative">
                <FileText className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-600">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Badge>
              </Button>
            </Link>
            <Link href="/company/chat">
              <Button variant="ghost" size="sm" className="relative">
                <MessageSquare className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-600">
                  2
                </Badge>
              </Button>
            </Link>
            <Link href="/user/home">
              <Button variant="outline" size="sm">
                {t("companyNav.backToUser")}
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Export as default for backward compatibility
export default CompanyLayout;
