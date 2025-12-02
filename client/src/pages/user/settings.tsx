import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings, Bell, Shield, Lock, Trash2, Save } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDisableRightClick } from "@/hooks/useDisableRightClick";
import { apiRequest } from "@/lib/queryClient";

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
  newPassword: z.string().min(6, "새 비밀번호는 최소 6자 이상이어야 합니다"),
  confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  jobAlerts: z.boolean(),
  messageNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

const privacySettingsSchema = z.object({
  profileVisibility: z.enum(["public", "private", "contacts"]),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  allowJobRecommendations: z.boolean(),
});

type PasswordUpdateForm = z.infer<typeof passwordUpdateSchema>;
type NotificationSettingsForm = z.infer<typeof notificationSettingsSchema>;
type PrivacySettingsForm = z.infer<typeof privacySettingsSchema>;

interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  jobAlerts: boolean;
  messageNotifications: boolean;
  marketingEmails: boolean;
  profileVisibility: "public" | "private" | "contacts";
  showEmail: boolean;
  showPhone: boolean;
  allowJobRecommendations: boolean;
}

export default function UserSettings() {
  useDisableRightClick();

  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("notifications");

  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
    enabled: !!user,
  });

  const passwordForm = useForm<PasswordUpdateForm>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationForm = useForm<NotificationSettingsForm>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      jobAlerts: true,
      messageNotifications: true,
      marketingEmails: false,
    },
  });

  const privacyForm = useForm<PrivacySettingsForm>({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: {
      profileVisibility: "public",
      showEmail: false,
      showPhone: false,
      allowJobRecommendations: true,
    },
  });

  // Update forms when settings data loads
  useEffect(() => {
    if (settings) {
      notificationForm.reset({
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        jobAlerts: settings.jobAlerts,
        messageNotifications: settings.messageNotifications,
        marketingEmails: settings.marketingEmails,
      });

      privacyForm.reset({
        profileVisibility: settings.profileVisibility,
        showEmail: settings.showEmail,
        showPhone: settings.showPhone,
        allowJobRecommendations: settings.allowJobRecommendations,
      });
    }
  }, [settings, notificationForm, privacyForm]);

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordUpdateForm) => {
      return await apiRequest("PUT", "/api/user/password", data);
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message || "비밀번호 변경에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: NotificationSettingsForm) => {
      return await apiRequest("PUT", "/api/user/notifications", data);
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "알림 설정이 저장되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message || "알림 설정 저장에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: async (data: PrivacySettingsForm) => {
      return await apiRequest("PUT", "/api/user/privacy", data);
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "개인정보 설정이 저장되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message || "개인정보 설정 저장에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", "/api/user/account");
    },
    onSuccess: () => {
      toast({
        title: "계정 삭제",
        description: "계정이 성공적으로 삭제되었습니다.",
      });
      // Redirect to home or login page
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message || "계정 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  const tabButtons = [
    { id: "notifications", label: "알림 설정", icon: Bell },
    { id: "privacy", label: "개인정보", icon: Shield },
    { id: "security", label: "보안", icon: Lock },
    { id: "account", label: "계정 관리", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">설정</h1>
          <p className="text-muted-foreground">계정 설정을 관리하고 개인정보를 보호하세요.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabButtons.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit((data) => updateNotificationsMutation.mutate(data))}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        알림 설정
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>이메일 알림</FormLabel>
                              <p className="text-sm text-muted-foreground">중요한 업데이트를 이메일로 받습니다</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="pushNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>푸시 알림</FormLabel>
                              <p className="text-sm text-muted-foreground">브라우저 푸시 알림을 받습니다</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="jobAlerts"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>채용 공고 알림</FormLabel>
                              <p className="text-sm text-muted-foreground">새로운 채용 공고를 알림으로 받습니다</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="messageNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>메시지 알림</FormLabel>
                              <p className="text-sm text-muted-foreground">새로운 메시지를 알림으로 받습니다</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="marketingEmails"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>마케팅 이메일</FormLabel>
                              <p className="text-sm text-muted-foreground">프로모션 및 마케팅 이메일을 받습니다</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={updateNotificationsMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        {updateNotificationsMutation.isPending ? "저장 중..." : "설정 저장"}
                      </Button>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <Form {...privacyForm}>
                <form onSubmit={privacyForm.handleSubmit((data) => updatePrivacyMutation.mutate(data))}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        개인정보 설정
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={privacyForm.control}
                        name="profileVisibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>프로필 공개 설정</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="공개 설정을 선택하세요" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="public">전체 공개</SelectItem>
                                <SelectItem value="contacts">연락처만 공개</SelectItem>
                                <SelectItem value="private">비공개</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={privacyForm.control}
                        name="showEmail"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>이메일 주소 공개</FormLabel>
                              <p className="text-sm text-muted-foreground">프로필에서 이메일 주소를 공개합니다</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={privacyForm.control}
                        name="showPhone"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>전화번호 공개</FormLabel>
                              <p className="text-sm text-muted-foreground">프로필에서 전화번호를 공개합니다</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={privacyForm.control}
                        name="allowJobRecommendations"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>채용 추천 허용</FormLabel>
                              <p className="text-sm text-muted-foreground">맞춤형 채용 공고 추천을 받습니다</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={updatePrivacyMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        {updatePrivacyMutation.isPending ? "저장 중..." : "설정 저장"}
                      </Button>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit((data) => updatePasswordMutation.mutate(data))}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        보안 설정
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>현재 비밀번호</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>새 비밀번호</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>새 비밀번호 확인</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={updatePasswordMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        {updatePasswordMutation.isPending ? "변경 중..." : "비밀번호 변경"}
                      </Button>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    계정 관리
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <h3 className="font-semibold text-destructive mb-2">위험 구역</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                    </p>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          계정 삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>계정을 삭제하시겠습니까?</AlertDialogTitle>
                          <AlertDialogDescription>
                            이 작업은 되돌릴 수 없습니다. 계정과 모든 데이터가 영구적으로 삭제됩니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteAccountMutation.mutate()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}