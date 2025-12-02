import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Home, Briefcase, Building2, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { href: "/user/home", label: t("mobile.nav.home"), icon: Home },
    { href: "/user/jobs", label: t("mobile.nav.jobs"), icon: Briefcase },
    { href: "/user/companies", label: t("mobile.nav.companies"), icon: Building2 },
  ];

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="h-10 w-10 p-0"
            aria-label={t("mobile.menu.open")}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[400px]">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">WorkMongolia</h2>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                  >
                    <a
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t pt-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                  >
                    {t("mobile.auth.logout")}
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t("mobile.auth.login")}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full">
                      {t("mobile.auth.register")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}