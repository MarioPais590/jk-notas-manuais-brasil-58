
import { useEffect, useState } from 'react';
import Dexie, { Table } from 'dexie';
import { Note, NoteAttachment } from '@/types/Note';
import { useToast } from '@/hooks/use-toast';

// Interface para operações pendentes
interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  noteId?: string;
  data: any;
  timestamp: number;
}

// Interface para cache de imagens
interface CachedImage {
  id: string;
  url: string;
  blob: Blob;
  timestamp: number;
}

// Database do Dexie
class LocalCacheDB extends Dexie {
  notes!: Table<Note>;
  pendingOperations!: Table<PendingOperation>;
  cachedImages!: Table<CachedImage>;

  constructor() {
    super('NotesJKCache');
    this.version(1).stores({
      notes: 'id, user_id, title, content, color, is_pinned, created_at, updated_at',
      pendingOperations: 'id, noteId, type, timestamp',
      cachedImages: 'id, url, timestamp'
    });
  }
}

const db = new LocalCacheDB();

export function useLocalCache() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheReady, setCacheReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Inicializar o cache
    initializeCache();

    // Monitorar status da conexão
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conectado",
        description: "Conexão restaurada. Sincronizando dados...",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Modo offline",
        description: "Suas alterações serão sincronizadas quando a conexão for restaurada.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const initializeCache = async () => {
    try {
      await db.open();
      setCacheReady(true);
      console.log('Cache local inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar cache local:', error);
    }
  };

  // Salvar notas no cache local
  const cacheNotes = async (notes: Note[]) => {
    if (!cacheReady) return;
    
    try {
      await db.notes.clear();
      await db.notes.bulkAdd(notes);
      console.log('Notas salvas no cache local:', notes.length);
    } catch (error) {
      console.error('Erro ao salvar notas no cache:', error);
    }
  };

  // Carregar notas do cache local
  const loadCachedNotes = async (): Promise<Note[]> => {
    if (!cacheReady) return [];
    
    try {
      const cachedNotes = await db.notes.orderBy('updated_at').reverse().toArray();
      console.log('Notas carregadas do cache:', cachedNotes.length);
      return cachedNotes;
    } catch (error) {
      console.error('Erro ao carregar notas do cache:', error);
      return [];
    }
  };

  // Salvar nota individual no cache
  const cacheNote = async (note: Note) => {
    if (!cacheReady) return;
    
    try {
      await db.notes.put(note);
      console.log('Nota salva no cache:', note.id);
    } catch (error) {
      console.error('Erro ao salvar nota no cache:', error);
    }
  };

  // Remover nota do cache
  const removeCachedNote = async (noteId: string) => {
    if (!cacheReady) return;
    
    try {
      await db.notes.delete(noteId);
      console.log('Nota removida do cache:', noteId);
    } catch (error) {
      console.error('Erro ao remover nota do cache:', error);
    }
  };

  // Cache de imagens
  const cacheImage = async (url: string): Promise<string> => {
    if (!cacheReady || !url || url.startsWith('blob:')) return url;
    
    try {
      // Verificar se já está em cache
      const cached = await db.cachedImages.where('url').equals(url).first();
      if (cached) {
        return URL.createObjectURL(cached.blob);
      }

      // Baixar e salvar a imagem
      const response = await fetch(url);
      if (!response.ok) return url;
      
      const blob = await response.blob();
      const cachedImage: CachedImage = {
        id: crypto.randomUUID(),
        url,
        blob,
        timestamp: Date.now()
      };

      await db.cachedImages.add(cachedImage);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Erro ao fazer cache da imagem:', error);
      return url;
    }
  };

  // Carregar imagem do cache
  const loadCachedImage = async (url: string): Promise<string> => {
    if (!cacheReady || !url || url.startsWith('blob:')) return url;
    
    try {
      const cached = await db.cachedImages.where('url').equals(url).first();
      if (cached) {
        return URL.createObjectURL(cached.blob);
      }
      return url;
    } catch (error) {
      console.error('Erro ao carregar imagem do cache:', error);
      return url;
    }
  };

  // Gerenciar operações pendentes
  const addPendingOperation = async (operation: Omit<PendingOperation, 'id' | 'timestamp'>) => {
    if (!cacheReady) return;
    
    try {
      const pendingOp: PendingOperation = {
        ...operation,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      };

      await db.pendingOperations.add(pendingOp);
      console.log('Operação pendente adicionada:', pendingOp);
    } catch (error) {
      console.error('Erro ao adicionar operação pendente:', error);
    }
  };

  const getPendingOperations = async (): Promise<PendingOperation[]> => {
    if (!cacheReady) return [];
    
    try {
      return await db.pendingOperations.orderBy('timestamp').toArray();
    } catch (error) {
      console.error('Erro ao carregar operações pendentes:', error);
      return [];
    }
  };

  const removePendingOperation = async (operationId: string) => {
    if (!cacheReady) return;
    
    try {
      await db.pendingOperations.delete(operationId);
      console.log('Operação pendente removida:', operationId);
    } catch (error) {
      console.error('Erro ao remover operação pendente:', error);
    }
  };

  const clearPendingOperations = async () => {
    if (!cacheReady) return;
    
    try {
      await db.pendingOperations.clear();
      console.log('Todas as operações pendentes foram removidas');
    } catch (error) {
      console.error('Erro ao limpar operações pendentes:', error);
    }
  };

  // Limpeza de cache antigo (manter apenas 30 dias)
  const cleanOldCache = async () => {
    if (!cacheReady) return;
    
    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      await db.cachedImages.where('timestamp').below(thirtyDaysAgo).delete();
      console.log('Cache antigo limpo');
    } catch (error) {
      console.error('Erro ao limpar cache antigo:', error);
    }
  };

  return {
    isOnline,
    cacheReady,
    cacheNotes,
    loadCachedNotes,
    cacheNote,
    removeCachedNote,
    cacheImage,
    loadCachedImage,
    addPendingOperation,
    getPendingOperations,
    removePendingOperation,
    clearPendingOperations,
    cleanOldCache
  };
}
