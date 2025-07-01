
import { useState } from 'react';
import { Note } from '@/types/Note';

export function useNotesManagerState() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  return {
    searchTerm,
    setSearchTerm,
    selectedNote,
    setSelectedNote,
    isEditing,
    setIsEditing,
  };
}
