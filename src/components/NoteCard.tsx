import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pin, Paperclip } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Note } from '@/types/Note';
import NoteActions from './NoteActions';
import { formatDate } from '@/utils/noteFormatters';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocalCache } from '@/hooks/useLocalCache';
import ImageWithFallback from './ImageWithFallback';

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onColorChange: (color: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onTogglePin,
  onColorChange,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { autoCacheImage, isOnline } = useLocalCache();
  const [coverImageSrc, setCoverImageSrc] = useState<string | null>(note.cover_image_url);

  useEffect(() => {
    const processCoverImage = async () => {
      if (!note.cover_image_url) {
        setCoverImageSrc(null);
        return;
      }

      console.log('NoteCard: Processing cover image for note:', note.id, note.cover_image_url);
      setCoverImageSrc(note.cover_image_url);

      // Auto-cache em background se estiver online
      if (isOnline && !note.cover_image_url.startsWith('blob:')) {
        console.log('NoteCard: Triggering auto-cache for cover image');
        autoCacheImage(note.cover_image_url);
      }
    };

    processCoverImage();
  }, [note.cover_image_url, note.id, autoCacheImage, isOnline]);

  const handleCardClick = () => {
    if (isMobile) {
      // Mobile/tablet: navegar para nova página
      navigate(`/note/${note.id}`);
    } else {
      // Desktop: selecionar nota na mesma página
      onSelect();
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={handleCardClick}
      style={{ borderLeftColor: note.color, borderLeftWidth: '4px' }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            {note.is_pinned && (
              <Pin className="h-4 w-4 text-primary" fill="currentColor" />
            )}
            <h3 className="font-semibold text-sm truncate flex-1">
              {note.title}
            </h3>
          </div>
          
          <NoteActions
            note={note}
            onEdit={onEdit}
            onDelete={onDelete}
            onTogglePin={onTogglePin}
            onColorChange={onColorChange}
          />
        </div>

        {coverImageSrc && (
          <div className="mb-2">
            <ImageWithFallback
              src={coverImageSrc}
              alt="Capa da nota"
              className="w-full h-20 object-cover rounded"
              fallbackText="Erro ao carregar capa"
            />
          </div>
        )}

        {note.attachments && note.attachments.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Paperclip className="h-3 w-3" />
              {note.attachments.length} anexo{note.attachments.length > 1 ? 's' : ''}
            </div>
            <div className="flex flex-wrap gap-1">
              {note.attachments.slice(0, 2).map((attachment) => (
                <span
                  key={attachment.id}
                  className="text-xs bg-muted px-2 py-1 rounded truncate max-w-24"
                >
                  {attachment.name}
                </span>
              ))}
              {note.attachments.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{note.attachments.length - 2} mais
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Criado: {formatDate(note.created_at)}</span>
          {note.updated_at.getTime() !== note.created_at.getTime() && (
            <span>Editado: {formatDate(note.updated_at)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;
