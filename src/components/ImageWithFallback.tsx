
import React, { useState, useEffect, useRef } from 'react';

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
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadImage = async () => {
      if (!src) {
        setCachedSrc(null);
        setImageLoading(false);
        return;
      }

      // Reset states quando src muda
      setImageError(false);
      setImageLoading(true);
      setCachedSrc(null);

      // Para URLs do Supabase Storage, carregar diretamente
      if (src.includes('supabase.co/storage')) {
        console.log('Loading Supabase Storage image:', src);
        if (isMountedRef.current) {
          setCachedSrc(src);
          setImageLoading(false);
        }
        return;
      }

      // Para URLs remotas confiáveis (Unsplash, etc), carregar diretamente
      if (src.startsWith('https://images.unsplash.com/') || src.startsWith('https://')) {
        if (isMountedRef.current) {
          setCachedSrc(src);
          setImageLoading(false);
        }
        return;
      }

      // Para URLs locais (blob:, data:), usar diretamente
      if (src.startsWith('blob:') || src.startsWith('data:')) {
        if (isMountedRef.current) {
          setCachedSrc(src);
          setImageLoading(false);
        }
        return;
      }

      // Para outras URLs, tentar carregar com cache inteligente
      try {
        console.log('Loading remote image:', src);
        
        // Verificar cache com limpeza automática se lotado
        const cacheKey = `img_cache_${btoa(src).replace(/[^a-zA-Z0-9]/g, '').slice(0, 50)}`;
        
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            console.log('Using cached image for:', src);
            if (isMountedRef.current) {
              setCachedSrc(cached);
              setImageLoading(false);
            }
            return;
          }
        } catch (storageError) {
          // Se localStorage está cheio, limpar cache automaticamente
          console.warn('Cache storage full, cleaning automatically:', storageError);
          cleanOldCacheEntries();
        }

        // Carregar e cachear se possível
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
        
        if (!blob.type.startsWith('image/')) {
          throw new Error('Content is not an image');
        }
        
        const reader = new FileReader();
        
        reader.onload = () => {
          const dataUrl = reader.result as string;
          
          // Tentar salvar no cache, mas não falhar se não conseguir
          try {
            if (dataUrl.length < 1.5 * 1024 * 1024) { // Apenas imagens < 1.5MB
              localStorage.setItem(cacheKey, dataUrl);
              console.log('Image cached successfully:', src);
            }
          } catch (e) {
            console.warn('Cache storage full, using image without caching:', e);
            cleanOldCacheEntries();
            try {
              localStorage.setItem(cacheKey, dataUrl);
            } catch (e2) {
              console.warn('Unable to cache even after cleanup:', e2);
            }
          }
          
          if (isMountedRef.current) {
            setCachedSrc(dataUrl);
            setImageLoading(false);
          }
        };
        
        reader.onerror = () => {
          console.error('Error reading image blob for:', src);
          if (isMountedRef.current) {
            setCachedSrc(src);
            setImageLoading(false);
          }
        };
        
        reader.readAsDataURL(blob);
        
      } catch (error) {
        console.error('Error loading image:', src, error);
        if (isMountedRef.current) {
          // Fallback para URL original
          setCachedSrc(src);
          setImageLoading(false);
        }
      }
    };

    loadImage();
  }, [src]);

  // Função para limpar entradas antigas do cache automaticamente
  const cleanOldCacheEntries = () => {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('img_cache_'));
      
      // Remove 50% das entradas de cache mais antigas para garantir espaço
      const keysToRemove = cacheKeys.slice(0, Math.floor(cacheKeys.length * 0.5));
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('Error removing cache key:', key, e);
        }
      });
      
      console.log('Auto-cleaned cache entries:', keysToRemove.length);
    } catch (error) {
      console.error('Error cleaning cache:', error);
    }
  };

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
            if (isMountedRef.current) {
              setImageLoading(false);
            }
          }}
          onError={(e) => {
            console.error('Image render failed for:', src);
            if (isMountedRef.current) {
              setImageError(true);
              setImageLoading(false);
            }
          }}
          style={{ 
            display: imageLoading ? 'none' : 'block',
            imageRendering: 'auto'
          }}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};

export default ImageWithFallback;
