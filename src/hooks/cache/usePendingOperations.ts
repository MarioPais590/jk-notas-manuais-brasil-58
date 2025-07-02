
import { db } from './database';
import { PendingOperation } from './types';

export function usePendingOperations() {
  // Manage pending operations
  const addPendingOperation = async (operation: Omit<PendingOperation, 'id' | 'timestamp'>) => {
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
    try {
      return await db.pendingOperations.orderBy('timestamp').toArray();
    } catch (error) {
      console.error('Error loading pending operations:', error);
      return [];
    }
  };

  const removePendingOperation = async (operationId: string) => {
    try {
      await db.pendingOperations.delete(operationId);
      console.log('Pending operation removed:', operationId);
    } catch (error) {
      console.error('Error removing pending operation:', error);
    }
  };

  const clearPendingOperations = async () => {
    try {
      await db.pendingOperations.clear();
      console.log('All pending operations cleared');
    } catch (error) {
      console.error('Error clearing pending operations:', error);
    }
  };

  return {
    addPendingOperation,
    getPendingOperations,
    removePendingOperation,
    clearPendingOperations
  };
}
