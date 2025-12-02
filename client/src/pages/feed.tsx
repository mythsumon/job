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
  UserPlus
} from "lucide-react";

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
  
  // Mock data for feed posts
  const feedPosts: FeedPost[] = [
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

  const handleLike = (postId: number) => {
    console.log('Liked post:', postId);
  };

  const handleComment = (postId: number) => {
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: number) => {
    console.log('Shared post:', postId);
  };

  const handleBookmark = (postId: number) => {
    console.log('Bookmarked post:', postId);
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
                        <Button size="sm" variant="outline">팔로우</Button>
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
                        <Button size="sm" variant="outline">팔로우</Button>
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
                      <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        사진
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                        <Video className="w-4 h-4 mr-2" />
                        동영상
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                        <Briefcase className="w-4 h-4 mr-2" />
                        채용공고
                      </Button>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={!newPost.trim()}
                    >
                      게시
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Feed Posts */}
              <div className="space-y-6">
                {feedPosts.map((post) => (
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
                        
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
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
                            
                            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Load More */}
              <div className="text-center mt-8">
                <Button variant="outline" className="w-full">
                  더 많은 게시물 보기
                </Button>
              </div>
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
    </>
  );
}