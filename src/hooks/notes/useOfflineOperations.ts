
import { User } from '@supabase/supabase-js';
import { Note } from '@/types/Note';
import { useOfflineSync } from '../useOfflineSync';
import { useCacheOperations } from '../cache/useCacheOperations';

export function useOfflineOperations(
  user: User | null,
  notes: Note[],
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  coreOperations: {
    createNewNote: () => Promise<Note | null>;
    saveNote: (noteId: string, noteData: Partial<Note>) => Promise<Note | null>;
    deleteNote: (noteId: string) => Promise<void>;
  }
) {
  const { 
    isOnline, 
    addOfflineOperation
  } = useOfflineSync();

  const {
    cacheNote,
    removeCachedNote,
  } = useCacheOperations();

  const createNewNoteOffline = async () => {
    if (isOnline) {
      const newNote = await coreOperations.createNewNote();
      if (newNote) {
        await cacheNote(newNote);
      }
      return newNote;
    } else {
      // Criar nota localmente quando offline
      const tempNote = {
        id: `temp-${Date.now()}`,
        user_id: user?.id || '',
        title: 'Nova Nota',
        content: '',
        color: '#3B82F6',
        cover_image_url: null,
        is_pinned: false,
        created_at: new Date(),
        updated_at: new Date(),
        attachments: [],
      };

      setNotes(prev => [tempNote, ...prev]);
      await cacheNote(tempNote);
      
      addOfflineOperation({
        type: 'create',
        data: {
          title: tempNote.title,
          content: tempNote.content,
          color: tempNote.color,
        },
      });

      return tempNote;
    }
  };

  const saveNoteOffline = async (noteId: string, noteData: Partial<Note>) => {
    if (isOnline) {
      const savedNote = await coreOperations.saveNote(noteId, noteData);
      if (savedNote) {
        await cacheNote(savedNote);
      }
      return savedNote;
    } else {
      // Salvar localmente quando offline
      const updatedNote = { ...notes.find(n => n.id === noteId), ...noteData, updated_at: new Date() };
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));

      if (updatedNote) {
        await cacheNote(updatedNote);
      }

      addOfflineOperation({
        type: 'update',
        noteId,
        data: noteData,
      });

      return updatedNote || null;
    }
  };

  const deleteNoteOffline = async (noteId: string) => {
    if (isOnline) {
      await coreOperations.deleteNote(noteId);
      await removeCachedNote(noteId);
    } else {
      // Remover localmente quando offline
      setNotes(prev => prev.filter(note => note.id !== noteId));
      await removeCachedNote(noteId);

      addOfflineOperation({
        type: 'delete',
        noteId,
        data: {},
      });
    }
  };

  return {
    createNewNoteOffline,
    saveNoteOffline,
    deleteNoteOffline,
  };
}
