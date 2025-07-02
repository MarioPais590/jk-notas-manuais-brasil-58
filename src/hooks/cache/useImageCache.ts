import { db } from './database';
import { CachedImage } from './types';

export function useImageCache() {
  // Cache images improved for PWA mobile
  const cacheImage = async (url: string): Promise<string> => {
    if (!url || url.startsWith('blob:') || url.startsWith('data:')) {
      console.log('Skipping cache for URL:', url);
      return url;
    }
    
    try {
      console.log('Attempting to cache image:', url);
      
      // Check if already cached
      const cached = await db.cachedImages.where('url').equals(url).first();
      if (cached) {
        console.log('Image already cached:', url);
        const blobUrl = URL.createObjectURL(cached.blob);
        console.log('Returning cached blob URL:', blobUrl);
        return blobUrl;
      }

      console.log('Downloading image for cache:', url);
      
      // Configure fetch with headers for better compatibility with PWA/mobile
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'force-cache',
        headers: {
          'Accept': 'image/*,*/*;q=0.8',
        }
      });
      
      if (!response.ok) {
        console.warn('Failed to fetch image:', response.status, response.statusText);
        return url;
      }
      
      const blob = await response.blob();
      console.log('Image downloaded, size:', blob.size, 'type:', blob.type);
      
      // Check if it's really an image
      if (!blob.type.startsWith('image/')) {
        console.warn('Downloaded content is not an image:', blob.type);
        return url;
      }
      
      const cachedImage: CachedImage = {
        id: crypto.randomUUID(),
        url,
        blob,
        timestamp: Date.now()
      };

      await db.cachedImages.add(cachedImage);
      const blobUrl = URL.createObjectURL(blob);
      console.log('Image cached successfully:', url, 'blob URL:', blobUrl);
      return blobUrl;
    } catch (error) {
      console.error('Error caching image:', url, error);
      return url;
    }
  };

  // Load image from cache
  const loadCachedImage = async (url: string): Promise<string> => {
    if (!url || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    
    try {
      console.log('Looking for cached image:', url);
      const cached = await db.cachedImages.where('url').equals(url).first();
      if (cached) {
        const blobUrl = URL.createObjectURL(cached.blob);
        console.log('Found cached image:', url, 'returning blob URL:', blobUrl);
        return blobUrl;
      }
      console.log('No cached version found for:', url);
      return url;
    } catch (error) {
      console.error('Error loading cached image:', url, error);
      return url;
    }
  };

  // Clean old cache (keep only 30 days)
  const cleanOldCache = async () => {
    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const deletedCount = await db.cachedImages.where('timestamp').below(thirtyDaysAgo).delete();
      if (deletedCount > 0) {
        console.log('Cleaned old cache entries:', deletedCount);
      }
    } catch (error) {
      console.error('Error cleaning old cache:', error);
    }
  };

  return {
    cacheImage,
    loadCachedImage,
    cleanOldCache
  };
}
