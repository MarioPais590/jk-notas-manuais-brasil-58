
import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Note } from '@/types/Note';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineSync } from '../useOfflineSync';
import { useCacheOperations } from '../cache/useCacheOperations';
import { useToast } from '@/hooks/use-toast';

export function useSupabaseNotesSync(
  user: User | null,
  notes: Note[],
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  setLoading: (loading: boolean) => void,
  fetchNotes: (user: User, setLoading: (loading: boolean) => void) => Promise<void>
) {
  const { toast } = useToast();
  const { 
    isOnline, 
    cacheReady,
    pendingOperations, 
    removeOfflineOperation 
  } = useOfflineSync();

  const {
    cacheNotes,
    loadCachedNotes,
    removeCachedNote,
    cleanOldCache
  } = useCacheOperations();

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

  // Cache das notas quando atualizadas
  useEffect(() => {
    if (notes.length > 0 && cacheReady) {
      cacheNotes(notes);
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

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Carregar do cache primeiro (mais rápido)
      const notesWithCachedImages = await loadCachedNotes();
      if (notesWithCachedImages.length > 0) {
        console.log('Carregando notas do cache local primeiro');
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

  return {
    loadInitialData,
  };
}
