import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/header";
import { 
  Send, 
  MessageCircle, 
  User, 
  Briefcase, 
  Search,
  Plus,
  Archive,
  Settings,
  Bell,
  UserPlus,
  Calendar,
  BookOpen,
  TrendingUp,
  Building,
  MapPin,
  Clock,
  Star
} from "lucide-react";
import type { ChatRoomWithParticipants, ChatMessageWithSender } from "@shared/schema";

// Mock user ID for demo - in real app this would come from auth context
const CURRENT_USER_ID = 1;

export default function Chat() {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isTyping, setIsTyping] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat rooms
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['/api/chat/rooms/user', CURRENT_USER_ID],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/chat/rooms/user/${CURRENT_USER_ID}`);
      return response.json();
    },
  });

  // Fetch messages for selected room
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat/messages', selectedRoom],
    queryFn: async () => {
      if (!selectedRoom) return [];
      const response = await apiRequest('GET', `/api/chat/rooms/${selectedRoom}/messages`);
      return response.json();
    },
    enabled: !!selectedRoom,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { roomId: number; message: string }) => {
      const response = await apiRequest('POST', `/api/chat/rooms/${messageData.roomId}/messages`, {
        message: messageData.message,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', selectedRoom] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/rooms/user', CURRENT_USER_ID] });
    },
  });

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_message' && data.roomId === selectedRoom) {
        queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', selectedRoom] });
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [selectedRoom, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedRoom) return;
    
    sendMessageMutation.mutate({
      roomId: selectedRoom,
      message: message.trim(),
    });
    
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (roomsLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Sidebar - Platform Features */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      빠른 작업
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Briefcase className="w-4 h-4 mr-2" />
                      채용공고 작성
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <UserPlus className="w-4 h-4 mr-2" />
                      인재 검색
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      면접 일정
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      커리어 가이드
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Bell className="w-5 h-5 text-green-600" />
                      최근 활동
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Building className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">MongolTech</span>
                        </div>
                        <p className="text-muted-foreground">새 채용공고 게시</p>
                        <div className="text-xs text-muted-foreground">2시간 전</div>
                      </div>
                      <Separator />
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-green-600" />
                          <span className="font-medium">김개발자</span>
                        </div>
                        <p className="text-muted-foreground">지원서 제출</p>
                        <div className="text-xs text-muted-foreground">4시간 전</div>
                      </div>
                      <Separator />
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium">이디자이너</span>
                        </div>
                        <p className="text-muted-foreground">프로필 업데이트</p>
                        <div className="text-xs text-muted-foreground">6시간 전</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <div className="flex h-[80vh] bg-white dark:bg-card rounded-lg border border-border overflow-hidden">
                
                {/* Chat Rooms Sidebar */}
                <div className="w-80 border-r border-border">
                  <div className="p-4 border-b border-border">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <MessageCircle className="w-6 h-6 text-primary" />
                      Messages
                    </h1>
                  </div>
                  
                  <div className="h-[calc(80vh-80px)] overflow-y-auto">
                    {rooms.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No conversations yet</p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {rooms.map((room: ChatRoomWithParticipants) => {
                          const isEmployer = room.employerId === CURRENT_USER_ID;
                          const otherUser = isEmployer ? room.candidate : room.employer;
                          
                          return (
                            <Card
                              key={room.id}
                              className={`mb-2 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                selectedRoom === room.id ? 'ring-2 ring-primary' : ''
                              }`}
                              onClick={() => setSelectedRoom(room.id)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start gap-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={otherUser.profilePicture || undefined} />
                                    <AvatarFallback>
                                      {otherUser.fullName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-medium text-sm truncate">
                                        {otherUser.fullName}
                                      </h3>
                                      {room.unreadCount && room.unreadCount > 0 && (
                                        <Badge variant="destructive" className="text-xs">
                                          {room.unreadCount}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      <Briefcase className="w-3 h-3" />
                                      <span className="truncate">{room.job.title}</span>
                                    </div>
                                    
                                    {room.lastMessage && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {room.lastMessage.message}
                                      </p>
                                    )}
                                    
                                    {room.lastMessageAt && (
                                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Last message recently
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 flex flex-col">
                  {selectedRoom ? (
                    <>
                      {/* Chat Header */}
                      <div className="bg-white dark:bg-card border-b border-border p-4">
                        {(() => {
                          const selectedRoomData = rooms.find((room: ChatRoomWithParticipants) => room.id === selectedRoom);
                          if (!selectedRoomData) return null;
                          
                          const isEmployer = selectedRoomData.employerId === CURRENT_USER_ID;
                          const otherUser = isEmployer ? selectedRoomData.candidate : selectedRoomData.employer;
                          
                          return (
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={otherUser.profilePicture || undefined} />
                                <AvatarFallback>
                                  {otherUser.fullName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                                  {otherUser.fullName}
                                </h2>
                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                  <Briefcase className="w-3 h-3" />
                                  <span>{selectedRoomData.job.title}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Messages */}
                      <div className="flex-1 h-[calc(80vh-200px)] overflow-y-auto">
                        {messagesLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <div className="text-center">
                              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p>Start the conversation</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 space-y-4">
                            {messages.map((message: ChatMessageWithSender) => {
                              const isOwnMessage = message.senderId === CURRENT_USER_ID;
                              
                              return (
                                <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={message.sender.profilePicture || undefined} />
                                      <AvatarFallback className="text-xs">
                                        {message.sender.fullName.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className={`rounded-lg px-4 py-2 ${
                                      isOwnMessage 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                    }`}>
                                      <p className="text-sm">{message.message}</p>
                                      <p className={`text-xs mt-1 ${
                                        isOwnMessage 
                                          ? 'text-primary-foreground/70' 
                                          : 'text-gray-500 dark:text-gray-400'
                                      }`}>
                                        Recently
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </div>

                      {/* Message Input */}
                      <div className="bg-white dark:bg-card border-t border-border p-4">
                        <div className="flex gap-2">
                          <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1"
                            disabled={sendMessageMutation.isPending}
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!message.trim() || sendMessageMutation.isPending}
                            size="icon"
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center bg-white dark:bg-card">
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
                        <p>Choose a conversation from the sidebar to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}