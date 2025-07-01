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

  // Cache de imagens otimizado para PWA mobile
  const cacheImage = async (url: string): Promise<string> => {
    if (!cacheReady || !url || url.startsWith('blob:') || url.startsWith('data:')) {
      console.log('Skipping cache for URL:', url);
      return url;
    }
    
    try {
      console.log('Attempting to cache image:', url);
      
      // Verificar se já está em cache
      const cached = await db.cachedImages.where('url').equals(url).first();
      if (cached) {
        console.log('Image already cached:', url);
        const blobUrl = URL.createObjectURL(cached.blob);
        console.log('Returning cached blob URL:', blobUrl);
        return blobUrl;
      }

      console.log('Downloading image for cache:', url);
      
      // Configurar fetch otimizado para PWA mobile
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'force-cache',
        signal: controller.signal,
        headers: {
          'Accept': 'image/webp,image/avif,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'User-Agent': navigator.userAgent
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn('Failed to fetch image:', response.status, response.statusText);
        return url;
      }
      
      const blob = await response.blob();
      console.log('Image downloaded, size:', blob.size, 'type:', blob.type);
      
      // Verificar se é realmente uma imagem
      if (!blob.type.startsWith('image/')) {
        console.warn('Downloaded content is not an image:', blob.type);
        return url;
      }
      
      const cachedImage: CachedImage = {
        id: crypto.randomUUID(),
        url,
        blob,
        timestamp: Date.now()
      };

      await db.cachedImages.add(cachedImage);
      const blobUrl = URL.createObjectURL(blob);
      console.log('Image cached successfully:', url, 'blob URL:', blobUrl);
      return blobUrl;
    } catch (error) {
      console.error('Error caching image:', url, error);
      return url;
    }
  };

  // Carregar imagem do cache com fallback melhorado
  const loadCachedImage = async (url: string): Promise<string> => {
    if (!cacheReady || !url || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    
    try {
      console.log('Looking for cached image:', url);
      const cached = await db.cachedImages.where('url').equals(url).first();
      if (cached) {
        const blobUrl = URL.createObjectURL(cached.blob);
        console.log('Found cached image:', url, 'returning blob URL:', blobUrl);
        return blobUrl;
      }
      console.log('No cached version found for:', url);
      return url;
    } catch (error) {
      console.error('Error loading cached image:', url, error);
      return url;
    }
  };

  // Cache automático de imagem quando online
  const autoCacheImage = async (url: string): Promise<void> => {
    if (!isOnline || !url || url.startsWith('blob:') || url.startsWith('data:')) {
      return;
    }

    try {
      // Verificar se já está em cache
      const cached = await db.cachedImages.where('url').equals(url).first();
      if (cached) {
        console.log('Image already cached, skipping auto-cache:', url);
        return;
      }

      // Cache em background sem bloquear a UI
      setTimeout(async () => {
        try {
          await cacheImage(url);
          console.log('Auto-cached image:', url);
        } catch (error) {
          console.error('Error auto-caching image:', error);
        }
      }, 100);
    } catch (error) {
      console.error('Error in auto-cache check:', error);
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
