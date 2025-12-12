import { CompanyLayout } from "@/components/company/company-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Download,
  Filter,
  BarChart3,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const performanceData = [
  { month: "1월", applications: 85, hires: 6, views: 2400 },
  { month: "2월", applications: 120, hires: 8, views: 3200 },
  { month: "3월", applications: 156, hires: 12, views: 4100 },
  { month: "4월", applications: 198, hires: 15, views: 5200 },
  { month: "5월", applications: 234, hires: 18, views: 6800 },
  { month: "6월", applications: 287, hires: 22, views: 8500 },
];

const jobAnalyticsData = [
  { job: "프론트엔드 개발자", applications: 45, views: 1250, conversionRate: 3.6 },
  { job: "백엔드 개발자", applications: 38, views: 980, conversionRate: 3.9 },
  { job: "데이터 분석가", applications: 32, views: 720, conversionRate: 4.4 },
  { job: "UI/UX 디자이너", applications: 28, views: 650, conversionRate: 4.3 },
  { job: "마케팅 매니저", applications: 25, views: 580, conversionRate: 4.3 },
];

const sourceAnalyticsData = [
  { name: "직접 지원", value: 42, color: "#3B82F6" },
  { name: "추천", value: 28, color: "#10B981" },
  { name: "헤드헌팅", value: 18, color: "#8B5CF6" },
  { name: "SNS", value: 12, color: "#F59E0B" },
];

const timeToHireData = [
  { position: "프론트엔드", averageDays: 28, industry: 32 },
  { position: "백엔드", averageDays: 25, industry: 30 },
  { position: "데이터", averageDays: 35, industry: 38 },
  { position: "디자이너", averageDays: 22, industry: 26 },
  { position: "마케팅", averageDays: 18, industry: 22 },
];

const competitorData = [
  { metric: "평균 지원자 수", us: 42, competitor1: 38, competitor2: 45 },
  { metric: "채용 성공률", us: 12.5, competitor1: 10.2, competitor2: 11.8 },
  { metric: "평균 채용 기간", us: 26, competitor1: 32, competitor2: 29 },
  { metric: "지원자 만족도", us: 4.3, competitor1: 3.9, competitor2: 4.1 },
];

const kpiData = [
  {
    title: "이번 달 지원자",
    value: "287",
    change: "+18.2%",
    trend: "up",
    target: "300",
    progress: 95.7,
  },
  {
    title: "채용 성공률",
    value: "12.5%",
    change: "+2.1%",
    trend: "up",
    target: "15%",
    progress: 83.3,
  },
  {
    title: "평균 채용 기간",
    value: "26일",
    change: "-3일",
    trend: "up",
    target: "25일",
    progress: 92.3,
  },
  {
    title: "지원자 만족도",
    value: "4.3/5",
    change: "+0.2",
    trend: "up",
    target: "4.5",
    progress: 95.6,
  },
];

export default function CompanyAnalytics() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("30days");

  const handleDownloadReport = () => {
    // Create a mock CSV report
    const csvContent = `Period,Applications,Hires,Views
${selectedPeriod},287,22,8500`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: t("common.success") || "성공",
      description: "리포트가 다운로드되었습니다.",
    });
  };

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('companyAnalytics.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('companyAnalytics.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('companyAnalytics.selectPeriod')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">{t('companyAnalytics.periods.last7Days')}</SelectItem>
                <SelectItem value="30days">{t('companyAnalytics.periods.last30Days')}</SelectItem>
                <SelectItem value="90days">{t('companyAnalytics.periods.last3Months')}</SelectItem>
                <SelectItem value="1year">{t('companyAnalytics.periods.lastYear')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-2" />
              {t('companyAnalytics.downloadReport')}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t(`companyAnalytics.kpi.${kpi.title.replace(/\s+/g, '').toLowerCase()}`)}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {kpi.value}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      {kpi.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ml-1 ${
                          kpi.trend === "up" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('companyAnalytics.target')}: {kpi.target}</span>
                    <span className="text-blue-600 font-medium">{kpi.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${kpi.progress}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">{t('companyAnalytics.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="jobs">{t('companyAnalytics.tabs.byJob')}</TabsTrigger>
            <TabsTrigger value="sources">{t('companyAnalytics.tabs.sources')}</TabsTrigger>
            <TabsTrigger value="timeline">{t('companyAnalytics.tabs.timeline')}</TabsTrigger>
            <TabsTrigger value="comparison">{t('companyAnalytics.tabs.comparison')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    {t('companyAnalytics.monthlyPerformance')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="applications" fill="#3B82F6" name={t('companyAnalytics.applications')} />
                      <Bar dataKey="hires" fill="#10B981" name={t('companyAnalytics.hires')} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    {t('companyAnalytics.viewsTrend')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#8B5CF6" strokeWidth={3} name={t('companyAnalytics.views')} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>{t('companyAnalytics.jobPerformance')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">{t('companyAnalytics.jobTitle')}</th>
                        <th className="text-left py-3 px-4">{t('companyAnalytics.applications')}</th>
                        <th className="text-left py-3 px-4">{t('companyAnalytics.views')}</th>
                        <th className="text-left py-3 px-4">{t('companyAnalytics.conversionRate')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobAnalyticsData.map((job, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4 font-medium">{job.job}</td>
                          <td className="py-3 px-4">{job.applications}</td>
                          <td className="py-3 px-4">{job.views.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-green-100 text-green-800">
                              {job.conversionRate}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>{t('companyAnalytics.applicationSources')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sourceAnalyticsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sourceAnalyticsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>{t('companyAnalytics.sourceBreakdown')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sourceAnalyticsData.map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: source.color }}
                          ></div>
                          <span className="font-medium">{source.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold">{source.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-purple-600" />
                  {t('companyAnalytics.timeToHire')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={timeToHireData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="position" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="averageDays" fill="#8B5CF6" name={t('companyAnalytics.ourAverage')} />
                    <Bar dataKey="industry" fill="#E5E7EB" name={t('companyAnalytics.industryAverage')} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-orange-600" />
                  {t('companyAnalytics.competitorComparison')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">{t('companyAnalytics.metric')}</th>
                        <th className="text-left py-3 px-4">{t('companyAnalytics.us')}</th>
                        <th className="text-left py-3 px-4">{t('companyAnalytics.competitor')} A</th>
                        <th className="text-left py-3 px-4">{t('companyAnalytics.competitor')} B</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitorData.map((data, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4 font-medium">{data.metric}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-blue-100 text-blue-800">
                              {data.us}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{data.competitor1}</td>
                          <td className="py-3 px-4">{data.competitor2}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CompanyLayout>
  );
}