
import React from 'react';
import NotesSearch from '@/components/NotesSearch';
import NotesList from '@/components/NotesList';
import EmptyNoteEditor from '@/components/EmptyNoteEditor';
import NoteEditor from '@/components/NoteEditor';
import OfflineIndicator from '@/components/OfflineIndicator';
import { useNotes } from '@/hooks/useNotes';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotesManagerState } from './NotesManager/NotesManagerState';
import { useNotesManagerHandlers } from './NotesManager/NotesManagerHandlers';

interface NotesManagerProps {
  onCreateNote: () => void;
  renderHeader?: (onCreateNote: () => void) => React.ReactNode;
}

const NotesManager: React.FC<NotesManagerProps> = ({ renderHeader }) => {
  const isMobile = useIsMobile();
  const { filterAndSortNotes, loading, user } = useNotes();
  
  const {
    searchTerm,
    setSearchTerm,
    selectedNote,
    setSelectedNote,
    isEditing,
    setIsEditing,
  } = useNotesManagerState();

  const {
    handleCreateNote,
    handleNoteSelect,
    handleNoteEdit,
    handleNoteDelete,
    handleNoteSave,
    handleNoteCancel,
    togglePinNote,
    updateNoteColor,
  } = useNotesManagerHandlers(selectedNote, setSelectedNote, setIsEditing);

  const filteredNotes = filterAndSortNotes(searchTerm);

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
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <NotesSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            <OfflineIndicator />
          </div>

          {isMobile ? (
            // Mobile: Grid layout como antes
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
                      onNoteSelect={handleNoteSelect}
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
          ) : (
            // Desktop: Layout com duas colunas
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lista de notas */}
              <div className="space-y-4">
                {filteredNotes.length === 0 ? (
                  <EmptyNoteEditor onCreateNote={handleCreateNote} />
                ) : (
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
                )}
              </div>

              {/* Editor de notas */}
              <div className="sticky top-6">
                {selectedNote ? (
                  <NoteEditor
                    note={selectedNote}
                    isEditing={isEditing}
                    onSave={handleNoteSave}
                    onEdit={() => setIsEditing(true)}
                    onCancel={handleNoteCancel}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
                    <p>Selecione uma nota para visualizar seu conteúdo</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NotesManager;
