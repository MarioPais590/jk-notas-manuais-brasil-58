
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotesSearch from '@/components/NotesSearch';
import NotesList from '@/components/NotesList';
import EmptyNoteEditor from '@/components/EmptyNoteEditor';
import { useNotes } from '@/hooks/useNotes';
import { Note } from '@/types/Note';

interface NotesManagerProps {
  onCreateNote: () => void;
  renderHeader?: (onCreateNote: () => void) => React.ReactNode;
}

const NotesManager: React.FC<NotesManagerProps> = ({ renderHeader }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const {
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
        navigate(`/note/${newNote.id}`);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleNoteEdit = (note: Note) => {
    navigate(`/note/${note.id}`);
  };

  const handleNoteDelete = (noteId: string) => {
    deleteNote(noteId);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        {renderHeader && renderHeader(handleCreateNote)}
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando notas...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        {renderHeader && renderHeader(handleCreateNote)}
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Faça login para acessar suas notas.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {renderHeader && renderHeader(handleCreateNote)}
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          <NotesSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full">
                <EmptyNoteEditor onCreateNote={handleCreateNote} />
              </div>
            ) : (
              filteredNotes.map(note => (
                <div key={note.id} className="h-fit">
                  <NotesList
                    notes={[note]}
                    selectedNote={null}
                    onNoteSelect={() => {}}
                    onNoteEdit={handleNoteEdit}
                    onNoteDelete={handleNoteDelete}
                    onNoteTogglePin={togglePinNote}
                    onNoteColorChange={updateNoteColor}
                    onCreateNote={handleCreateNote}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotesManager;
