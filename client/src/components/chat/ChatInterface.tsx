import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Send, Search, MessageCircle, X, RefreshCw, Trash2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export default function ChatInterface() {
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

  return (
    <div className="h-[calc(100vh-120px)] flex bg-background">
      {/* Platform Features Sidebar */}
      <div className="w-64 border-r border-border bg-muted/30">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm mb-4">빠른 액세스</h3>
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm h-8"
              onClick={() => window.location.href = '/jobs'}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0v2a2 2 0 002 2h4a2 2 0 002-2V6" />
              </svg>
              일자리 검색
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm h-8"
              onClick={() => window.location.href = '/companies'}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              기업 정보
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm h-8"
              onClick={() => window.location.href = '/user/profile'}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              내 프로필
            </Button>
          </div>
        </div>
        
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm mb-3">최근 활동</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>새로운 일자리 알림 2개</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>프로필 조회 5회</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>지원 현황 업데이트</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm mb-3">추천 기능</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-xs h-7"
            >
              <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI 이력서 분석
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-xs h-7"
            >
              <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              맞춤 일자리 추천
            </Button>
          </div>
        </div>

        <div className="flex-1"></div>
        
        <div className="p-4 border-t border-border">
          <h3 className="font-semibold text-sm mb-3">도움말</h3>
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-xs h-7 text-muted-foreground"
            >
              <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              자주 묻는 질문
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-xs h-7 text-muted-foreground"
            >
              <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              고객 지원
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Rooms List */}
      <div className="w-1/3 border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100%-120px)]">
          {roomsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No chats available</p>
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
                      Accept Reopen
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
                      Request Reopen
                    </Button>
                  )}
                  
                  {selectedChatRoom?.status === 'active' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <X className="w-4 h-4 mr-2" />
                          Close Chat
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Close Chat</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to close this chat? The other person can request to reopen it later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => closeChatMutation.mutate(selectedRoom)}>
                            Close Chat
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this chat? This action cannot be undone and you will lose all message history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteChatMutation.mutate(selectedRoom)}>
                          Delete Chat
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
                  <p>No messages yet. Start the conversation!</p>
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
                      ? 'This chat is closed. Request to reopen it to continue messaging.'
                      : selectedChatRoom?.status === 'pending_reopen'
                      ? 'Waiting for the other person to accept the reopen request.'
                      : 'Cannot send messages in this chat.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
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
              <h3 className="text-lg font-medium mb-2">Select a chat to start messaging</h3>
              <p>Choose a conversation from the left to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}