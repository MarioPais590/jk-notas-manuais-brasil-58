
import { Note } from '@/types/Note';

// Interface for operations pending
export interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  noteId?: string;
  data: any;
  timestamp: number;
}

// Interface for cache of images
export interface CachedImage {
  id: string;
  url: string;
  blob: Blob;
  timestamp: number;
}
