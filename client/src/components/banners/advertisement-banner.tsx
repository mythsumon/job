import { useState, useEffect } from "react";
import { X, ExternalLink, Sparkles, TrendingUp, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BannerData {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  type?: 'premium' | 'standard' | 'announcement';
}

interface AdvertisementBannerProps {
  position: string;
  className?: string;
}

export default function AdvertisementBanner({ position, className = "" }: AdvertisementBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<BannerData | null>(null);

  // Multiple banner options that rotate
  const bannerOptions: BannerData[] = [
    {
      id: 1,
      title: "🚀 몽골 최고의 개발자 채용 플랫폼",
      content: "프리미엄 기업들과 연결되어 더 나은 기회를 찾아보세요",
      linkUrl: "/user/companies",
      backgroundColor: "#f59e0b",
      textColor: "#ffffff",
      type: 'premium'
    },
    {
      id: 2,
      title: "💼 새로운 커리어의 시작",
      content: "한국 대기업들의 독점 채용정보를 확인하세요",
      linkUrl: "/user/jobs",
      backgroundColor: "#3b82f6",
      textColor: "#ffffff",
      type: 'standard'
    },
    {
      id: 3,
      title: "📊 AI 기반 맞춤 채용 추천",
      content: "당신의 경력과 완벽하게 매칭되는 포지션을 찾아드립니다",
      linkUrl: "/user/jobs",
      backgroundColor: "#10b981",
      textColor: "#ffffff",
      type: 'announcement'
    }
  ];

  useEffect(() => {
    // Select a random banner on mount
    const randomBanner = bannerOptions[Math.floor(Math.random() * bannerOptions.length)];
    setCurrentBanner(randomBanner);
  }, []);

  if (dismissed || !currentBanner) return null;

  const handleClick = () => {
    if (currentBanner.linkUrl) {
      window.open(currentBanner.linkUrl, '_self');
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
  };

  const getTypeIcon = () => {
    switch (currentBanner.type) {
      case 'premium':
        return <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />;
      case 'standard':
        return <TrendingUp className="w-4 h-4 mr-2 flex-shrink-0" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 mr-2 flex-shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative w-full py-3 px-4 rounded-lg shadow-sm border transition-all duration-300 hover:shadow-md group cursor-pointer"
        style={{
          backgroundColor: currentBanner.backgroundColor || '#f8f9fa',
          color: currentBanner.textColor || '#333333',
          borderColor: currentBanner.backgroundColor || '#e9ecef'
        }}
        onClick={handleClick}
      >
        {/* Banner Content */}
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            {getTypeIcon()}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm mb-1">
                {currentBanner.title}
              </h3>
              {currentBanner.content && (
                <p className="text-xs opacity-90 line-clamp-1">
                  {currentBanner.content}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs px-3 py-1 h-auto hover:bg-white/20"
              style={{ color: currentBanner.textColor || '#333333' }}
            >
              자세히 보기
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="p-1 h-auto opacity-70 hover:opacity-100 hover:bg-white/20"
              style={{ color: currentBanner.textColor || '#333333' }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}