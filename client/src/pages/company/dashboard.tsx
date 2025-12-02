import { CompanyLayout } from "@/components/company/company-layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";





export default function CompanyDashboard() {
  const { t } = useLanguage();

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
      type: t("companyDashboard.videoInterview"),
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
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              {t("companyDashboard.postNewJob")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
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
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Application Trend */}
          <Card className="border-0 shadow-lg">
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

          {/* Job Performance */}
          <Card className="border-0 shadow-lg">
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
                  <div key={application.id} className="flex items-center space-x-3">
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
                        variant={application.status === "면접 대기" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {application.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{application.appliedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-red-600" />
                예정된 면접
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="border-l-4 border-blue-500 pl-4">
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CompanyLayout>
  );
}