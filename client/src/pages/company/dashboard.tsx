import { Link } from "wouter";
import { CompanyLayout } from "@/components/company/company-layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  FileText,
  Calendar,
  Award,
  Target,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  MessageSquare,
  UserSearch,
  BarChart3,
  Settings,
  Building2,
  Sparkles,
  Palette,
  GitBranch,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  TrendingDown as TrendingDownIcon,
  Zap,
  Activity,
  Bell,
  CheckCircle,
  XCircle,
  Circle,
  User,
  Shield,
} from "lucide-react";
import { CareerSection } from "@/components/career/career-section";
import { FeedSection } from "@/components/feed/feed-section";
import { useAuth } from "@/hooks/useAuth";





export default function CompanyDashboard() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();

  const candidateSourceData = [
    { name: t("companyDashboard.directApplication"), value: 45, color: "#3B82F6" },
    { name: t("companyDashboard.headhunting"), value: 25, color: "#8B5CF6" },
    { name: t("companyDashboard.referral"), value: 20, color: "#10B981" },
    { name: t("companyDashboard.social"), value: 10, color: "#F59E0B" },
  ];

  const recentApplications = [
    {
      id: 1,
      name: "김민수",
      position: t("companyDashboard.frontendDeveloper"),
      experience: `3${t("companyDashboard.years")}`,
      status: t("companyDashboard.interviewPending"),
      appliedAt: `2${t("companyDashboard.hoursAgo")}`,
      avatar: "KM",
    },
    {
      id: 2,
      name: "이지현",
      position: t("companyDashboard.backendDeveloper"),
      experience: `5${t("companyDashboard.years")}`,
      status: t("companyDashboard.documentReview"),
      appliedAt: `4${t("companyDashboard.hoursAgo")}`,
      avatar: "LJ",
    },
    {
      id: 3,
      name: "박준호",
      position: t("companyDashboard.dataAnalyst"),
      experience: `2${t("companyDashboard.years")}`,
      status: t("companyDashboard.firstRoundPassed"),
      appliedAt: `6${t("companyDashboard.hoursAgo")}`,
      avatar: "PJ",
    },
  ];

  const upcomingInterviews = [
    {
      id: 1,
      candidate: "김민수",
      position: t("companyDashboard.frontendDeveloper"),
      time: `${t("companyDashboard.today")} 14:00`,
      type: t("companyDashboard.faceToFaceInterview"),
    },
    {
      id: 2,
      candidate: "이지현",
      position: t("companyDashboard.backendDeveloper"), 
      time: `${t("companyDashboard.tomorrow")} 10:00`,
      type: t("companyDashboard.faceToFaceInterview"),
    },
  ];

  const applicationTrendData = [
    { name: t("companyDashboard.jan"), applications: 65, hired: 4 },
    { name: t("companyDashboard.feb"), applications: 89, hired: 6 },
    { name: t("companyDashboard.mar"), applications: 120, hired: 8 },
    { name: t("companyDashboard.apr"), applications: 156, hired: 12 },
    { name: t("companyDashboard.may"), applications: 189, hired: 15 },
    { name: t("companyDashboard.jun"), applications: 248, hired: 18 },
  ];

  const jobPerformanceData = [
    { name: t("companyDashboard.frontendDeveloper"), applications: 45, views: 1250 },
    { name: t("companyDashboard.backendDeveloper"), applications: 38, views: 980 },
    { name: t("companyDashboard.dataAnalyst"), applications: 32, views: 720 },
    { name: t("companyDashboard.marketingManager"), applications: 28, views: 650 },
    { name: t("companyDashboard.uiuxDesigner"), applications: 25, views: 580 },
  ];

  const statsData = [
    {
      title: t("companyDashboard.totalJobs"),
      value: "12",
      change: "+2",
      trend: "up",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: t("companyDashboard.monthlyApplicants"),
      value: "248",
      change: "+18%",
      trend: "up",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: t("companyDashboard.jobViews"),
      value: "12,456",
      change: "+8%",
      trend: "up",
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: t("companyDashboard.interviewsScheduled"),
      value: "8",
      change: "-2",
      trend: "down",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  // Active Jobs Data
  const activeJobs = [
    {
      id: 1,
      title: t("companyDashboard.frontendDeveloper"),
      department: t("companyDashboard.developmentTeam"),
      location: t("companyDashboard.seoulGangnam"),
      applications: 45,
      views: 1250,
      status: "active",
      postedAt: "2024-06-01",
      deadline: "2024-06-30",
    },
    {
      id: 2,
      title: t("companyDashboard.backendDeveloper"),
      department: t("companyDashboard.developmentTeam"),
      location: t("companyDashboard.seoulGangnam"),
      applications: 38,
      views: 980,
      status: "active",
      postedAt: "2024-06-05",
      deadline: "2024-07-05",
    },
    {
      id: 3,
      title: t("companyDashboard.dataAnalyst"),
      department: t("companyDashboard.dataTeam"),
      location: t("companyDashboard.seoulSeocho"),
      applications: 32,
      views: 720,
      status: "active",
      postedAt: "2024-06-10",
      deadline: "2024-07-10",
    },
  ];

  // Pipeline Status
  const pipelineStatus = [
    { stage: t("companyDashboard.stageReview"), count: 12, color: "bg-yellow-500" },
    { stage: t("companyDashboard.stageInterview"), count: 8, color: "bg-blue-500" },
    { stage: t("companyDashboard.stageOffer"), count: 3, color: "bg-green-500" },
    { stage: t("companyDashboard.stageHired"), count: 5, color: "bg-purple-500" },
  ];

  // Priority Tasks
  const priorityTasks = [
    {
      id: 1,
      title: t("companyDashboard.taskReviewApplications"),
      description: t("companyDashboard.taskReviewApplicationsDesc"),
      priority: "high",
      dueDate: t("companyDashboard.today"),
      link: "/company/applications?status=pending",
    },
    {
      id: 2,
      title: t("companyDashboard.taskScheduleInterviews"),
      description: t("companyDashboard.taskScheduleInterviewsDesc"),
      priority: "medium",
      dueDate: t("companyDashboard.tomorrow"),
      link: "/company/interviews",
    },
    {
      id: 3,
      title: t("companyDashboard.taskUpdateJobPosting"),
      description: t("companyDashboard.taskUpdateJobPostingDesc"),
      priority: "low",
      dueDate: `3 ${t("companyDashboard.daysLater")}`,
      link: "/company/jobs",
    },
  ];

  // Recent Activity Timeline
  const recentActivities = [
    {
      id: 1,
      type: "application",
      message: t("companyDashboard.activityNewApplication"),
      time: `2 ${t("companyDashboard.hoursAgo")}`,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      id: 2,
      type: "interview",
      message: t("companyDashboard.activityInterviewScheduled"),
      time: `4 ${t("companyDashboard.hoursAgo")}`,
      icon: Calendar,
      color: "text-green-600",
    },
    {
      id: 3,
      type: "job",
      message: t("companyDashboard.activityJobPosted"),
      time: `1 ${t("companyDashboard.daysAgo")}`,
      icon: Briefcase,
      color: "text-purple-600",
    },
    {
      id: 4,
      type: "hired",
      message: t("companyDashboard.activityHired"),
      time: `2 ${t("companyDashboard.daysAgo")}`,
      icon: CheckCircle,
      color: "text-green-600",
    },
  ];

  // Performance Goals
  const performanceGoals = [
    {
      title: t("companyDashboard.goalMonthlyHires"),
      current: 5,
      target: 10,
      unit: t("companyDashboard.people"),
    },
    {
      title: t("companyDashboard.goalApplicationResponse"),
      current: 85,
      target: 90,
      unit: "%",
    },
    {
      title: t("companyDashboard.goalInterviewCompletion"),
      current: 70,
      target: 80,
      unit: "%",
    },
  ];

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("companyNav.dashboard")}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("companyDashboard.subtitle")}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  {language === "ko" ? "한국어" : language === "en" ? "English" : "Монгол"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("ko")}>
                  한국어
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("mn")}>
                  Монгол
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/user/home">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {t("companyNav.backToUser")}
              </Button>
            </Link>
            {(user?.userType === 'admin' || user?.role === 'admin') && (
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  관리자 대시보드
                </Button>
              </Link>
            )}
            <Link href="/company/jobs?action=create">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                {t("companyDashboard.postNewJob")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("companyDashboard.quickActions")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("companyDashboard.quickActionsDescription")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Link href="/company/jobs?action=create">
                <Button 
                  variant="outline" 
                  className="w-full h-auto flex-col py-4 space-y-2 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                >
                  <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium">{t("companyDashboard.postNewJob")}</span>
                </Button>
              </Link>
              <Link href="/company/applications">
                <Button 
                  variant="outline" 
                  className="w-full h-auto flex-col py-4 space-y-2 hover:bg-green-50 dark:hover:bg-green-950/50 hover:border-green-300 dark:hover:border-green-700 transition-all"
                >
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium">{t("companyNav.applications")}</span>
                </Button>
              </Link>
              <Link href="/company/chat">
                <Button 
                  variant="outline" 
                  className="w-full h-auto flex-col py-4 space-y-2 hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:border-orange-300 dark:hover:border-orange-700 transition-all"
                >
                  <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-medium">{t("companyNav.chat")}</span>
                </Button>
              </Link>
              <Link href="/company/analytics">
                <Button 
                  variant="outline" 
                  className="w-full h-auto flex-col py-4 space-y-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-medium">{t("companyNav.analytics")}</span>
                </Button>
              </Link>
              <Link href="/company/settings">
                <Button 
                  variant="outline" 
                  className="w-full h-auto flex-col py-4 space-y-2 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                >
                  <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs font-medium">{t("companyNav.settings")}</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            // Determine link based on stat type
            const getStatLink = () => {
              if (stat.title === t("companyDashboard.totalJobs")) return "/company/jobs";
              if (stat.title === t("companyDashboard.monthlyApplicants")) return "/company/applications";
              if (stat.title === t("companyDashboard.jobViews")) return "/company/analytics";
              if (stat.title === t("companyDashboard.interviewsScheduled")) return "/company/interviews";
              return null;
            };
            const statLink = getStatLink();
            
            const cardContent = (
              <Card className={`border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 ${statLink ? 'hover:shadow-xl transition-shadow cursor-pointer' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                      <div className="flex items-center mt-2">
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={`text-sm font-medium ml-1 ${
                            stat.trend === "up" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">{t("companyDashboard.comparedToLastWeek")}</span>
                      </div>
                    </div>
                    <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            
            return (
              <div key={index}>
                {statLink ? (
                  <Link href={statLink}>
                    {cardContent}
                  </Link>
                ) : (
                  cardContent
                )}
              </div>
            );
          })}
        </div>

        {/* Active Jobs Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                {t("companyDashboard.activeJobs")}
              </CardTitle>
              <Link href="/company/jobs">
                <Button variant="ghost" size="sm">
                  {t("common.viewAll")} →
                </Button>
              </Link>
            </div>
            <CardDescription>
              {t("companyDashboard.activeJobsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <Link key={job.id} href={`/company/jobs?id=${job.id}`}>
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {job.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {job.department} • {job.location}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {job.applications}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t("companyDashboard.applications")}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {job.views.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t("companyDashboard.views")}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {t("companyDashboard.active")}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Application Trend */}
          <Link href="/company/analytics">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  {t("companyDashboard.applicationTrends")}
                </CardTitle>
                <CardDescription>{t("companyDashboard.applicationTrendDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={applicationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      name={t("companyDashboard.applicants")}
                    />
                    <Area
                      type="monotone"
                      dataKey="hired"
                      stackId="2"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.8}
                      name={t("companyDashboard.hired")}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Link>

          {/* Job Performance */}
          <Link href="/company/jobs">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-600" />
                  {t("companyDashboard.topPerformingJobs")}
                </CardTitle>
                <CardDescription>{t("companyDashboard.jobPerformanceDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={jobPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#8B5CF6" name={t("companyDashboard.views")} />
                    <Bar dataKey="applications" fill="#3B82F6" name={t("companyDashboard.applicantCount")} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Pipeline Status & Performance Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitBranch className="h-5 w-5 mr-2 text-indigo-600" />
                {t("companyDashboard.pipelineStatus") || "채용 파이프라인 현황"}
              </CardTitle>
              <CardDescription>
                {t("companyDashboard.pipelineStatusDescription") || "단계별 지원자 현황"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineStatus.map((stage, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stage.stage}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {stage.count}
                      </span>
                    </div>
                    <Progress 
                      value={(stage.count / pipelineStatus.reduce((sum, s) => sum + s.count, 0)) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
                <Link href="/company/pipeline">
                  <Button variant="ghost" className="w-full mt-4">
                    {t("companyDashboard.viewPipeline") || "파이프라인 상세 보기"} →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Performance Goals */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                {t("companyDashboard.performanceGoals") || "성과 목표"}
              </CardTitle>
              <CardDescription>
                {t("companyDashboard.performanceGoalsDescription") || "이번 달 목표 대비 진행률"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceGoals.map((goal, index) => {
                  const percentage = (goal.current / goal.target) * 100;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {goal.title}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {goal.current} / {goal.target} {goal.unit}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {percentage.toFixed(0)}% {t("companyDashboard.completed") || "완료"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Tasks & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority Tasks */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                {t("companyDashboard.priorityTasks") || "우선순위 작업"}
              </CardTitle>
              <CardDescription>
                {t("companyDashboard.priorityTasksDescription") || "즉시 처리해야 할 작업들"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priorityTasks.map((task) => (
                  <Link key={task.id} href={task.link}>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {task.priority === "high" && (
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            )}
                            {task.priority === "medium" && (
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            )}
                            {task.priority === "low" && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                              {task.title}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            {task.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            {t("companyDashboard.dueDate")}: {task.dueDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Timeline */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-purple-600" />
                {t("companyDashboard.recentActivityTimeline") || "최근 활동"}
              </CardTitle>
              <CardDescription>
                {t("companyDashboard.recentActivityTimelineDescription") || "최근 발생한 주요 활동"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`${activity.color} p-2 rounded-lg bg-opacity-10`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <Link href="/company/applications">
                  <Button variant="ghost" className="w-full mt-2">
                    {t("companyDashboard.viewAllActivity")} →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidate Sources */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                {t("companyDashboard.candidateSourceAnalysis")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={candidateSourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {candidateSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                {t("companyDashboard.recentActivity")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <Link key={application.id} href={`/company/applications?applicant=${application.id}`}>
                    <div className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {application.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {application.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {application.position} • {application.experience}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={application.status === t("companyDashboard.interviewPending") ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {application.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{application.appliedAt}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link href="/company/applications">
                  <Button variant="ghost" className="w-full mt-2">
                    {t("companyDashboard.viewAllApplications")} →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-red-600" />
                  {t("companyDashboard.upcomingInterviews")}
                </CardTitle>
              </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <Link key={interview.id} href={`/company/interviews?interview=${interview.id}`}>
                    <div className="border-l-4 border-blue-500 pl-4 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {interview.candidate}
                          </p>
                          <p className="text-xs text-gray-500">{interview.position}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {interview.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-blue-600 font-medium mt-1">{interview.time}</p>
                    </div>
                  </Link>
                ))}
                <Link href="/company/interviews">
                  <Button variant="ghost" className="w-full mt-2">
                    {t("companyDashboard.viewAllInterviews")} →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              {t("companyDashboard.quickLinks") || "빠른 링크"}
            </CardTitle>
            <CardDescription>
              {t("companyDashboard.quickLinksDescription") || "자주 방문하는 페이지로 빠르게 이동하세요"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Link href="/company/jobs">
                <Button variant="outline" className="w-full flex-col h-auto py-3 space-y-1">
                  <Briefcase className="h-5 w-5" />
                  <span className="text-xs">{t("companyNav.jobs")}</span>
                </Button>
              </Link>
              <Link href="/company/applications">
                <Button variant="outline" className="w-full flex-col h-auto py-3 space-y-1">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">{t("companyNav.applications")}</span>
                </Button>
              </Link>
              <Link href="/company/pipeline">
                <Button variant="outline" className="w-full flex-col h-auto py-3 space-y-1">
                  <GitBranch className="h-5 w-5" />
                  <span className="text-xs">{t("companyNav.pipeline")}</span>
                </Button>
              </Link>
              <Link href="/company/interviews">
                <Button variant="outline" className="w-full flex-col h-auto py-3 space-y-1">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs">{t("companyNav.interviews")}</span>
                </Button>
              </Link>
              <Link href="/company/recommendations">
                <Button variant="outline" className="w-full flex-col h-auto py-3 space-y-1">
                  <UserSearch className="h-5 w-5" />
                  <span className="text-xs">{t("companyNav.recommendations") || "인재 추천"}</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Career & Community Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <CareerSection compact={true} showHeader={false} />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <FeedSection compact={true} showCreatePost={true} />
            </CardContent>
          </Card>
        </div>
      </div>
    </CompanyLayout>
  );
}