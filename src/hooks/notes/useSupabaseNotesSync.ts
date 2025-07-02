
import { useEffect, useRef } from 'react';
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

  const initialLoadRef = useRef(false);
  const syncInProgressRef = useRef(false);

  // Carregar dados inicial (cache primeiro, depois remoto)
  useEffect(() => {
    if (user && cacheReady && !initialLoadRef.current) {
      initialLoadRef.current = true;
      loadInitialData();
    }
  }, [user, cacheReady]);

  // Limpar cache antigo periodicamente
  useEffect(() => {
    if (cacheReady) {
      cleanOldCache();
    }
  }, [cacheReady]);

  // Cache das notas apenas quando necessário
  useEffect(() => {
    if (notes.length > 0 && cacheReady && !syncInProgressRef.current) {
      const timeoutId = setTimeout(() => {
        cacheNotes(notes);
        console.log('Notas automaticamente salvas no cache:', notes.length);
      }, 500); // Debounce para evitar múltiplas chamadas

      return () => clearTimeout(timeoutId);
    }
  }, [notes, cacheReady]);

  // Sincronizar operações offline quando voltar online
  useEffect(() => {
    const syncOfflineOperations = async () => {
      if (!isOnline || !user || pendingOperations.length === 0 || syncInProgressRef.current) return;

      syncInProgressRef.current = true;
      console.log('Iniciando sincronização de operações offline:', pendingOperations);
      let syncErrors = 0;
      
      try {
        for (const operation of pendingOperations) {
          try {
            switch (operation.type) {
              case 'create':
                // Verificar se a nota temporária ainda existe
                const tempNote = notes.find(n => n.id.startsWith('temp-'));
                if (tempNote) {
                  const { data: newNote, error } = await supabase
                    .from('notes')
                    .insert({
                      ...operation.data,
                      user_id: user.id,
                    })
                    .select()
                    .single();
                  
                  if (!error && newNote) {
                    // Remover a nota temporária e adicionar a nota real
                    setNotes(prev => prev.filter(n => n.id !== tempNote.id).concat({
                      ...newNote,
                      created_at: new Date(newNote.created_at),
                      updated_at: new Date(newNote.updated_at),
                      attachments: []
                    }));
                  }
                }
                break;
                
              case 'update':
                if (operation.noteId && notes.some(n => n.id === operation.noteId)) {
                  await supabase
                    .from('notes')
                    .update(operation.data)
                    .eq('id', operation.noteId)
                    .eq('user_id', user.id);
                }
                break;
                
              case 'delete':
                await supabase
                  .from('notes')
                  .delete()
                  .eq('id', operation.noteId)
                  .eq('user_id', user.id);
                
                if (operation.noteId) {
                  await removeCachedNote(operation.noteId);
                }
                break;
            }
            
            await removeOfflineOperation(operation.id);
            
          } catch (error) {
            console.error('Erro ao sincronizar operação:', operation, error);
            syncErrors++;
          }
        }

        // Atualizar dados do servidor após sincronização
        if (pendingOperations.length > syncErrors) {
          await fetchNotes(user, () => {});
          toast({
            title: "Sincronização concluída",
            description: `${pendingOperations.length - syncErrors} alterações foram sincronizadas com sucesso.`,
          });
        }

        if (syncErrors > 0) {
          toast({
            title: "Sincronização parcial",
            description: `${syncErrors} operações falharam e serão tentadas novamente.`,
            variant: "destructive",
          });
        }
      } finally {
        syncInProgressRef.current = false;
      }
    };

    if (pendingOperations.length > 0) {
      syncOfflineOperations();
    }
  }, [isOnline, user, pendingOperations.length]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // 1. Sempre carregar do cache primeiro
      console.log('Carregando notas do cache local...');
      const cachedNotes = await loadCachedNotes();
      if (cachedNotes.length > 0) {
        console.log('Notas carregadas do cache:', cachedNotes.length);
        setNotes(cachedNotes);
        setLoading(false);
      }

      // 2. Se estiver online, buscar dados atualizados em background
      if (isOnline && user) {
        console.log('Buscando dados atualizados do servidor...');
        setTimeout(async () => {
          try {
            await fetchNotes(user, () => {});
            console.log('Dados do servidor carregados e atualizados');
          } catch (error) {
            console.error('Erro ao buscar dados do servidor:', error);
          }
        }, 100);
      } else if (cachedNotes.length === 0) {
        setLoading(false);
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
