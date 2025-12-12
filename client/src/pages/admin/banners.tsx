import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink, Monitor, CheckCircle, XCircle, TrendingUp, Search, Image as ImageIcon, X } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, apiGet } from "@/lib/queryClient";

interface Banner {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  position: string;
  priority: number;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  clickCount: number;
  viewCount: number;
  createdAt: string;
}

interface BannerFormData {
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  priority: number;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export default function AdminBanners() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    content: "",
    imageUrl: "",
    linkUrl: "",
    position: "jobs_header",
    priority: 0,
    backgroundColor: "#f59e0b",
    textColor: "#ffffff",
    isActive: true,
    startDate: "",
    endDate: ""
  });

  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ["/api/admin/banners"],
    queryFn: async () => {
      return await apiGet("/api/admin/banners");
    },
  });

  const createBannerMutation = useMutation({
    mutationFn: async (data: BannerFormData) => {
      return apiRequest("POST", "/api/admin/banners", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({ title: "배너가 성공적으로 생성되었습니다." });
    },
    onError: () => {
      toast({ title: "배너 생성에 실패했습니다.", variant: "destructive" });
    },
  });

  const updateBannerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BannerFormData }) => {
      return apiRequest("PUT", `/api/admin/banners/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      setEditingBanner(null);
      resetForm();
      toast({ title: "배너가 성공적으로 수정되었습니다." });
    },
    onError: () => {
      toast({ title: "배너 수정에 실패했습니다.", variant: "destructive" });
    },
  });

  const deleteBannerMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({ title: "배너가 성공적으로 삭제되었습니다." });
    },
    onError: () => {
      toast({ title: "배너 삭제에 실패했습니다.", variant: "destructive" });
    },
  });

  const toggleBannerMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/admin/banners/${id}/toggle`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({ title: "배너 상태가 변경되었습니다." });
    },
    onError: () => {
      toast({ title: "배너 상태 변경에 실패했습니다.", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      imageUrl: "",
      linkUrl: "",
      position: "jobs_header",
      priority: 0,
      backgroundColor: "#f59e0b",
      textColor: "#ffffff",
      isActive: true,
      startDate: "",
      endDate: ""
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // UI only - create object URL for preview
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      content: banner.content || "",
      imageUrl: banner.imageUrl || "",
      linkUrl: banner.linkUrl || "",
      position: banner.position,
      priority: banner.priority,
      backgroundColor: banner.backgroundColor,
      textColor: banner.textColor,
      isActive: banner.isActive,
      startDate: banner.startDate ? banner.startDate.split('T')[0] : "",
      endDate: banner.endDate ? banner.endDate.split('T')[0] : ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      updateBannerMutation.mutate({ id: editingBanner.id, data: formData });
    } else {
      createBannerMutation.mutate(formData);
    }
  };

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      jobs_header: "채용정보 헤더",
      home_top: "홈 상단",
      sidebar: "사이드바"
    };
    return labels[position] || position;
  };

  // Calculate stats
  const totalBanners = banners?.length || 0;
  const activeBanners = banners?.filter(b => b.isActive).length || 0;
  const inactiveBanners = totalBanners - activeBanners;
  const totalClicks = banners?.reduce((sum, b) => sum + b.clickCount, 0) || 0;
  const totalViews = banners?.reduce((sum, b) => sum + b.viewCount, 0) || 0;

  // Filter banners
  const filteredBanners = banners?.filter((banner) => {
    const matchesSearch = searchQuery === "" || 
      banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      banner.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && banner.isActive) ||
      (statusFilter === "inactive" && !banner.isActive);
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                배너 관리
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                광고 배너를 생성하고 관리합니다
              </p>
            </div>
            <Dialog open={isCreateDialogOpen || !!editingBanner} onOpenChange={(open) => {
              if (!open) {
                setIsCreateDialogOpen(false);
                setEditingBanner(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  새 배너 생성
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBanner ? "배너 수정" : "새 배너 생성"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">제목 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">위치</Label>
                    <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jobs_header">채용정보 헤더</SelectItem>
                        <SelectItem value="home_top">홈 상단</SelectItem>
                        <SelectItem value="sidebar">사이드바</SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">내용</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="banner-image">배너 이미지</Label>
                    <div className="flex items-center gap-4">
                      {formData.imageUrl && (
                        <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img
                            src={formData.imageUrl}
                            alt="Banner preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <div className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary transition-colors">
                            <div className="text-center">
                              <ImageIcon className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formData.imageUrl ? "이미지 변경" : "이미지 업로드"}
                              </span>
                            </div>
                          </div>
                        </Label>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        {formData.imageUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
                            className="mt-2"
                          >
                            <X className="h-4 w-4 mr-1" />
                            이미지 제거
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      배너 이미지를 업로드할 수 있습니다. 이미지가 있으면 배경으로 표시됩니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkUrl">링크 URL</Label>
                      <Input
                        id="linkUrl"
                        type="url"
                        value={formData.linkUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">우선순위</Label>
                      <Input
                        id="priority"
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="backgroundColor">배경색</Label>
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="textColor">텍스트 색상</Label>
                      <Input
                        id="textColor"
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">시작일</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">종료일</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="isActive">활성 상태</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingBanner(null);
                      resetForm();
                    }}>
                      취소
                    </Button>
                    <Button type="submit" disabled={createBannerMutation.isPending || updateBannerMutation.isPending}>
                      {editingBanner ? "수정" : "생성"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 배너</CardTitle>
              <Monitor className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBanners}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 배너</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBanners}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">비활성 배너</CardTitle>
              <XCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inactiveBanners}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 클릭 수</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle>배너 목록</CardTitle>
            <CardDescription>
              등록된 모든 배너를 확인하고 관리할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="배너 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">로딩 중...</div>
            ) : filteredBanners.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery || statusFilter !== "all" ? "검색 결과가 없습니다" : "배너가 없습니다"}
              </div>
            ) : (
              <div className="rounded-md border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>위치</TableHead>
                      <TableHead>우선순위</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>통계</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBanners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{banner.title}</div>
                          {banner.content && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {banner.content}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getPositionLabel(banner.position)}
                        </Badge>
                      </TableCell>
                      <TableCell>{banner.priority}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={banner.isActive}
                            onCheckedChange={(checked) => 
                              toggleBannerMutation.mutate({ id: banner.id, isActive: checked })
                            }
                          />
                          <Badge variant={banner.isActive ? "default" : "secondary"}>
                            {banner.isActive ? "활성" : "비활성"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>클릭: {banner.clickCount}</div>
                          <div>노출: {banner.viewCount}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {banner.linkUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(banner.linkUrl, '_blank')}
                              title="링크 열기"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(banner)}
                            title="수정"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteBannerMutation.mutate(banner.id)}
                            disabled={deleteBannerMutation.isPending}
                            title="삭제"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}