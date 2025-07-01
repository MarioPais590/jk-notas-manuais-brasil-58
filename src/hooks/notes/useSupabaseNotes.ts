
import { useEffect } from 'react';
import { useNotesAuth } from './useNotesAuth';
import { useNotesData } from './useNotesData';
import { useNoteOperations } from './useNoteOperations';
import { useNoteAttachments } from './useNoteAttachments';
import { useNoteDeletion } from './useNoteDeletion';
import { useOfflineSync } from '../useOfflineSync';
import { useLocalCache } from '../useLocalCache';
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
    cacheReady,
    pendingOperations, 
    addOfflineOperation, 
    clearOfflineOperations,
    removeOfflineOperation 
  } = useOfflineSync();

  const {
    cacheNotes,
    loadCachedNotes,
    cacheNote,
    removeCachedNote,
    cacheImage,
    loadCachedImage,
    cleanOldCache
  } = useLocalCache();
  
  const { createNewNote, saveNote, togglePinNote, updateNoteColor } = useNoteOperations(
    user, 
    notes, 
    setNotes
  );
  
  const { uploadAttachment, removeAttachment } = useNoteAttachments(user, setNotes);
  const { deleteNote } = useNoteDeletion(user, notes, setNotes);

  // Carregar dados inicial (cache primeiro, depois remoto)
  useEffect(() => {
    if (user && cacheReady) {
      loadInitialData();
    }
  }, [user, cacheReady]);

  // Limpar cache antigo periodicamente
  useEffect(() => {
    if (cacheReady) {
      cleanOldCache();
    }
  }, [cacheReady]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Carregar do cache primeiro (mais rápido)
      const cachedNotes = await loadCachedNotes();
      if (cachedNotes.length > 0) {
        console.log('Carregando notas do cache local primeiro');
        
        // Processar imagens do cache
        const notesWithCachedImages = await Promise.all(
          cachedNotes.map(async (note) => {
            if (note.cover_image_url) {
              const cachedImageUrl = await loadCachedImage(note.cover_image_url);
              return { ...note, cover_image_url: cachedImageUrl };
            }
            return note;
          })
        );
        
        setNotes(notesWithCachedImages);
        setLoading(false);
      }

      // Se estiver online, buscar dados atualizados do servidor
      if (isOnline && user) {
        console.log('Buscando dados atualizados do servidor');
        setTimeout(async () => {
          await fetchNotes(user, () => {});
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      setLoading(false);
    }
  };

  // Cache das notas quando atualizadas
  useEffect(() => {
    if (notes.length > 0 && cacheReady) {
      cacheNotes(notes);
      
      // Cache das imagens de capa
      notes.forEach(async (note) => {
        if (note.cover_image_url && !note.cover_image_url.startsWith('blob:')) {
          await cacheImage(note.cover_image_url);
        }
      });
    }
  }, [notes, cacheReady]);

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
              
              // Remover do cache local também
              if (operation.noteId) {
                await removeCachedNote(operation.noteId);
              }
              break;
          }
          
          removeOfflineOperation(operation.id);
        } catch (error) {
          console.error('Error syncing operation:', operation, error);
        }
      }

      if (pendingOperations.length > 0) {
        await fetchNotes(user, () => {});
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
      const newNote = await createNewNote();
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

  const saveNoteOffline = async (noteId: string, noteData: Partial<typeof notes[0]>) => {
    if (isOnline) {
      const savedNote = await saveNote(noteId, noteData);
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
      await deleteNote(noteId);
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

  const refetch = async () => {
    if (user) {
      if (isOnline) {
        await fetchNotes(user, setLoading);
      } else {
        // Se offline, carregar do cache
        const cachedNotes = await loadCachedNotes();
        if (cachedNotes.length > 0) {
          setNotes(cachedNotes);
        }
      }
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
    togglePinNote,
    updateNoteColor,
    uploadAttachment,
    removeAttachment,
    filterAndSortNotes: filterAndSort,
    refetch,
  };
}
