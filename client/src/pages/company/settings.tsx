import { CompanyLayout } from "@/components/company/company-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Settings,
  Building2,
  Users,
  Bell,
  Shield,
  CreditCard,
  Key,
  Mail,
  Globe,
  Database,
  Save,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function CompanySettings() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    companyName: "테크스타트",
    industry: "tech",
    companySize: "startup",
    foundedYear: "2020",
    email: "hr@techstart.com",
    phone: "02-1234-5678",
    address: "서울시 강남구 테헤란로 123",
    website: "https://techstart.com",
    shortDescription: "혁신적인 기술로 세상을 변화시키는 스타트업입니다.",
    detailedDescription: "우리는 최신 기술을 활용하여 사용자들에게 더 나은 경험을 제공하고, 지속가능한 미래를 만들어가는 것을 목표로 합니다. 젊고 역동적인 팀과 함께 성장할 인재를 찾고 있습니다.",
  });

  const handleSaveSettings = () => {
    // Save settings logic here
    toast({
      title: t("common.success") || "성공",
      description: "설정이 저장되었습니다.",
    });
  };

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Settings className="h-8 w-8 mr-3 text-gray-600" />
              {t('companySettings.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('companySettings.subtitle')}
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600" onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            {t('companySettings.saveSettings')}
          </Button>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="company">{t('companySettings.tabs.company')}</TabsTrigger>
            <TabsTrigger value="users">{t('companySettings.tabs.users')}</TabsTrigger>
            <TabsTrigger value="notifications">{t('companySettings.tabs.notifications')}</TabsTrigger>
            <TabsTrigger value="security">{t('companySettings.tabs.security')}</TabsTrigger>
            <TabsTrigger value="billing">{t('companySettings.tabs.billing')}</TabsTrigger>
            <TabsTrigger value="api">{t('companySettings.tabs.api')}</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                    {t('companySettings.company.basicInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('companySettings.company.companyName')}</Label>
                    <Input 
                      value={settings.companyName} 
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                      className="mt-2" 
                    />
                  </div>
                  <div>
                    <Label>{t('companySettings.company.industry')}</Label>
                    <Select value={settings.industry} onValueChange={(value) => setSettings({...settings, industry: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={t('companySettings.company.industryPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">{t('companySettings.company.industries.tech')}</SelectItem>
                        <SelectItem value="finance">{t('companySettings.company.industries.finance')}</SelectItem>
                        <SelectItem value="healthcare">{t('companySettings.company.industries.healthcare')}</SelectItem>
                        <SelectItem value="retail">{t('companySettings.company.industries.retail')}</SelectItem>
                        <SelectItem value="manufacturing">{t('companySettings.company.industries.manufacturing')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('companySettings.company.companySize')}</Label>
                    <Select value={settings.companySize} onValueChange={(value) => setSettings({...settings, companySize: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={t('companySettings.company.sizePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">{t('companySettings.company.sizes.startup')}</SelectItem>
                        <SelectItem value="small">{t('companySettings.company.sizes.small')}</SelectItem>
                        <SelectItem value="medium">{t('companySettings.company.sizes.medium')}</SelectItem>
                        <SelectItem value="large">{t('companySettings.company.sizes.large')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('companySettings.company.foundedYear')}</Label>
                    <Input 
                      type="number" 
                      value={settings.foundedYear} 
                      onChange={(e) => setSettings({...settings, foundedYear: e.target.value})}
                      className="mt-2" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>{t('companySettings.company.contactInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('companySettings.company.email')}</Label>
                    <Input 
                      value={settings.email} 
                      onChange={(e) => setSettings({...settings, email: e.target.value})}
                      className="mt-2" 
                    />
                  </div>
                  <div>
                    <Label>{t('companySettings.company.phone')}</Label>
                    <Input 
                      value={settings.phone} 
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                      className="mt-2" 
                    />
                  </div>
                  <div>
                    <Label>{t('companySettings.company.address')}</Label>
                    <Input 
                      value={settings.address} 
                      onChange={(e) => setSettings({...settings, address: e.target.value})}
                      className="mt-2" 
                    />
                  </div>
                  <div>
                    <Label>{t('companySettings.company.website')}</Label>
                    <Input 
                      value={settings.website} 
                      onChange={(e) => setSettings({...settings, website: e.target.value})}
                      className="mt-2" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="border-0 shadow-lg lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t('companySettings.company.description')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('companySettings.company.shortDescription')}</Label>
                    <Textarea 
                      value={settings.shortDescription}
                      onChange={(e) => setSettings({...settings, shortDescription: e.target.value})}
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>{t('companySettings.company.detailedDescription')}</Label>
                    <Textarea 
                      value={settings.detailedDescription}
                      onChange={(e) => setSettings({...settings, detailedDescription: e.target.value})}
                      rows={5}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="space-y-6">
              {/* User Management */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    {t('companySettings.users.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{t('companySettings.users.inviteMembers')}</h3>
                    <Button>{t('companySettings.users.inviteNew')}</Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">박팀장</p>
                        <p className="text-sm text-gray-600">park@techstart.com</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge>{t('companySettings.users.roles.admin')}</Badge>
                        <Button variant="outline" size="sm">{t('companySettings.users.edit')}</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">최CTO</p>
                        <p className="text-sm text-gray-600">choi@techstart.com</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{t('companySettings.users.roles.editor')}</Badge>
                        <Button variant="outline" size="sm">{t('companySettings.users.edit')}</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">김부장</p>
                        <p className="text-sm text-gray-600">kim@techstart.com</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{t('companySettings.users.roles.viewer')}</Badge>
                        <Button variant="outline" size="sm">{t('companySettings.users.edit')}</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>{t('companySettings.users.permissions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('companySettings.users.permissionsList.jobManagement')}</p>
                        <p className="text-sm text-gray-600">{t('companySettings.users.permissionsList.jobManagementDesc')}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('companySettings.users.permissionsList.candidateAccess')}</p>
                        <p className="text-sm text-gray-600">{t('companySettings.users.permissionsList.candidateAccessDesc')}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('companySettings.users.permissionsList.analytics')}</p>
                        <p className="text-sm text-gray-600">{t('companySettings.users.permissionsList.analyticsDesc')}</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-yellow-600" />
                  {t('companySettings.notifications.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">{t('companySettings.notifications.emailNotifications')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('companySettings.notifications.newApplications')}</p>
                        <p className="text-sm text-gray-600">{t('companySettings.notifications.newApplicationsDesc')}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('companySettings.notifications.interviewReminders')}</p>
                        <p className="text-sm text-gray-600">{t('companySettings.notifications.interviewRemindersDesc')}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('companySettings.notifications.weeklyReports')}</p>
                        <p className="text-sm text-gray-600">{t('companySettings.notifications.weeklyReportsDesc')}</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">{t('companySettings.notifications.pushNotifications')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('companySettings.notifications.urgentAlerts')}</p>
                        <p className="text-sm text-gray-600">{t('companySettings.notifications.urgentAlertsDesc')}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('companySettings.notifications.systemUpdates')}</p>
                        <p className="text-sm text-gray-600">{t('companySettings.notifications.systemUpdatesDesc')}</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    {t('companySettings.security.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('companySettings.security.twoFactor')}</p>
                        <p className="text-sm text-gray-600">{t('companySettings.security.twoFactorDesc')}</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('companySettings.security.ssoLogin')}</p>
                        <p className="text-sm text-gray-600">{t('companySettings.security.ssoLoginDesc')}</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('companySettings.security.ipRestriction')}</p>
                        <p className="text-sm text-gray-600">{t('companySettings.security.ipRestrictionDesc')}</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 mr-2 text-blue-600" />
                    {t('companySettings.security.passwordPolicy')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('companySettings.security.minLength')}</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={t('companySettings.security.selectLength')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8 {t('companySettings.security.characters')}</SelectItem>
                        <SelectItem value="10">10 {t('companySettings.security.characters')}</SelectItem>
                        <SelectItem value="12">12 {t('companySettings.security.characters')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{t('companySettings.security.requireUppercase')}</p>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{t('companySettings.security.requireNumbers')}</p>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{t('companySettings.security.requireSpecialChars')}</p>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                    {t('companySettings.billing.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{t('companySettings.billing.currentPlan')}</p>
                      <p className="text-sm text-gray-600">{t('companySettings.billing.professionalPlan')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">$99/{t('companySettings.billing.month')}</p>
                      <Button variant="outline" size="sm">{t('companySettings.billing.changePlan')}</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">{t('companySettings.billing.paymentMethod')}</h3>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">**** **** **** 1234</p>
                          <p className="text-sm text-gray-600">{t('companySettings.billing.expires')} 12/25</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">{t('companySettings.billing.update')}</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">{t('companySettings.billing.billingHistory')}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">2024-01-01</p>
                          <p className="text-sm text-gray-600">{t('companySettings.billing.professionalPlan')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">$99.00</p>
                          <Button variant="ghost" size="sm">{t('companySettings.billing.download')}</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-orange-600" />
                    {t('companySettings.api.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('companySettings.api.apiKey')}</Label>
                    <div className="flex space-x-2 mt-2">
                      <Input value="sk_live_1234567890abcdef" readOnly />
                      <Button variant="outline">{t('companySettings.api.regenerate')}</Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>{t('companySettings.api.webhookUrl')}</Label>
                    <Input placeholder={t('companySettings.api.webhookPlaceholder')} className="mt-2" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">{t('companySettings.api.webhookEvents')}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{t('companySettings.api.events.newApplication')}</p>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{t('companySettings.api.events.statusUpdate')}</p>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{t('companySettings.api.events.interviewScheduled')}</p>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {t('companySettings.dangerZone.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{t('companySettings.dangerZone.deleteAccount')}</p>
                <p className="text-sm text-gray-600">{t('companySettings.dangerZone.deleteAccountDesc')}</p>
              </div>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                {t('companySettings.dangerZone.deleteButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CompanyLayout>
  );
}