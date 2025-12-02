import { Link, useLocation } from "wouter";
import { Home, Briefcase, Building2, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";

export function BottomNavigation() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { href: "/user/home", label: t("common.nav.home"), icon: Home },
    { href: "/user/jobs", label: t("common.nav.jobs"), icon: Briefcase },
    { href: "/user/companies", label: t("common.nav.companies"), icon: Building2 },
    ...(isAuthenticated ? [{ href: "/user/chat", label: t("common.nav.messages"), icon: MessageSquare }] : []),
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex flex-col items-center justify-center space-y-1 min-w-0 flex-1 py-2 px-1 transition-colors ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""} transition-transform`} />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}