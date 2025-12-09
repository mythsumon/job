import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Image as ImageIcon,
  Video,
  Briefcase,
  TrendingUp,
  Award,
  Building,
  Hash,
  ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface FeedSectionProps {
  compact?: boolean;
  showCreatePost?: boolean;
}

export function FeedSection({ compact = false, showCreatePost = true }: FeedSectionProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [newPost, setNewPost] = useState("");

  const feedPosts = [
    {
      id: 1,
      type: 'job_post',
      author: {
        name: 'MongolTech',
        avatar: '',
        title: 'HR 매니저',
        company: 'MongolTech',
        verified: true
      },
      content: '🚀 몽골테크에서 시니어 풀스택 개발자를 모십니다! React, Node.js 경험이 있으신 분들의 많은 지원 바랍니다.',
      metadata: {
        jobTitle: '시니어 풀스택 개발자',
        company: 'MongolTech',
        location: '울란바토르',
        salary: '₮2,500,000 - ₮4,000,000',
        tags: ['React', 'Node.js', 'MongoDB']
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
        name: '김커리어',
        avatar: '',
        title: '커리어 코치',
        company: 'CareerPath Mongolia',
        verified: false
      },
      content: '💡 면접에서 자주 묻는 질문과 답변 팁! 준비된 면접은 성공의 첫걸음입니다! 👍',
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
  ];

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'job_post': return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'career_tip': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'user_achievement': return <Award className="w-4 h-4 text-yellow-600" />;
      case 'company_update': return <Building className="w-4 h-4 text-orange-600" />;
      default: return null;
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

  if (compact) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-lg">커뮤니티 피드</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/user/feed")}
          >
            모두 보기
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedPosts.slice(0, 2).map((post) => (
              <div key={post.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {post.author.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {post.author.name}
                      </span>
                      {post.author.verified && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                      {getPostTypeIcon(post.type)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {post.author.title} • {getTimeAgo(post.createdAt)}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white mt-2 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`h-6 px-2 text-xs ${post.userInteraction.liked ? 'text-red-600' : 'text-gray-600'}`}
                      >
                        <Heart className={`w-3 h-3 ${post.userInteraction.liked ? 'fill-current' : ''}`} />
                        <span className="ml-1">{post.stats.likes}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleComment(post.id)}
                        className="h-6 px-2 text-xs text-gray-600"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span className="ml-1">{post.stats.comments}</span>
                      </Button>
                    </div>
                  </div>
                </div>
                {post.id !== feedPosts.length && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showCreatePost && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {user?.fullName?.charAt(0) || 'U'}
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
      )}

      <div className="space-y-4">
        {feedPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                      {post.author.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
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
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-gray-900 dark:text-gray-100 whitespace-pre-line">
                {post.content}
              </div>
              
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
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-blue-700 dark:text-blue-300">
                        📍 {post.metadata.location}
                      </div>
                      <div className="text-blue-700 dark:text-blue-300">
                        💰 {post.metadata.salary}
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
    </div>
  );
}

