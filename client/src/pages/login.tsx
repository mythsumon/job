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
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
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

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "로그인에 실패했습니다");
      }
      return response.json();
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

      // Redirect based on user type
      if (normalizedUser.userType === "employer") {
        setLocation("/company");
      } else if (normalizedUser.userType === "admin" || normalizedUser.role === "admin") {
        setLocation("/admin");
      } else {
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
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}