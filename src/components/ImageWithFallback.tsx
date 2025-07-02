
import React, { useState, useEffect, useRef } from 'react';

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
}

// Global cache to prevent duplicate requests
const pendingRequests = new Map<string, Promise<string>>();
const imageCache = new Map<string, string>();

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackText = 'Imagem não disponível'
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cache automático para PWA mobile
  useEffect(() => {
    const loadAndCacheImage = async () => {
      if (!src || src.startsWith('blob:') || src.startsWith('data:')) {
        setCachedSrc(src);
        setImageLoading(false);
        return;
      }

      // Check memory cache first
      if (imageCache.has(src)) {
        setCachedSrc(imageCache.get(src)!);
        setImageLoading(false);
        return;
      }

      // Check if there's already a pending request for this image
      if (pendingRequests.has(src)) {
        try {
          const result = await pendingRequests.get(src)!;
          if (isMountedRef.current) {
            setCachedSrc(result);
            setImageLoading(false);
          }
        } catch (error) {
          if (isMountedRef.current) {
            setImageError(true);
            setImageLoading(false);
          }
        }
        return;
      }

      try {
        // Create a promise for this request
        const requestPromise = (async () => {
          // Verificar localStorage cache primeiro
          const cacheKey = `img_${btoa(src).replace(/[^a-zA-Z0-9]/g, '').slice(0, 50)}`;
          
          try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              console.log('Using cached image:', src);
              return cached;
            }
          } catch (storageError) {
            console.warn('localStorage read error:', storageError);
          }

          // Se não tem cache, carregar e cachear
          console.log('Loading and caching image:', src);
          
          const response = await fetch(src, {
            mode: 'cors',
            cache: 'force-cache',
            headers: {
              'Accept': 'image/*,*/*;q=0.8',
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const blob = await response.blob();
          const reader = new FileReader();
          
          return new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const dataUrl = reader.result as string;
              // Salvar no cache local com tratamento de erros
              try {
                localStorage.setItem(cacheKey, dataUrl);
                console.log('Image cached successfully:', src);
              } catch (e) {
                console.warn('Cache storage full, clearing old entries');
                // Limpar cache antigo se necessário
                try {
                  const keys = Object.keys(localStorage).filter(k => k.startsWith('img_'));
                  keys.slice(0, Math.floor(keys.length / 2)).forEach(k => {
                    try {
                      localStorage.removeItem(k);
                    } catch (removeError) {
                      console.warn('Error removing cache key:', k);
                    }
                  });
                  // Tentar salvar novamente
                  localStorage.setItem(cacheKey, dataUrl);
                } catch (cleanupError) {
                  console.warn('Cache cleanup failed:', cleanupError);
                }
              }
              resolve(dataUrl);
            };
            
            reader.onerror = () => {
              reject(new Error('Error reading image blob'));
            };
            
            reader.readAsDataURL(blob);
          });
        })();

        // Store the promise
        pendingRequests.set(src, requestPromise);

        const result = await requestPromise;
        
        // Cache in memory
        imageCache.set(src, result);
        
        // Clean up the pending request
        pendingRequests.delete(src);

        if (isMountedRef.current) {
          setCachedSrc(result);
          setImageLoading(false);
        }
        
      } catch (error) {
        console.error('Error loading image:', src, error);
        pendingRequests.delete(src);
        if (isMountedRef.current) {
          setImageError(true);
          setImageLoading(false);
        }
      }
    };

    if (src) {
      setImageError(false);
      setImageLoading(true);
      loadAndCacheImage();
    } else {
      setImageLoading(false);
    }
  }, [src]);

  // Se não há src ou erro, mostrar fallback
  if (!src || imageError) {
    return (
      <div className={`bg-muted flex items-center justify-center text-muted-foreground text-sm ${className}`}>
        {fallbackText}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {imageLoading && (
        <div className={`absolute inset-0 bg-muted flex items-center justify-center ${className}`}>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
      {cachedSrc && (
        <img
          src={cachedSrc}
          alt={alt}
          className={className}
          onLoad={() => {
            console.log('Image rendered successfully');
            if (isMountedRef.current) {
              setImageLoading(false);
            }
          }}
          onError={() => {
            console.error('Image render failed:', cachedSrc);
            if (isMountedRef.current) {
              setImageError(true);
              setImageLoading(false);
            }
          }}
          style={{ 
            display: imageLoading ? 'none' : 'block',
            imageRendering: 'crisp-edges'
          }}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default ImageWithFallback;
