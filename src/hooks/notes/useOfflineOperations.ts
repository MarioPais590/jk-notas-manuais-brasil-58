
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

      setNotes(prev => [tempNote, ...prev]);
      await cacheNote(tempNote);
      
      await addOfflineOperation({
        type: 'create',
        data: {
          title: tempNote.title,
          content: tempNote.content,
          color: tempNote.color,
          cover_image_url: tempNote.cover_image_url,
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
      const currentNote = notes.find(n => n.id === noteId);
      if (!currentNote) return null;

      // PRESERVAR campos não modificados, especialmente cover_image_url
      const updatedNote: Note = { 
        ...currentNote,
        ...(noteData.title !== undefined && { title: noteData.title }),
        ...(noteData.content !== undefined && { content: noteData.content }),
        ...(noteData.color !== undefined && { color: noteData.color }),
        ...(noteData.is_pinned !== undefined && { is_pinned: noteData.is_pinned }),
        // Só atualizar cover_image_url se foi explicitamente fornecido
        ...(noteData.cover_image_url !== undefined && { cover_image_url: noteData.cover_image_url }),
        updated_at: new Date()
      };

      console.log('Saving note offline:', {
        noteId,
        preservedCover: currentNote.cover_image_url,
        updatedCover: updatedNote.cover_image_url
      });

      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));

      await cacheNote(updatedNote);

      if (!noteId.startsWith('temp-')) {
        const operationData: Partial<Note> = {};
        
        if (noteData.title !== undefined) operationData.title = noteData.title;
        if (noteData.content !== undefined) operationData.content = noteData.content;
        if (noteData.color !== undefined) operationData.color = noteData.color;
        if (noteData.is_pinned !== undefined) operationData.is_pinned = noteData.is_pinned;
        if (noteData.cover_image_url !== undefined) operationData.cover_image_url = noteData.cover_image_url;

        await addOfflineOperation({
          type: 'update',
          noteId,
          data: operationData,
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
      setNotes(prev => prev.filter(note => note.id !== noteId));
      await removeCachedNote(noteId);

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
