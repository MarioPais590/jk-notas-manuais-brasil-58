
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NoteCard from '@/components/NoteCard';
import { Note } from '@/types/Note';

interface NotesListProps {
  notes: Note[];
  selectedNote: Note | null;
  onNoteSelect: (note: Note) => void;
  onNoteEdit: (note: Note) => void;
  onNoteDelete: (noteId: string) => void;
  onNoteTogglePin: (noteId: string) => void;
  onNoteColorChange: (noteId: string, color: string) => void;
  onCreateNote: () => void;
}

const NotesList: React.FC<NotesListProps> = ({
  notes,
  selectedNote,
  onNoteSelect,
  onNoteEdit,
  onNoteDelete,
  onNoteTogglePin,
  onNoteColorChange,
  onCreateNote,
}) => {
  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma nota encontrada.</p>
        <Button 
          variant="link" 
          onClick={onCreateNote}
          className="mt-2"
        >
          Criar sua primeira nota
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          isSelected={selectedNote?.id === note.id}
          onSelect={() => onNoteSelect(note)}
          onEdit={() => onNoteEdit(note)}
          onDelete={() => onNoteDelete(note.id)}
          onTogglePin={() => onNoteTogglePin(note.id)}
          onColorChange={(color) => onNoteColorChange(note.id, color)}
        />
      ))}
    </div>
  );
};

export default NotesList;
