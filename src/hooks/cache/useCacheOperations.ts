
import { useLocalCache } from '../useLocalCache';
import { Note } from '@/types/Note';

export function useCacheOperations() {
  const {
    cacheNote,
    removeCachedNote,
    cacheNotes,
    loadCachedNotes,
    cleanOldCache,
  } = useLocalCache();

  const cacheNoteWithImages = async (note: Note) => {
    await cacheNote(note);
    
    // Cache automático da imagem de capa via ImageWithFallback
    if (note.cover_image_url && !note.cover_image_url.startsWith('blob:') && !note.cover_image_url.startsWith('data:')) {
      console.log('Cover image will be cached automatically by ImageWithFallback component');
    }
  };

  const cacheNotesWithImages = async (notes: Note[]) => {
    console.log('Caching notes:', notes.length);
    await cacheNotes(notes);
    
    // As imagens serão automaticamente cacheadas pelo ImageWithFallback quando renderizadas
    const imagesCount = notes.filter(note => 
      note.cover_image_url && 
      !note.cover_image_url.startsWith('blob:') && 
      !note.cover_image_url.startsWith('data:')
    ).length;
    
    if (imagesCount > 0) {
      console.log(`${imagesCount} cover images will be cached automatically when rendered`);
    }
  };

  const loadNotesWithCachedImages = async (): Promise<Note[]> => {
    console.log('Loading notes from cache...');
    const cachedNotes = await loadCachedNotes();
    
    if (cachedNotes.length === 0) {
      console.log('No cached notes found');
      return [];
    }
    
    console.log('Found', cachedNotes.length, 'cached notes');
    
    // As imagens cacheadas serão carregadas automaticamente pelo ImageWithFallback
    return cachedNotes;
  };

  return {
    cacheNote: cacheNoteWithImages,
    removeCachedNote,
    cacheNotes: cacheNotesWithImages,
    loadCachedNotes: loadNotesWithCachedImages,
    cleanOldCache,
  };
}
