
import React, { useState } from 'react';

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

  // If no src provided or we had an error loading, show fallback
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
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => {
          console.log('Image loaded successfully:', src);
          setImageLoading(false);
        }}
        onError={(e) => {
          console.error('Failed to load image:', src, e);
          setImageError(true);
          setImageLoading(false);
        }}
        style={{ 
          display: imageLoading ? 'none' : 'block',
          imageRendering: 'crisp-edges'
        }}
        // Adicionar atributos para melhor compatibilidade com PWA mobile
        crossOrigin="anonymous"
        loading="lazy"
      />
    </div>
  );
};

export default ImageWithFallback;
