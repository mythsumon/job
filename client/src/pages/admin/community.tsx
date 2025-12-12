import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  Ban,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Image as ImageIcon,
  Video,
  MoreVertical,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Post {
  id: number;
  authorId: number;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  type: "job_post" | "company_update" | "career_tip" | "industry_news" | "user_achievement";
  content: string;
  mediaCount: number;
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  reportCount: number;
  status: "active" | "hidden" | "deleted" | "reported";
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: number;
  postId: number;
  authorId: number;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  reportCount: number;
  status: "active" | "hidden" | "deleted" | "reported";
  createdAt: string;
}

interface Report {
  id: number;
  postId?: number;
  commentId?: number;
  reporterId: number;
  reporterName: string;
  reason: string;
  description?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
}

export default function AdminCommunity() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"hide" | "delete" | "ban" | null>(null);
  const [banReason, setBanReason] = useState("");

  // Fetch posts
  const { data: posts = [], isLoading: loadingPosts } = useQuery<Post[]>({
    queryKey: ["/api/admin/community/posts", { search: searchQuery, status: statusFilter, type: typeFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      const response = await apiRequest("GET", `/api/admin/community/posts?${params.toString()}`);
      return Array.isArray(response) ? response : response.posts || [];
    },
  });

  // Fetch comments
  const { data: comments = [], isLoading: loadingComments } = useQuery<Comment[]>({
    queryKey: ["/api/admin/community/comments", { search: searchQuery, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      const response = await apiRequest("GET", `/api/admin/community/comments?${params.toString()}`);
      return Array.isArray(response) ? response : response.comments || [];
    },
  });

  // Fetch reports
  const { data: reports = [], isLoading: loadingReports } = useQuery<Report[]>({
    queryKey: ["/api/admin/community/reports", { status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      const response = await apiRequest("GET", `/api/admin/community/reports?${params.toString()}`);
      return Array.isArray(response) ? response : response.reports || [];
    },
  });

  // Hide post/comment
  const hideMutation = useMutation({
    mutationFn: async ({ type, id }: { type: "post" | "comment"; id: number }) => {
      return apiRequest("PUT", `/api/admin/community/${type}s/${id}/hide`, {});
    },
    onSuccess: () => {
      toast({ title: "숨김 처리되었습니다" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/community"] });
      setActionDialogOpen(false);
    },
  });

  // Delete post/comment
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: "post" | "comment"; id: number }) => {
      return apiRequest("DELETE", `/api/admin/community/${type}s/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "삭제되었습니다" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/community"] });
      setActionDialogOpen(false);
    },
  });

  // Ban user
  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: number; reason: string }) => {
      return apiRequest("POST", `/api/admin/users/${userId}/ban`, { reason });
    },
    onSuccess: () => {
      toast({ title: "사용자가 차단되었습니다" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/community"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setActionDialogOpen(false);
      setBanReason("");
    },
  });

  // Resolve report
  const resolveReportMutation = useMutation({
    mutationFn: async ({ reportId, action }: { reportId: number; action: string }) => {
      return apiRequest("PUT", `/api/admin/community/reports/${reportId}/resolve`, { action });
    },
    onSuccess: () => {
      toast({ title: "신고가 처리되었습니다" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/community/reports"] });
    },
  });

  const handleAction = (type: "hide" | "delete" | "ban", item: Post | Comment) => {
    setActionType(type);
    if (type === "ban") {
      setBanReason("");
    }
    if ("type" in item) {
      setSelectedPost(item as Post);
    } else {
      setSelectedComment(item as Comment);
    }
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!actionType) return;

    if (selectedPost) {
      if (actionType === "hide") {
        hideMutation.mutate({ type: "post", id: selectedPost.id });
      } else if (actionType === "delete") {
        deleteMutation.mutate({ type: "post", id: selectedPost.id });
      } else if (actionType === "ban") {
        banUserMutation.mutate({ userId: selectedPost.authorId, reason: banReason });
      }
    } else if (selectedComment) {
      if (actionType === "hide") {
        hideMutation.mutate({ type: "comment", id: selectedComment.id });
      } else if (actionType === "delete") {
        deleteMutation.mutate({ type: "comment", id: selectedComment.id });
      } else if (actionType === "ban") {
        banUserMutation.mutate({ userId: selectedComment.authorId, reason: banReason });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: "활성", variant: "default" as const },
      hidden: { label: "숨김", variant: "secondary" as const },
      deleted: { label: "삭제됨", variant: "destructive" as const },
      reported: { label: "신고됨", variant: "destructive" as const },
    };
    return config[status as keyof typeof config] || config.active;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      job_post: "채용공고",
      company_update: "기업 소식",
      career_tip: "커리어 팁",
      industry_news: "산업 뉴스",
      user_achievement: "사용자 성과",
    };
    return labels[type as keyof typeof labels] || type;
  };

  // Example data
  const examplePosts: Post[] = [
    {
      id: 1,
      authorId: 101,
      authorName: "김민수",
      authorEmail: "minsu.kim@email.com",
      type: "career_tip",
      content: "면접 준비 팁을 공유합니다!",
      mediaCount: 0,
      stats: { likes: 24, comments: 8, shares: 5 },
      reportCount: 0,
      status: "active",
      createdAt: "2024-01-20T10:30:00Z",
      updatedAt: "2024-01-20T10:30:00Z",
    },
    {
      id: 2,
      authorId: 102,
      authorName: "이지현",
      authorEmail: "jihyun.lee@email.com",
      type: "job_post",
      content: "우리 회사에서 개발자를 모집합니다!",
      mediaCount: 1,
      stats: { likes: 45, comments: 12, shares: 8 },
      reportCount: 2,
      status: "reported",
      createdAt: "2024-01-19T15:45:00Z",
      updatedAt: "2024-01-19T15:45:00Z",
    },
  ];

  const exampleComments: Comment[] = [
    {
      id: 1,
      postId: 1,
      authorId: 103,
      authorName: "박준호",
      authorEmail: "junho.park@email.com",
      content: "좋은 정보 감사합니다!",
      reportCount: 0,
      status: "active",
      createdAt: "2024-01-20T11:00:00Z",
    },
    {
      id: 2,
      postId: 2,
      authorId: 104,
      authorName: "최수진",
      authorEmail: "sujin.choi@email.com",
      content: "부적절한 내용입니다.",
      reportCount: 5,
      status: "reported",
      createdAt: "2024-01-19T16:00:00Z",
    },
  ];

  const exampleReports: Report[] = [
    {
      id: 1,
      postId: 2,
      reporterId: 105,
      reporterName: "정다은",
      reason: "스팸",
      description: "스팸 게시글입니다.",
      status: "pending",
      createdAt: "2024-01-19T16:30:00Z",
    },
    {
      id: 2,
      commentId: 2,
      reporterId: 106,
      reporterName: "홍길동",
      reason: "욕설/비방",
      description: "부적절한 댓글입니다.",
      status: "pending",
      createdAt: "2024-01-19T17:00:00Z",
    },
  ];

  const displayPosts = Array.isArray(posts) && posts.length > 0 ? posts : examplePosts;
  const displayComments = Array.isArray(comments) && comments.length > 0 ? comments : exampleComments;
  const displayReports = Array.isArray(reports) && reports.length > 0 ? reports : exampleReports;

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            커뮤니티 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            게시글, 댓글, 신고를 관리하고 모니터링합니다
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 게시글</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayPosts.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">신고된 게시글</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayPosts.filter((p) => p.status === "reported" || p.reportCount > 0).length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 댓글</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayComments.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기 중인 신고</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayReports.filter((r) => r.status === "pending").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="posts">게시글 ({displayPosts.length})</TabsTrigger>
            <TabsTrigger value="comments">댓글 ({displayComments.length})</TabsTrigger>
            <TabsTrigger value="reports">신고 ({displayReports.length})</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>게시글 관리</CardTitle>
                <CardDescription>게시글을 검색하고 관리할 수 있습니다</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="작성자명, 내용으로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="상태 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 상태</SelectItem>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="hidden">숨김</SelectItem>
                      <SelectItem value="reported">신고됨</SelectItem>
                      <SelectItem value="deleted">삭제됨</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="유형 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 유형</SelectItem>
                      <SelectItem value="job_post">채용공고</SelectItem>
                      <SelectItem value="company_update">기업 소식</SelectItem>
                      <SelectItem value="career_tip">커리어 팁</SelectItem>
                      <SelectItem value="industry_news">산업 뉴스</SelectItem>
                      <SelectItem value="user_achievement">사용자 성과</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Posts Table */}
                <div className="rounded-md border border-gray-200 dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>작성자</TableHead>
                        <TableHead>유형</TableHead>
                        <TableHead>내용</TableHead>
                        <TableHead>통계</TableHead>
                        <TableHead>신고</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>작성일</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingPosts ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            로딩 중...
                          </TableCell>
                        </TableRow>
                      ) : displayPosts.length > 0 ? (
                        displayPosts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {post.authorName}
                                    <Link href={`/user/profile/${post.authorId}`} target="_blank">
                                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                        <ExternalLink className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                  </div>
                                  <div className="text-xs text-gray-500">{post.authorEmail}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{getTypeLabel(post.type)}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-md">
                                <div className="flex items-start gap-2">
                                  <p className="text-sm line-clamp-2 flex-1">{post.content}</p>
                                  <Link href={`/user/feed#post-${post.id}`} target="_blank">
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </Link>
                                </div>
                                {post.mediaCount > 0 && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                    {post.mediaCount > 0 && <ImageIcon className="h-3 w-3" />}
                                    미디어 {post.mediaCount}개
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>👍 {post.stats.likes}</div>
                                <div>💬 {post.stats.comments}</div>
                                <div>📤 {post.stats.shares}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {post.reportCount > 0 ? (
                                <Badge variant="destructive">{post.reportCount}</Badge>
                              ) : (
                                <span className="text-sm text-gray-400">0</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadge(post.status).variant}>
                                {getStatusBadge(post.status).label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction("hide", post)}
                                  title="숨김"
                                >
                                  {post.status === "hidden" ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction("delete", post)}
                                  className="text-red-500 hover:text-red-600"
                                  title="삭제"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction("ban", post)}
                                  className="text-orange-500 hover:text-orange-600"
                                  title="사용자 차단"
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            게시글이 없습니다
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>댓글 관리</CardTitle>
                <CardDescription>댓글을 검색하고 관리할 수 있습니다</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="작성자명, 내용으로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="상태 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 상태</SelectItem>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="hidden">숨김</SelectItem>
                      <SelectItem value="reported">신고됨</SelectItem>
                      <SelectItem value="deleted">삭제됨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Comments Table */}
                <div className="rounded-md border border-gray-200 dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>작성자</TableHead>
                        <TableHead>게시글 ID</TableHead>
                        <TableHead>내용</TableHead>
                        <TableHead>신고</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>작성일</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingComments ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            로딩 중...
                          </TableCell>
                        </TableRow>
                      ) : displayComments.length > 0 ? (
                        displayComments.map((comment) => (
                          <TableRow key={comment.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {comment.authorName}
                                    <Link href={`/user/profile/${comment.authorId}`} target="_blank">
                                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                        <ExternalLink className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                  </div>
                                  <div className="text-xs text-gray-500">{comment.authorEmail}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">#{comment.postId}</Badge>
                                <Link href={`/user/feed#post-${comment.postId}`} target="_blank">
                                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm max-w-md line-clamp-2">{comment.content}</p>
                            </TableCell>
                            <TableCell>
                              {comment.reportCount > 0 ? (
                                <Badge variant="destructive">{comment.reportCount}</Badge>
                              ) : (
                                <span className="text-sm text-gray-400">0</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadge(comment.status).variant}>
                                {getStatusBadge(comment.status).label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction("hide", comment)}
                                  title="숨김"
                                >
                                  {comment.status === "hidden" ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction("delete", comment)}
                                  className="text-red-500 hover:text-red-600"
                                  title="삭제"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction("ban", comment)}
                                  className="text-orange-500 hover:text-orange-600"
                                  title="사용자 차단"
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            댓글이 없습니다
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>신고 관리</CardTitle>
                <CardDescription>신고된 게시글과 댓글을 검토하고 처리합니다</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="상태 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 상태</SelectItem>
                      <SelectItem value="pending">대기 중</SelectItem>
                      <SelectItem value="reviewed">검토 중</SelectItem>
                      <SelectItem value="resolved">처리 완료</SelectItem>
                      <SelectItem value="dismissed">기각됨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reports Table */}
                <div className="rounded-md border border-gray-200 dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>신고자</TableHead>
                        <TableHead>대상</TableHead>
                        <TableHead>신고 사유</TableHead>
                        <TableHead>설명</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>신고일</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingReports ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            로딩 중...
                          </TableCell>
                        </TableRow>
                      ) : displayReports.length > 0 ? (
                        displayReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>
                              <div className="font-medium">{report.reporterName}</div>
                            </TableCell>
                            <TableCell>
                              {report.postId ? (
                                <Badge variant="outline">게시글 #{report.postId}</Badge>
                              ) : (
                                <Badge variant="outline">댓글 #{report.commentId}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive">{report.reason}</Badge>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm max-w-md line-clamp-2">{report.description || "-"}</p>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  report.status === "pending"
                                    ? "destructive"
                                    : report.status === "resolved"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {report.status === "pending"
                                  ? "대기 중"
                                  : report.status === "resolved"
                                  ? "처리 완료"
                                  : report.status === "reviewed"
                                  ? "검토 중"
                                  : "기각됨"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-500">
                                {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    resolveReportMutation.mutate({
                                      reportId: report.id,
                                      action: "resolve",
                                    });
                                  }}
                                  disabled={report.status === "resolved"}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  처리
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    resolveReportMutation.mutate({
                                      reportId: report.id,
                                      action: "dismiss",
                                    });
                                  }}
                                  disabled={report.status === "dismissed"}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  기각
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            신고가 없습니다
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === "hide"
                  ? "게시글 숨김"
                  : actionType === "delete"
                  ? "게시글 삭제"
                  : "사용자 차단"}
              </DialogTitle>
              <DialogDescription>
                {actionType === "hide"
                  ? "이 게시글을 숨김 처리하시겠습니까?"
                  : actionType === "delete"
                  ? "이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                  : "이 사용자를 차단하시겠습니까? 차단 사유를 입력해주세요."}
              </DialogDescription>
            </DialogHeader>
            {actionType === "ban" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="banReason">차단 사유</Label>
                  <Textarea
                    id="banReason"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="차단 사유를 입력하세요"
                    rows={3}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                취소
              </Button>
              <Button
                variant={actionType === "delete" || actionType === "ban" ? "destructive" : "default"}
                onClick={confirmAction}
                disabled={
                  (actionType === "ban" && !banReason.trim()) ||
                  hideMutation.isPending ||
                  deleteMutation.isPending ||
                  banUserMutation.isPending
                }
              >
                {actionType === "hide"
                  ? "숨김 처리"
                  : actionType === "delete"
                  ? "삭제"
                  : "차단"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}