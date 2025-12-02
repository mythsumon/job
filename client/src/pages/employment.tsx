import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Award,
  TrendingUp,
  FileText,
  Send,
  UserCheck,
  UserX,
  Eye,
  Lock,
  DollarSign,
  MapPin,
  Briefcase,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from "lucide-react";

// Mock user ID for demo
const CURRENT_USER_ID = 1;
const CURRENT_USER_TYPE = "employer"; // or "job_seeker"

interface EmploymentRequest {
  id: number;
  userId: number;
  companyId: number;
  position: string;
  department?: string;
  status: string;
  requestType: string;
  startDate?: string;
  salary?: number;
  requestedAt: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  company?: {
    id: number;
    name: string;
    logo?: string;
  };
}

interface Evaluation {
  id: number;
  employmentId: number;
  evaluatorId: number;
  evaluatedId: number;
  evaluatorType: string;
  overallRating: number;
  workQuality?: number;
  communication?: number;
  teamwork?: number;
  reliability?: number;
  leadership?: number;
  comment?: string;
  strengths?: string[];
  improvements?: string[];
  wouldRecommend?: boolean;
  isPublic: boolean;
  createdAt: string;
}

interface CompanyReview {
  id: number;
  companyId: number;
  userId: number;
  overallRating: number;
  workLifeBalance?: number;
  compensation?: number;
  culture?: number;
  management?: number;
  careerGrowth?: number;
  title: string;
  pros?: string;
  cons?: string;
  advice?: string;
  position?: string;
  employmentType?: string;
  isCurrentEmployee: boolean;
  isVerified: boolean;
  isPublic: boolean;
  createdAt: string;
}

export default function Employment() {
  const [selectedTab, setSelectedTab] = useState("requests");
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employment requests
  const { data: employmentRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/employment/user', CURRENT_USER_ID],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/employment/user/${CURRENT_USER_ID}`);
      return response.json();
    },
  });

  // Fetch evaluations
  const { data: evaluations = [], isLoading: evaluationsLoading } = useQuery({
    queryKey: ['/api/evaluations/user', CURRENT_USER_ID],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/evaluations/user/${CURRENT_USER_ID}`);
      return response.json();
    },
  });

  // Create employment request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await apiRequest('POST', '/api/employment/request', requestData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employment/user', CURRENT_USER_ID] });
      setShowRequestDialog(false);
      toast({
        title: "요청 전송됨",
        description: "입사 요청이 성공적으로 전송되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "요청 전송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Approve/Reject employment mutations
  const approveRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/employment/${id}/approve`, {
        approverId: CURRENT_USER_ID
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employment/user', CURRENT_USER_ID] });
      toast({
        title: "승인 완료",
        description: "입사 요청이 승인되었습니다.",
      });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/employment/${id}/reject`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employment/user', CURRENT_USER_ID] });
      toast({
        title: "거절 완료",
        description: "입사 요청이 거절되었습니다.",
      });
    },
  });

  // Create evaluation mutation
  const createEvaluationMutation = useMutation({
    mutationFn: async (evaluationData: any) => {
      const response = await apiRequest('POST', '/api/evaluations', evaluationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evaluations/user', CURRENT_USER_ID] });
      setShowEvaluationDialog(false);
      toast({
        title: "평가 등록됨",
        description: "평가가 성공적으로 등록되었습니다.",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "대기중", variant: "secondary" as const, icon: Clock },
      active: { label: "재직중", variant: "default" as const, icon: CheckCircle },
      terminated: { label: "퇴사", variant: "destructive" as const, icon: XCircle },
      rejected: { label: "거절됨", variant: "destructive" as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const renderStarRating = (rating: number, size: "sm" | "md" = "sm") => {
    const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  입사/퇴사 관리
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  채용 프로세스, 평가, 리뷰를 관리하세요
                </p>
              </div>
              <div className="flex gap-3">
                <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Send className="w-4 h-4 mr-2" />
                      입사 요청
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>입사 요청 보내기</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="company">회사</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="회사를 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">MongolTech</SelectItem>
                            <SelectItem value="2">UB Digital</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="position">포지션</Label>
                        <Input placeholder="예: 프론트엔드 개발자" />
                      </div>
                      <div>
                        <Label htmlFor="department">부서</Label>
                        <Input placeholder="예: 개발팀" />
                      </div>
                      <div>
                        <Label htmlFor="salary">희망 연봉</Label>
                        <Input type="number" placeholder="예: 4500" />
                      </div>
                      <Button className="w-full" onClick={() => createRequestMutation.mutate({})}>
                        요청 보내기
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="requests">입사 요청</TabsTrigger>
              <TabsTrigger value="history">근무 이력</TabsTrigger>
              <TabsTrigger value="evaluations">평가</TabsTrigger>
              <TabsTrigger value="reviews">리뷰</TabsTrigger>
            </TabsList>

            {/* Employment Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <div className="grid gap-6">
                {employmentRequests.map((request: EmploymentRequest) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={request.company?.logo} />
                            <AvatarFallback>
                              <Building2 className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{request.position}</h3>
                            <p className="text-muted-foreground">{request.company?.name}</p>
                            {request.department && (
                              <p className="text-sm text-muted-foreground">{request.department}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                요청일: {new Date(request.requestedAt).toLocaleDateString('ko-KR')}
                              </div>
                              {request.salary && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {request.salary.toLocaleString()}만원
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(request.status)}
                          {request.status === "pending" && CURRENT_USER_TYPE === "employer" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveRequestMutation.mutate(request.id)}
                                disabled={approveRequestMutation.isPending}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                승인
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectRequestMutation.mutate(request.id)}
                                disabled={rejectRequestMutation.isPending}
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                거절
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Employment History Tab */}
            <TabsContent value="history" className="space-y-6">
              <div className="grid gap-6">
                {employmentRequests.filter(req => req.status === 'active' || req.status === 'terminated').map((employment: EmploymentRequest) => (
                  <Card key={employment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={employment.company?.logo} />
                            <AvatarFallback>
                              <Building2 className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{employment.position}</h3>
                            <p className="text-muted-foreground">{employment.company?.name}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {employment.startDate && new Date(employment.startDate).toLocaleDateString('ko-KR')} - 
                                {employment.status === 'terminated' ? '퇴사' : '재직중'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(employment.status)}
                          {employment.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowEvaluationDialog(true)}
                            >
                              <Star className="w-4 h-4 mr-1" />
                              평가하기
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Evaluations Tab */}
            <TabsContent value="evaluations" className="space-y-6">
              <div className="grid gap-6">
                {evaluations.map((evaluation: Evaluation) => (
                  <Card key={evaluation.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">직원 평가</h3>
                            <Badge variant={evaluation.evaluatorType === 'company' ? 'default' : 'secondary'}>
                              {evaluation.evaluatorType === 'company' ? '회사 평가' : '직원 평가'}
                            </Badge>
                            {evaluation.isPublic && (
                              <Badge variant="outline">
                                <Eye className="w-3 h-3 mr-1" />
                                공개
                              </Badge>
                            )}
                          </div>
                          {renderStarRating(evaluation.overallRating, "md")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(evaluation.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        {evaluation.workQuality && (
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-1">업무 품질</div>
                            {renderStarRating(evaluation.workQuality)}
                          </div>
                        )}
                        {evaluation.communication && (
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-1">소통</div>
                            {renderStarRating(evaluation.communication)}
                          </div>
                        )}
                        {evaluation.teamwork && (
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-1">팀워크</div>
                            {renderStarRating(evaluation.teamwork)}
                          </div>
                        )}
                        {evaluation.reliability && (
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-1">신뢰성</div>
                            {renderStarRating(evaluation.reliability)}
                          </div>
                        )}
                        {evaluation.leadership && (
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground mb-1">리더십</div>
                            {renderStarRating(evaluation.leadership)}
                          </div>
                        )}
                      </div>

                      {evaluation.comment && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">평가 의견</h4>
                          <p className="text-muted-foreground">{evaluation.comment}</p>
                        </div>
                      )}

                      <div className="flex gap-4">
                        {evaluation.strengths && evaluation.strengths.length > 0 && (
                          <div className="flex-1">
                            <h4 className="font-medium mb-2 text-green-600">강점</h4>
                            <div className="flex flex-wrap gap-2">
                              {evaluation.strengths.map((strength, index) => (
                                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  {strength}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {evaluation.improvements && evaluation.improvements.length > 0 && (
                          <div className="flex-1">
                            <h4 className="font-medium mb-2 text-orange-600">개선점</h4>
                            <div className="flex flex-wrap gap-2">
                              {evaluation.improvements.map((improvement, index) => (
                                <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  {improvement}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Company Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">회사 리뷰</h2>
                <Button onClick={() => setShowReviewDialog(true)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  리뷰 작성
                </Button>
              </div>
              
              <div className="grid gap-6">
                {/* Placeholder for company reviews */}
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>아직 작성된 리뷰가 없습니다.</p>
                      <p className="text-sm">첫 번째 리뷰를 작성해보세요!</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Evaluation Dialog */}
          <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>직원 평가 작성</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label>전체 평점</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-6 h-6 text-yellow-400 cursor-pointer" />
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>업무 품질</Label>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 text-yellow-400 cursor-pointer" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>소통 능력</Label>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 text-yellow-400 cursor-pointer" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>팀워크</Label>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 text-yellow-400 cursor-pointer" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>신뢰성</Label>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 text-yellow-400 cursor-pointer" />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="comment">평가 의견</Label>
                  <Textarea 
                    id="comment"
                    placeholder="이 직원에 대한 전반적인 평가를 작성해주세요..."
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="strengths">강점 (쉼표로 구분)</Label>
                  <Input 
                    id="strengths"
                    placeholder="예: 책임감, 창의성, 문제해결능력"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="improvements">개선점 (쉼표로 구분)</Label>
                  <Input 
                    id="improvements"
                    placeholder="예: 시간관리, 문서화, 발표력"
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="public" />
                  <Label htmlFor="public">이 평가를 공개합니다</Label>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => createEvaluationMutation.mutate({})}
                  disabled={createEvaluationMutation.isPending}
                >
                  평가 등록
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Company Review Dialog */}
          <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>회사 리뷰 작성</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">리뷰 제목</Label>
                  <Input 
                    id="title"
                    placeholder="이 회사에 대한 한 줄 평가"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>전체 평점</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-6 h-6 text-yellow-400 cursor-pointer" />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>워라밸</Label>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 text-yellow-400 cursor-pointer" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>급여</Label>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 text-yellow-400 cursor-pointer" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>회사문화</Label>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 text-yellow-400 cursor-pointer" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>성장기회</Label>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 text-yellow-400 cursor-pointer" />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pros">장점</Label>
                  <Textarea 
                    id="pros"
                    placeholder="이 회사의 좋은 점들을 작성해주세요..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="cons">단점</Label>
                  <Textarea 
                    id="cons"
                    placeholder="이 회사의 아쉬운 점들을 작성해주세요..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="advice">조언</Label>
                  <Textarea 
                    id="advice"
                    placeholder="이 회사에 입사를 고려하는 분들에게 조언을 해주세요..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <Button className="w-full">
                  리뷰 등록
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}