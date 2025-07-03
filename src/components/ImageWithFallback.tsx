
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

  // Cache isolado por imagem para evitar conflitos
  useEffect(() => {
    const loadAndCacheImage = async () => {
      if (!src) {
        setCachedSrc(null);
        setImageLoading(false);
        return;
      }

      // Para URLs locais (blob: ou data:), usar diretamente
      if (src.startsWith('blob:') || src.startsWith('data:')) {
        setCachedSrc(src);
        setImageLoading(false);
        return;
      }

      try {
        // Gerar chave única baseada na URL completa
        const cacheKey = `img_cache_${btoa(src).replace(/[^a-zA-Z0-9]/g, '').slice(0, 50)}`;
        
        // Verificar cache local primeiro
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
        
        if (!blob.type.startsWith('image/')) {
          throw new Error('Content is not an image');
        }
        
        const reader = new FileReader();
        
        reader.onload = () => {
          const dataUrl = reader.result as string;
          
          // Salvar no cache com tratamento de erros
          try {
            localStorage.setItem(cacheKey, dataUrl);
            console.log('Image cached successfully:', src);
          } catch (e) {
            console.warn('Cache storage full, clearing old entries');
            // Limpar cache antigo se necessário
            try {
              const keys = Object.keys(localStorage).filter(k => k.startsWith('img_cache_'));
              // Remover metade das entradas mais antigas
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
          
          if (isMountedRef.current) {
            setCachedSrc(dataUrl);
            setImageLoading(false);
          }
        };
        
        reader.onerror = () => {
          console.error('Error reading image blob for:', src);
          if (isMountedRef.current) {
            setImageError(true);
            setImageLoading(false);
          }
        };
        
        reader.readAsDataURL(blob);
        
      } catch (error) {
        console.error('Error loading image:', src, error);
        if (isMountedRef.current) {
          setImageError(true);
          setImageLoading(false);
        }
      }
    };

    // Reset states quando src muda
    setImageError(false);
    setImageLoading(true);
    setCachedSrc(null);
    
    loadAndCacheImage();
  }, [src]); // Dependência apenas do src para garantir que cada URL seja tratada individualmente

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
            console.log('Image rendered successfully for:', src);
            if (isMountedRef.current) {
              setImageLoading(false);
            }
          }}
          onError={() => {
            console.error('Image render failed for:', src);
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
