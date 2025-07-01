
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocalCache } from './useLocalCache';

interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  noteId?: string;
  data: any;
  timestamp: number;
}

export function useOfflineSync() {
  const [pendingOperations, setPendingOperations] = useState<OfflineOperation[]>([]);
  const { toast } = useToast();
  const {
    isOnline,
    cacheReady,
    addPendingOperation,
    getPendingOperations,
    removePendingOperation,
    clearPendingOperations
  } = useLocalCache();

  useEffect(() => {
    if (cacheReady) {
      loadPendingOperations();
    }
  }, [cacheReady]);

  const loadPendingOperations = async () => {
    try {
      const operations = await getPendingOperations();
      setPendingOperations(operations);
    } catch (error) {
      console.error('Error loading pending operations:', error);
    }
  };

  const addOfflineOperation = async (operation: Omit<OfflineOperation, 'id' | 'timestamp'>) => {
    const newOperation: OfflineOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    await addPendingOperation(newOperation);
    setPendingOperations(prev => [...prev, newOperation]);
    
    if (!isOnline) {
      toast({
        title: "Salvo offline",
        description: "Suas alterações foram salvas localmente e serão sincronizadas quando você estiver online.",
      });
    }
  };

  const clearOfflineOperations = async () => {
    await clearPendingOperations();
    setPendingOperations([]);
  };

  const removeOfflineOperation = async (operationId: string) => {
    await removePendingOperation(operationId);
    setPendingOperations(prev => prev.filter(op => op.id !== operationId));
  };

  return {
    isOnline,
    cacheReady,
    pendingOperations,
    addOfflineOperation,
    clearOfflineOperations,
    removeOfflineOperation,
  };
}
