
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
    
    // Cache da imagem de capa se existir e não for um blob temporário
    if (note.cover_image_url && !note.cover_image_url.startsWith('blob:') && !note.cover_image_url.startsWith('data:')) {
      try {
        await cacheImage(note.cover_image_url);
        console.log('Imagem de capa cacheada para nota:', note.id);
      } catch (error) {
        console.error('Erro ao cachear imagem de capa:', error);
      }
    }
  };

  const cacheNotesWithImages = async (notes: Note[]) => {
    await cacheNotes(notes);
    
    // Cache das imagens de capa em paralelo para melhor performance
    const imagePromises = notes
      .filter(note => note.cover_image_url && 
        !note.cover_image_url.startsWith('blob:') && 
        !note.cover_image_url.startsWith('data:'))
      .map(async (note) => {
        try {
          await cacheImage(note.cover_image_url!);
          console.log('Imagem cacheada:', note.id);
        } catch (error) {
          console.error('Erro ao cachear imagem da nota', note.id, ':', error);
        }
      });
    
    if (imagePromises.length > 0) {
      await Promise.allSettled(imagePromises);
      console.log('Cache de imagens concluído para', imagePromises.length, 'imagens');
    }
  };

  const loadNotesWithCachedImages = async (): Promise<Note[]> => {
    const cachedNotes = await loadCachedNotes();
    
    if (cachedNotes.length === 0) return [];
    
    // Processar imagens do cache em paralelo
    const notesWithCachedImages = await Promise.all(
      cachedNotes.map(async (note) => {
        if (note.cover_image_url && 
            !note.cover_image_url.startsWith('blob:') && 
            !note.cover_image_url.startsWith('data:')) {
          try {
            const cachedImageUrl = await loadCachedImage(note.cover_image_url);
            return { ...note, cover_image_url: cachedImageUrl };
          } catch (error) {
            console.error('Erro ao carregar imagem do cache para nota', note.id, ':', error);
            return note; // Retornar nota sem a imagem em caso de erro
          }
        }
        return note;
      })
    );
    
    console.log('Notas carregadas com imagens do cache:', notesWithCachedImages.length);
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
