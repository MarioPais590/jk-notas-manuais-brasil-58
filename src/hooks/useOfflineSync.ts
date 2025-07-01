
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
      console.log('Operações pendentes carregadas:', operations.length);
    } catch (error) {
      console.error('Error loading pending operations:', error);
    }
  };

  const addOfflineOperation = async (operation: Omit<OfflineOperation, 'id' | 'timestamp'>) => {
    const newOperation: OfflineOperation = {
      ...operation,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    await addPendingOperation(newOperation);
    setPendingOperations(prev => [...prev, newOperation]);
    
    console.log('Operação offline adicionada:', newOperation.type, newOperation.id);
    
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
    console.log('Todas as operações offline foram limpas');
  };

  const removeOfflineOperation = async (operationId: string) => {
    await removePendingOperation(operationId);
    setPendingOperations(prev => prev.filter(op => op.id !== operationId));
    console.log('Operação offline removida:', operationId);
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
