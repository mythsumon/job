import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings2, Save, Plus, Edit, Trash2, Info } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/admin/admin-layout';

const settingSchema = z.object({
  key: z.string().min(1, '키를 입력해주세요'),
  value: z.string().min(1, '값을 입력해주세요'),
  description: z.string().optional(),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  type: z.string().min(1, '타입을 선택해주세요'),
});

type SettingFormData = z.infer<typeof settingSchema>;

export default function AdminSettings() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [editingSetting, setEditingSetting] = useState<any>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/settings');
      return response.json();
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) =>
      apiRequest('PUT', `/api/admin/settings/${key}`, { value }),
    onSuccess: () => {
      toast({ title: '설정이 저장되었습니다' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: () => {
      toast({ title: '설정 저장에 실패했습니다', variant: 'destructive' });
    }
  });

  const createSettingMutation = useMutation({
    mutationFn: async (data: SettingFormData) =>
      apiRequest('POST', '/api/admin/settings', data),
    onSuccess: () => {
      toast({ title: '새 설정이 생성되었습니다' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: () => {
      toast({ title: '설정 생성에 실패했습니다', variant: 'destructive' });
    }
  });

  const form = useForm<SettingFormData>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      category: 'general',
      type: 'string'
    }
  });

  const onSubmit = (data: SettingFormData) => {
    if (editingSetting) {
      updateSettingMutation.mutate({
        key: editingSetting.key,
        value: data.value
      });
      setEditingSetting(null);
    } else {
      createSettingMutation.mutate(data);
    }
    form.reset();
  };

  const settingsArray = Array.isArray(settings?.data) ? settings.data : (Array.isArray(settings) ? settings : []);
  const groupedSettings = settingsArray.reduce((acc: any, setting: any) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {});

  const categories = Object.keys(groupedSettings);

  const renderSettingInput = (setting: any) => {
    const handleValueChange = (newValue: string | boolean) => {
      updateSettingMutation.mutate({
        key: setting.key,
        value: String(newValue)
      });
    };

    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={setting.value === 'true'}
            onCheckedChange={(checked) => handleValueChange(checked)}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            defaultValue={setting.value}
            onBlur={(e) => handleValueChange(e.target.value)}
            className="w-48"
          />
        );
      case 'json':
        return (
          <Textarea
            defaultValue={setting.value}
            onBlur={(e) => handleValueChange(e.target.value)}
            className="min-h-[100px]"
          />
        );
      default:
        return (
          <Input
            defaultValue={setting.value}
            onBlur={(e) => handleValueChange(e.target.value)}
            className="w-48"
          />
        );
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      string: 'default',
      number: 'secondary',
      boolean: 'outline',
      json: 'destructive'
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      general: '일반',
      pricing: '요금제',
      limits: '제한사항',
      notifications: '알림',
      contact: '연락처',
      system: '시스템'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            시스템 설정
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            플랫폼 전체 설정 관리
          </p>
        </div>
        
        <div className="flex justify-end mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                새 설정 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>새 설정 추가</DialogTitle>
                <DialogDescription>
                  시스템에 새로운 설정을 추가합니다
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>키</FormLabel>
                          <FormControl>
                            <Input placeholder="setting_key" {...field} />
                          </FormControl>
                          <FormDescription>
                            영문, 숫자, 언더스코어만 사용
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>카테고리</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">일반</SelectItem>
                              <SelectItem value="pricing">요금제</SelectItem>
                              <SelectItem value="limits">제한사항</SelectItem>
                              <SelectItem value="notifications">알림</SelectItem>
                              <SelectItem value="contact">연락처</SelectItem>
                              <SelectItem value="system">시스템</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>데이터 타입</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="string">문자열</SelectItem>
                            <SelectItem value="number">숫자</SelectItem>
                            <SelectItem value="boolean">불린</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>값</FormLabel>
                        <FormControl>
                          <Input placeholder="설정 값" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>설명 (선택사항)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="설정에 대한 설명" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createSettingMutation.isPending}>
                    {createSettingMutation.isPending ? '생성 중...' : '설정 생성'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : categories.length > 0 ? (
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-6 mb-6">
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {getCategoryLabel(category)}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="space-y-4">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings2 className="h-5 w-5" />
                      {getCategoryLabel(category)} 설정
                    </CardTitle>
                    <CardDescription>
                      {category === 'general' && '기본적인 플랫폼 설정'}
                      {category === 'pricing' && '요금제 및 수수료 관련 설정'}
                      {category === 'limits' && '시스템 제한 사항 설정'}
                      {category === 'notifications' && '알림 관련 설정'}
                      {category === 'contact' && '연락처 정보 설정'}
                      {category === 'system' && '시스템 운영 설정'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {groupedSettings[category]?.map((setting: any) => (
                      <div key={setting.key} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{setting.key}</h3>
                            <Badge variant={getTypeColor(setting.type) as any}>
                              {setting.type}
                            </Badge>
                          </div>
                          {setting.description && (
                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            {renderSettingInput(setting)}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingSetting(setting);
                              form.setValue('key', setting.key);
                              form.setValue('value', setting.value);
                              form.setValue('description', setting.description || '');
                              form.setValue('category', setting.category);
                              form.setValue('type', setting.type);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings2 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">설정이 없습니다</h3>
              <p className="text-muted-foreground mb-4">첫 번째 시스템 설정을 추가해보세요</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>설정 추가</Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* 시스템 정보 카드 */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              시스템 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium text-lg">{settings?.length || 0}</h4>
              <p className="text-sm text-muted-foreground">총 설정 수</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium text-lg">{categories.length}</h4>
              <p className="text-sm text-muted-foreground">카테고리 수</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium text-lg">
                {settingsArray.filter((s: any) => s.type === 'boolean').length || 0}
              </h4>
              <p className="text-sm text-muted-foreground">스위치 설정</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium text-lg">
                {settingsArray.filter((s: any) => s.category === 'system').length || 0}
              </h4>
              <p className="text-sm text-muted-foreground">시스템 설정</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}