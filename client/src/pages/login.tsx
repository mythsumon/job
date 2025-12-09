import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, EyeOff, Mail, Lock, User, Copy, Check, Briefcase, UserCircle, Shield } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

type LoginForm = z.infer<typeof loginSchema>;

// Sample demo accounts
const demoAccounts = [
  {
    email: "wizar.temuujin1@gmail.com",
    password: "Admin00!@#$",
    userType: "candidate",
    label: "구직자 (Candidate)",
    description: "채용공고 탐색 및 지원",
    icon: UserCircle,
    color: "bg-blue-500",
  },
  {
    email: "comp@mail.com",
    password: "Admin00!@#$",
    userType: "employer",
    label: "구인자 (Employer)",
    description: "채용공고 작성 및 관리",
    icon: Briefcase,
    color: "bg-purple-500",
  },
  {
    email: "admin@admin.admin",
    password: "Admin00!@#$",
    userType: "admin",
    label: "관리자 (Admin)",
    description: "플랫폼 관리 및 모니터링",
    icon: Shield,
    color: "bg-red-500",
  },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const fillDemoAccount = (account: typeof demoAccounts[0]) => {
    form.setValue("email", account.email);
    form.setValue("password", account.password);
    toast({
      title: "데모 계정 입력됨",
      description: `${account.label} 계정 정보가 입력되었습니다.`,
    });
  };

  const copyAccountInfo = (account: typeof demoAccounts[0]) => {
    const accountInfo = `이메일: ${account.email}\n비밀번호: ${account.password}`;
    navigator.clipboard.writeText(accountInfo);
    setCopiedAccount(account.email);
    setTimeout(() => setCopiedAccount(null), 2000);
    toast({
      title: "복사됨",
      description: "계정 정보가 클립보드에 복사되었습니다.",
    });
  };

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      // Use AuthManager.login for proper mock mode support
      const { AuthManager } = await import("@/utils/auth");
      return await AuthManager.login({
        email: data.email,
        password: data.password,
      });
    },
    onSuccess: (data) => {
      console.log('[LOGIN] Login successful, data:', data);
      
      // Store JWT token and user data for JWT authentication
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_data", JSON.stringify(data.user));
      
      // Normalize user data for consistency
      const normalizedUser = {
        ...data.user,
        fullName: data.user.fullName || data.user.full_name,
        userType: data.user.userType || data.user.user_type,
        isActive: data.user.isActive || data.user.is_active,
        profilePicture: data.user.profilePicture || data.user.profile_picture,
        lastLogin: data.user.lastLogin || data.user.last_login,
        createdAt: data.user.createdAt || data.user.created_at
      };
      
      console.log('[LOGIN] Normalized user data:', normalizedUser);
      
      // Immediately set user data in cache for instant UI update
      queryClient.setQueryData(["/api/auth/user"], normalizedUser);
      
      // Also invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });

      // Redirect based on user type - directly to dashboard
      console.log('[LOGIN] User type:', normalizedUser.userType, 'Role:', normalizedUser.role);
      
      if (normalizedUser.userType === "employer") {
        console.log('[LOGIN] Redirecting employer to /company/dashboard');
        setLocation("/company/dashboard");
      } else if (normalizedUser.userType === "admin" || normalizedUser.role === "admin") {
        console.log('[LOGIN] Redirecting admin to /admin/dashboard');
        setLocation("/admin/dashboard");
      } else {
        console.log('[LOGIN] Redirecting candidate to /user/home');
        setLocation("/user/home");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "로그인 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-4 py-16">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("login.title")}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {t("login.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200">{t("login.email")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            type="email"
                            placeholder={t("login.emailPlaceholder")}
                            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200">{t("login.password")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder={t("login.passwordPlaceholder")}
                            className="pl-10 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? t("login.loggingIn") : t("login.submit")}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t("login.noAccount")}{" "}
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  {t("login.registerLink")}
                </Link>
              </p>
            </div>

            {/* Demo Accounts Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  데모 계정으로 로그인
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  UI 플로우 확인을 위한 샘플 계정
                </p>
              </div>
              
              <div className="space-y-3">
                {demoAccounts.map((account) => {
                  const Icon = account.icon;
                  return (
                    <div
                      key={account.email}
                      className="group relative p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                      onClick={() => fillDemoAccount(account)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`${account.color} p-2 rounded-lg text-white`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {account.label}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {account.userType}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              {account.description}
                            </p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded font-mono">
                                  {account.email}
                                </code>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <Lock className="w-3 h-3 text-gray-400" />
                                <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded font-mono">
                                  {account.password}
                                </code>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyAccountInfo(account);
                          }}
                        >
                          {copiedAccount === account.email ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => fillDemoAccount(account)}
                        >
                          이 계정으로 로그인
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  💡 <strong>팁:</strong> 데모 계정 카드를 클릭하면 자동으로 입력됩니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}