
import React, { useState } from 'react';
import { Pin, Edit, Trash2, MoreVertical, Palette, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Note } from '@/types/Note';

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onColorChange: (color: string) => void;
}

const colors = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#F97316', // Orange
];

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onTogglePin,
  onColorChange,
}) => {
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
            {note.isPinned && (
              <Pin className="h-4 w-4 text-primary" fill="currentColor" />
            )}
            <h3 className="font-semibold text-sm truncate flex-1">
              {note.title}
            </h3>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin(); }}>
                <Pin className="h-4 w-4 mr-2" />
                {note.isPinned ? 'Desafixar' : 'Fixar'}
              </DropdownMenuItem>
              <Popover open={colorPopoverOpen} onOpenChange={setColorPopoverOpen}>
                <PopoverTrigger asChild>
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setColorPopoverOpen(true);
                    }}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Cor
                  </DropdownMenuItem>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-48 p-3" 
                  align="end"
                  onPointerDownOutside={() => setColorPopoverOpen(false)}
                  onEscapeKeyDown={() => setColorPopoverOpen(false)}
                >
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border-2 border-gray-200 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ backgroundColor: color }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onColorChange(color);
                          setColorPopoverOpen(false);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {note.coverImage && (
          <div className="mb-2">
            <img
              src={note.coverImage}
              alt="Capa da nota"
              className="w-full h-20 object-cover rounded"
            />
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
          {truncateContent(note.content)}
        </p>

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
          <span>Criado: {formatDate(note.createdAt)}</span>
          {note.updatedAt.getTime() !== note.createdAt.getTime() && (
            <span>Editado: {formatDate(note.updatedAt)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;
