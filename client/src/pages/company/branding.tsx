import { CompanyLayout } from "@/components/company/company-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crown,
  Upload,
  Palette,
  Eye,
  Save,
  Undo,
  Star,
  Globe,
  Camera,
  Brush,
  Layout,
  Type,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export default function CompanyBranding() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: t("common.success") || "성공",
      description: "브랜딩 설정이 저장되었습니다.",
    });
  };

  const handlePreview = () => {
    toast({
      title: "미리보기",
      description: "브랜딩 미리보기 페이지를 엽니다.",
    });
    // Open preview in new window or modal
  };

  const handleUpgrade = () => {
    toast({
      title: "프리미엄 업그레이드",
      description: "프리미엄 요금제로 업그레이드합니다.",
    });
    // Navigate to pricing page
  };

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Crown className="h-8 w-8 mr-3 text-yellow-600" />
              {t('companyBranding.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('companyBranding.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              {t('companyBranding.premiumFeature')}
            </Badge>
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              {t('companyBranding.preview')}
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {t('companyBranding.save')}
            </Button>
          </div>
        </div>

        {/* Premium Notice */}
        <Card className="border-2 border-gradient-to-r from-yellow-400 to-orange-500 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Crown className="h-12 w-12 text-yellow-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('companyBranding.premiumBranding.title')}
                </h3>
                <p className="text-gray-600 mt-1">
                  {t('companyBranding.premiumBranding.description')}
                </p>
              </div>
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white" onClick={handleUpgrade}>
                {t('companyBranding.premiumBranding.upgrade')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Branding Tabs */}
        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visual">{t('companyBranding.tabs.visual')}</TabsTrigger>
            <TabsTrigger value="content">{t('companyBranding.tabs.content')}</TabsTrigger>
            <TabsTrigger value="layout">{t('companyBranding.tabs.layout')}</TabsTrigger>
            <TabsTrigger value="preview">{t('companyBranding.tabs.preview')}</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-blue-600" />
                    {t('companyBranding.visual.logo.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">{t('companyBranding.visual.logo.uploadText')}</p>
                    <p className="text-sm text-gray-400 mb-4">{t('companyBranding.visual.logo.fileTypes')}</p>
                    <Button variant="outline">
                      {t('companyBranding.visual.logo.selectFile')}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('companyBranding.visual.logo.size')}</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">{t('companyBranding.visual.logo.sizes.small')}</Button>
                      <Button variant="outline" size="sm">{t('companyBranding.visual.logo.sizes.medium')}</Button>
                      <Button size="sm">{t('companyBranding.visual.logo.sizes.large')}</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Color Scheme */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2 text-purple-600" />
                    {t('companyBranding.visual.colors.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label>{t('companyBranding.visual.colors.primary')}</Label>
                      <div className="flex items-center space-x-3 mt-2">
                        <Input type="color" value="#3B82F6" className="w-16 h-10" />
                        <Input value="#3B82F6" className="flex-1" />
                      </div>
                    </div>
                    <div>
                      <Label>{t('companyBranding.visual.colors.secondary')}</Label>
                      <div className="flex items-center space-x-3 mt-2">
                        <Input type="color" value="#8B5CF6" className="w-16 h-10" />
                        <Input value="#8B5CF6" className="flex-1" />
                      </div>
                    </div>
                    <div>
                      <Label>{t('companyBranding.visual.colors.accent')}</Label>
                      <div className="flex items-center space-x-3 mt-2">
                        <Input type="color" value="#10B981" className="w-16 h-10" />
                        <Input value="#10B981" className="flex-1" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Label className="mb-3 block">{t('companyBranding.visual.colors.presets')}</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg border cursor-pointer hover:border-blue-500">
                        <div className="flex space-x-1 mb-2">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <div className="w-4 h-4 bg-purple-500 rounded"></div>
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                        </div>
                        <p className="text-xs text-gray-600">{t('companyBranding.visual.colors.themes.modern')}</p>
                      </div>
                      <div className="p-3 rounded-lg border cursor-pointer hover:border-blue-500">
                        <div className="flex space-x-1 mb-2">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          <div className="w-4 h-4 bg-orange-500 rounded"></div>
                          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        </div>
                        <p className="text-xs text-gray-600">{t('companyBranding.visual.colors.themes.warm')}</p>
                      </div>
                      <div className="p-3 rounded-lg border cursor-pointer hover:border-blue-500">
                        <div className="flex space-x-1 mb-2">
                          <div className="w-4 h-4 bg-gray-800 rounded"></div>
                          <div className="w-4 h-4 bg-gray-600 rounded"></div>
                          <div className="w-4 h-4 bg-gray-400 rounded"></div>
                        </div>
                        <p className="text-xs text-gray-600">{t('companyBranding.visual.colors.themes.minimal')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Typography */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Type className="h-5 w-5 mr-2 text-green-600" />
                    {t('companyBranding.visual.typography.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('companyBranding.visual.typography.mainFont')}</Label>
                    <select className="w-full mt-2 p-2 border rounded-lg">
                      <option>Noto Sans KR</option>
                      <option>Pretendard</option>
                      <option>Spoqa Han Sans Neo</option>
                      <option>IBM Plex Sans KR</option>
                    </select>
                  </div>
                  <div>
                    <Label>{t('companyBranding.visual.typography.headingFont')}</Label>
                    <select className="w-full mt-2 p-2 border rounded-lg">
                      <option>Noto Sans KR Bold</option>
                      <option>Pretendard Bold</option>
                      <option>Spoqa Han Sans Neo Bold</option>
                      <option>IBM Plex Sans KR Bold</option>
                    </select>
                  </div>
                  <div>
                    <Label>{t('companyBranding.visual.typography.fontSize')}</Label>
                    <div className="flex space-x-2 mt-2">
                      <Button variant="outline" size="sm">{t('companyBranding.visual.typography.sizes.small')}</Button>
                      <Button size="sm">{t('companyBranding.visual.typography.sizes.normal')}</Button>
                      <Button variant="outline" size="sm">{t('companyBranding.visual.typography.sizes.large')}</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Background Settings */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brush className="h-5 w-5 mr-2 text-orange-600" />
                    {t('companyBranding.visual.background.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t('companyBranding.visual.background.gradient')}</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t('companyBranding.visual.background.pattern')}</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t('companyBranding.visual.background.image')}</Label>
                      <Switch />
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{t('companyBranding.visual.background.uploadImage')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-blue-600" />
                    {t('companyBranding.content.company.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('companyBranding.content.company.tagline')}</Label>
                    <Input placeholder={t('companyBranding.content.company.taglinePlaceholder')} className="mt-2" />
                  </div>
                  <div>
                    <Label>{t('companyBranding.content.company.description')}</Label>
                    <Textarea 
                      placeholder={t('companyBranding.content.company.descriptionPlaceholder')}
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>{t('companyBranding.content.company.values')}</Label>
                    <Textarea 
                      placeholder={t('companyBranding.content.company.valuesPlaceholder')}
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-purple-600" />
                    {t('companyBranding.content.social.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('companyBranding.content.social.website')}</Label>
                    <Input placeholder="https://company.com" className="mt-2" />
                  </div>
                  <div>
                    <Label>{t('companyBranding.content.social.linkedin')}</Label>
                    <Input placeholder="https://linkedin.com/company/..." className="mt-2" />
                  </div>
                  <div>
                    <Label>{t('companyBranding.content.social.facebook')}</Label>
                    <Input placeholder="https://facebook.com/..." className="mt-2" />
                  </div>
                  <div>
                    <Label>{t('companyBranding.content.social.instagram')}</Label>
                    <Input placeholder="https://instagram.com/..." className="mt-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Custom Messages */}
              <Card className="border-0 shadow-lg lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t('companyBranding.content.messages.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('companyBranding.content.messages.welcome')}</Label>
                    <Textarea 
                      placeholder={t('companyBranding.content.messages.welcomePlaceholder')}
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>{t('companyBranding.content.messages.application')}</Label>
                    <Textarea 
                      placeholder={t('companyBranding.content.messages.applicationPlaceholder')}
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Page Layout */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layout className="h-5 w-5 mr-2 text-green-600" />
                    {t('companyBranding.layout.page.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('companyBranding.layout.page.style')}</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="p-4 border rounded-lg cursor-pointer hover:border-blue-500">
                        <div className="w-full h-16 bg-gray-200 rounded mb-2"></div>
                        <p className="text-sm text-center">{t('companyBranding.layout.page.styles.classic')}</p>
                      </div>
                      <div className="p-4 border rounded-lg cursor-pointer hover:border-blue-500">
                        <div className="w-full h-16 bg-gradient-to-r from-blue-200 to-purple-200 rounded mb-2"></div>
                        <p className="text-sm text-center">{t('companyBranding.layout.page.styles.modern')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t('companyBranding.layout.page.showLogo')}</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t('companyBranding.layout.page.showCompanyInfo')}</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t('companyBranding.layout.page.showSocialLinks')}</Label>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Card Layout */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>{t('companyBranding.layout.jobCard.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('companyBranding.layout.jobCard.style')}</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="p-3 border rounded-lg cursor-pointer hover:border-blue-500">
                        <div className="space-y-1">
                          <div className="w-full h-2 bg-gray-300 rounded"></div>
                          <div className="w-3/4 h-2 bg-gray-200 rounded"></div>
                          <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
                        </div>
                        <p className="text-xs text-center mt-2">{t('companyBranding.layout.jobCard.styles.compact')}</p>
                      </div>
                      <div className="p-3 border rounded-lg cursor-pointer hover:border-blue-500">
                        <div className="space-y-2">
                          <div className="w-full h-3 bg-gray-300 rounded"></div>
                          <div className="w-full h-2 bg-gray-200 rounded"></div>
                          <div className="w-2/3 h-2 bg-gray-200 rounded"></div>
                        </div>
                        <p className="text-xs text-center mt-2">{t('companyBranding.layout.jobCard.styles.detailed')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-blue-600" />
                  {t('companyBranding.preview.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-8 min-h-96">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold mb-2">{t('companyBranding.preview.companyName')}</h2>
                    <p className="text-gray-600 mb-6">{t('companyBranding.preview.tagline')}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-semibold mb-2">{t('companyBranding.preview.jobTitle1')}</h3>
                        <p className="text-sm text-gray-600 mb-3">{t('companyBranding.preview.jobDescription1')}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">{t('companyBranding.preview.location')}</span>
                          <Button size="sm">{t('companyBranding.preview.apply')}</Button>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-semibold mb-2">{t('companyBranding.preview.jobTitle2')}</h3>
                        <p className="text-sm text-gray-600 mb-3">{t('companyBranding.preview.jobDescription2')}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">{t('companyBranding.preview.location')}</span>
                          <Button size="sm">{t('companyBranding.preview.apply')}</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CompanyLayout>
  );
}