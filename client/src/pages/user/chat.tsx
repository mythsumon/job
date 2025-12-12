import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Send, Search, MessageCircle, X, RefreshCw, Trash2, Clock, CheckCircle2, AlertCircle, Briefcase, Users, FileText, TrendingUp, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { RoleGuard } from "@/components/common/RoleGuard";
import { Link } from "wouter";

interface ChatRoom {
  id: number;
  employerId: number;
  candidateId: number;
  jobId: number;
  status: 'active' | 'closed' | 'pending_reopen';
  closedBy?: number;
  closedAt?: string;
  reopenRequestedBy?: number;
  reopenRequestedAt?: string;
  lastMessageAt: string;
  employer: { id: number; fullName: string; };
  candidate: { id: number; fullName: string; };
  job: { id: number; title: string; };
  unreadCount: number;
}

interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  message: string;
  messageType: string;
  sentAt: string;
  sender: { id: number; fullName: string; };
  isRead: boolean;
}

export default function UserChat() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedRoom]);

  // Fetch chat rooms
  const { data: chatRooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["/api/chat/rooms", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No authentication token');
      
      const res = await fetch(`/api/chat/rooms?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch chat rooms');
      return res.json();
    },
    enabled: !!user?.id,
    refetchInterval: 10000,
  });

  // Fetch messages for selected room
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/chat/messages", selectedRoom],
    enabled: !!selectedRoom,
    refetchInterval: 5000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { roomId: number; message: string }) => {
      await apiRequest("POST", "/api/chat/messages", {
        roomId: messageData.roomId,
        senderId: user?.id,
        message: messageData.message,
        messageType: "text"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
      setNewMessage("");
      scrollToBottom();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  });

  // Close chat mutation
  const closeChatMutation = useMutation({
    mutationFn: async (roomId: number) => {
      await apiRequest("POST", `/api/chat/rooms/${roomId}/close`, {
        userId: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
      toast({
        title: "Success",
        description: "Chat closed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to close chat",
        variant: "destructive"
      });
    }
  });

  // Request reopen mutation
  const requestReopenMutation = useMutation({
    mutationFn: async (roomId: number) => {
      await apiRequest("POST", `/api/chat/rooms/${roomId}/reopen-request`, {
        userId: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
      toast({
        title: "Success",
        description: "Reopen request sent",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to request reopen",
        variant: "destructive"
      });
    }
  });

  // Accept reopen mutation
  const acceptReopenMutation = useMutation({
    mutationFn: async (roomId: number) => {
      await apiRequest("POST", `/api/chat/rooms/${roomId}/accept-reopen`, {
        userId: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
      toast({
        title: "Success",
        description: "Chat reopened successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept reopen",
        variant: "destructive"
      });
    }
  });

  // Delete chat mutation
  const deleteChatMutation = useMutation({
    mutationFn: async (roomId: number) => {
      await apiRequest("POST", `/api/chat/rooms/${roomId}/delete`, {
        userId: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
      setSelectedRoom(null);
      toast({
        title: "Success",
        description: "Chat deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    const selectedChatRoom = chatRooms.find((room: ChatRoom) => room.id === selectedRoom);
    if (selectedChatRoom?.status !== 'active') {
      toast({
        title: "Error",
        description: "Cannot send message in closed chat",
        variant: "destructive"
      });
      return;
    }

    sendMessageMutation.mutate({
      roomId: selectedRoom,
      message: newMessage.trim()
    });
  };

  const handleRoomSelect = async (roomId: number) => {
    setSelectedRoom(roomId);
    
    // Mark messages as read
    try {
      await apiRequest("POST", `/api/chat/rooms/${roomId}/mark-read`, {
        userId: user?.id
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const filteredRooms = chatRooms.filter((room: ChatRoom) => {
    const otherUserName = user?.userType === 'employer' ? room.candidate.fullName : room.employer.fullName;
    return otherUserName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           room.job.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedChatRoom = chatRooms.find((room: ChatRoom) => room.id === selectedRoom);
  const otherUser = selectedChatRoom 
    ? (user?.userType === 'employer' ? selectedChatRoom.candidate : selectedChatRoom.employer)
    : null;

  const getStatusBadge = (room: ChatRoom) => {
    switch (room.status) {
      case 'active':
        return <Badge variant="default" className="text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case 'closed':
        return <Badge variant="secondary" className="text-xs"><X className="w-3 h-3 mr-1" />Closed</Badge>;
      case 'pending_reopen':
        return <Badge variant="outline" className="text-xs"><Clock className="w-3 h-3 mr-1" />Pending Reopen</Badge>;
      default:
        return null;
    }
  };

  const canSendMessage = selectedChatRoom?.status === 'active';
  const canRequestReopen = selectedChatRoom?.status === 'closed';
  const canAcceptReopen = selectedChatRoom?.status === 'pending_reopen' && 
                         selectedChatRoom.reopenRequestedBy !== user?.id;

  // Calculate stats
  const totalChats = chatRooms.length;
  const activeChats = chatRooms.filter((r: ChatRoom) => r.status === 'active').length;
  const unreadTotal = chatRooms.reduce((sum: number, r: ChatRoom) => sum + (r.unreadCount || 0), 0);

  return (
    <RoleGuard allowedUserTypes={['candidate', 'employer', 'admin']}>
      <ProtectedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    메시지
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    채용 담당자와 소통하고 지원 현황을 확인하세요.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/user/jobs">
                    <Button variant="outline" size="sm">
                      <Briefcase className="w-4 h-4 mr-2" />
                      채용공고 찾기
                    </Button>
                  </Link>
                  <Link href="/user/applications">
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      지원 현황
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">전체 대화</p>
                      <p className="text-3xl font-bold text-blue-600">{totalChats}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">활성 대화</p>
                      <p className="text-3xl font-bold text-green-600">{activeChats}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">읽지 않은 메시지</p>
                      <p className="text-3xl font-bold text-orange-600">{unreadTotal}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      <Bell className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <Card className="overflow-hidden">
              <div className="h-[calc(100vh-28rem)] flex bg-background">
                {/* Chat Rooms List */}
                <div className="w-80 border-r border-border bg-muted/30 flex flex-col">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center space-x-2 mb-4">
                      <MessageCircle className="w-5 h-5" />
                      <h2 className="text-lg font-semibold">대화 목록</h2>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="대화 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    {roomsLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : filteredRooms.length === 0 ? (
                      <div className="text-center text-muted-foreground p-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>대화가 없습니다</p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {filteredRooms.map((room: ChatRoom) => {
                          const otherUser = user?.userType === 'employer' ? room.candidate : room.employer;
                          const isSelected = selectedRoom === room.id;
                          
                          return (
                            <Card
                              key={room.id}
                              className={`mb-2 cursor-pointer transition-colors hover:bg-accent ${
                                isSelected ? 'ring-2 ring-primary bg-accent' : ''
                              }`}
                              onClick={() => handleRoomSelect(room.id)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="w-10 h-10">
                                      <AvatarFallback>{otherUser?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-medium text-sm truncate">{otherUser?.fullName}</h3>
                                      <p className="text-xs text-muted-foreground truncate">{room.job.title}</p>
                                    </div>
                                  </div>
                                  {room.unreadCount > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      {room.unreadCount}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  {getStatusBadge(room)}
                                  {room.lastMessageAt && (
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(room.lastMessageAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 flex flex-col">
                  {selectedRoom ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-border bg-card">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>{otherUser?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{otherUser?.fullName}</h3>
                              <p className="text-sm text-muted-foreground">{selectedChatRoom?.job.title}</p>
                            </div>
                            {selectedChatRoom && getStatusBadge(selectedChatRoom)}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {selectedChatRoom?.status === 'pending_reopen' && canAcceptReopen && (
                              <Button
                                size="sm"
                                onClick={() => acceptReopenMutation.mutate(selectedRoom)}
                                disabled={acceptReopenMutation.isPending}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                재개 수락
                              </Button>
                            )}
                            
                            {canRequestReopen && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => requestReopenMutation.mutate(selectedRoom)}
                                disabled={requestReopenMutation.isPending}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                재개 요청
                              </Button>
                            )}
                            
                            {selectedChatRoom?.status === 'active' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <X className="w-4 h-4 mr-2" />
                                    대화 종료
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>대화 종료</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      이 대화를 종료하시겠습니까? 상대방이 나중에 재개를 요청할 수 있습니다.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => closeChatMutation.mutate(selectedRoom)}>
                                      종료
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  삭제
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>대화 삭제</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    이 대화를 삭제하시겠습니까? 이 작업은 취소할 수 없으며 모든 메시지 기록이 삭제됩니다.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>취소</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteChatMutation.mutate(selectedRoom)}>
                                    삭제
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>

                      {/* Messages Area */}
                      <ScrollArea className="flex-1 p-4">
                        {messagesLoading ? (
                          <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>아직 메시지가 없습니다. 대화를 시작해보세요!</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((message: ChatMessage) => {
                              const isOwnMessage = message.senderId === user?.id;
                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[70%] p-3 rounded-lg ${
                                      isOwnMessage
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                    }`}
                                  >
                                    <p className="text-sm">{message.message}</p>
                                    <p className={`text-xs mt-1 ${
                                      isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                    }`}>
                                      {new Date(message.sentAt).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="p-4 border-t border-border">
                        {!canSendMessage ? (
                          <div className="text-center py-4">
                            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {selectedChatRoom?.status === 'closed' 
                                ? '이 대화는 종료되었습니다. 재개를 요청하여 메시지를 계속 보낼 수 있습니다.'
                                : selectedChatRoom?.status === 'pending_reopen'
                                ? '재개 요청이 승인되기를 기다리는 중입니다.'
                                : '이 대화에서 메시지를 보낼 수 없습니다.'}
                            </p>
                          </div>
                        ) : (
                          <form onSubmit={handleSendMessage} className="flex space-x-2">
                            <Input
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="메시지를 입력하세요..."
                              disabled={sendMessageMutation.isPending || !canSendMessage}
                            />
                            <Button 
                              type="submit" 
                              disabled={!newMessage.trim() || sendMessageMutation.isPending || !canSendMessage}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </form>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">대화를 선택하세요</h3>
                        <p>왼쪽에서 대화를 선택하여 메시지를 확인하세요</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </main>
        </div>
      </ProtectedPage>
    </RoleGuard>
  );
}
