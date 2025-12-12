import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, ExternalLink, Sparkles, TrendingUp, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGet, apiRequest } from "@/lib/queryClient";

interface BannerData {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  position: string;
  priority: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  clickCount: number;
  viewCount: number;
  type?: 'premium' | 'standard' | 'announcement';
}

interface AdvertisementBannerProps {
  position: string;
  className?: string;
}

export default function AdvertisementBanner({ position, className = "" }: AdvertisementBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<BannerData | null>(null);
  const queryClient = useQueryClient();

  // Fetch banners from API
  const { data: banners, isLoading } = useQuery<BannerData[]>({
    queryKey: ["/api/banners", position],
    queryFn: async () => {
      try {
        const response = await apiGet<BannerData[]>(`/api/banners?position=${position}&isActive=true`);
        return response || [];
      } catch (error) {
        console.error("Failed to fetch banners:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Track banner view
  const trackViewMutation = useMutation({
    mutationFn: async (bannerId: number) => {
      return apiRequest("POST", `/api/banners/${bannerId}/view`, {});
    },
  });

  // Track banner click
  const trackClickMutation = useMutation({
    mutationFn: async (bannerId: number) => {
      return apiRequest("POST", `/api/banners/${bannerId}/click`, {});
    },
  });

  useEffect(() => {
    if (!banners || banners.length === 0) {
      setCurrentBanner(null);
      return;
    }

    // Filter banners by date range and active status
    const now = new Date();
    const validBanners = banners.filter((banner) => {
      if (!banner.isActive) return false;
      
      // Check start date
      if (banner.startDate) {
        const startDate = new Date(banner.startDate);
        if (now < startDate) return false;
      }
      
      // Check end date
      if (banner.endDate) {
        const endDate = new Date(banner.endDate);
        if (now > endDate) return false;
      }
      
      return true;
    });

    if (validBanners.length === 0) {
      setCurrentBanner(null);
      return;
    }

    // Sort by priority (higher priority first) and select the highest priority banner
    const sortedBanners = [...validBanners].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    const selectedBanner = sortedBanners[0];
    
    setCurrentBanner(selectedBanner);

    // Track view
    if (selectedBanner.id) {
      trackViewMutation.mutate(selectedBanner.id);
    }
  }, [banners]);

  if (dismissed || !currentBanner || isLoading) return null;

  const handleClick = () => {
    // Track click
    if (currentBanner.id) {
      trackClickMutation.mutate(currentBanner.id);
    }

    if (currentBanner.linkUrl) {
      if (currentBanner.linkUrl.startsWith('http')) {
        window.open(currentBanner.linkUrl, '_blank');
      } else {
        window.location.href = currentBanner.linkUrl;
      }
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
  };

  const getTypeIcon = () => {
    // Determine icon based on position or priority
    if (currentBanner.priority >= 8) {
      return <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />;
    } else if (currentBanner.priority >= 5) {
      return <TrendingUp className="w-4 h-4 mr-2 flex-shrink-0" />;
    } else {
      return <Megaphone className="w-4 h-4 mr-2 flex-shrink-0" />;
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
        {/* Banner Image */}
        {currentBanner.imageUrl && (
          <div className="absolute inset-0 rounded-lg overflow-hidden opacity-10">
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Banner Content */}
        <div className="relative flex items-center justify-between z-10">
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
