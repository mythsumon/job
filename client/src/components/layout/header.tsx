import { Link, useLocation } from "wouter";
import { Briefcase, Building2, Users, BookOpen, Heart, MessageCircle, User, Settings, LogOut, ChevronDown, CreditCard, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { MobileNav } from "@/components/mobile/mobile-nav";
import { LanguageSelector } from "@/components/common/language-selector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useNotifications } from "@/hooks/useNotifications";
import { useDisableRightClick } from "@/hooks/useDisableRightClick";
import type { Company } from "@shared/schema";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const { unreadCount, hasUnread } = useUnreadMessages();
  const { unreadCount: notificationUnreadCount, hasUnread: hasUnreadNotifications } = useNotifications();
  useDisableRightClick();
  const { data: userCompany } = useQuery({
    queryKey: ['/api/user/primary-company'],
    enabled: isAuthenticated && user?.userType === 'employer',
    retry: false,
  });
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };
  const navigation = [
    { name: t("header.nav.jobs"), href: "/user/jobs", icon: Briefcase },
    { name: t("header.nav.companies"), href: "/user/companies", icon: Building2 },
  ];

  const careerNavigation = [
    { name: t("header.nav.career"), href: "/user/career", icon: BookOpen },
    { name: t("header.nav.community"), href: "/user/feed", icon: Heart },
  ];
  return (
    <header className="bg-white/80 dark:bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-lg shadow-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <Link href={isAuthenticated ? "/user/home" : "/"} className="flex items-center group">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 lg:p-3 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Briefcase className="text-white h-5 w-5 lg:h-6 lg:w-6" />
            </div>
            <span className="ml-3 font-bold text-xl lg:text-2xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              WorkMongolia
            </span>
          </Link>
          <nav className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`px-4 xl:px-5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                      isActive(item.href)
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2 xl:mr-2.5" />
                    <span className="hidden xl:inline">{item.name}</span>
                    <span className="xl:hidden">{item.name.substring(0, 2)}</span>
                  </Button>
                </Link>
              );
            })}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`px-4 xl:px-5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive("/user/career") || isActive("/user/feed")
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  <BookOpen className="h-4 w-4 mr-2 xl:mr-2.5" />
                  <span className="hidden xl:inline">{t("header.nav.career")}</span>
                  <span className="xl:hidden">{t("header.nav.career").substring(0, 2)}</span>
                  <ChevronDown className="h-3 w-3 ml-1.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {careerNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/pricing">
              <Button
                variant="ghost"
                className={`px-4 xl:px-5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive("/pricing")
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <CreditCard className="h-4 w-4 mr-2 xl:mr-2.5" />
                <span className="hidden xl:inline">{t("header.nav.pricing") || "요금제"}</span>
                <span className="xl:hidden">{t("header.nav.pricing")?.substring(0, 2) || "요금"}</span>
              </Button>
            </Link>
          </nav>
          <div className="hidden lg:flex items-center space-x-5">
            <LanguageSelector />
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href={user?.userType === 'employer' ? '/company/notifications' : '/user/notifications'}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`hover:bg-primary/10 hover:text-primary relative ${
                      isActive('/user/notifications') || isActive('/company/notifications') ? 'bg-primary/10 text-primary' : ''
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                    {hasUnreadNotifications && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse min-w-[20px]">
                        {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
                {user?.userType !== 'admin' && (
                  <Link href="/user/chat">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`hover:bg-primary/10 hover:text-primary relative ${
                        isActive('/user/chat') ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <MessageCircle className="h-5 w-5" />
                      {hasUnread && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse min-w-[20px]">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-3 px-4 py-2.5 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
                      {user?.userType === 'employer' && userCompany?.logo ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20">
                          <img 
                            src={userCompany.logo} 
                            alt={userCompany.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {user?.userType === 'employer' && userCompany?.name 
                              ? userCompany.name[0]?.toUpperCase()
                              : (user?.fullName || user?.username)?.[0]?.toUpperCase() || 'U'
                            }
                          </span>
                        </div>
                      )}
                      <div className="text-sm text-left">
                        <div className="font-medium">
                          {user?.userType === 'employer' && userCompany?.name 
                            ? userCompany.name 
                            : user?.fullName || user?.username || 'User'
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user?.userType === 'employer' 
                            ? (user?.fullName || user?.username || '사용자')
                            : user?.userType === 'admin'
                            ? '관리자'
                            : '구직자'
                          }
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {user?.userType === 'candidate' ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/user/profile" className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            내정보
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/user/settings" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            설정
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    ) : user?.userType === 'employer' ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/company/dashboard" className="flex items-center">
                            <Building2 className="mr-2 h-4 w-4" />
                            기업화면
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    ) : user?.userType === 'admin' ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            관리자화면
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    ) : null}
                    <DropdownMenuItem 
                      onClick={logout}
                      className="flex items-center text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                    {t("header.auth.login")}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    {t("header.auth.register")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <div className="lg:hidden flex items-center space-x-2">
            <LanguageSelector />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
