
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

  // Cache das notas sempre que atualizadas (incluindo primeira carga)
  useEffect(() => {
    if (notes.length > 0 && cacheReady) {
      cacheNotes(notes);
      console.log('Notas automaticamente salvas no cache:', notes.length);
    }
  }, [notes, cacheReady]);

  // Sincronizar operações offline quando voltar online
  useEffect(() => {
    const syncOfflineOperations = async () => {
      if (!isOnline || !user || pendingOperations.length === 0) return;

      console.log('Iniciando sincronização de operações offline:', pendingOperations);
      let syncErrors = 0;
      
      for (const operation of pendingOperations) {
        try {
          let shouldRefetch = false;
          
          switch (operation.type) {
            case 'create':
              // Verificar se a nota temporária ainda existe antes de sincronizar
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
                  shouldRefetch = true;
                }
              }
              break;
              
            case 'update':
              // Verificar se a nota ainda existe antes de atualizar
              if (operation.noteId && notes.some(n => n.id === operation.noteId)) {
                await supabase
                  .from('notes')
                  .update(operation.data)
                  .eq('id', operation.noteId)
                  .eq('user_id', user.id);
                shouldRefetch = true;
              }
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
              shouldRefetch = true;
              break;
          }
          
          // Marcar operação como concluída
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
    };

    syncOfflineOperations();
  }, [isOnline, user, pendingOperations.length]); // Usar length para evitar loops

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // 1. Sempre carregar do cache primeiro (experiência mais rápida)
      console.log('Carregando notas do cache local...');
      const cachedNotes = await loadCachedNotes();
      if (cachedNotes.length > 0) {
        console.log('Notas carregadas do cache:', cachedNotes.length);
        setNotes(cachedNotes);
        setLoading(false); // Mostrar dados do cache imediatamente
      }

      // 2. Se estiver online, buscar dados atualizados do servidor em background
      if (isOnline && user) {
        console.log('Buscando dados atualizados do servidor...');
        // Usar setTimeout para não bloquear a renderização inicial
        setTimeout(async () => {
          try {
            await fetchNotes(user, () => {}); // Não mostrar loading pois já temos dados do cache
            console.log('Dados do servidor carregados e atualizados');
          } catch (error) {
            console.error('Erro ao buscar dados do servidor:', error);
            // Se falhar, manter dados do cache
          }
        }, 100);
      } else if (cachedNotes.length === 0) {
        // Se não há cache e não está online, mostrar estado vazio
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
