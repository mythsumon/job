/** @format */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Calendar,
    MapPin,
    Mail,
    Phone,
    Briefcase,
    GraduationCap,
    Award,
    Edit3,
    Save,
    X,
    Camera,
    User,
    FileText,
    Globe,
    Quote,
    Code,
    Search,
    Download,
    Edit,
    Plus,
    CreditCard,
    Shield,
    Bell,
    Trash2,
    Eye,
    EyeOff,
    Activity,
    Clock,
    Target,
    Star,
    TrendingUp,
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ResumeManagement from "@/components/resume/ResumeManagement";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload";

const profileUpdateSchema = z.object({
    fullName: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
    email: z.string().email("올바른 이메일 주소를 입력해주세요"),
    phone: z.string().optional(),
    location: z.string().optional(),
    // Simplified profile fields for AI matching
    major: z.string().optional(),
    preferredIndustry: z.array(z.string()).optional(),
    dreamCompany: z.string().optional(),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

interface UserProfile {
    id: number;
    fullName: string;
    email: string;
    phone?: string | null;
    location?: string | null;
    bio?: string | null;
    profilePicture?: string | null;
    userType: string;
    username?: string;
    skills?: string[];
    experience?: string;
    education?: string;
    birthDate?: string;
    createdAt?: Date;
    // Simplified profile fields for AI matching
    major?: string | null;
    preferredIndustry?: string[] | null;
    dreamCompany?: string | null;
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
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("resumes");

    // Profile data query
    const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
        queryKey: ["/api/user/profile"],
        enabled: !!user,
    });

    // Subscription data query
    const { data: subscription } = useQuery<UserSubscription>({
        queryKey: ["/api/users/subscription"],
        enabled: !!user,
    });

    const form = useForm<ProfileUpdateForm>({
        resolver: zodResolver(profileUpdateSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            location: "",
            major: "",
            preferredIndustry: [],
            dreamCompany: "",
        },
    });

    // Update form values when profile data is loaded
    React.useEffect(() => {
        if (profile || user) {
            form.reset({
                fullName: profile?.fullName || user?.fullName || "",
                email: profile?.email || user?.email || "",
                phone: profile?.phone || user?.phone || "",
                location: profile?.location || user?.location || "",
                major: profile?.major ?? "",
                preferredIndustry: profile?.preferredIndustry ?? [],
                dreamCompany: profile?.dreamCompany ?? "",
            });
        }
    }, [profile, user, form]);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: ProfileUpdateForm) => {
            const token = localStorage.getItem("auth_token");
            console.log(
                "Profile update token:",
                token ? "Token exists" : "No token found"
            );

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
                console.log("Authorization header set");
            } else {
                console.error("No token available for profile update");
            }

            console.log("Making profile update request with headers:", headers);

            const response = await fetch("/api/user/profile", {
                method: "PUT",
                headers,
                body: JSON.stringify(data),
            });

            console.log("Profile update response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Profile update failed:", errorText);
                throw new Error("프로필 업데이트에 실패했습니다");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
            setIsEditing(false);
            toast({ title: "프로필이 성공적으로 업데이트되었습니다" });
        },
        onError: (error: Error) => {
            toast({
                title: "오류",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: ProfileUpdateForm) => {
        updateProfileMutation.mutate(data);
    };

    if (profileLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">
                                프로필을 불러오는 중...
                            </p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <ProfilePictureUpload
                                    currentPicture={
                                        profile?.profilePicture ||
                                        user?.profilePicture
                                    }
                                    fullName={
                                        profile?.fullName ||
                                        user?.fullName ||
                                        user?.username
                                    }
                                    onUploadSuccess={(profilePicture) => {
                                        queryClient.invalidateQueries({
                                            queryKey: ["/api/user/profile"],
                                        });
                                        queryClient.invalidateQueries({
                                            queryKey: ["/api/auth/user"],
                                        });
                                    }}
                                />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                        {profile?.fullName ||
                                            user?.fullName ||
                                            user?.username}
                                    </h1>
                                    <p className="text-gray-600 mb-2">
                                        {user?.userType === "candidate"
                                            ? "구직자"
                                            : user?.userType === "employer"
                                            ? "채용담당자"
                                            : "사용자"}
                                    </p>
                                    {profile?.location && (
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm">
                                                {profile.location}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {!isEditing ? (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        프로필 편집
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={form.handleSubmit(
                                                onSubmit
                                            )}
                                            disabled={
                                                updateProfileMutation.isPending
                                            }
                                            className="flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            {updateProfileMutation.isPending
                                                ? "저장 중..."
                                                : "저장"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            <X className="w-4 h-4" />
                                            취소
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Content Tabs */}
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="space-y-6"
                    >
                        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm rounded-lg p-1">
                            <TabsTrigger
                                value="resumes"
                                className="flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                이력서
                            </TabsTrigger>
                            <TabsTrigger
                                value="subscription"
                                className="flex items-center gap-2"
                            >
                                <CreditCard className="w-4 h-4" />
                                구독 관리
                            </TabsTrigger>
                            <TabsTrigger
                                value="activity"
                                className="flex items-center gap-2"
                            >
                                <Activity className="w-4 h-4" />
                                활동 내역
                            </TabsTrigger>
                            <TabsTrigger
                                value="settings"
                                className="flex items-center gap-2"
                            >
                                <Shield className="w-4 h-4" />
                                설정
                            </TabsTrigger>
                        </TabsList>

                        {isEditing ? (
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
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
                                                            <FormLabel>
                                                                이름
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    placeholder="이름을 입력하세요"
                                                                />
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
                                                            <FormLabel>
                                                                이메일 (변경
                                                                불가)
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    type="email"
                                                                    placeholder="이메일을 입력하세요"
                                                                    disabled
                                                                    className="bg-gray-100"
                                                                />
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
                                                            <FormLabel>
                                                                전화번호
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    placeholder="전화번호를 입력하세요"
                                                                />
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
                                                            <FormLabel>
                                                                위치
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    placeholder="위치를 입력하세요"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="major"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            전공
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="전공을 입력하세요"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Preferred Industries */}
                                            <FormField
                                                control={form.control}
                                                name="preferredIndustry"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            내가 일하고 싶은
                                                            분야 (복수 선택
                                                            가능)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                                                                {[
                                                                    "IT/소프트웨어",
                                                                    "게임",
                                                                    "핀테크",
                                                                    "이커머스",
                                                                    "스타트업",
                                                                    "대기업",
                                                                    "금융/은행",
                                                                    "제조업",
                                                                    "의료/헬스케어",
                                                                    "교육",
                                                                    "미디어/엔터테인먼트",
                                                                    "컨설팅",
                                                                    "마케팅/광고",
                                                                    "디자인",
                                                                    "물류/유통",
                                                                    "건설/부동산",
                                                                    "에너지",
                                                                    "공공기관",
                                                                ].map(
                                                                    (
                                                                        industry
                                                                    ) => (
                                                                        <label
                                                                            key={
                                                                                industry
                                                                            }
                                                                            className="flex items-center space-x-2 cursor-pointer"
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                                checked={
                                                                                    field.value?.includes(
                                                                                        industry
                                                                                    ) ||
                                                                                    false
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) => {
                                                                                    const currentValue =
                                                                                        field.value ||
                                                                                        [];
                                                                                    if (
                                                                                        e
                                                                                            .target
                                                                                            .checked
                                                                                    ) {
                                                                                        field.onChange(
                                                                                            [
                                                                                                ...currentValue,
                                                                                                industry,
                                                                                            ]
                                                                                        );
                                                                                    } else {
                                                                                        field.onChange(
                                                                                            currentValue.filter(
                                                                                                (
                                                                                                    item: string
                                                                                                ) =>
                                                                                                    item !==
                                                                                                    industry
                                                                                            )
                                                                                        );
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <span className="text-sm">
                                                                                {
                                                                                    industry
                                                                                }
                                                                            </span>
                                                                        </label>
                                                                    )
                                                                )}
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Dream Company */}
                                            <FormField
                                                control={form.control}
                                                name="dreamCompany"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            내 꿈의 직장
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="희망하는 회사명을 입력하세요"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                </form>
                            </Form>
                        ) : (
                            <div className="space-y-6">
                                {/* Subscription Management Tab */}
                                <TabsContent value="subscription">
                                    <div className="space-y-6">
                                        {/* Current Subscription Status */}
                                        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <CreditCard className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-bold">
                                                            구독 현황
                                                        </h2>
                                                        <p className="text-sm text-muted-foreground font-normal">
                                                            현재 구독 상태 및
                                                            혜택을 확인하세요
                                                        </p>
                                                    </div>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                                        <div className="text-2xl font-bold text-purple-600 mb-1">
                                                            {subscription?.planType ===
                                                            "premium"
                                                                ? "Premium"
                                                                : subscription?.planType ===
                                                                  "pro"
                                                                ? "Pro"
                                                                : "Basic"}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            현재 플랜
                                                        </div>
                                                        <Badge
                                                            variant={
                                                                subscription?.status ===
                                                                "active"
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                            className="mt-2"
                                                        >
                                                            {subscription?.status ===
                                                            "active"
                                                                ? "활성"
                                                                : "비활성"}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                                        <div className="text-2xl font-bold text-green-600 mb-1">
                                                            {subscription?.endDate
                                                                ? new Date(
                                                                      subscription.endDate
                                                                  ).toLocaleDateString(
                                                                      "ko-KR"
                                                                  )
                                                                : "무제한"}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            만료일
                                                        </div>
                                                    </div>
                                                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                                        <div className="text-2xl font-bold text-blue-600 mb-1">
                                                            ₩
                                                            {subscription?.price?.toLocaleString() ||
                                                                "0"}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            월 요금
                                                        </div>
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
                                                            <span className="text-sm">
                                                                무제한 이력서
                                                                생성
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            <span className="text-sm">
                                                                프리미엄 템플릿
                                                                사용
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            <span className="text-sm">
                                                                우선 지원 서비스
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            <span className="text-sm">
                                                                고급 분석 도구
                                                            </span>
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
                                                            <span className="text-sm">
                                                                AI 이력서 최적화
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                            <span className="text-sm">
                                                                채용공고 매칭
                                                                알림
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                            <span className="text-sm">
                                                                면접 준비 가이드
                                                            </span>
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
                                                            <div className="font-medium">
                                                                Premium 플랜
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                2025년 6월 12일
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-medium">
                                                                ₩29,900
                                                            </div>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                완료
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div>
                                                            <div className="font-medium">
                                                                Pro 플랜
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                2025년 5월 12일
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-medium">
                                                                ₩19,900
                                                            </div>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                완료
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                {/* Activity History Tab */}
                                <TabsContent value="activity">
                                    <div className="space-y-6">
                                        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <Activity className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-bold">
                                                            활동 내역
                                                        </h2>
                                                        <p className="text-sm text-muted-foreground font-normal">
                                                            최근 플랫폼 활동을
                                                            확인하세요
                                                        </p>
                                                    </div>
                                                </CardTitle>
                                            </CardHeader>
                                        </Card>

                                        {/* Activity Stats */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <Card>
                                                <CardContent className="p-4 text-center">
                                                    <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        3
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        이력서 생성
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="p-4 text-center">
                                                    <Search className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                                    <div className="text-2xl font-bold text-green-600">
                                                        12
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        지원한 공고
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="p-4 text-center">
                                                    <Eye className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                                    <div className="text-2xl font-bold text-purple-600">
                                                        45
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        프로필 조회
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="p-4 text-center">
                                                    <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                                                    <div className="text-2xl font-bold text-orange-600">
                                                        8
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        관심 공고
                                                    </div>
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
                                                            <div className="font-medium">
                                                                새 이력서를
                                                                생성했습니다
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                내 이력서001
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                2시간 전
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <Search className="w-4 h-4 text-green-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium">
                                                                채용공고에
                                                                지원했습니다
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                DevOps 엔지니어
                                                                - 카카오
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                1일 전
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <Edit className="w-4 h-4 text-purple-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium">
                                                                프로필을
                                                                업데이트했습니다
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                경력 사항 추가
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                3일 전
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                {/* Account Settings Tab */}
                                <TabsContent value="settings">
                                    <div className="space-y-6">
                                        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <Shield className="w-5 h-5 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-bold">
                                                            계정 설정
                                                        </h2>
                                                        <p className="text-sm text-muted-foreground font-normal">
                                                            보안 및 개인정보
                                                            설정을 관리하세요
                                                        </p>
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
                                                        <div className="font-medium">
                                                            프로필 공개 여부
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            다른 사용자가 내
                                                            프로필을 볼 수
                                                            있습니다
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        공개
                                                    </Button>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <div className="font-medium">
                                                            이력서 공개 설정
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            채용담당자가 내
                                                            이력서를 검색할 수
                                                            있습니다
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
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
                                                        <div className="font-medium">
                                                            이메일 알림
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            새로운 채용공고 및
                                                            지원 현황을 이메일로
                                                            받아보세요
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        활성화됨
                                                    </Button>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <div className="font-medium">
                                                            푸시 알림
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            실시간 알림을
                                                            받아보세요
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
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
                                                        <div className="font-medium">
                                                            비밀번호 변경
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            정기적으로
                                                            비밀번호를 변경하여
                                                            보안을 강화하세요
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        변경
                                                    </Button>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                                                    <div>
                                                        <div className="font-medium text-red-800">
                                                            계정 삭제
                                                        </div>
                                                        <div className="text-sm text-red-600">
                                                            계정을 삭제하면 모든
                                                            데이터가 영구적으로
                                                            삭제됩니다
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        삭제
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                {/* Resumes Tab */}
                                <TabsContent value="resumes">
                                    <ErrorBoundary>
                                        <ResumeManagement />
                                    </ErrorBoundary>
                                </TabsContent>
                            </div>
                        )}
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    );
}
