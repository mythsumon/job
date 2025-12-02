/**
 * Image processing utilities for WebP conversion and optimization
 */

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maintainAspectRatio?: boolean;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Converts and optimizes an image file to WebP format
 * @param file - The input image file
 * @param options - Processing options
 * @returns Promise that resolves to a WebP data URL
 */
export function processImageToWebP(
  file: File, 
  options: ImageProcessingOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.9,
    maintainAspectRatio = true,
    format = 'webp'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        let { width, height } = img;
        
        // Calculate dimensions while maintaining aspect ratio
        if (maintainAspectRatio) {
          const aspectRatio = width / height;
          
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        } else {
          width = Math.min(width, maxWidth);
          height = Math.min(height, maxHeight);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image with high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP with specified quality
        const dataURL = canvas.toDataURL(`image/${format}`, quality);
        resolve(dataURL);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Processes profile picture specifically (square crop with WebP)
 * @param file - The input image file
 * @returns Promise that resolves to processed image data with metadata
 */
export function processProfilePicture(file: File): Promise<{
  dataUrl: string;
  format: string;
  size: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }
        
        // Set target size for profile picture (square)
        const targetSize = 400;
        canvas.width = targetSize;
        canvas.height = targetSize;
        
        // Calculate scaling to fit image in square while maintaining aspect ratio
        const scale = Math.max(targetSize / img.width, targetSize / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Center the image
        const x = (targetSize - scaledWidth) / 2;
        const y = (targetSize - scaledHeight) / 2;
        
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetSize, targetSize);
        
        // Draw the scaled and centered image with high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Convert to WebP format for optimal compression
        const processedDataURL = canvas.toDataURL('image/webp', 0.9);
        
        // Calculate approximate size from base64 data
        const base64Data = processedDataURL.split(',')[1];
        const sizeInBytes = Math.round((base64Data.length * 3) / 4);
        
        resolve({
          dataUrl: processedDataURL,
          format: 'webp',
          size: sizeInBytes
        });
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validates if the file is a supported image format
 * @param file - The file to validate
 * @returns boolean indicating if the file is a valid image
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Gets the file size in a human readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}