import { useState } from "react";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Target,
  TrendingUp,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useLocation } from "wouter";

interface CareerContent {
  id: number;
  title: string;
  category: "learning" | "tips" | "insights" | "goals";
  content: string;
  thumbnailUrl?: string;
  author: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

const categoryLabels = {
  learning: "학습 자료",
  tips: "커리어 팁",
  insights: "시장 동향",
  goals: "목표 설정",
};

const statusLabels = {
  draft: "초안",
  published: "게시됨",
};

export default function AdminCareer() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Local state for content management (UI only)
  const [contents, setContents] = useState<CareerContent[]>([
    {
      id: 1,
      title: "프론트엔드 개발자 커리어 로드맵",
      category: "learning",
      content: "<p>프론트엔드 개발자가 되기 위한 단계별 학습 가이드입니다.</p><ul><li>HTML/CSS 기초</li><li>JavaScript 심화</li><li>React/Vue.js 프레임워크</li></ul>",
      thumbnailUrl: "https://via.placeholder.com/300x200",
      author: "관리자",
      status: "published",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: 2,
      title: "면접 준비 꿀팁 10가지",
      category: "tips",
      content: "<p>면접에서 좋은 인상을 남기는 방법들을 소개합니다.</p>",
      thumbnailUrl: "https://via.placeholder.com/300x200",
      author: "관리자",
      status: "published",
      createdAt: "2024-01-14T09:00:00Z",
      updatedAt: "2024-01-14T09:00:00Z",
    },
    {
      id: 3,
      title: "2024년 IT 시장 동향 분석",
      category: "insights",
      content: "<p>올해 IT 업계의 주요 트렌드와 전망을 분석합니다.</p>",
      author: "관리자",
      status: "draft",
      createdAt: "2024-01-13T14:00:00Z",
      updatedAt: "2024-01-13T14:00:00Z",
    },
    {
      id: 4,
      title: "연봉 협상 전략",
      category: "tips",
      content: "<p>효과적인 연봉 협상을 위한 전략을 제시합니다.</p>",
      author: "관리자",
      status: "published",
      createdAt: "2024-01-12T11:00:00Z",
      updatedAt: "2024-01-12T11:00:00Z",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"learning" | "tips" | "insights" | "goals">("learning");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<CareerContent | null>(null);
  const [editingContent, setEditingContent] = useState<CareerContent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "learning" as "learning" | "tips" | "insights" | "goals",
    content: "",
    thumbnailUrl: "",
    status: "draft" as "draft" | "published",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter content based on active tab, search, and status
  const filteredContents = contents.filter((content) => {
    const matchesTab = content.category === activeTab;
    const matchesSearch = searchQuery === "" || content.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || content.status === statusFilter;
    return matchesTab && matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredContents.length / itemsPerPage);
  const paginatedContents = filteredContents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreate = () => {
    setFormData({
      title: "",
      category: activeTab,
      content: "",
      thumbnailUrl: "",
      status: "draft",
    });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (content: CareerContent) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      category: content.category,
      content: content.content,
      thumbnailUrl: content.thumbnailUrl || "",
      status: content.status,
    });
    setIsEditDialogOpen(true);
  };

  const handlePreview = (content: CareerContent) => {
    setSelectedContent(content);
    setIsPreviewDialogOpen(true);
  };

  const handleDelete = (content: CareerContent) => {
    setSelectedContent(content);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveCreate = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const newContent: CareerContent = {
      id: Math.max(...contents.map(c => c.id), 0) + 1,
      title: formData.title,
      category: formData.category,
      content: formData.content,
      thumbnailUrl: formData.thumbnailUrl || undefined,
      author: "관리자",
      status: formData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setContents([...contents, newContent]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast({
      title: "성공",
      description: "콘텐츠가 성공적으로 생성되었습니다.",
    });
  };

  const handleSaveEdit = () => {
    if (!editingContent || !formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const updatedContents = contents.map((content) =>
      content.id === editingContent.id
        ? {
            ...content,
            title: formData.title,
            category: formData.category,
            content: formData.content,
            thumbnailUrl: formData.thumbnailUrl || undefined,
            status: formData.status,
            updatedAt: new Date().toISOString(),
          }
        : content
    );

    setContents(updatedContents);
    setIsEditDialogOpen(false);
    setEditingContent(null);
    resetForm();
    toast({
      title: "성공",
      description: "콘텐츠가 성공적으로 수정되었습니다.",
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedContent) return;

    setContents(contents.filter((content) => content.id !== selectedContent.id));
    setIsDeleteDialogOpen(false);
    setSelectedContent(null);
    toast({
      title: "성공",
      description: "콘텐츠가 성공적으로 삭제되었습니다.",
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: activeTab,
      content: "",
      thumbnailUrl: "",
      status: "draft",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (status: "draft" | "published") => {
    return status === "published" ? "default" : "secondary";
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                커리어 가이드 관리
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                구직자들이 볼 수 있는 커리어 가이드 콘텐츠를 관리합니다
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              새 콘텐츠 추가
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle>콘텐츠 관리</CardTitle>
            <CardDescription>
              각 카테고리별로 콘텐츠를 관리할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value as typeof activeTab);
              setCurrentPage(1);
            }}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="learning" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  학습 자료
                </TabsTrigger>
                <TabsTrigger value="tips" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  커리어 팁
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  시장 동향
                </TabsTrigger>
                <TabsTrigger value="goals" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  목표 설정
                </TabsTrigger>
              </TabsList>

              {/* Learning Materials Tab */}
              <TabsContent value="learning" className="space-y-4">
                <ContentTable
                  contents={paginatedContents}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  onEdit={handleEdit}
                  onPreview={handlePreview}
                  onDelete={handleDelete}
                  formatDate={formatDate}
                  getStatusBadgeVariant={getStatusBadgeVariant}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </TabsContent>

              {/* Career Tips Tab */}
              <TabsContent value="tips" className="space-y-4">
                <ContentTable
                  contents={paginatedContents}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  onEdit={handleEdit}
                  onPreview={handlePreview}
                  onDelete={handleDelete}
                  formatDate={formatDate}
                  getStatusBadgeVariant={getStatusBadgeVariant}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </TabsContent>

              {/* Market Insights Tab */}
              <TabsContent value="insights" className="space-y-4">
                <ContentTable
                  contents={paginatedContents}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  onEdit={handleEdit}
                  onPreview={handlePreview}
                  onDelete={handleDelete}
                  formatDate={formatDate}
                  getStatusBadgeVariant={getStatusBadgeVariant}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </TabsContent>

              {/* Goal Setting Tab */}
              <TabsContent value="goals" className="space-y-4">
                <ContentTable
                  contents={paginatedContents}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  onEdit={handleEdit}
                  onPreview={handlePreview}
                  onDelete={handleDelete}
                  formatDate={formatDate}
                  getStatusBadgeVariant={getStatusBadgeVariant}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 콘텐츠 추가</DialogTitle>
              <DialogDescription>
                새로운 커리어 가이드 콘텐츠를 작성합니다
              </DialogDescription>
            </DialogHeader>
            <ContentForm
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveCreate}
              onCancel={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>콘텐츠 수정</DialogTitle>
              <DialogDescription>
                콘텐츠를 수정합니다
              </DialogDescription>
            </DialogHeader>
            <ContentForm
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingContent(null);
                resetForm();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>콘텐츠 미리보기</span>
                {selectedContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsPreviewDialogOpen(false);
                      handleEdit(selectedContent);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    편집하기
                  </Button>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedContent && (
              <div className="space-y-4">
                {selectedContent.thumbnailUrl && (
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={selectedContent.thumbnailUrl}
                      alt={selectedContent.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedContent.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <Badge variant="outline">{categoryLabels[selectedContent.category]}</Badge>
                    <Badge variant={getStatusBadgeVariant(selectedContent.status)}>
                      {statusLabels[selectedContent.status]}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {selectedContent.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(selectedContent.createdAt)}
                    </span>
                  </div>
                </div>
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedContent.content }}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>콘텐츠 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                정말로 "{selectedContent?.title}" 콘텐츠를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedContent(null)}>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}

// Content Table Component
interface ContentTableProps {
  contents: CareerContent[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: "all" | "draft" | "published";
  setStatusFilter: (filter: "all" | "draft" | "published") => void;
  onEdit: (content: CareerContent) => void;
  onPreview: (content: CareerContent) => void;
  onDelete: (content: CareerContent) => void;
  formatDate: (date: string) => string;
  getStatusBadgeVariant: (status: "draft" | "published") => "default" | "secondary";
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function ContentTable({
  contents,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onEdit,
  onPreview,
  onDelete,
  formatDate,
  getStatusBadgeVariant,
  currentPage,
  totalPages,
  onPageChange,
}: ContentTableProps) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="제목으로 검색..."
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
            <SelectItem value="draft">초안</SelectItem>
            <SelectItem value="published">게시됨</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  콘텐츠가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              contents.map((content) => (
                <TableRow key={content.id}>
                  <TableCell className="font-medium max-w-md">
                    <div className="flex items-center gap-2">
                      {content.thumbnailUrl && (
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={content.thumbnailUrl}
                            alt={content.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span className="line-clamp-1">{content.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{categoryLabels[content.category]}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {content.author}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(content.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(content.status)}>
                      {statusLabels[content.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPreview(content)}
                        title="미리보기"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(content)}
                        title="수정"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(content)}
                        title="삭제"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            총 {contents.length}개의 콘텐츠
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              이전
            </Button>
            <div className="text-sm">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Content Form Component
interface ContentFormProps {
  formData: {
    title: string;
    category: "learning" | "tips" | "insights" | "goals";
    content: string;
    thumbnailUrl: string;
    status: "draft" | "published";
  };
  setFormData: (data: ContentFormProps["formData"]) => void;
  onSave: () => void;
  onCancel: () => void;
}

function ContentForm({ formData, setFormData, onSave, onCancel }: ContentFormProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // UI only
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, thumbnailUrl: url });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">제목 *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="콘텐츠 제목을 입력하세요"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">카테고리 *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value as typeof formData.category })}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="learning">학습 자료</SelectItem>
              <SelectItem value="tips">커리어 팁</SelectItem>
              <SelectItem value="insights">시장 동향</SelectItem>
              <SelectItem value="goals">목표 설정</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">상태 *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">초안</SelectItem>
              <SelectItem value="published">게시됨</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail">썸네일 이미지</Label>
        <div className="flex items-center gap-4">
          {formData.thumbnailUrl && (
            <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={formData.thumbnailUrl}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <Label htmlFor="thumbnail-upload" className="cursor-pointer">
                <div className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary transition-colors">
                  <div className="text-center">
                    <ImageIcon className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.thumbnailUrl ? "이미지 변경" : "이미지 업로드"}
                    </span>
                  </div>
                </div>
              </Label>
              <Input
                id="thumbnail-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {formData.thumbnailUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, thumbnailUrl: "" })}
                  className="mt-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  이미지 제거
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">내용 *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="콘텐츠를 입력하세요. 예: <p>내용</p>"
            className="min-h-[300px] font-mono text-sm"
          />
          <p className="text-xs text-gray-500">
            HTML 형식으로 입력하거나 일반 텍스트를 입력할 수 있습니다.
          </p>
        </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button onClick={onSave} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          저장
        </Button>
      </div>
    </div>
  );
}