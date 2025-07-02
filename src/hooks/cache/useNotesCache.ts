
import { Note } from '@/types/Note';
import { db } from './database';

export function useNotesCache() {
  // Save notes in local cache
  const cacheNotes = async (notes: Note[]) => {
    try {
      await db.notes.clear();
      await db.notes.bulkAdd(notes);
      console.log('Notes cached locally:', notes.length);
    } catch (error) {
      console.error('Error caching notes:', error);
    }
  };

  // Load notes from local cache
  const loadCachedNotes = async (): Promise<Note[]> => {
    try {
      const cachedNotes = await db.notes.orderBy('updated_at').reverse().toArray();
      console.log('Notes loaded from cache:', cachedNotes.length);
      return cachedNotes;
    } catch (error) {
      console.error('Error loading cached notes:', error);
      return [];
    }
  };

  // Save individual note in cache
  const cacheNote = async (note: Note) => {
    try {
      await db.notes.put(note);
      console.log('Note cached:', note.id);
    } catch (error) {
      console.error('Error caching note:', error);
    }
  };

  // Remove note from cache
  const removeCachedNote = async (noteId: string) => {
    try {
      await db.notes.delete(noteId);
      console.log('Note removed from cache:', noteId);
    } catch (error) {
      console.error('Error removing note from cache:', error);
    }
  };

  return {
    cacheNotes,
    loadCachedNotes,
    cacheNote,
    removeCachedNote
  };
}
