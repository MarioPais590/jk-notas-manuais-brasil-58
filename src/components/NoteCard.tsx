
import React from 'react';
import { Pin, Paperclip } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Note } from '@/types/Note';
import NoteActions from './NoteActions';
import { formatDate, truncateContent } from '@/utils/noteFormatters';
import { processTextWithLinksAndLineBreaks } from '@/utils/linkProcessor';

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
  // Truncar o conteúdo e depois processar links apenas se o conteúdo não foi truncado
  const truncatedContent = truncateContent(note.content);
  const shouldProcessLinks = truncatedContent === note.content;

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
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

        {note.cover_image_url && (
          <div className="mb-2">
            <img
              src={note.cover_image_url}
              alt="Capa da nota"
              className="w-full h-20 object-cover rounded"
            />
          </div>
        )}

        <div className="text-sm text-muted-foreground mb-2 line-clamp-3">
          {shouldProcessLinks ? (
            processTextWithLinksAndLineBreaks(truncatedContent)
          ) : (
            truncatedContent
          )}
        </div>

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
