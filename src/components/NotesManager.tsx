
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
    createNewNote,
    loading,
    user,
  } = useNotes();

  const filteredNotes = filterAndSortNotes(searchTerm);

  const handleCreateNote = async () => {
    console.log('Creating new note...');
    if (!user) {
      console.log('No user found, cannot create note');
      return;
    }

    try {
      const newNote = await createNewNote();
      console.log('New note created:', newNote);
      if (newNote) {
        setSelectedNote(newNote);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

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

  const handleNoteSave = async (noteData: Partial<Note>) => {
    if (!selectedNote) return;
    
    const updatedNote = await saveNote(selectedNote.id, noteData);
    if (updatedNote) {
      setSelectedNote(updatedNote);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando notas...</p>
        </div>
      </div>
    );
  }

  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Faça login para acessar suas notas.</p>
        </div>
      </div>
    );
  }

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
          onCreateNote={handleCreateNote}
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
          <EmptyNoteEditor onCreateNote={handleCreateNote} />
        )}
      </div>
    </div>
  );
};

export default NotesManager;
