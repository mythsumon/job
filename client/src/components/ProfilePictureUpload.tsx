import { useState, useRef } from "react";
import { Camera, User, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
// Simple image compression utility
const compressImage = (file: File, options: { maxWidth: number; maxHeight: number; quality: number; format: string }): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      const { maxWidth, maxHeight } = options;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: `image/${options.format}`,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, `image/${options.format}`, options.quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

interface ProfilePictureUploadProps {
  currentPicture?: string;
  fullName?: string;
  onUploadSuccess: (profilePicture: string) => void;
}

export function ProfilePictureUpload({ 
  currentPicture, 
  fullName, 
  onUploadSuccess 
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "오류",
        description: "이미지 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "오류",
        description: "파일 크기는 5MB 이하여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Compress and convert to WebP
      const compressedFile = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
        format: 'webp'
      });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);

      // Upload to server
      const formData = new FormData();
      formData.append('profilePicture', compressedFile);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('프로필 사진 업로드에 실패했습니다.');
      }

      const result = await response.json();
      
      toast({
        title: "성공",
        description: "프로필 사진이 업데이트되었습니다.",
      });

      onUploadSuccess(result.profilePicture);
      setPreviewUrl(null);

    } catch (error) {
      console.error('Profile picture upload error:', error);
      toast({
        title: "오류",
        description: "프로필 사진 업로드에 실패했습니다.",
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const displayPicture = previewUrl || currentPicture;
  const initials = fullName ? fullName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={displayPicture} alt={fullName || "프로필"} />
          <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center space-x-2"
        >
          {isUploading ? (
            <Upload className="w-4 h-4" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
          <span>{isUploading ? "업로드 중..." : "사진 변경"}</span>
        </Button>

        {previewUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewUrl(null)}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>취소</span>
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}