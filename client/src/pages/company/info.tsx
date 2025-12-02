import { useState, useEffect, useRef } from "react";
import { CompanyLayout } from "@/components/company/company-layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { processProfilePicture, isValidImageFile } from "@/utils/imageUtils";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  Calendar,
  Edit,
  Save,
  X,
  Upload,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  Target,
  Eye,
  Heart
} from "lucide-react";

interface CompanyData {
  id: number;
  name: string;
  registrationNumber?: string;
  industry?: string;
  location?: string;
  website?: string;
  description?: string;
  size?: string;
  founded?: number;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  logoFormat?: string;
  logoSize?: number;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  benefits?: string[];
  culture?: string;
  mission?: string;
  vision?: string;
  values?: string[];
}

export default function CompanyInfo() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyData>>({});

  const { data: companyData, isLoading, error } = useQuery({
    queryKey: ["/api/companies/profile"],
    enabled: true,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5분 캐시
    gcTime: 10 * 60 * 1000, // 10분 가비지 컬렉션
  });

  useEffect(() => {
    if (companyData) {
      setFormData(companyData);
    }
  }, [companyData]);

  const updateCompanyMutation = useMutation({
    mutationFn: (data: Partial<CompanyData>) =>
      apiRequest("/api/companies/profile", "PUT", data),
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("companyInfo.updateSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies/profile"] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.tryAgain"),
        variant: "destructive",
      });
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (data: { logoUrl: string; format: string; size: number }) => {
      const response = await apiRequest("POST", "/api/companies/logo", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: t("common.success"),
        description: "로고가 성공적으로 업데이트되었습니다.",
      });
      setFormData(prev => ({ ...prev, logo: data.logo, logoFormat: data.logoFormat, logoSize: data.logoSize }));
      queryClient.invalidateQueries({ queryKey: ["/api/companies/profile"] });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: "로고 업로드에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateCompanyMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData(companyData || {});
    setIsEditing(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('로고 업로드: 파일이 선택되지 않음');
      return;
    }

    console.log('로고 업로드 시작:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type 
    });

    // Validate file type
    if (!isValidImageFile(file)) {
      console.log('로고 업로드 오류: 지원하지 않는 파일 형식');
      toast({
        title: "오류",
        description: "지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('로고 업로드 오류: 파일 크기 초과');
      toast({
        title: "오류",
        description: "파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingLogo(true);
      console.log('이미지 처리 시작...');
      
      const processedImage = await processProfilePicture(file);
      console.log('이미지 처리 완료:', {
        format: processedImage.format,
        size: processedImage.size,
        dataUrlLength: processedImage.dataUrl.length
      });
      
      console.log('서버 업로드 시작...');
      const result = await uploadLogoMutation.mutateAsync({
        logoUrl: processedImage.dataUrl,
        format: processedImage.format,
        size: processedImage.size
      });
      
      console.log('로고 업로드 성공:', result);
      
    } catch (error) {
      console.error('로고 업로드 오류:', error);
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "이미지 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <CompanyLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t("common.loading")}...</p>
          </div>
        </div>
      </CompanyLayout>
    );
  }

  if (error) {
    return (
      <CompanyLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">기업 정보를 불러올 수 없습니다</div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              다시 시도
            </Button>
          </div>
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("companyInfo.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t("companyInfo.subtitle")}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                {t("companyInfo.edit")}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  {t("companyInfo.cancel")}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateCompanyMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {t("companyInfo.save")}
                </Button>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">{t("companyInfo.basicInfo")}</TabsTrigger>
            <TabsTrigger value="contact">{t("companyInfo.contactInfo")}</TabsTrigger>
            <TabsTrigger value="social">{t("companyInfo.socialMedia")}</TabsTrigger>
            <TabsTrigger value="culture">{t("companyInfo.culture")}</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Company Logo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {t("companyInfo.companyLogo")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={formData.logo} alt={formData.name} />
                      <AvatarFallback className="text-lg">
                        {formData.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingLogo}
                      >
                        <Upload className="h-4 w-4" />
                        {isUploadingLogo ? "업로드 중..." : t("companyInfo.uploadLogo")}
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </CardContent>
              </Card>

              {/* Basic Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("companyInfo.basicInfo")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">{t("companyInfo.companyName")}</Label>
                    {isEditing ? (
                      <Input
                        id="companyName"
                        value={formData.name || ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder={t("companyInfo.companyName")}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.name || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">{t("companyInfo.registrationNumber")}</Label>
                    {isEditing ? (
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber || ""}
                        onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                        placeholder={t("companyInfo.registrationNumber")}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.registrationNumber || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">{t("companyInfo.industry")}</Label>
                    {isEditing ? (
                      <Input
                        id="industry"
                        value={formData.industry || ""}
                        onChange={(e) => handleInputChange("industry", e.target.value)}
                        placeholder={t("companyInfo.industry")}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.industry || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">{t("companyInfo.size")}</Label>
                    {isEditing ? (
                      <Input
                        id="size"
                        value={formData.size || ""}
                        onChange={(e) => handleInputChange("size", e.target.value)}
                        placeholder={t("companyInfo.size")}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.size || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="founded">{t("companyInfo.founded")}</Label>
                    {isEditing ? (
                      <Input
                        id="founded"
                        type="number"
                        value={formData.founded || ""}
                        onChange={(e) => handleInputChange("founded", e.target.value)}
                        placeholder={t("companyInfo.founded")}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.founded || "-"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{t("companyInfo.description")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={formData.description || ""}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder={t("companyInfo.description")}
                      rows={6}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {formData.description || "-"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {t("companyInfo.contactInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("companyInfo.email")}</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder={t("companyInfo.email")}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.email || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("companyInfo.phone")}</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone || ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder={t("companyInfo.phone")}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.phone || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">{t("companyInfo.website")}</Label>
                    {isEditing ? (
                      <Input
                        id="website"
                        value={formData.website || ""}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder={t("companyInfo.website")}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.website || "-"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t("companyInfo.location")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">{t("companyInfo.location")}</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={formData.location || ""}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder={t("companyInfo.location")}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.location || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">{t("companyInfo.address")}</Label>
                    {isEditing ? (
                      <Textarea
                        id="address"
                        value={formData.address || ""}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder={t("companyInfo.address")}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {formData.address || "-"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>{t("companyInfo.socialMedia")}</CardTitle>
                <CardDescription>
                  {t("companyInfo.socialMediaDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      {t("companyInfo.linkedin")}
                    </Label>
                    {isEditing ? (
                      <Input
                        id="linkedin"
                        value={formData.linkedin || ""}
                        onChange={(e) => handleInputChange("linkedin", e.target.value)}
                        placeholder="https://linkedin.com/company/..."
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.linkedin || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="flex items-center gap-2">
                      <Facebook className="h-4 w-4" />
                      {t("companyInfo.facebook")}
                    </Label>
                    {isEditing ? (
                      <Input
                        id="facebook"
                        value={formData.facebook || ""}
                        onChange={(e) => handleInputChange("facebook", e.target.value)}
                        placeholder="https://facebook.com/..."
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.facebook || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      {t("companyInfo.twitter")}
                    </Label>
                    {isEditing ? (
                      <Input
                        id="twitter"
                        value={formData.twitter || ""}
                        onChange={(e) => handleInputChange("twitter", e.target.value)}
                        placeholder="https://twitter.com/..."
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.twitter || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      {t("companyInfo.instagram")}
                    </Label>
                    {isEditing ? (
                      <Input
                        id="instagram"
                        value={formData.instagram || ""}
                        onChange={(e) => handleInputChange("instagram", e.target.value)}
                        placeholder="https://instagram.com/..."
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.instagram || "-"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Culture Tab */}
          <TabsContent value="culture">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t("companyInfo.mission")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={formData.mission || ""}
                      onChange={(e) => handleInputChange("mission", e.target.value)}
                      placeholder={t("companyInfo.mission")}
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {formData.mission || "-"}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    {t("companyInfo.vision")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={formData.vision || ""}
                      onChange={(e) => handleInputChange("vision", e.target.value)}
                      placeholder={t("companyInfo.vision")}
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {formData.vision || "-"}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    {t("companyInfo.culture")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={formData.culture || ""}
                      onChange={(e) => handleInputChange("culture", e.target.value)}
                      placeholder={t("companyInfo.culture")}
                      rows={6}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {formData.culture || "-"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CompanyLayout>
  );
}