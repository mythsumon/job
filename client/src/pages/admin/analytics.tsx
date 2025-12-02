import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Users, Building, Briefcase, Download, RefreshCw, BarChart3 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/admin/admin-layout';

export default function AdminAnalytics() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30일 전
    to: new Date().toISOString().split('T')[0] // 오늘
  });

  const { data: analyticsResponse, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/analytics', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        dateFrom: dateRange.from,
        dateTo: dateRange.to
      });
      const response = await fetch(`/api/admin/analytics?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      return result;
    }
  });

  const analytics = analyticsResponse?.data || [];

  const generateAnalyticsMutation = useMutation({
    mutationFn: async (date: string) => {
      const response = await fetch('/api/admin/analytics/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ date })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: '일일 분석이 생성되었습니다' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics'] });
    },
    onError: () => {
      toast({ title: '분석 생성에 실패했습니다', variant: 'destructive' });
    }
  });

  // 최신 분석 데이터 (가장 최근 날짜)
  const latestAnalytics = analytics?.length > 0 ? analytics[0] : null;

  // 전체 기간 합계 계산
  const totals = analytics?.reduce((acc: any, item: any) => ({
    totalRevenue: (parseFloat(acc.totalRevenue) + parseFloat(item.total_revenue || 0)).toString(),
    newUsers: acc.newUsers + (item.new_users || 0),
    newCompanies: acc.newCompanies + (item.new_companies || 0),
    newJobs: acc.newJobs + (item.new_jobs || 0),
    totalApplications: acc.totalApplications + (item.total_applications || 0)
  }), {
    totalRevenue: '0',
    newUsers: 0,
    newCompanies: 0,
    newJobs: 0,
    totalApplications: 0
  }) || {
    totalRevenue: '0',
    newUsers: 0,
    newCompanies: 0,
    newJobs: 0,
    totalApplications: 0
  };

  const exportAnalytics = () => {
    if (!analytics || analytics.length === 0) return;
    
    const csvContent = [
      ['날짜', '총 수익', '채용공고 수익', '구독 수익', '총 사용자', '신규 사용자', '총 회사', '신규 회사', '총 채용공고', '신규 채용공고', '총 지원'],
      ...analytics.map((item: any) => [
        item.date,
        item.total_revenue || 0,
        item.job_posting_revenue || 0,
        item.subscription_revenue || 0,
        item.total_users || 0,
        item.new_users || 0,
        item.total_companies || 0,
        item.new_companies || 0,
        item.total_jobs || 0,
        item.new_jobs || 0,
        item.total_applications || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_${dateRange.from}_${dateRange.to}.csv`;
    link.click();
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('mn-MN', {
      style: 'currency',
      currency: 'MNT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('mn-MN').format(num);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">플랫폼 분석</h1>
            <p className="text-muted-foreground">비즈니스 성과 및 사용자 통계</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              새로고침
            </Button>
            <Button onClick={exportAnalytics} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              내보내기
            </Button>
            <Button 
              onClick={() => generateAnalyticsMutation.mutate(new Date().toISOString().split('T')[0])}
              className="gap-2"
              disabled={generateAnalyticsMutation.isPending}
            >
              <BarChart3 className="h-4 w-4" />
              {generateAnalyticsMutation.isPending ? '생성 중...' : '오늘 분석 생성'}
            </Button>
          </div>
        </div>

        {/* 날짜 범위 선택 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              기간 선택
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">시작일</label>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">종료일</label>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">빠른 선택</label>
                <Select onValueChange={(value) => {
                  const today = new Date();
                  const days = parseInt(value);
                  setDateRange({
                    from: new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    to: today.toISOString().split('T')[0]
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="기간 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">지난 7일</SelectItem>
                    <SelectItem value="30">지난 30일</SelectItem>
                    <SelectItem value="90">지난 90일</SelectItem>
                    <SelectItem value="365">지난 1년</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* 주요 지표 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 수익</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totals.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    선택된 기간 동안
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">신규 사용자</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(totals.newUsers)}</div>
                  <p className="text-xs text-muted-foreground">
                    총 사용자: {latestAnalytics ? formatNumber(latestAnalytics.total_users) : 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">신규 회사</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(totals.newCompanies)}</div>
                  <p className="text-xs text-muted-foreground">
                    총 회사: {latestAnalytics ? formatNumber(latestAnalytics.total_companies) : 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">신규 채용공고</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(totals.newJobs)}</div>
                  <p className="text-xs text-muted-foreground">
                    총 채용공고: {latestAnalytics ? formatNumber(latestAnalytics.total_jobs) : 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 상세 분석 테이블 */}
            <Card>
              <CardHeader>
                <CardTitle>일별 상세 분석</CardTitle>
                <CardDescription>
                  선택된 기간의 일별 성과 데이터
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics && analytics.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">날짜</th>
                          <th className="text-right p-3">총 수익</th>
                          <th className="text-right p-3">채용공고 수익</th>
                          <th className="text-right p-3">신규 사용자</th>
                          <th className="text-right p-3">신규 회사</th>
                          <th className="text-right p-3">신규 채용공고</th>
                          <th className="text-right p-3">총 지원</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.map((item: any, index: number) => (
                          <tr key={item.date} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                            <td className="p-3 font-medium">
                              {new Date(item.date).toLocaleDateString('ko-KR')}
                            </td>
                            <td className="p-3 text-right font-medium">
                              {formatCurrency(item.total_revenue || 0)}
                            </td>
                            <td className="p-3 text-right">
                              {formatCurrency(item.job_posting_revenue || 0)}
                            </td>
                            <td className="p-3 text-right">
                              <Badge variant="secondary">
                                +{formatNumber(item.new_users || 0)}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <Badge variant="secondary">
                                +{formatNumber(item.new_companies || 0)}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <Badge variant="secondary">
                                +{formatNumber(item.new_jobs || 0)}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              {formatNumber(item.total_applications || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">분석 데이터가 없습니다</h3>
                    <p className="text-muted-foreground mb-4">선택된 기간에 대한 분석 데이터가 없습니다</p>
                    <Button onClick={() => generateAnalyticsMutation.mutate(new Date().toISOString().split('T')[0])}>
                      오늘 분석 생성
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 수익 분석 */}
            {latestAnalytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>수익 구성</CardTitle>
                    <CardDescription>최근 데이터 기준</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>채용공고 수익</span>
                      <span className="font-medium">
                        {formatCurrency(latestAnalytics.job_posting_revenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>구독 수익</span>
                      <span className="font-medium">
                        {formatCurrency(latestAnalytics.subscription_revenue || 0)}
                      </span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-bold">
                        <span>총 수익</span>
                        <span>{formatCurrency(latestAnalytics.total_revenue || 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>플랫폼 성장</CardTitle>
                    <CardDescription>누적 데이터</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <h4 className="font-bold text-2xl">{formatNumber(latestAnalytics.total_users || 0)}</h4>
                        <p className="text-sm text-muted-foreground">총 사용자</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <h4 className="font-bold text-2xl">{formatNumber(latestAnalytics.total_companies || 0)}</h4>
                        <p className="text-sm text-muted-foreground">총 회사</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <h4 className="font-bold text-2xl">{formatNumber(latestAnalytics.total_jobs || 0)}</h4>
                        <p className="text-sm text-muted-foreground">총 채용공고</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <h4 className="font-bold text-2xl">{formatNumber(latestAnalytics.total_applications || 0)}</h4>
                        <p className="text-sm text-muted-foreground">총 지원</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}