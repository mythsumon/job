import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Activity,
  Monitor
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();

  const navigation = [
    { name: "대시보드", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "사용자 관리", href: "/admin/users", icon: Users },
    { name: "기업 관리", href: "/admin/companies", icon: Building2 },
    { name: "권한 관리", href: "/admin/roles", icon: Shield },
    { name: "배너 관리", href: "/admin/banners", icon: Monitor },
    { name: "시스템 모니터링", href: "/admin/monitoring", icon: Activity },
    { name: "정산 관리", href: "/admin/settlements", icon: CreditCard },
    { name: "통계 분석", href: "/admin/analytics", icon: BarChart3 },
    { name: "시스템 설정", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/admin/dashboard" && location === "/admin/dashboard") return true;
    if (path !== "/admin/dashboard" && location.startsWith(path)) return true;
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
                <LayoutDashboard className="text-white h-6 w-6" />
              </div>
              <span className="ml-3 font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                관리자 패널
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
                placeholder="검색..."
                className="pl-10"
              />
            </div>
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
                    {item.name === "사용자 관리" && (
                      <Badge variant="secondary" className="ml-auto">
                        12
                      </Badge>
                    )}
                    {item.name === "기업 관리" && (
                      <Badge variant="destructive" className="ml-auto">
                        3
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                관
              </div>
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium">관리자</div>
                <div className="text-xs text-gray-500">admin@workmongolia.com</div>
              </div>
              <Button variant="ghost" size="sm">
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
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>
            <Link href="/user/home">
              <Button variant="outline" size="sm">
                사용자 사이트로 이동
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
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