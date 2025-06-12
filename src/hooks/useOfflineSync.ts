
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  noteId?: string;
  data: any;
  timestamp: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState<OfflineOperation[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Carregar operações pendentes do localStorage
    const saved = localStorage.getItem('offline-notes-operations');
    if (saved) {
      try {
        const operations = JSON.parse(saved);
        setPendingOperations(operations);
      } catch (error) {
        console.error('Error loading offline operations:', error);
      }
    }

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

  // Salvar operações pendentes no localStorage
  useEffect(() => {
    localStorage.setItem('offline-notes-operations', JSON.stringify(pendingOperations));
  }, [pendingOperations]);

  const addOfflineOperation = (operation: Omit<OfflineOperation, 'id' | 'timestamp'>) => {
    const newOperation: OfflineOperation = {
      ...operation,
      id: `offline-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };

    setPendingOperations(prev => [...prev, newOperation]);
    
    if (!isOnline) {
      toast({
        title: "Salvo offline",
        description: "Suas alterações foram salvas localmente e serão sincronizadas quando você estiver online.",
      });
    }
  };

  const clearOfflineOperations = () => {
    setPendingOperations([]);
    localStorage.removeItem('offline-notes-operations');
  };

  const removeOfflineOperation = (operationId: string) => {
    setPendingOperations(prev => prev.filter(op => op.id !== operationId));
  };

  return {
    isOnline,
    pendingOperations,
    addOfflineOperation,
    clearOfflineOperations,
    removeOfflineOperation,
  };
}
