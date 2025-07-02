
import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackText = 'Imagem não disponível'
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);

  // Cache automático para PWA mobile
  useEffect(() => {
    const loadAndCacheImage = async () => {
      if (!src || src.startsWith('blob:') || src.startsWith('data:')) {
        setCachedSrc(src);
        setImageLoading(false);
        return;
      }

      try {
        // Verificar cache primeiro
        const cacheKey = `img_cache_${btoa(src)}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          console.log('Using cached image:', src);
          setCachedSrc(cached);
          setImageLoading(false);
          return;
        }

        // Se não tem cache, carregar e cachear
        console.log('Loading and caching image:', src);
        
        const response = await fetch(src, {
          mode: 'cors',
          cache: 'force-cache'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onload = () => {
          const dataUrl = reader.result as string;
          // Salvar no cache local
          try {
            localStorage.setItem(cacheKey, dataUrl);
            console.log('Image cached successfully:', src);
          } catch (e) {
            console.warn('Cache storage full, clearing old entries');
            // Limpar cache antigo se necessário
            const keys = Object.keys(localStorage).filter(k => k.startsWith('img_cache_'));
            keys.slice(0, Math.floor(keys.length / 2)).forEach(k => localStorage.removeItem(k));
          }
          setCachedSrc(dataUrl);
          setImageLoading(false);
        };
        
        reader.onerror = () => {
          console.error('Error reading image blob');
          setImageError(true);
          setImageLoading(false);
        };
        
        reader.readAsDataURL(blob);
        
      } catch (error) {
        console.error('Error loading image:', src, error);
        setImageError(true);
        setImageLoading(false);
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
            setImageLoading(false);
          }}
          onError={() => {
            console.error('Image render failed:', cachedSrc);
            setImageError(true);
            setImageLoading(false);
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
