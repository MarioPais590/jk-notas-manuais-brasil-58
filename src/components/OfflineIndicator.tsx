
import React from 'react';
import { useLocalCache } from '@/hooks/useLocalCache';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Database, Clock } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const { isOnline, cacheReady } = useLocalCache();
  const { pendingOperations } = useOfflineSync();

  if (!cacheReady) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge 
        variant={isOnline ? "default" : "destructive"} 
        className="flex items-center gap-1 text-xs"
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Offline
          </>
        )}
      </Badge>
      
      {cacheReady && (
        <Badge variant="outline" className="flex items-center gap-1 text-xs">
          <Database className="h-3 w-3" />
          Cache ativo
        </Badge>
      )}

      {pendingOperations.length > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          {pendingOperations.length} pendente{pendingOperations.length > 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
};

export default OfflineIndicator;
