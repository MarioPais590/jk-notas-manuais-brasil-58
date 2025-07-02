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
      console.log('Connection restored - now online');
      toast({
        title: "Conectado",
        description: "Conexão restaurada. Sincronizando dados...",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Connection lost - now offline');
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
      console.log('Local cache initialized successfully');
    } catch (error) {
      console.error('Error initializing local cache:', error);
    }
  };

  // Salvar notas no cache local
  const cacheNotes = async (notes: Note[]) => {
    if (!cacheReady) return;
    
    try {
      await db.notes.clear();
      await db.notes.bulkAdd(notes);
      console.log('Notes cached locally:', notes.length);
    } catch (error) {
      console.error('Error caching notes:', error);
    }
  };

  // Carregar notas do cache local
  const loadCachedNotes = async (): Promise<Note[]> => {
    if (!cacheReady) return [];
    
    try {
      const cachedNotes = await db.notes.orderBy('updated_at').reverse().toArray();
      console.log('Notes loaded from cache:', cachedNotes.length);
      return cachedNotes;
    } catch (error) {
      console.error('Error loading cached notes:', error);
      return [];
    }
  };

  // Salvar nota individual no cache
  const cacheNote = async (note: Note) => {
    if (!cacheReady) return;
    
    try {
      await db.notes.put(note);
      console.log('Note cached:', note.id);
    } catch (error) {
      console.error('Error caching note:', error);
    }
  };

  // Remover nota do cache
  const removeCachedNote = async (noteId: string) => {
    if (!cacheReady) return;
    
    try {
      await db.notes.delete(noteId);
      console.log('Note removed from cache:', noteId);
    } catch (error) {
      console.error('Error removing note from cache:', error);
    }
  };

  // Cache de imagens otimizado para PWA mobile com cache automático
  const cacheImage = async (url: string): Promise<string> => {
    if (!cacheReady || !url || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    
    try {
      console.log('Cache: Attempting to cache image:', url);
      
      // Verificar se já está em cache
      const cached = await db.cachedImages.where('url').equals(url).first();
      if (cached) {
        const blobUrl = URL.createObjectURL(cached.blob);
        console.log('Cache: Image already cached, returning blob URL:', blobUrl);
        return blobUrl;
      }

      console.log('Cache: Downloading image for cache:', url);
      
      // Fetch otimizado para PWA mobile
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        signal: controller.signal,
        headers: {
          'Accept': 'image/webp,image/avif,image/apng,image/jpeg,image/png,image/*,*/*;q=0.8',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn('Cache: Failed to fetch image:', response.status, response.statusText);
        return url;
      }
      
      const blob = await response.blob();
      console.log('Cache: Image downloaded, size:', blob.size, 'type:', blob.type);
      
      // Verificar se é uma imagem válida
      if (!blob.type.startsWith('image/')) {
        console.warn('Cache: Downloaded content is not an image:', blob.type);
        return url;
      }
      
      // Salvar no cache
      const cachedImage: CachedImage = {
        id: crypto.randomUUID(),
        url,
        blob,
        timestamp: Date.now()
      };

      await db.cachedImages.add(cachedImage);
      const blobUrl = URL.createObjectURL(blob);
      console.log('Cache: Image cached successfully, blob URL:', blobUrl);
      return blobUrl;
    } catch (error) {
      console.error('Cache: Error caching image:', url, error);
      return url;
    }
  };

  // Carregar imagem do cache
  const loadCachedImage = async (url: string): Promise<string> => {
    if (!cacheReady || !url || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    
    try {
      const cached = await db.cachedImages.where('url').equals(url).first();
      if (cached) {
        const blobUrl = URL.createObjectURL(cached.blob);
        console.log('Cache: Found cached image, returning blob URL:', blobUrl);
        return blobUrl;
      }
      return url;
    } catch (error) {
      console.error('Cache: Error loading cached image:', url, error);
      return url;
    }
  };

  // Cache automático de imagem quando online - com retry
  const autoCacheImage = async (url: string): Promise<void> => {
    if (!isOnline || !url || url.startsWith('blob:') || url.startsWith('data:')) {
      return;
    }

    try {
      // Verificar se já está em cache
      const cached = await db.cachedImages.where('url').equals(url).first();
      if (cached) {
        console.log('Cache: Image already auto-cached:', url);
        return;
      }

      console.log('Cache: Starting auto-cache for:', url);
      
      // Cache em background com retry
      const autoCacheWithRetry = async (retries = 2) => {
        try {
          await cacheImage(url);
          console.log('Cache: Auto-cached successfully:', url);
        } catch (error) {
          if (retries > 0) {
            console.warn(`Cache: Auto-cache failed, retrying (${retries} left):`, error);
            setTimeout(() => autoCacheWithRetry(retries - 1), 2000);
          } else {
            console.error('Cache: Auto-cache failed after retries:', error);
          }
        }
      };

      // Executar em background sem bloquear
      setTimeout(() => autoCacheWithRetry(), 500);
    } catch (error) {
      console.error('Cache: Error in auto-cache check:', error);
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
      console.log('Pending operation added:', pendingOp);
    } catch (error) {
      console.error('Error adding pending operation:', error);
    }
  };

  const getPendingOperations = async (): Promise<PendingOperation[]> => {
    if (!cacheReady) return [];
    
    try {
      return await db.pendingOperations.orderBy('timestamp').toArray();
    } catch (error) {
      console.error('Error loading pending operations:', error);
      return [];
    }
  };

  const removePendingOperation = async (operationId: string) => {
    if (!cacheReady) return;
    
    try {
      await db.pendingOperations.delete(operationId);
      console.log('Pending operation removed:', operationId);
    } catch (error) {
      console.error('Error removing pending operation:', error);
    }
  };

  const clearPendingOperations = async () => {
    if (!cacheReady) return;
    
    try {
      await db.pendingOperations.clear();
      console.log('All pending operations cleared');
    } catch (error) {
      console.error('Error clearing pending operations:', error);
    }
  };

  // Limpeza de cache antigo (manter apenas 30 dias)
  const cleanOldCache = async () => {
    if (!cacheReady) return;
    
    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const deletedCount = await db.cachedImages.where('timestamp').below(thirtyDaysAgo).delete();
      if (deletedCount > 0) {
        console.log('Cleaned old cache entries:', deletedCount);
      }
    } catch (error) {
      console.error('Error cleaning old cache:', error);
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
    autoCacheImage,
    addPendingOperation,
    getPendingOperations,
    removePendingOperation,
    clearPendingOperations,
    cleanOldCache
  };
}
