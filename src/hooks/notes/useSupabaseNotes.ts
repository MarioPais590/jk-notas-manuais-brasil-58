
import { useEffect } from 'react';
import { useNotesAuth } from './useNotesAuth';
import { useNotesData } from './useNotesData';
import { useNoteOperations } from './useNoteOperations';
import { useNoteAttachments } from './useNoteAttachments';
import { useNoteDeletion } from './useNoteDeletion';
import { useOfflineSync } from '../useOfflineSync';
import { filterAndSortNotes } from './utils';
import { NotesHookReturn } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSupabaseNotes(): NotesHookReturn {
  const { user, loading, setLoading } = useNotesAuth();
  const { notes, setNotes, fetchNotes } = useNotesData();
  const { toast } = useToast();
  
  const { 
    isOnline, 
    pendingOperations, 
    addOfflineOperation, 
    clearOfflineOperations,
    removeOfflineOperation 
  } = useOfflineSync();
  
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

  // Sincronizar operações offline quando voltar online
  useEffect(() => {
    const syncOfflineOperations = async () => {
      if (!isOnline || !user || pendingOperations.length === 0) return;

      console.log('Syncing offline operations:', pendingOperations);
      
      for (const operation of pendingOperations) {
        try {
          switch (operation.type) {
            case 'create':
              await supabase
                .from('notes')
                .insert({
                  ...operation.data,
                  user_id: user.id,
                })
                .select()
                .single();
              break;
              
            case 'update':
              await supabase
                .from('notes')
                .update(operation.data)
                .eq('id', operation.noteId)
                .eq('user_id', user.id);
              break;
              
            case 'delete':
              await supabase
                .from('notes')
                .delete()
                .eq('id', operation.noteId)
                .eq('user_id', user.id);
              break;
          }
          
          removeOfflineOperation(operation.id);
        } catch (error) {
          console.error('Error syncing operation:', operation, error);
        }
      }

      if (pendingOperations.length > 0) {
        await fetchNotes(user, setLoading);
        toast({
          title: "Sincronização concluída",
          description: "Todas as alterações offline foram sincronizadas.",
        });
      }
    };

    syncOfflineOperations();
  }, [isOnline, user, pendingOperations]);

  // Wrapper para operações que suportam offline
  const createNewNoteOffline = async () => {
    if (isOnline) {
      return await createNewNote();
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

  const saveNoteOffline = async (noteId: string, noteData: Partial<typeof notes[0]>) => {
    if (isOnline) {
      return await saveNote(noteId, noteData);
    } else {
      // Salvar localmente quando offline
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, ...noteData, updated_at: new Date() } : note
      ));

      addOfflineOperation({
        type: 'update',
        noteId,
        data: noteData,
      });

      return notes.find(n => n.id === noteId) || null;
    }
  };

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
    deleteNote,
    togglePinNote,
    updateNoteColor,
    uploadAttachment,
    removeAttachment,
    filterAndSortNotes: filterAndSort,
    refetch,
  };
}
