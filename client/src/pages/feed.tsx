import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  FileText,
  Briefcase,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Award,
  Building,
  Hash,
  Star,
  Globe,
  UserPlus,
  Flag,
  AlertTriangle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface FeedPost {
  id: number;
  type: 'job_post' | 'company_update' | 'career_tip' | 'industry_news' | 'user_achievement';
  author: {
    id: number;
    name: string;
    avatar?: string;
    title?: string;
    company?: string;
    verified?: boolean;
  };
  content: string;
  media?: {
    type: 'image' | 'video' | 'document';
    url: string;
    thumbnail?: string;
  }[];
  metadata?: {
    jobTitle?: string;
    company?: string;
    location?: string;
    salary?: string;
    tags?: string[];
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  userInteraction: {
    liked: boolean;
    bookmarked: boolean;
  };
  createdAt: string;
}

export default function Feed() {
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState<"job_post" | "company_update" | "career_tip" | "industry_news" | "user_achievement">("user_achievement");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch feed posts
  const { data: feedPostsData, isLoading: loadingPosts } = useQuery({
    queryKey: ["/api/community/posts", page],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/community/posts?page=${page}&limit=10`);
        return response;
      } catch (error) {
        // API 실패 시 빈 배열 반환
        return { posts: [], total: 0 };
      }
    },
  });

  const feedPosts: FeedPost[] = feedPostsData?.posts || [];
  const totalPosts = feedPostsData?.total || 0;

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; type: string; media?: File[]; metadata?: any }) => {
      const formData = new FormData();
      formData.append("content", data.content);
      formData.append("type", data.type);
      if (data.metadata) {
        formData.append("metadata", JSON.stringify(data.metadata));
      }
      if (data.media) {
        data.media.forEach((file) => {
          formData.append("media", file);
        });
      }
      const response = await apiRequest("POST", "/api/community/posts", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "게시물이 작성되었습니다",
        description: "피드에 게시물이 추가되었습니다.",
      });
      setNewPost("");
      setSelectedImages([]);
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "게시물 작성 실패",
        description: error?.message || "게시물 작성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest("POST", `/api/community/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "좋아요 실패",
        description: error?.message || "좋아요 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Bookmark post mutation
  const bookmarkPostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest("POST", `/api/community/posts/${postId}/bookmark`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "북마크 실패",
        description: error?.message || "북마크 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Fetch comments
  const { data: commentsData } = useQuery({
    queryKey: ["/api/community/posts/comments", selectedPostForComment],
    queryFn: async () => {
      if (!selectedPostForComment) return { comments: [] };
      const response = await apiRequest("GET", `/api/community/posts/${selectedPostForComment}/comments`);
      return response;
    },
    enabled: !!selectedPostForComment && commentDialogOpen,
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (data: { postId: number; content: string }) => {
      return apiRequest("POST", `/api/community/posts/${data.postId}/comments`, { content: data.content });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts/comments", selectedPostForComment] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "댓글 작성 실패",
        description: error?.message || "댓글 작성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Report post mutation
  const reportPostMutation = useMutation({
    mutationFn: async (data: { postId: number; reason: string; description?: string }) => {
      return apiRequest("POST", "/api/community/posts/report", data);
    },
    onSuccess: () => {
      toast({
        title: "신고가 접수되었습니다",
        description: "검토 후 조치하겠습니다.",
      });
      setReportDialogOpen(false);
      setReportReason("");
      setReportDescription("");
      setSelectedPostId(null);
    },
    onError: (error: any) => {
      toast({
        title: "신고 실패",
        description: error?.message || "신고 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Follow user mutation
  const followUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("POST", `/api/users/${userId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({
        title: "팔로우했습니다",
        description: "이제 이 사용자의 게시물을 볼 수 있습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "팔로우 실패",
        description: error?.message || "팔로우 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    if (!newPost.trim()) {
      toast({
        title: "내용을 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate({
      content: newPost,
      type: postType,
      media: selectedImages.length > 0 ? selectedImages : undefined,
    });
  };

  const handleLike = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const handleComment = (postId: number) => {
    setSelectedPostForComment(postId);
    setCommentDialogOpen(true);
  };

  const handleShare = async (postId: number) => {
    try {
      const url = `${window.location.origin}/feed?post=${postId}`;
      if (navigator.share) {
        await navigator.share({
          title: "게시물 공유",
          text: "이 게시물을 확인해보세요!",
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "링크가 복사되었습니다",
          description: "게시물 링크를 클립보드에 복사했습니다.",
        });
      }
      // Share count 업데이트
      await apiRequest("POST", `/api/community/posts/${postId}/share`);
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    } catch (error: any) {
      if (error.name !== "AbortError") {
        toast({
          title: "공유 실패",
          description: error?.message || "공유 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBookmark = (postId: number) => {
    bookmarkPostMutation.mutate(postId);
  };

  const handleReport = (postId: number) => {
    setSelectedPostId(postId);
    setReportDialogOpen(true);
  };

  const submitReport = () => {
    if (!selectedPostId || !reportReason) {
      toast({
        title: "신고 사유를 선택해주세요",
        variant: "destructive",
      });
      return;
    }
    reportPostMutation.mutate({
      postId: selectedPostId,
      reason: reportReason,
      description: reportDescription || undefined,
    });
  };

  const handleSubmitComment = () => {
    if (!newComment.trim() || !selectedPostForComment) return;
    createCommentMutation.mutate({
      postId: selectedPostForComment,
      content: newComment,
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast({
        title: "이미지는 최대 5개까지 업로드할 수 있습니다",
        variant: "destructive",
      });
      return;
    }
    setSelectedImages(files);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingPosts) {
      setPage((prev) => prev + 1);
    }
  };

  // Mock data for feed posts (fallback)
  const mockFeedPosts: FeedPost[] = [
    {
      id: 1,
      type: 'job_post',
      author: {
        id: 1,
        name: 'MongolTech',
        avatar: '',
        title: 'HR 매니저',
        company: 'MongolTech',
        verified: true
      },
      content: '🚀 몽골테크에서 시니어 풀스택 개발자를 모십니다!\n\n우리와 함께 몽골의 디지털 미래를 만들어갈 개발자를 찾고 있습니다. React, Node.js 경험이 있으신 분들의 많은 지원 바랍니다.',
      metadata: {
        jobTitle: '시니어 풀스택 개발자',
        company: 'MongolTech',
        location: '울란바토르',
        salary: '₮2,500,000 - ₮4,000,000',
        tags: ['React', 'Node.js', 'MongoDB', '풀스택']
      },
      stats: {
        likes: 24,
        comments: 8,
        shares: 5
      },
      userInteraction: {
        liked: true,
        bookmarked: false
      },
      createdAt: '2024-01-20T10:30:00Z'
    },
    {
      id: 2,
      type: 'career_tip',
      author: {
        id: 2,
        name: '김커리어',
        avatar: '',
        title: '커리어 코치',
        company: 'CareerPath Mongolia',
        verified: false
      },
      content: '💡 면접에서 자주 묻는 질문과 답변 팁!\n\n1. "자신의 강점과 약점은?" - 구체적인 사례와 개선 노력을 함께 말하세요\n2. "5년 후 목표는?" - 회사와 개인의 성장을 연결해서 답하세요\n3. "왜 이 회사를 선택했나?" - 회사의 가치와 본인의 가치관을 연결하세요\n\n준비된 면접은 성공의 첫걸음입니다! 👍',
      stats: {
        likes: 89,
        comments: 23,
        shares: 45
      },
      userInteraction: {
        liked: false,
        bookmarked: true
      },
      createdAt: '2024-01-19T15:45:00Z'
    },
    {
      id: 3,
      type: 'user_achievement',
      author: {
        id: 3,
        name: '이개발자',
        avatar: '',
        title: 'Frontend Developer',
        company: 'TechStartup',
        verified: false
      },
      content: '🎉 드디어 첫 회사에 입사했습니다!\n\n6개월간의 취업 준비 끝에 꿈꾸던 프론트엔드 개발자로 첫 발을 내딛게 되었습니다. 포기하지 않고 계속 도전한 결과라고 생각합니다.\n\n취업 준비하시는 모든 분들, 힘내세요! 💪',
      stats: {
        likes: 156,
        comments: 34,
        shares: 12
      },
      userInteraction: {
        liked: true,
        bookmarked: false
      },
      createdAt: '2024-01-19T09:20:00Z'
    },
    {
      id: 4,
      type: 'industry_news',
      author: {
        id: 4,
        name: '몽골 IT 협회',
        avatar: '',
        title: '공식 계정',
        company: '몽골 IT 협회',
        verified: true
      },
      content: '📊 2024년 몽골 IT 산업 전망 보고서가 발표되었습니다!\n\n주요 내용:\n• IT 인력 수요 30% 증가 예상\n• 원격 근무 확산으로 글로벌 기업 진출 기회 확대\n• AI/ML 분야 투자 증가\n• 사이버 보안 전문가 급증 수요\n\n몽골 IT 산업의 밝은 미래가 기대됩니다! 🚀',
      stats: {
        likes: 67,
        comments: 12,
        shares: 28
      },
      userInteraction: {
        liked: false,
        bookmarked: true
      },
      createdAt: '2024-01-18T14:10:00Z'
    }
  ];

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'job_post': return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'career_tip': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'user_achievement': return <Award className="w-4 h-4 text-yellow-600" />;
      case 'industry_news': return <FileText className="w-4 h-4 text-purple-600" />;
      case 'company_update': return <Building className="w-4 h-4 text-orange-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    return `${Math.floor(diffInHours / 24)}일 전`;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Trending Topics */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Hash className="w-5 h-5 text-blue-600" />
                      트렌딩 토픽
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">#몽골IT</span>
                        <span className="text-xs text-muted-foreground">2.1k 게시물</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">#개발자채용</span>
                        <span className="text-xs text-muted-foreground">850 게시물</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">#원격근무</span>
                        <span className="text-xs text-muted-foreground">650 게시물</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">#스타트업</span>
                        <span className="text-xs text-muted-foreground">420 게시물</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Suggested Connections */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-green-600" />
                      추천 연결
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                            김
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">김개발</div>
                          <div className="text-xs text-muted-foreground">Senior Developer at TechCorp</div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // Mock user ID - 실제로는 추천 연결에서 사용자 ID를 가져와야 함
                            toast({
                              title: "팔로우 기능",
                              description: "사용자 ID를 연동해야 합니다.",
                            });
                          }}
                        >
                          팔로우
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            이
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">이디자인</div>
                          <div className="text-xs text-muted-foreground">UX Designer at CreativeLab</div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // Mock user ID - 실제로는 추천 연결에서 사용자 ID를 가져와야 함
                            toast({
                              title: "팔로우 기능",
                              description: "사용자 ID를 연동해야 합니다.",
                            });
                          }}
                        >
                          팔로우
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              
              {/* Create Post Section */}
              <Card className="mb-8">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="무엇을 공유하고 싶으신가요?"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="min-h-[80px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 dark:text-gray-400"
                          asChild
                        >
                          <span>
                            <ImageIcon className="w-4 h-4 mr-2" />
                            사진 {selectedImages.length > 0 && `(${selectedImages.length})`}
                          </span>
                        </Button>
                      </label>
                      <Select value={postType} onValueChange={(value: any) => setPostType(value)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user_achievement">일반 게시물</SelectItem>
                          <SelectItem value="career_tip">커리어 팁</SelectItem>
                          <SelectItem value="industry_news">산업 뉴스</SelectItem>
                          <SelectItem value="company_update">회사 소식</SelectItem>
                          <SelectItem value="job_post">채용공고</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={!newPost.trim() || createPostMutation.isPending}
                      onClick={handleCreatePost}
                    >
                      {createPostMutation.isPending ? "게시 중..." : "게시"}
                    </Button>
                  </div>
                  {selectedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white p-0"
                            onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Feed Posts */}
              <div className="space-y-6">
                {loadingPosts && feedPosts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">로딩 중...</div>
                ) : feedPosts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">게시물이 없습니다.</div>
                ) : (
                  feedPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                              {post.author.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {post.author.name}
                              </span>
                              {post.author.verified && (
                                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                              {getPostTypeIcon(post.type)}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <span>{post.author.title}</span>
                              {post.author.company && (
                                <>
                                  <span>•</span>
                                  <span>{post.author.company}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{getTimeAgo(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleReport(post.id)}>
                              <Flag className="w-4 h-4 mr-2 text-red-500" />
                              신고하기
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Post Content */}
                      <div className="text-gray-900 dark:text-gray-100 whitespace-pre-line">
                        {post.content}
                      </div>
                      
                      {/* Job Metadata */}
                      {post.type === 'job_post' && post.metadata && (
                        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-lg text-blue-900 dark:text-blue-100">
                                  {post.metadata.jobTitle}
                                </h4>
                                <p className="text-blue-700 dark:text-blue-300">{post.metadata.company}</p>
                              </div>
                              <Badge className="bg-blue-600 text-white">채용공고</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <MapPin className="w-4 h-4" />
                                <span>{post.metadata.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <TrendingUp className="w-4 h-4" />
                                <span>{post.metadata.salary}</span>
                              </div>
                            </div>
                            
                            {post.metadata.tags && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {post.metadata.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <Button 
                              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => {
                                if (post.metadata?.jobId) {
                                  window.location.href = `/user/jobs/${post.metadata.jobId}`;
                                } else {
                                  toast({
                                    title: "채용공고 정보가 없습니다",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              지원하기
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                      
                      <Separator />
                      
                      {/* Post Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 ${post.userInteraction.liked ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}
                          >
                            <Heart className={`w-4 h-4 ${post.userInteraction.liked ? 'fill-current' : ''}`} />
                            <span>{post.stats.likes}</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleComment(post.id)}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.stats.comments}</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(post.id)}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>{post.stats.shares}</span>
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmark(post.id)}
                          className={`${post.userInteraction.bookmarked ? 'text-yellow-600' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                          <Bookmark className={`w-4 h-4 ${post.userInteraction.bookmarked ? 'fill-current' : ''}`} />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleReport(post.id)}>
                              <Flag className="w-4 h-4 mr-2 text-red-500" />
                              신고하기
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
              
              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleLoadMore}
                    disabled={loadingPosts}
                  >
                    {loadingPosts ? "로딩 중..." : "더 많은 게시물 보기"}
                  </Button>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      최근 활동
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="font-medium">김개발</span>님이 회사 소식을 공유했습니다
                        <div className="text-xs text-muted-foreground">2시간 전</div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">이디자인</span>님이 당신의 게시물에 좋아요를 눌렀습니다
                        <div className="text-xs text-muted-foreground">4시간 전</div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">MongolTech</span>에서 새 채용공고를 게시했습니다
                        <div className="text-xs text-muted-foreground">6시간 전</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-lg">빠른 작업</h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Briefcase className="w-4 h-4 mr-2" />
                      채용공고 작성
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      팀원 초대
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      이벤트 생성
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>댓글</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {/* Comments List */}
            {commentsData?.comments?.map((comment: any) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{comment.authorName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.authorName}</span>
                    <span className="text-xs text-gray-500">{getTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
              </div>
            ))}
            {(!commentsData?.comments || commentsData.comments.length === 0) && (
              <div className="text-center py-4 text-gray-500 text-sm">댓글이 없습니다.</div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Textarea
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || createCommentMutation.isPending}
              className="self-end"
            >
              {createCommentMutation.isPending ? "작성 중..." : "작성"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              게시글 신고
            </DialogTitle>
            <DialogDescription>
              부적절한 게시글을 신고해주세요. 검토 후 조치하겠습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportReason">신고 사유 *</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="신고 사유를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">스팸</SelectItem>
                  <SelectItem value="harassment">괴롭힘/혐오</SelectItem>
                  <SelectItem value="inappropriate">부적절한 내용</SelectItem>
                  <SelectItem value="false_info">거짓 정보</SelectItem>
                  <SelectItem value="copyright">저작권 침해</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportDescription">상세 설명 (선택사항)</Label>
              <Textarea
                id="reportDescription"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="신고 사유에 대한 상세 설명을 입력하세요"
                rows={4}
                className="mt-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                취소
              </Button>
              <Button
                onClick={submitReport}
                disabled={!reportReason || reportPostMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {reportPostMutation.isPending ? "처리 중..." : "신고하기"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </>
  );
}