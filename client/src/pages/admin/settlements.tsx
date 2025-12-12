import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Download, Filter, Plus, Search } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/admin/admin-layout';

const settlementSchema = z.object({
  companyId: z.number().min(1, '회사를 선택해주세요'),
  jobId: z.number().optional(),
  amount: z.string().min(1, '금액을 입력해주세요'),
  type: z.string().min(1, '유형을 선택해주세요'),
  status: z.string().min(1, '상태를 선택해주세요'),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
  settlementDate: z.string().optional(),
});

type SettlementFormData = z.infer<typeof settlementSchema>;

export default function AdminSettlements() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const { data: settlements, isLoading } = useQuery({
    queryKey: ['/api/admin/settlements', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      const response = await apiRequest('GET', `/api/admin/settlements?${params.toString()}`);
      return response.json();
    }
  });

  const { data: companies } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/companies');
      return response.json();
    }
  });

  const createSettlementMutation = useMutation({
    mutationFn: async (data: SettlementFormData) => 
      apiRequest('POST', '/api/admin/settlements', {
        ...data,
        amount: parseFloat(data.amount)
      }),
    onSuccess: () => {
      toast({ title: '정산이 생성되었습니다' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settlements'] });
    },
    onError: () => {
      toast({ title: '정산 생성에 실패했습니다', variant: 'destructive' });
    }
  });

  const updateSettlementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SettlementFormData> }) =>
      apiRequest('PUT', `/api/admin/settlements/${id}`, data),
    onSuccess: () => {
      toast({ title: '정산이 업데이트되었습니다' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settlements'] });
    },
    onError: () => {
      toast({ title: '정산 업데이트에 실패했습니다', variant: 'destructive' });
    }
  });

  const form = useForm<SettlementFormData>({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      type: 'job_posting',
      status: 'pending'
    }
  });

  const onSubmit = (data: SettlementFormData) => {
    createSettlementMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '대기중', variant: 'outline' as const },
      completed: { label: '완료', variant: 'default' as const },
      failed: { label: '실패', variant: 'destructive' as const },
      cancelled: { label: '취소', variant: 'secondary' as const }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      job_posting: '채용공고',
      featured_listing: '추천 게시',
      premium_placement: '프리미엄 배치',
      subscription: '구독료'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const exportSettlements = () => {
    const settlementsArray = Array.isArray(settlements?.data) ? settlements.data : (Array.isArray(settlements) ? settlements : []);
    if (settlementsArray.length === 0) return;
    
    const csvContent = [
      ['ID', '회사명', '채용공고', '금액', '유형', '상태', '결제수단', '정산일'],
      ...settlementsArray.map((settlement: any) => [
        settlement.id,
        settlement.company_name || '',
        settlement.job_title || '',
        settlement.amount,
        getTypeLabel(settlement.type),
        getStatusBadge(settlement.status).label,
        settlement.payment_method || '',
        settlement.settlement_date || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `settlements_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            정산 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            플랫폼 정산 및 수수료 관리
          </p>
        </div>
        
        <div className="flex justify-end mb-6">
          <div className="flex gap-2">
            <Button onClick={exportSettlements} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              내보내기
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  정산 생성
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>새 정산 생성</DialogTitle>
                  <DialogDescription>
                    새로운 정산을 생성하고 관리합니다
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>회사</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="회사 선택" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(Array.isArray(companies?.data) ? companies.data : (Array.isArray(companies) ? companies : [])).filter((company: any) => company.id).map((company: any) => (
                                  <SelectItem key={company.id} value={company.id.toString()}>
                                    {company.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>금액 (MNT)</FormLabel>
                            <FormControl>
                              <Input placeholder="50000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>유형</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="job_posting">채용공고</SelectItem>
                                <SelectItem value="featured_listing">추천 게시</SelectItem>
                                <SelectItem value="premium_placement">프리미엄 배치</SelectItem>
                                <SelectItem value="subscription">구독료</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>상태</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pending">대기중</SelectItem>
                                <SelectItem value="completed">완료</SelectItem>
                                <SelectItem value="failed">실패</SelectItem>
                                <SelectItem value="cancelled">취소</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>결제수단 (선택사항)</FormLabel>
                          <FormControl>
                            <Input placeholder="신용카드, 계좌이체 등" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={createSettlementMutation.isPending}>
                      {createSettlementMutation.isPending ? '생성 중...' : '정산 생성'}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 필터 */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              필터
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">상태</label>
                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="모든 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 상태</SelectItem>
                    <SelectItem value="pending">대기중</SelectItem>
                    <SelectItem value="completed">완료</SelectItem>
                    <SelectItem value="failed">실패</SelectItem>
                    <SelectItem value="cancelled">취소</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">시작일</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">종료일</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">검색</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="회사명, 거래ID 검색"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 정산 목록 */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle>정산 목록</CardTitle>
            <CardDescription>
              총 {Array.isArray(settlements?.data) ? settlements.data.length : (Array.isArray(settlements) ? settlements.length : 0)}건의 정산 내역
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>회사명</TableHead>
                    <TableHead>채용공고</TableHead>
                    <TableHead>금액</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>결제수단</TableHead>
                    <TableHead>정산일</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(settlements?.data) ? settlements.data : (Array.isArray(settlements) ? settlements : [])).map((settlement: any) => (
                    <TableRow key={settlement.id}>
                      <TableCell className="font-medium">{settlement.id}</TableCell>
                      <TableCell>{settlement.company_name || '-'}</TableCell>
                      <TableCell>{settlement.job_title || '-'}</TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat('mn-MN').format(settlement.amount)} MNT
                      </TableCell>
                      <TableCell>{getTypeLabel(settlement.type)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(settlement.status).variant}>
                          {getStatusBadge(settlement.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell>{settlement.payment_method || '-'}</TableCell>
                      <TableCell>
                        {settlement.settlement_date ? 
                          new Date(settlement.settlement_date).toLocaleDateString('ko-KR') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (settlement.status === 'pending') {
                                updateSettlementMutation.mutate({
                                  id: settlement.id,
                                  data: { status: 'completed' }
                                });
                              }
                            }}
                            disabled={settlement.status !== 'pending'}
                          >
                            승인
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}