
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
    autoCacheImage,
    cleanOldCache,
  } = useLocalCache();

  const cacheNoteWithImages = async (note: Note) => {
    await cacheNote(note);
    
    // Auto-cache da imagem de capa se existir e não for um blob temporário
    if (note.cover_image_url && !note.cover_image_url.startsWith('blob:') && !note.cover_image_url.startsWith('data:')) {
      try {
        console.log('Auto-caching cover image for note:', note.id, note.cover_image_url);
        await autoCacheImage(note.cover_image_url);
        console.log('Cover image auto-cached successfully for note:', note.id);
      } catch (error) {
        console.error('Error auto-caching cover image for note', note.id, ':', error);
      }
    }
  };

  const cacheNotesWithImages = async (notes: Note[]) => {
    console.log('Caching notes and auto-caching images:', notes.length);
    await cacheNotes(notes);
    
    // Auto-cache das imagens de capa em paralelo para melhor performance
    const imagePromises = notes
      .filter(note => note.cover_image_url && 
        !note.cover_image_url.startsWith('blob:') && 
        !note.cover_image_url.startsWith('data:'))
      .map(async (note) => {
        try {
          console.log('Starting auto-cache for image:', note.id, note.cover_image_url);
          await autoCacheImage(note.cover_image_url!);
          console.log('Image auto-cached successfully:', note.id);
        } catch (error) {
          console.error('Error auto-caching image for note', note.id, ':', error);
        }
      });
    
    if (imagePromises.length > 0) {
      console.log('Auto-caching', imagePromises.length, 'images in background...');
      // Não esperar pelas imagens para não bloquear a UI
      Promise.allSettled(imagePromises).then(() => {
        console.log('Background auto-caching completed for', imagePromises.length, 'images');
      });
    }
  };

  const loadNotesWithCachedImages = async (): Promise<Note[]> => {
    console.log('Loading notes with cached images...');
    const cachedNotes = await loadCachedNotes();
    
    if (cachedNotes.length === 0) {
      console.log('No cached notes found');
      return [];
    }
    
    console.log('Found', cachedNotes.length, 'cached notes');
    
    // Processar imagens do cache em paralelo
    const notesWithCachedImages = await Promise.all(
      cachedNotes.map(async (note) => {
        if (note.cover_image_url && 
            !note.cover_image_url.startsWith('blob:') && 
            !note.cover_image_url.startsWith('data:')) {
          try {
            console.log('Loading cached image for note:', note.id, note.cover_image_url);
            const cachedImageUrl = await loadCachedImage(note.cover_image_url);
            console.log('Cached image loaded for note:', note.id, 'new URL:', cachedImageUrl);
            return { ...note, cover_image_url: cachedImageUrl };
          } catch (error) {
            console.error('Error loading cached image for note', note.id, ':', error);
            return note; // Retornar nota sem a imagem em caso de erro
          }
        }
        return note;
      })
    );
    
    console.log('Notes loaded with cached images:', notesWithCachedImages.length);
    return notesWithCachedImages;
  };

  return {
    cacheNote: cacheNoteWithImages,
    removeCachedNote,
    cacheNotes: cacheNotesWithImages,
    loadCachedNotes: loadNotesWithCachedImages,
    cacheImage,
    loadCachedImage,
    autoCacheImage,
    cleanOldCache,
  };
}
