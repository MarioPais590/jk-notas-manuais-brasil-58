
import React, { useState, useEffect, useRef } from 'react';
import { useLocalCache } from '@/hooks/useLocalCache';

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
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [finalSrc, setFinalSrc] = useState<string | null>(null);
  const { cacheImage, loadCachedImage, isOnline } = useLocalCache();
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const loadImage = async () => {
      if (!src) {
        setImageState('error');
        return;
      }

      setImageState('loading');
      console.log('ImageWithFallback: Loading image:', src);

      try {
        // Primeiro, tentar carregar do cache local
        const cachedSrc = await loadCachedImage(src);
        console.log('ImageWithFallback: Cache result:', { original: src, cached: cachedSrc });

        // Se conseguiu uma versão cached (blob URL), usar ela
        if (cachedSrc !== src && cachedSrc.startsWith('blob:')) {
          console.log('ImageWithFallback: Using cached version');
          setFinalSrc(cachedSrc);
          setImageState('loaded');
          return;
        }

        // Se online, tentar carregar e cache automaticamente
        if (isOnline) {
          console.log('ImageWithFallback: Online - attempting to load and cache');
          
          // Tentar carregar a imagem original
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          const loadPromise = new Promise<void>((resolve, reject) => {
            img.onload = () => {
              console.log('ImageWithFallback: Image loaded successfully');
              setFinalSrc(src);
              setImageState('loaded');
              
              // Cache em background após sucesso
              cacheImage(src).then((cachedUrl) => {
                console.log('ImageWithFallback: Image cached:', cachedUrl);
                // Se retornou uma blob URL, atualizar
                if (cachedUrl !== src && cachedUrl.startsWith('blob:')) {
                  setFinalSrc(cachedUrl);
                }
              }).catch(err => {
                console.warn('ImageWithFallback: Cache failed but image loaded:', err);
              });
              
              resolve();
            };
            
            img.onerror = (error) => {
              console.error('ImageWithFallback: Failed to load image:', src, error);
              setImageState('error');
              reject(error);
            };
            
            // Timeout para PWAs móveis
            setTimeout(() => {
              if (!img.complete) {
                console.warn('ImageWithFallback: Load timeout, showing original URL anyway');
                setFinalSrc(src);
                setImageState('loaded');
                resolve();
              }
            }, 8000);
          });

          img.src = src;
          await loadPromise;
        } else {
          // Offline e sem cache - mostrar erro
          console.log('ImageWithFallback: Offline and no cache available');
          setImageState('error');
        }
      } catch (error) {
        console.error('ImageWithFallback: Error in load process:', error);
        
        // Fallback: se estiver online, tentar mostrar a URL original
        if (isOnline && src) {
          console.log('ImageWithFallback: Fallback to original URL');
          setFinalSrc(src);
          setImageState('loaded');
        } else {
          setImageState('error');
        }
      }
    };

    loadImage();
  }, [src, isOnline, cacheImage, loadCachedImage]);

  // Estado de erro ou sem src
  if (!src || imageState === 'error') {
    return (
      <div className={`flex items-center justify-center text-sm ${className}`} 
           style={{ 
             backgroundColor: '#f1f5f9', 
             color: '#64748b',
             minHeight: '60px'
           }}>
        {fallbackText}
      </div>
    );
  }

  // Estado de loading
  if (imageState === 'loading') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}
           style={{ minHeight: '60px' }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
          <div 
            className="animate-spin rounded-full border-2 border-b-transparent"
            style={{ 
              width: '16px', 
              height: '16px',
              borderColor: '#3b82f6',
              borderBottomColor: 'transparent'
            }}
          ></div>
          Carregando...
        </div>
      </div>
    );
  }

  // Estado loaded - renderizar imagem
  return (
    <div className="relative w-full h-full">
      <img
        ref={imgRef}
        src={finalSrc || src}
        alt={alt}
        className={className}
        style={{ 
          maxWidth: '100%',
          height: 'auto',
          display: 'block'
        }}
        onLoad={() => {
          console.log('ImageWithFallback: Image render completed:', finalSrc || src);
        }}
        onError={(e) => {
          console.error('ImageWithFallback: Image render failed:', finalSrc || src, e);
          setImageState('error');
        }}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default ImageWithFallback;
