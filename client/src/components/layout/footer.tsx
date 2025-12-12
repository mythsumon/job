import { Briefcase, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Heart, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast({
        title: "오류",
        description: "유효한 이메일 주소를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubscribing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubscribing(false);
    setNewsletterEmail("");
    toast({
      title: "구독 완료",
      description: "뉴스레터 구독이 완료되었습니다.",
    });
  };
  
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-amber-500/10 to-orange-500/10 rounded-full translate-x-24 translate-y-24"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-20"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                  <Briefcase className="text-white h-6 w-6" />
                </div>
              </div>
              <div className="ml-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  WorkMongolia
                </span>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-0.5 ml-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  PREMIUM
                </Badge>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t('footer.description')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-3 text-blue-400" />
                <span className="text-sm">contact@workmongolia.mn</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-3 text-blue-400" />
                <span className="text-sm">+976 1234 5678</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-3 text-blue-400" />
                <span className="text-sm">{t('footer.contact.address')}</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="group">
                <div className="bg-gray-800 hover:bg-blue-600 p-3 rounded-lg transition-all duration-200 group-hover:scale-110">
                  <Facebook className="h-4 w-4" />
                </div>
              </a>
              <a href="#" className="group">
                <div className="bg-gray-800 hover:bg-sky-500 p-3 rounded-lg transition-all duration-200 group-hover:scale-110">
                  <Twitter className="h-4 w-4" />
                </div>
              </a>
              <a href="#" className="group">
                <div className="bg-gray-800 hover:bg-blue-700 p-3 rounded-lg transition-all duration-200 group-hover:scale-110">
                  <Linkedin className="h-4 w-4" />
                </div>
              </a>
              <a href="#" className="group">
                <div className="bg-gray-800 hover:bg-pink-600 p-3 rounded-lg transition-all duration-200 group-hover:scale-110">
                  <Instagram className="h-4 w-4" />
                </div>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{t('footer.sections.services.title')}</h3>
            <ul className="space-y-3">
              <li><Link href="/user/jobs" className="text-gray-300 hover:text-blue-400 transition-all duration-200 flex items-center group">
                <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                {t('footer.sections.services.jobs')}
              </Link></li>
              <li><Link href="/user/companies" className="text-gray-300 hover:text-blue-400 transition-all duration-200 flex items-center group">
                <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                {t('footer.sections.services.companies')}
              </Link></li>
              <li>
                {isAuthenticated && user?.userType === 'employer' ? (
                  <Link href="/company/talents" className="text-gray-300 hover:text-blue-400 transition-all duration-200 flex items-center group">
                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                    {t('footer.sections.services.talents')}
                  </Link>
                ) : (
                  <Link href="/user/jobs" className="text-gray-300 hover:text-blue-400 transition-all duration-200 flex items-center group">
                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                    {t('footer.sections.services.talents')}
                  </Link>
                )}
              </li>
              <li>
                {isAuthenticated ? (
                  <Link href="/user/resumes" className="text-gray-300 hover:text-blue-400 transition-all duration-200 flex items-center group">
                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                    {t('footer.sections.services.resume')}
                  </Link>
                ) : (
                  <Link href="/register" className="text-gray-300 hover:text-blue-400 transition-all duration-200 flex items-center group">
                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                    {t('footer.sections.services.resume')}
                  </Link>
                )}
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{t('footer.sections.business.title')}</h3>
            <ul className="space-y-3">
              <li>
                {isAuthenticated && user?.userType === 'employer' ? (
                  <Link href="/company/jobs" className="text-gray-300 hover:text-purple-400 transition-all duration-200 flex items-center group">
                    <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                    {t('footer.sections.business.postJobs')}
                  </Link>
                ) : (
                  <Link href="/register?type=employer" className="text-gray-300 hover:text-purple-400 transition-all duration-200 flex items-center group">
                    <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                    {t('footer.sections.business.postJobs')}
                  </Link>
                )}
              </li>
              <li>
                {isAuthenticated && user?.userType === 'employer' ? (
                  <Link href="/company/talents" className="text-gray-300 hover:text-purple-400 transition-all duration-200 flex items-center group">
                    <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                    {t('footer.sections.business.searchTalents')}
                  </Link>
                ) : (
                  <Link href="/register?type=employer" className="text-gray-300 hover:text-purple-400 transition-all duration-200 flex items-center group">
                    <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                    {t('footer.sections.business.searchTalents')}
                  </Link>
                )}
              </li>
              <li>
                {isAuthenticated && user?.userType === 'employer' ? (
                  <Link href="/company/profile" className="text-gray-300 hover:text-purple-400 transition-all duration-200 flex items-center group">
                    <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                    {t('footer.sections.business.companyPage')}
                  </Link>
                ) : (
                  <Link href="/register?type=employer" className="text-gray-300 hover:text-purple-400 transition-all duration-200 flex items-center group">
                    <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                    {t('footer.sections.business.companyPage')}
                  </Link>
                )}
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-purple-400 transition-all duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-purple-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                  {t('footer.sections.business.solutions')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{t('footer.sections.support.title')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/user/feed" className="text-gray-300 hover:text-amber-400 transition-all duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                  {t('footer.sections.support.notices')}
                </Link>
              </li>
              <li>
                <Link href="/user/career" className="text-gray-300 hover:text-amber-400 transition-all duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                  {t('footer.sections.support.faq')}
                </Link>
              </li>
              <li>
                <a href="mailto:contact@workmongolia.mn" className="text-gray-300 hover:text-amber-400 transition-all duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                  {t('footer.sections.support.customerService')}
                </a>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-amber-400 transition-all duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                  {t('footer.sections.support.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Newsletter Section */}
        <div className="mt-16 border-t border-gray-700/50 pt-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t('footer.newsletter.title')}
            </h3>
            <p className="text-gray-300 mb-6">
              {t('footer.newsletter.subtitle')}
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                disabled={isSubscribing}
                required
              />
              <Button 
                type="submit"
                disabled={isSubscribing}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                {isSubscribing ? "구독 중..." : t('footer.newsletter.subscribe')}
              </Button>
            </form>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-gray-400 mb-4 md:mb-0">
              <span>{t('footer.bottom.copyright')}</span>
              <Heart className="h-4 w-4 text-red-500 mx-2" />
              <span className="text-sm">{t('footer.bottom.madeWith')}</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">{t('footer.bottom.privacy')}</Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">{t('footer.bottom.terms')}</Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">{t('footer.bottom.cookies')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}