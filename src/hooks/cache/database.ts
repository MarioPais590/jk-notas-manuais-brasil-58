
import Dexie, { Table } from 'dexie';
import { Note } from '@/types/Note';
import { PendingOperation, CachedImage } from './types';

// Database do Dexie
export class LocalCacheDB extends Dexie {
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

export const db = new LocalCacheDB();
