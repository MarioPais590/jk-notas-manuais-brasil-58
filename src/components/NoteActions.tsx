
import React, { useState } from 'react';
import { Pin, Edit, Trash2, MoreVertical, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ColorPicker from './ColorPicker';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { Note } from '@/types/Note';

interface NoteActionsProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onColorChange: (color: string) => void;
}

const NoteActions: React.FC<NoteActionsProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onColorChange,
}) => {
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setColorPopoverOpen(false);
  };

  const handleDeleteClick = () => {
    setDropdownOpen(false);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setDeleteDialogOpen(false);
    onDelete();
  };

  return (
    <div className="flex items-center gap-1">
      <ColorPicker
        isOpen={colorPopoverOpen}
        onOpenChange={setColorPopoverOpen}
        onColorSelect={handleColorSelect}
      />
      
      <DropdownMenu 
        open={dropdownOpen} 
        onOpenChange={setDropdownOpen}
      >
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
        <DropdownMenuContent align="end" className="z-50">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin(); }}>
            <Pin className="h-4 w-4 mr-2" />
            {note.is_pinned ? 'Desafixar' : 'Fixar'}
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive"
            onClick={(e) => { 
              e.stopPropagation(); 
              handleDeleteClick();
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir nota"
        description="Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita e todos os anexos também serão removidos."
      />
    </div>
  );
};

export default NoteActions;
