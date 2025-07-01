
import React from 'react';
import { useLocalCache } from '@/hooks/useLocalCache';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Database } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const { isOnline, cacheReady } = useLocalCache();

  if (!cacheReady) return null;

  return (
    <div className="flex items-center gap-2">
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
    </div>
  );
};

export default OfflineIndicator;
