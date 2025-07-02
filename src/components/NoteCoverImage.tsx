
import React from 'react';
import { Button } from '@/components/ui/button';
import ImageWithFallback from './ImageWithFallback';
import { COVER_IMAGE_CONFIG } from '@/utils/imageProcessor';

interface NoteCoverImageProps {
  coverImage: string | null;
  isEditing: boolean;
  onRemoveCover: () => void;
}

const NoteCoverImage: React.FC<NoteCoverImageProps> = ({
  coverImage,
  isEditing,
  onRemoveCover,
}) => {
  if (!coverImage) return null;

  const displayWidth = 340;
  const displayHeight = Math.round((displayWidth * COVER_IMAGE_CONFIG.height) / COVER_IMAGE_CONFIG.width);

  return (
    <div className="space-y-2">
      <div 
        className="overflow-hidden rounded-lg border bg-muted flex items-center justify-center"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          maxWidth: '100%'
        }}
      >
        <ImageWithFallback
          src={coverImage}
          alt="Capa da nota"
          className="w-full h-full object-cover"
          fallbackText="Erro ao carregar imagem de capa"
        />
      </div>
      
      {isEditing && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Dimensões: {COVER_IMAGE_CONFIG.width}x{COVER_IMAGE_CONFIG.height}px • 300 DPI
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onRemoveCover}
          >
            Remover Capa
          </Button>
        </div>
      )}
    </div>
  );
};

export default NoteCoverImage;
