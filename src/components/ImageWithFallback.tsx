
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
  const cacheAttemptedRef = useRef(new Set<string>());

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

      // Reset states quando src muda
      setImageError(false);
      setImageLoading(true);
      setCachedSrc(null);

      // Para URLs locais (blob:, data:, ou assets locais), usar diretamente
      if (src.startsWith('blob:') || src.startsWith('data:') || src.startsWith('/lovable-uploads/')) {
        if (isMountedRef.current) {
          setCachedSrc(src);
          setImageLoading(false);
        }
        return;
      }

      // Evitar múltiplas tentativas de cache para a mesma URL
      const cacheKey = `img_cache_${btoa(src).replace(/[^a-zA-Z0-9]/g, '').slice(0, 50)}`;
      
      if (cacheAttemptedRef.current.has(src)) {
        // Se já tentamos cachear esta URL, usar diretamente
        if (isMountedRef.current) {
          setCachedSrc(src);
          setImageLoading(false);
        }
        return;
      }

      try {
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

        // Marcar como tentado para evitar loops
        cacheAttemptedRef.current.add(src);

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
            // Verificar se o tamanho é razoável (< 5MB base64)
            if (dataUrl.length < 5 * 1024 * 1024) {
              localStorage.setItem(cacheKey, dataUrl);
              console.log('Image cached successfully:', src);
            } else {
              console.warn('Image too large for cache:', src);
            }
          } catch (e) {
            console.warn('Cache storage full or error, using direct URL:', e);
            // Se não conseguir cachear, usar a URL original
          }
          
          if (isMountedRef.current) {
            setCachedSrc(dataUrl);
            setImageLoading(false);
          }
        };
        
        reader.onerror = () => {
          console.error('Error reading image blob for:', src);
          if (isMountedRef.current) {
            // Fallback para URL original se não conseguir processar
            setCachedSrc(src);
            setImageLoading(false);
          }
        };
        
        reader.readAsDataURL(blob);
        
      } catch (error) {
        console.error('Error loading image:', src, error);
        if (isMountedRef.current) {
          // Fallback para URL original em caso de erro
          setCachedSrc(src);
          setImageLoading(false);
        }
      }
    };

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
