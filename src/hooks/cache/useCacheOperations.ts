
import { useLocalCache } from '../useLocalCache';
import { Note } from '@/types/Note';

export function useCacheOperations() {
  const {
    cacheNote,
    removeCachedNote,
    cacheNotes,
    loadCachedNotes,
    cacheImage,
    loadCachedImage,
    cleanOldCache,
  } = useLocalCache();

  const cacheNoteWithImages = async (note: Note) => {
    await cacheNote(note);
    
    // Cache da imagem de capa se existir
    if (note.cover_image_url && !note.cover_image_url.startsWith('blob:')) {
      await cacheImage(note.cover_image_url);
    }
  };

  const cacheNotesWithImages = async (notes: Note[]) => {
    await cacheNotes(notes);
    
    // Cache das imagens de capa
    for (const note of notes) {
      if (note.cover_image_url && !note.cover_image_url.startsWith('blob:')) {
        await cacheImage(note.cover_image_url);
      }
    }
  };

  const loadNotesWithCachedImages = async (): Promise<Note[]> => {
    const cachedNotes = await loadCachedNotes();
    
    // Processar imagens do cache
    const notesWithCachedImages = await Promise.all(
      cachedNotes.map(async (note) => {
        if (note.cover_image_url) {
          const cachedImageUrl = await loadCachedImage(note.cover_image_url);
          return { ...note, cover_image_url: cachedImageUrl };
        }
        return note;
      })
    );
    
    return notesWithCachedImages;
  };

  return {
    cacheNote: cacheNoteWithImages,
    removeCachedNote,
    cacheNotes: cacheNotesWithImages,
    loadCachedNotes: loadNotesWithCachedImages,
    cacheImage,
    loadCachedImage,
    cleanOldCache,
  };
}
