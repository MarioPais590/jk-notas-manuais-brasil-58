
import React from 'react';
import { Button } from '@/components/ui/button';

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

  return (
    <div>
      <img
        src={coverImage}
        alt="Capa da nota"
        className="w-full max-h-48 object-cover rounded-lg"
      />
      {isEditing && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={onRemoveCover}
        >
          Remover Capa
        </Button>
      )}
    </div>
  );
};

export default NoteCoverImage;
