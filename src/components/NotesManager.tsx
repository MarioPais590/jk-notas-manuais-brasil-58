
import React, { useState } from 'react';
import NotesSearch from '@/components/NotesSearch';
import NotesList from '@/components/NotesList';
import EmptyNoteEditor from '@/components/EmptyNoteEditor';
import NoteEditor from '@/components/NoteEditor';
import { useNotes } from '@/hooks/useNotes';
import { Note } from '@/types/Note';

interface NotesManagerProps {
  onCreateNote: () => void;
}

const NotesManager: React.FC<NotesManagerProps> = ({ onCreateNote }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    saveNote,
    deleteNote,
    togglePinNote,
    updateNoteColor,
    filterAndSortNotes,
  } = useNotes();

  const filteredNotes = filterAndSortNotes(searchTerm);

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
  };

  const handleNoteEdit = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(true);
  };

  const handleNoteDelete = (noteId: string) => {
    deleteNote(noteId);
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const handleNoteSave = (noteData: Partial<Note>) => {
    if (!selectedNote) return;
    
    const updatedNote = saveNote(selectedNote.id, noteData);
    if (updatedNote) {
      setSelectedNote(updatedNote);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista de Notas */}
      <div className="lg:col-span-1 space-y-4">
        <NotesSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <NotesList
          notes={filteredNotes}
          selectedNote={selectedNote}
          onNoteSelect={handleNoteSelect}
          onNoteEdit={handleNoteEdit}
          onNoteDelete={handleNoteDelete}
          onNoteTogglePin={togglePinNote}
          onNoteColorChange={updateNoteColor}
          onCreateNote={onCreateNote}
        />
      </div>

      {/* Editor de Notas */}
      <div className="lg:col-span-2">
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            isEditing={isEditing}
            onSave={handleNoteSave}
            onEdit={() => setIsEditing(true)}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <EmptyNoteEditor onCreateNote={onCreateNote} />
        )}
      </div>
    </div>
  );
};

export default NotesManager;
