import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, MapPin, Mail, Phone, Briefcase, GraduationCap, Award, Edit3, Save, X, Camera, User, FileText, Globe, Quote, Code, Search, Download, Edit, Plus, CreditCard, Shield, Bell, Trash2, Eye, EyeOff, Activity, Clock, Target, Star, TrendingUp } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDisableRightClick } from "@/hooks/useDisableRightClick";
import { apiRequest } from "@/lib/queryClient";
import { ResumeManagement } from "@/components/resume/ResumeManagement";
import { processProfilePicture, isValidImageFile } from "@/utils/imageUtils";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

const profileUpdateSchema = z.object({
  fullName: z.string().min(1, "이름을 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  userType: string;
  profilePicture?: string;
  location?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  birthDate?: string;
  createdAt?: Date;
}

interface UserSubscription {
  id: number;
  userId: number;
  planType: string;
  status: string;
  startDate: string;
  endDate?: string;
  price: number;
}

export default function UserProfile() {
  useDisableRightClick();

  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("resumes");
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/user/profile"],
    enabled: !!user,
  });

  // Fetch user subscription data
  const { data: subscription } = useQuery<UserSubscription>({
    queryKey: ["/api/subscription/user", user?.id],
    enabled: !!user?.id && user?.userType === 'candidate',
  });

  // Fetch user's default resume for overview section
  const { data: defaultResumeResponse } = useQuery({
    queryKey: ["/api/resumes/default"],
    enabled: !!user,
  });

  const defaultResume = (defaultResumeResponse as any)?.success ? (defaultResumeResponse as any).data : null;

  // Calculate age from birth date
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Get subscription plan display info
  const getSubscriptionBadge = () => {
    if (!subscription || subscription.status !== 'active') {
      return {
        text: "무료",
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-600"
      };
    }

    switch (subscription.planType) {
      case 'premium':
        return {
          text: "프리미엄",
          variant: "default" as const,
          className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
        };
      case 'enterprise':
        return {
          text: "엔터프라이즈",
          variant: "default" as const,
          className: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
        };
      case 'basic':
      default:
        return {
          text: "베이직",
          variant: "outline" as const,
          className: "bg-blue-50 text-blue-600 border-blue-200"
        };
    }
  };

  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      bio: "",
      skills: "",
      experience: "",
      education: "",
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
        skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : "",
        experience: profile.experience || "",
        education: profile.education || "",
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateForm) => {
      const updateData = {
        ...data,
        skills: data.skills ? data.skills.split(",").map(s => s.trim()).filter(s => s) : [],
      };
      return await apiRequest("PUT", "/api/user/profile", updateData);
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "프로필이 성공적으로 업데이트되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message || "프로필 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (imageData: { profilePictureUrl: string; format: string; size: number }) => {
      return await apiRequest("POST", "/api/users/profile-picture", imageData);
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "프로필 사진이 성공적으로 업데이트되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message || "프로필 사진 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isValidImageFile(file)) {
      toast({
        title: "오류",
        description: "지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "오류",
        description: "파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const processedImage = await processProfilePicture(file);
      uploadProfilePictureMutation.mutate({
        profilePictureUrl: processedImage.dataUrl,
        format: processedImage.format,
        size: processedImage.size
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "이미지 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: ProfileUpdateForm) => {
    updateProfileMutation.mutate(data);
  };

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
    // { id: "overview", label: "개요", icon: User }, // 임시 비활성화
    { id: "resumes", label: "이력서", icon: FileText },
    { id: "subscription", label: "구독 관리", icon: Award },
    { id: "activity", label: "활동 내역", icon: Search },
    { id: "settings", label: "계정 설정", icon: Edit },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 md:w-32 md:h-32">
                  <AvatarImage 
                    src={profile?.profilePicture} 
                    className="object-cover object-center"
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {profile?.fullName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="profile-picture-upload">
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full shadow-lg cursor-pointer"
                    asChild
                  >
                    <span>
                      <Camera className="w-4 h-4" />
                    </span>
                  </Button>
                </label>
                <input
                  id="profile-picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {profile?.fullName || "사용자"}
                    </h1>
                    {user?.userType === 'candidate' && (
                      <Badge 
                        variant={getSubscriptionBadge().variant}
                        className={`${getSubscriptionBadge().className} text-xs font-medium px-2 py-1`}
                      >
                        {getSubscriptionBadge().text}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{profile?.location || "위치 정보 없음"}</span>
                </div>
              </div>

              <Button
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    저장
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    편집
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">개인 정보</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{profile?.email || "이메일 없음"}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{profile?.phone || "전화번호 없음"}</span>
                  </div>
                  {(user as any)?.birthDate && (
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        나이: {calculateAge((user as any).birthDate)}세
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      가입일: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ko-KR') : "정보 없음"}
                    </span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">빠른 액션</h4>
                  {profile?.userType === 'candidate' && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-auto p-2 text-left"
                      onClick={() => setActiveTab('resumes')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      <div>
                        <div className="font-medium">이력서 관리</div>
                        <div className="text-xs text-muted-foreground">이력서 탭으로 이동</div>
                      </div>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Navigation Tabs */}
            <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
              {tabButtons.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        기본 정보 수정
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>이름</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>이메일</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>전화번호</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>위치</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>자기소개</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={4} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>경력사항</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={4} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>학력사항</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={4} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>기술 스택 (쉼표로 구분)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="React, TypeScript, Node.js" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  <div className="flex gap-4">
                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? "저장 중..." : "저장"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      취소
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                {/* Overview Tab - Temporarily Disabled */}
                {/* {activeTab === "overview" && (
                  <div className="space-y-6">
                    {defaultResume ? (
                      <>
                        {/* Hero Section with Main Resume Info */}
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                          <CardContent className="p-8">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile?.fullName || user?.fullName}</h2>
                                  <p className="text-lg text-blue-600 font-medium">{defaultResume.title}</p>
                                  {profile?.location && (
                                    <div className="flex items-center gap-1 mt-2 text-gray-600">
                                      <MapPin className="w-4 h-4" />
                                      <span className="text-sm">{profile.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                메인 이력서
                              </Badge>
                            </div>

                            {defaultResume.summary && (
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <Quote className="w-4 h-4 text-blue-500" />
                                  전문 요약
                                </h3>
                                <p className="text-gray-700 leading-relaxed">{defaultResume.summary}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Key Highlights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Work Experience Highlight */}
                          {defaultResume.workHistory && Array.isArray(defaultResume.workHistory) && defaultResume.workHistory.length > 0 && (
                            <Card className="hover:shadow-lg transition-shadow">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Briefcase className="w-5 h-5 text-blue-500" />
                                  주요 경력
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {defaultResume.workHistory.slice(0, 2).map((work: any, index: number) => (
                                    <div key={index} className="border-l-4 border-blue-200 pl-4">
                                      <h4 className="font-semibold text-gray-900">{work.position}</h4>
                                      <p className="text-sm text-blue-600 font-medium">{work.company}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {work.startDate} - {work.current ? "재직중" : work.endDate}
                                      </p>
                                      {work.description && (
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                          {work.description}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                  {defaultResume.workHistory.length > 2 && (
                                    <p className="text-xs text-gray-500 text-center pt-2">
                                      +{defaultResume.workHistory.length - 2}개 더 보기
                                    </p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Education Highlight */}
                          {defaultResume.educationHistory && Array.isArray(defaultResume.educationHistory) && defaultResume.educationHistory.length > 0 && (
                            <Card className="hover:shadow-lg transition-shadow">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <GraduationCap className="w-5 h-5 text-green-500" />
                                  학력 사항
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {defaultResume.educationHistory.slice(0, 2).map((edu: any, index: number) => (
                                    <div key={index} className="border-l-4 border-green-200 pl-4">
                                      <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                                      {edu.field && <p className="text-sm text-green-600 font-medium">{edu.field}</p>}
                                      <p className="text-sm text-gray-600">{edu.institution}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {edu.startDate} - {edu.current ? "재학중" : edu.endDate}
                                      </p>
                                      {edu.gpa && (
                                        <p className="text-xs text-gray-600 mt-1">GPA: {edu.gpa}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Skills Highlight */}
                          {defaultResume.skillsAndLanguages?.technicalSkills && Array.isArray(defaultResume.skillsAndLanguages.technicalSkills) && defaultResume.skillsAndLanguages.technicalSkills.length > 0 && (
                            <Card className="hover:shadow-lg transition-shadow">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Code className="w-5 h-5 text-purple-500" />
                                  핵심 기술
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {defaultResume.skillsAndLanguages.technicalSkills.slice(0, 3).map((category: any, index: number) => (
                                    <div key={index}>
                                      <h4 className="font-medium text-purple-700 mb-2">{category.category}</h4>
                                      <div className="flex flex-wrap gap-1">
                                        {Array.isArray(category.skills) && category.skills.slice(0, 4).map((skill: any, skillIndex: number) => (
                                          <Badge key={`${index}-${skillIndex}`} variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                                            {skill.name || skill}
                                          </Badge>
                                        ))}
                                        {Array.isArray(category.skills) && category.skills.length > 4 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{category.skills.length - 4}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>

                        {/* Languages and Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Languages */}
                          {defaultResume.skillsAndLanguages?.languages && defaultResume.skillsAndLanguages.languages.length > 0 && (
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Globe className="w-5 h-5 text-indigo-500" />
                                  언어 능력
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {defaultResume.skillsAndLanguages.languages.map((lang: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                      <span className="font-medium">{lang.name}</span>
                                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                                        {lang.proficiency}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Contact Information */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Phone className="w-5 h-5 text-orange-500" />
                                연락처 정보
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {profile?.email && (
                                  <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">{profile.email}</span>
                                  </div>
                                )}
                                {profile?.phone && (
                                  <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">{profile.phone}</span>
                                  </div>
                                )}
                                {profile?.location && (
                                  <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">{profile.location}</span>
                                  </div>
                                )}
                                {profile?.userType && (
                                  <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">{profile.userType === 'candidate' ? '구직자' : profile.userType === 'employer' ? '채용담당자' : '관리자'}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Quick Actions */}
                        <Card className="bg-gray-50">
                          <CardContent className="p-6">
                            <div className="flex flex-wrap gap-3 justify-center">
                              <Button onClick={() => setActiveTab("resumes")} variant="outline" className="flex items-center gap-2">
                                <Edit className="w-4 h-4" />
                                이력서 편집
                              </Button>
                              <Button onClick={() => setActiveTab("resumes")} variant="outline" className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                이력서 다운로드
                              </Button>
                              <Button onClick={() => setActiveTab("jobs")} className="flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                일자리 찾기
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <Card className="border-2 border-dashed border-gray-300">
                        <CardContent className="text-center py-16">
                          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">메인 이력서가 없습니다</h3>
                          <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            프로필을 더욱 돋보이게 하려면 이력서를 작성하고 메인으로 설정해 보세요.
                            완성된 이력서가 여기에 멋지게 표시됩니다.
                          </p>
                          <Button onClick={() => setActiveTab("resumes")} size="lg" className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            이력서 작성하기
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )} */

                {/* Subscription Management Tab */}
                {activeTab === "subscription" && (
                  <div className="space-y-6">
                    {/* Current Subscription Status */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">구독 현황</h2>
                            <p className="text-sm text-muted-foreground font-normal">현재 구독 상태 및 혜택을 확인하세요</p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-purple-600 mb-1">
                              {subscription?.planType === 'premium' ? 'Premium' : subscription?.planType === 'pro' ? 'Pro' : 'Basic'}
                            </div>
                            <div className="text-sm text-gray-600">현재 플랜</div>
                            <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'} className="mt-2">
                              {subscription?.status === 'active' ? '활성' : '비활성'}
                            </Badge>
                          </div>
                          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('ko-KR') : '무제한'}
                            </div>
                            <div className="text-sm text-gray-600">만료일</div>
                          </div>
                          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              ₩{subscription?.price?.toLocaleString() || '0'}
                            </div>
                            <div className="text-sm text-gray-600">월 요금</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Subscription Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            현재 혜택
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm">무제한 이력서 생성</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm">프리미엄 템플릿 사용</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm">우선 지원 서비스</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm">고급 분석 도구</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            업그레이드 혜택
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">AI 이력서 최적화</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">채용공고 매칭 알림</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">면접 준비 가이드</span>
                            </div>
                          </div>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            <Award className="w-4 h-4 mr-2" />
                            프리미엄으로 업그레이드
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Payment History */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-gray-500" />
                          결제 내역
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium">Premium 플랜</div>
                              <div className="text-sm text-gray-600">2025년 6월 12일</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">₩29,900</div>
                              <Badge variant="outline" className="text-xs">완료</Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium">Pro 플랜</div>
                              <div className="text-sm text-gray-600">2025년 5월 12일</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">₩19,900</div>
                              <Badge variant="outline" className="text-xs">완료</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Activity History Tab */}
                {activeTab === "activity" && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Activity className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">활동 내역</h2>
                            <p className="text-sm text-muted-foreground font-normal">최근 플랫폼 활동을 확인하세요</p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    {/* Activity Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-blue-600">3</div>
                          <div className="text-sm text-gray-600">이력서 생성</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Search className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-green-600">12</div>
                          <div className="text-sm text-gray-600">지원한 공고</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Eye className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-purple-600">45</div>
                          <div className="text-sm text-gray-600">프로필 조회</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-orange-600">8</div>
                          <div className="text-sm text-gray-600">관심 공고</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Activity Timeline */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-gray-500" />
                          최근 활동
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">새 이력서를 생성했습니다</div>
                              <div className="text-sm text-gray-600">내 이력서001</div>
                              <div className="text-xs text-gray-500 mt-1">2시간 전</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Search className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">채용공고에 지원했습니다</div>
                              <div className="text-sm text-gray-600">DevOps 엔지니어 - 카카오</div>
                              <div className="text-xs text-gray-500 mt-1">1일 전</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Edit className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">프로필을 업데이트했습니다</div>
                              <div className="text-sm text-gray-600">경력 사항 추가</div>
                              <div className="text-xs text-gray-500 mt-1">3일 전</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Account Settings Tab */}
                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">계정 설정</h2>
                            <p className="text-sm text-muted-foreground font-normal">보안 및 개인정보 설정을 관리하세요</p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    {/* Privacy Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="w-5 h-5 text-blue-500" />
                          개인정보 설정
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">프로필 공개 여부</div>
                            <div className="text-sm text-gray-600">다른 사용자가 내 프로필을 볼 수 있습니다</div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            공개
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">이력서 공개 설정</div>
                            <div className="text-sm text-gray-600">채용담당자가 내 이력서를 검색할 수 있습니다</div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            제한적 공개
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-green-500" />
                          알림 설정
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">이메일 알림</div>
                            <div className="text-sm text-gray-600">새로운 채용공고 및 지원 현황을 이메일로 받아보세요</div>
                          </div>
                          <Button variant="outline" size="sm">
                            활성화됨
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">푸시 알림</div>
                            <div className="text-sm text-gray-600">실시간 알림을 받아보세요</div>
                          </div>
                          <Button variant="outline" size="sm">
                            활성화됨
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Account Management */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-red-500" />
                          계정 관리
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">비밀번호 변경</div>
                            <div className="text-sm text-gray-600">정기적으로 비밀번호를 변경하여 보안을 강화하세요</div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            변경
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                          <div>
                            <div className="font-medium text-red-800">계정 삭제</div>
                            <div className="text-sm text-red-600">계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다</div>
                          </div>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Resumes Tab */}
                {activeTab === "resumes" && (
                  <ErrorBoundary>
                    <ResumeManagement />
                  </ErrorBoundary>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}