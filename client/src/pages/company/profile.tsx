import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Save, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import CompanyLayout from "@/components/company/company-layout";

const companyProfileSchema = z.object({
  name: z.string().min(2, "회사명은 최소 2자 이상이어야 합니다"),
  description: z.string().min(10, "회사 소개는 최소 10자 이상이어야 합니다"),
  industry: z.string().min(1, "업종을 선택해주세요"),
  size: z.string().min(1, "회사 규모를 선택해주세요"),
  location: z.string().min(2, "위치를 입력해주세요"),
  website: z.string().url("올바른 웹사이트 URL을 입력해주세요").optional().or(z.literal("")),
  founded: z.number().min(1900).max(new Date().getFullYear()).optional(),
  employeeCount: z.number().min(1).optional(),
  culture: z.string().optional(),
});

type CompanyProfileForm = z.infer<typeof companyProfileSchema>;

const industries = [
  { value: "technology", label: "정보기술/소프트웨어" },
  { value: "finance", label: "금융/은행" },
  { value: "manufacturing", label: "제조업" },
  { value: "healthcare", label: "의료/헬스케어" },
  { value: "education", label: "교육" },
  { value: "retail", label: "소매/유통" },
  { value: "construction", label: "건설/부동산" },
  { value: "energy", label: "에너지/광업" },
  { value: "transportation", label: "운송/물류" },
  { value: "media", label: "미디어/엔터테인먼트" },
  { value: "agriculture", label: "농업/축산업" },
  { value: "government", label: "정부/공공기관" },
  { value: "nonprofit", label: "비영리단체" },
  { value: "other", label: "기타" },
];

const companySizes = [
  { value: "1-10", label: "1-10명" },
  { value: "11-50", label: "11-50명" },
  { value: "51-200", label: "51-200명" },
  { value: "201-500", label: "201-500명" },
  { value: "501-1000", label: "501-1000명" },
  { value: "1000+", label: "1000명 이상" },
];

function getStatusBadge(status: string, isDetailComplete: boolean) {
  switch (status) {
    case '가입':
      return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">가입</Badge>;
    case '승인대기':
      return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
        <Clock className="w-3 h-3 mr-1" />
        승인대기
      </Badge>;
    case '승인':
      return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
        <CheckCircle className="w-3 h-3 mr-1" />
        승인
      </Badge>;
    default:
      return <Badge variant="outline">알 수 없음</Badge>;
  }
}

export default function CompanyProfile() {
  const { toast } = useToast();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const { data: company, isLoading } = useQuery({
    queryKey: ['/api/company/profile'],
  });

  const form = useForm<CompanyProfileForm>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: company?.name || "",
      description: company?.description || "",
      industry: company?.industry || "",
      size: company?.size || "",
      location: company?.location || "",
      website: company?.website || "",
      founded: company?.founded || undefined,
      employeeCount: company?.employeeCount || undefined,
      culture: company?.culture || "",
    },
  });

  // Update form when company data loads
  useState(() => {
    if (company) {
      form.reset({
        name: company.name || "",
        description: company.description || "",
        industry: company.industry || "",
        size: company.size || "",
        location: company.location || "",
        website: company.website || "",
        founded: company.founded || undefined,
        employeeCount: company.employeeCount || undefined,
        culture: company.culture || "",
      });
    }
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: CompanyProfileForm) => {
      return apiRequest("PUT", "/api/company/profile", data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/company/profile'] });
      
      if (response.requiresApproval) {
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 10000);
      }
      
      toast({
        title: "성공",
        description: response.message || "기업 정보가 업데이트되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "기업 정보 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CompanyProfileForm) => {
    updateCompanyMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <CompanyLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6" />
            <h1 className="text-2xl font-bold">기업 정보</h1>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6" />
            <h1 className="text-2xl font-bold">기업 정보</h1>
          </div>
          {company && getStatusBadge(company.status, company.isDetailComplete)}
        </div>

        {showSuccessAlert && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              기업 정보가 저장되었습니다. 관리자 검토 후 사용자단에 노출됩니다.
            </AlertDescription>
          </Alert>
        )}

        {company?.status === '승인대기' && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              현재 관리자 검토 중입니다. 승인 완료까지 잠시만 기다려주세요.
            </AlertDescription>
          </Alert>
        )}

        {company?.status === '승인' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              기업 정보가 승인되어 사용자단에 노출되고 있습니다.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>기업 프로필</CardTitle>
            <CardDescription>
              기업의 기본 정보를 입력해주세요. 모든 필수 정보를 입력하면 관리자 검토 후 공개됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>회사명 *</FormLabel>
                        <FormControl>
                          <Input placeholder="회사명을 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>업종 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="업종을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry.value} value={industry.value}>
                                {industry.label}
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
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>회사 규모 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="회사 규모를 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companySizes.map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>위치 *</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 울란바토르, 몽골" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>웹사이트</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="founded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>설립연도</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="2010" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>회사 소개 *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="회사에 대한 상세한 설명을 입력하세요..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        회사의 비전, 미션, 주요 사업 등을 포함해 주세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="culture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>기업 문화</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="회사의 문화와 가치관에 대해 설명해주세요..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        근무 환경, 복지, 팀 문화 등을 포함해 주세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateCompanyMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {updateCompanyMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        저장
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </CompanyLayout>
  );
}