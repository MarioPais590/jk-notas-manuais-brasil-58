
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
    if (!coverImageUrl) {
      setCoverImage(null);
      return;
    }

    try {
      console.log('Loading cover image:', coverImageUrl);
      
      // Primeiro tenta carregar do cache local
      const cachedImageUrl = await loadCachedImage(coverImageUrl);
      console.log('Cached image URL:', cachedImageUrl);
      
      // Se a URL do cache é diferente da original, significa que temos uma versão local
      if (cachedImageUrl !== coverImageUrl) {
        console.log('Using cached image for cover');
        setCoverImage(cachedImageUrl);
      } else if (isOnline) {
        // Se estamos online e não temos cache, tenta carregar e fazer cache
        console.log('Online: loading and caching image');
        try {
          // Verificar se a imagem existe e é acessível
          const response = await fetch(coverImageUrl, { method: 'HEAD' });
          if (response.ok) {
            setCoverImage(coverImageUrl);
            // Fazer cache em background
            setTimeout(async () => {
              try {
                await cacheImage(coverImageUrl);
                console.log('Image cached successfully:', coverImageUrl);
              } catch (error) {
                console.error('Error caching image:', error);
              }
            }, 100);
          } else {
            console.warn('Image not accessible:', coverImageUrl);
            setCoverImage(null);
          }
        } catch (error) {
          console.error('Error checking image accessibility:', error);
          // Em caso de erro, ainda tenta exibir a imagem
          setCoverImage(coverImageUrl);
        }
      } else {
        // Offline e sem cache - não exibir a imagem
        console.log('Offline: no cached image available');
        setCoverImage(null);
      }
    } catch (error) {
      console.error('Error loading cover image:', error);
      // Fallback: tentar exibir a URL original se disponível
      if (isOnline && coverImageUrl) {
        setCoverImage(coverImageUrl);
      } else {
        setCoverImage(null);
      }
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
        setTimeout(async () => {
          try {
            await cacheImage(publicUrl);
            console.log('Uploaded image cached:', publicUrl);
          } catch (error) {
            console.error('Error caching uploaded image:', error);
          }
        }, 100);
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
