
import React from 'react';
import { Save, Edit, X, Download, Share2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/utils/noteFormatters';
import { Note } from '@/types/Note';

interface NoteEditorHeaderProps {
  note: Note;
  isEditing: boolean;
  title: string;
  onTitleChange: (title: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onShareModalOpen: () => void;
  onDownloadModalOpen: () => void;
}

const NoteEditorHeader: React.FC<NoteEditorHeaderProps> = ({
  note,
  isEditing,
  title,
  onTitleChange,
  onEdit,
  onCancel,
  onSave,
  onImageUpload,
  onShareModalOpen,
  onDownloadModalOpen,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
            placeholder="Título da nota"
          />
        ) : (
          <h2 className="text-lg font-semibold">{note.title}</h2>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          Criado em {formatDate(note.created_at)}
          {note.updated_at.getTime() !== note.created_at.getTime() && (
            <span> • Editado em {formatDate(note.updated_at)}</span>
          )}
        </p>
      </div>
      
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={onImageUpload}
              className="hidden"
              id="cover-upload"
            />
            <label htmlFor="cover-upload">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                title="Adicionar capa (1700x700px, PNG/JPG, máx 10MB, 300 DPI)"
              >
                <span className="cursor-pointer">
                  <Image className="h-4 w-4" />
                </span>
              </Button>
            </label>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={onShareModalOpen}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDownloadModalOpen}>
              <Download className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default NoteEditorHeader;
