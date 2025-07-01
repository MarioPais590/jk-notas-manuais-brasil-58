
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
    uploadAttachment: (noteId: string, file: File) => Promise<any>;
    removeAttachment: (attachmentId: string, noteId: string) => Promise<void>;
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
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tempNote: Note = {
        id: tempId,
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

      // Adicionar à lista local imediatamente
      setNotes(prev => [tempNote, ...prev]);
      await cacheNote(tempNote);
      
      // Registrar operação para sincronização posterior
      await addOfflineOperation({
        type: 'create',
        data: {
          title: tempNote.title,
          content: tempNote.content,
          color: tempNote.color,
        },
      });

      console.log('Nota criada offline:', tempId);
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
      const currentNote = notes.find(n => n.id === noteId);
      if (!currentNote) return null;

      const updatedNote: Note = { 
        ...currentNote, 
        ...noteData, 
        updated_at: new Date() 
      };

      // Atualizar na lista local
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));

      // Salvar no cache
      await cacheNote(updatedNote);

      // Registrar operação apenas se não for uma nota temporária
      if (!noteId.startsWith('temp-')) {
        await addOfflineOperation({
          type: 'update',
          noteId,
          data: noteData,
        });
      }

      console.log('Nota salva offline:', noteId);
      return updatedNote;
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

      // Registrar operação apenas se não for uma nota temporária
      if (!noteId.startsWith('temp-')) {
        await addOfflineOperation({
          type: 'delete',
          noteId,
          data: {},
        });
      }

      console.log('Nota removida offline:', noteId);
    }
  };

  return {
    createNewNoteOffline,
    saveNoteOffline,
    deleteNoteOffline,
  };
}
