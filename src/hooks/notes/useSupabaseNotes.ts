
import { useEffect } from 'react';
import { useNotesAuth } from './useNotesAuth';
import { useNotesData } from './useNotesData';
import { useNoteOperations } from './useNoteOperations';
import { useNoteAttachments } from './useNoteAttachments';
import { useNoteDeletion } from './useNoteDeletion';
import { filterAndSortNotes } from './utils';
import { NotesHookReturn } from './types';

export function useSupabaseNotes(): NotesHookReturn {
  const { user, loading, setLoading } = useNotesAuth();
  const { notes, setNotes, fetchNotes } = useNotesData();
  
  const { createNewNote, saveNote, togglePinNote, updateNoteColor } = useNoteOperations(
    user, 
    notes, 
    setNotes
  );
  
  const { uploadAttachment, removeAttachment } = useNoteAttachments(user, setNotes);
  const { deleteNote } = useNoteDeletion(user, notes, setNotes);

  useEffect(() => {
    if (user) {
      setTimeout(async () => {
        await fetchNotes(user, setLoading);
      }, 100);
    }
  }, [user]);

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
    createNewNote,
    saveNote,
    deleteNote,
    togglePinNote,
    updateNoteColor,
    uploadAttachment,
    removeAttachment,
    filterAndSortNotes: filterAndSort,
    refetch,
  };
}
