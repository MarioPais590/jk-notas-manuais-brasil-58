
import { useSupabaseNotesCore } from './useSupabaseNotesCore';
import { useOfflineOperations } from './useOfflineOperations';
import { useSupabaseNotesSync } from './useSupabaseNotesSync';
import { useNotesAuth } from './useNotesAuth';
import { useNotesData } from './useNotesData';
import { useNoteOperations } from './useNoteOperations';
import { filterAndSortNotes } from './utils';
import { NotesHookReturn } from './types';

export function useSupabaseNotes(): NotesHookReturn {
  const { user, loading, setLoading } = useNotesAuth();
  const { notes, setNotes, fetchNotes } = useNotesData();
  
  const coreOperations = useNoteOperations(user, notes, setNotes);
  
  const {
    createNewNoteOffline,
    saveNoteOffline,
    deleteNoteOffline,
  } = useOfflineOperations(user, notes, setNotes, coreOperations);

  // Configurar sincronização
  useSupabaseNotesSync(user, notes, setNotes, setLoading, fetchNotes);

  const refetch = async () => {
    if (user) {
      await fetchNotes(user, setLoading);
    }
  };

  const filterAndSort = (searchTerm: string) => {
    return filterAndSortNotes(notes, searchTerm);
  };

  return {
    notes,
    user,
    loading,
    createNewNote: createNewNoteOffline,
    saveNote: saveNoteOffline,
    deleteNote: deleteNoteOffline,
    togglePinNote: coreOperations.togglePinNote,
    updateNoteColor: coreOperations.updateNoteColor,
    uploadAttachment: coreOperations.uploadAttachment,
    removeAttachment: coreOperations.removeAttachment,
    filterAndSortNotes: filterAndSort,
    refetch,
  };
}
