
import React, { useState } from 'react';
import { Pin, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ColorPicker from './ColorPicker';
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

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setColorPopoverOpen(false);
    setDropdownOpen(false);
  };

  return (
    <DropdownMenu 
      open={dropdownOpen} 
      onOpenChange={(open) => {
        // Não fecha o dropdown se o color picker estiver aberto
        if (!open && colorPopoverOpen) {
          return;
        }
        setDropdownOpen(open);
        // Se o dropdown está fechando, fecha o color picker também
        if (!open) {
          setColorPopoverOpen(false);
        }
      }}
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
      <DropdownMenuContent 
        align="end"
        onInteractOutside={(e) => {
          // Se o color picker estiver aberto, não fecha o menu ao interagir com ele
          if (colorPopoverOpen) {
            const target = e.target as Element;
            if (target.closest('[data-radix-popper-content-wrapper]')) {
              e.preventDefault();
              return;
            }
          }
        }}
      >
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin(); }}>
          <Pin className="h-4 w-4 mr-2" />
          {note.isPinned ? 'Desafixar' : 'Fixar'}
        </DropdownMenuItem>
        <ColorPicker
          isOpen={colorPopoverOpen}
          onOpenChange={setColorPopoverOpen}
          onColorSelect={handleColorSelect}
        />
        <DropdownMenuItem 
          className="text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NoteActions;
