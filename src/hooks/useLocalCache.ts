
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db } from './cache/database';
import { useNotesCache } from './cache/useNotesCache';
import { useImageCache } from './cache/useImageCache';
import { usePendingOperations } from './cache/usePendingOperations';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export function useLocalCache() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheReady, setCacheReady] = useState(isInitialized);
  const { toast } = useToast();
  const initRef = useRef(false);

  // Import all cache operations
  const notesCache = useNotesCache();
  const imageCache = useImageCache();
  const pendingOps = usePendingOperations();

  useEffect(() => {
    // Prevent multiple initializations
    if (initRef.current) return;
    initRef.current = true;

    // Initialize cache only once globally
    if (!initPromise) {
      initPromise = initializeCache();
    }
    
    initPromise.then(() => {
      setCacheReady(true);
    });

    // Monitor connection status
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
    if (isInitialized) return;
    
    try {
      await db.open();
      isInitialized = true;
      console.log('Local cache initialized successfully');
    } catch (error) {
      console.error('Error initializing local cache:', error);
      throw error;
    }
  };

  return {
    isOnline,
    cacheReady,
    // Notes cache operations
    ...notesCache,
    // Image cache operations
    ...imageCache,
    // Pending operations
    ...pendingOps
  };
}
