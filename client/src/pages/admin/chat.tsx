import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Shield,
  Users,
  Building2,
  Clock,
  User,
  ExternalLink,
} from "lucide-react";
import { Link } from "wouter";

interface ChatRoom {
  id: number;
  jobId: number;
  jobTitle: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  employerId: number;
  employerName: string;
  employerEmail: string;
  companyId: number;
  companyName: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  status: "active" | "closed" | "archived";
  createdAt: string;
}

export default function AdminChat() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);

  const { data: chatRooms, isLoading } = useQuery<ChatRoom[]>({
    queryKey: ["/api/admin/chat/rooms", { search: searchQuery, status: selectedStatus }],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/chat/stats"],
  });

  const handleViewChat = (room: ChatRoom) => {
    // Open chat in new window or navigate to user chat with room ID
    window.open(`/user/chat?roomId=${room.id}&admin=true`, "_blank");
  };

  const filteredRooms = chatRooms || [];

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            채팅 모니터링
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            모든 채팅방을 모니터링하고 필요시 중재할 수 있습니다
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 채팅방</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRooms || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 채팅방</CardTitle>
              <MessageSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeRooms || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘 메시지</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.todayMessages || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">신고된 채팅</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.reportedRooms || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle>채팅방 목록</CardTitle>
            <CardDescription>
              모든 채팅방을 조회하고 모니터링할 수 있습니다
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="구직자명, 기업명, 채용공고로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">전체</TabsTrigger>
                  <TabsTrigger value="active">활성</TabsTrigger>
                  <TabsTrigger value="closed">종료됨</TabsTrigger>
                  <TabsTrigger value="archived">보관됨</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Chat Rooms Table */}
            <div className="rounded-md border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">채팅방</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">구직자</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">기업</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">채용공고</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">상태</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">최근 메시지</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-gray-300">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                          <td className="p-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                          <td className="p-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                          <td className="p-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                          <td className="p-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                          <td className="p-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                          <td className="p-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                          <td className="p-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                        </tr>
                      ))
                    ) : filteredRooms.length > 0 ? (
                      filteredRooms.map((room) => (
                        <tr key={room.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                                <MessageSquare className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium">#{room.id}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(room.createdAt).toLocaleDateString('ko-KR')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-500 text-white">
                                  {room.candidateName?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">{room.candidateName}</div>
                                <div className="text-xs text-gray-500">{room.candidateEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium text-sm">{room.companyName}</div>
                                <div className="text-xs text-gray-500">{room.employerName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div className="font-medium">{room.jobTitle}</div>
                              <Link href={`/user/jobs/${room.jobId}`} target="_blank">
                                <Button variant="ghost" size="sm" className="h-6 text-xs p-0">
                                  채용공고 보기
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge 
                              variant={
                                room.status === "active" ? "default" : 
                                room.status === "closed" ? "secondary" : "outline"
                              }
                            >
                              {room.status === "active" ? "활성" : 
                               room.status === "closed" ? "종료됨" : "보관됨"}
                            </Badge>
                            {room.unreadCount > 0 && (
                              <Badge variant="destructive" className="ml-2">
                                {room.unreadCount}
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">
                            {room.lastMessage ? (
                              <div className="text-sm">
                                <div className="text-gray-600 dark:text-gray-400 line-clamp-1">
                                  {room.lastMessage}
                                </div>
                                {room.lastMessageAt && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {new Date(room.lastMessageAt).toLocaleString('ko-KR')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">메시지 없음</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewChat(room)}
                                title="채팅 보기"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                보기
                              </Button>
                              <Link href={`/admin/users?userId=${room.candidateId}`} target="_blank">
                                <Button variant="ghost" size="sm" title="관리자에서 구직자 보기">
                                  <User className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/user/profile/${room.candidateId}`} target="_blank">
                                <Button variant="ghost" size="sm" title="웹사이트 프로필 보기">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/admin/companies?companyId=${room.companyId}`} target="_blank">
                                <Button variant="ghost" size="sm" title="관리자에서 기업 보기">
                                  <Building2 className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/user/companies/${room.companyId}`} target="_blank">
                                <Button variant="ghost" size="sm" title="웹사이트 기업 프로필 보기">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">
                          채팅방이 없습니다
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}