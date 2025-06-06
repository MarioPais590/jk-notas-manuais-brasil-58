
import React, { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import NotesSearch from '@/components/NotesSearch';
import NotesList from '@/components/NotesList';
import EmptyNoteEditor from '@/components/EmptyNoteEditor';
import NoteEditor from '@/components/NoteEditor';
import { useTheme } from '@/hooks/useTheme';
import { useNotes } from '@/hooks/useNotes';
import { Note } from '@/types/Note';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const { darkMode, toggleTheme } = useTheme();
  const {
    createNewNote,
    saveNote,
    deleteNote,
    togglePinNote,
    updateNoteColor,
    filterAndSortNotes,
  } = useNotes();

  const filteredNotes = filterAndSortNotes(searchTerm);

  const handleCreateNote = () => {
    const newNote = createNewNote();
    setSelectedNote(newNote);
    setIsEditing(true);
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

  const handleNoteSave = (noteData: Partial<Note>) => {
    if (!selectedNote) return;
    
    const updatedNote = saveNote(selectedNote.id, noteData);
    if (updatedNote) {
      setSelectedNote(updatedNote);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground min-h-screen">
        <AppHeader
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
          onCreateNote={handleCreateNote}
        />

        <div className="container mx-auto px-4 py-6">
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
        </div>
      </div>
    </div>
  );
};

export default Index;
