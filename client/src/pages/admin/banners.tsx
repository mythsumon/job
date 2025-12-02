import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
      const response = await fetch("/api/admin/banners");
      if (!response.ok) throw new Error("Failed to fetch banners");
      return response.json();
    },
  });

  const createBannerMutation = useMutation({
    mutationFn: async (data: BannerFormData) => {
      return apiRequest("POST", "/api/admin/banners", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">배너 관리</h1>
            <p className="text-muted-foreground mt-1">광고 배너를 생성하고 관리합니다</p>
          </div>
          <Dialog open={isCreateDialogOpen || !!editingBanner} onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setEditingBanner(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
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

        <Card>
          <CardHeader>
            <CardTitle>배너 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">로딩 중...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>위치</TableHead>
                    <TableHead>우선순위</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>통계</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners?.map((banner) => (
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
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {banner.linkUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(banner.linkUrl, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(banner)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteBannerMutation.mutate(banner.id)}
                            disabled={deleteBannerMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}