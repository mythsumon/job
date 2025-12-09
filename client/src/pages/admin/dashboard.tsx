import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Building2, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  UserCheck,
  Activity,
  AlertCircle,
  BarChart3,
  PieChart,
  Calendar
} from "lucide-react";
import { CareerSection } from "@/components/career/career-section";
import { FeedSection } from "@/components/feed/feed-section";

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats", selectedPeriod],
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/admin/recent-activity"],
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/admin/payments/recent"],
  });

  const statsCards = [
    {
      title: "총 사용자",
      value: (stats as any)?.totalUsers || 0,
      change: (stats as any)?.userGrowth || 0,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "등록된 기업",
      value: (stats as any)?.totalCompanies || 0,
      change: (stats as any)?.companyGrowth || 0,
      icon: Building2,
      color: "text-green-600",
    },
    {
      title: "활성 채용공고",
      value: (stats as any)?.activeJobs || 0,
      change: (stats as any)?.jobGrowth || 0,
      icon: Briefcase,
      color: "text-purple-600",
    },
    {
      title: "월 매출",
      value: `${((stats as any)?.monthlyRevenue || 0).toLocaleString()}원`,
      change: (stats as any)?.revenueGrowth || 0,
      icon: DollarSign,
      color: "text-orange-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            관리자 대시보드
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            WorkMongolia 플랫폼 운영 현황을 한눈에 확인하세요
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex gap-2">
            {[
              { value: "1d", label: "1일" },
              { value: "7d", label: "7일" },
              { value: "30d", label: "30일" },
              { value: "90d", label: "90일" },
            ].map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span className={stat.change >= 0 ? "text-green-600" : "text-red-600"}>
                      {stat.change >= 0 ? "+" : ""}{stat.change}%
                    </span>
                    <span className="ml-1">지난 기간 대비</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="payments">정산 관리</TabsTrigger>
            <TabsTrigger value="activity">활동 로그</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    매출 추이
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    매출 차트 영역
                  </div>
                </CardContent>
              </Card>

              {/* User Growth Chart */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    사용자 증가율
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    사용자 증가 차트 영역
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  최근 활동
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : recentActivity?.length ? (
                    recentActivity.map((activity: any) => (
                      <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-blue-500 rounded-full" />
                          <span className="text-sm">{activity.description}</span>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      최근 활동이 없습니다
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>사용자 관리</CardTitle>
                <CardDescription>
                  플랫폼 사용자들을 관리하고 모니터링합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  사용자 관리 기능이 여기에 표시됩니다
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>정산 관리</CardTitle>
                <CardDescription>
                  결제 내역과 정산을 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentsLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : payments?.length ? (
                    payments.map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium">{payment.description}</div>
                          <div className="text-sm text-gray-500">{payment.user?.fullName}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{payment.amount.toLocaleString()}원</div>
                          <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                            {payment.status === "completed" ? "완료" : "대기중"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      최근 결제 내역이 없습니다
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>시스템 활동 로그</CardTitle>
                <CardDescription>
                  관리자 활동과 시스템 로그를 확인합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  활동 로그가 여기에 표시됩니다
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Career & Community Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardContent className="p-6">
              <CareerSection compact={true} showHeader={false} />
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardContent className="p-6">
              <FeedSection compact={true} showCreatePost={true} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}