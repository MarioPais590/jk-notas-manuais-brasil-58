
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { processImageForCover, COVER_IMAGE_CONFIG } from '@/utils/imageProcessor';
import { useLocalCache } from '@/hooks/useLocalCache';

export function useCoverImageHandler(
  noteId: string,
  coverImage: string | null,
  setCoverImage: (url: string | null) => void,
  coverPreview: string | null,
  setCoverPreview: (url: string | null) => void,
  setUploadingCover: (uploading: boolean) => void
) {
  const { toast } = useToast();
  const { isOnline, cacheImage, loadCachedImage } = useLocalCache();

  const loadCoverImage = async (coverImageUrl: string | null) => {
    if (coverImageUrl) {
      const cachedImageUrl = await loadCachedImage(coverImageUrl);
      setCoverImage(cachedImageUrl);
    } else {
      setCoverImage(null);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      console.log('Processing cover image for note:', noteId);
      
      // Processar e redimensionar imagem
      const processedImage = await processImageForCover(file);
      
      console.log('Image processed successfully:', {
        originalSize: processedImage.originalSize,
        processedSize: processedImage.processedSize,
        dimensions: `${processedImage.width}x${processedImage.height}`
      });

      // Criar preview local
      const previewUrl = URL.createObjectURL(processedImage.file);
      setCoverPreview(previewUrl);

      if (isOnline) {
        // Se online, fazer upload para Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('Usuário não autenticado');
        }
        
        const timestamp = Date.now();
        const fileName = `${user.id}/covers/${noteId}/${timestamp}.png`;

        console.log('Uploading processed cover image to:', fileName);

        const { data, error } = await supabase.storage
          .from('note-attachments')
          .upload(fileName, processedImage.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Cover image upload error:', error);
          throw error;
        }

        console.log('Cover image uploaded:', data);

        const { data: { publicUrl } } = supabase.storage
          .from('note-attachments')
          .getPublicUrl(fileName);

        console.log('Cover image public URL:', publicUrl);
        setCoverImage(publicUrl);
        
        // Cache da imagem após upload
        await cacheImage(publicUrl);
      } else {
        // Se offline, usar apenas o preview local
        setCoverImage(previewUrl);
        
        toast({
          title: "Modo offline",
          description: "A imagem será sincronizada quando você estiver online.",
          variant: "destructive",
        });
      }
      
      // Limpar preview após upload bem-sucedido (apenas se online)
      if (isOnline && coverPreview) {
        URL.revokeObjectURL(coverPreview);
        setCoverPreview(null);
      }
      
      toast({
        title: "Imagem carregada",
        description: `Capa redimensionada para ${COVER_IMAGE_CONFIG.width}x${COVER_IMAGE_CONFIG.height}px e adicionada com sucesso.`,
      });
    } catch (error) {
      console.error('Error uploading cover image:', error);
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
        setCoverPreview(null);
      }
      toast({
        title: "Erro ao carregar imagem",
        description: error instanceof Error ? error.message : "Não foi possível carregar a imagem de capa. Verifique sua conexão.",
        variant: "destructive",
      });
    } finally {
      setUploadingCover(false);
      event.target.value = '';
    }
  };

  const handleRemoveCover = () => {
    setCoverImage(null);
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
    }
  };

  return {
    loadCoverImage,
    handleImageUpload,
    handleRemoveCover,
  };
}
