import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CompanyLayout } from "@/components/company/company-layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Send,
  Search,
  MessageCircle,
  Users,
  Clock,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Star,
  Archive,
  Trash2,
  Filter
} from "lucide-react";

interface ChatRoom {
  id: number;
  candidateId: number;
  employerId: number;
  jobId: number;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  candidate: {
    id: number;
    name: string;
    profileImage?: string;
    title?: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  job: {
    id: number;
    title: string;
    department: string;
  };
}

interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
  messageType: "text" | "file" | "system";
  sender: {
    id: number;
    name: string;
    profileImage?: string;
  };
}

export default function CompanyChat() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat rooms for company
  const { data: chatRooms = [], isLoading: loadingRooms } = useQuery({
    queryKey: ["/api/chat/rooms/company"],
    enabled: !!user?.id,
  });

  // Fetch messages for selected room
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["/api/chat/messages", selectedRoomId],
    enabled: !!selectedRoomId,
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (messageData: { roomId: number; content: string }) => {
      return apiRequest("POST", "/api/chat/messages", {
        ...messageData,
        senderId: user?.id,
        messageType: "text",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", selectedRoomId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms/company"] });
      setNewMessage("");
      scrollToBottom();
    },
  });

  // Mark messages as read
  const markAsRead = useMutation({
    mutationFn: async (roomId: number) => {
      return apiRequest("POST", `/api/chat/rooms/${roomId}/read`, {
        userId: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms/company"] });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedRoomId && Array.isArray(messages) && messages.length > 0) {
      markAsRead.mutate(selectedRoomId);
      scrollToBottom();
    }
  }, [selectedRoomId, messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoomId) return;

    sendMessage.mutate({
      roomId: selectedRoomId,
      content: newMessage.trim(),
    });
  };

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoomId(room.id);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('companyChat.time.justNow');
    if (diffInMinutes < 60) return t('companyChat.time.minutesAgo', { minutes: diffInMinutes });
    if (diffInMinutes < 1440) return t('companyChat.time.hoursAgo', { hours: Math.floor(diffInMinutes / 60) });
    return date.toLocaleDateString();
  };

  const getOnlineStatus = (candidate: ChatRoom['candidate']) => {
    if (candidate.isOnline) return t('companyChat.status.online');
    if (candidate.lastSeen) return t('companyChat.status.lastSeen', { time: formatTime(candidate.lastSeen) });
    return t('companyChat.status.offline');
  };

  const filteredRooms = Array.isArray(chatRooms) ? chatRooms.filter((room: ChatRoom) =>
    room.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.job.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const selectedRoom = Array.isArray(chatRooms) ? chatRooms.find((room: ChatRoom) => room.id === selectedRoomId) : undefined;

  return (
    <CompanyLayout>
      <div className="h-[calc(100vh-12rem)] flex">
        {/* Chat List Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('companyChat.title')}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('companyChat.searchConversations')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Room List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {loadingRooms ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-3 rounded-lg animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded mb-1"></div>
                          <div className="h-3 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : Array.isArray(chatRooms) && chatRooms.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {t('companyChat.noConversations')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('companyChat.startConversation')}
                  </p>
                </div>
              ) : (
                filteredRooms.map((room: ChatRoom) => (
                  <div
                    key={room.id}
                    onClick={() => handleRoomSelect(room)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedRoomId === room.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={room.candidate.profileImage} />
                          <AvatarFallback>{room.candidate.name?.[0] || 'C'}</AvatarFallback>
                        </Avatar>
                        {room.candidate.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {room.candidate.name}
                          </h4>
                          {room.lastMessageAt && (
                            <span className="text-xs text-gray-500">
                              {formatTime(room.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {room.job.title}
                        </p>
                        {room.lastMessage && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {room.lastMessage}
                          </p>
                        )}
                      </div>
                      {room.unreadCount > 0 && (
                        <Badge className="bg-blue-600 text-white text-xs">
                          {room.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedRoom.candidate.profileImage} />
                      <AvatarFallback>{selectedRoom.candidate.name?.[0] || 'C'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedRoom.candidate.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getOnlineStatus(selectedRoom.candidate)} • {selectedRoom.job.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {loadingMessages ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-start space-x-3">
                            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-300 rounded mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : Array.isArray(messages) && messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {t('companyChat.noMessages')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t('companyChat.startConversationWith', { name: selectedRoom.candidate.name })}
                      </p>
                    </div>
                  ) : (
                    Array.isArray(messages) && messages.map((message: ChatMessage) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === user?.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-70">
                              {formatTime(message.createdAt)}
                            </span>
                            {message.senderId === user?.id && (
                              <div className="ml-2">
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3 opacity-70" />
                                ) : (
                                  <Check className="h-3 w-3 opacity-70" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <Button type="button" variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('companyChat.typeMessage')}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim() || sendMessage.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('companyChat.selectConversation')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('companyChat.selectConversationDescription')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </CompanyLayout>
  );
}