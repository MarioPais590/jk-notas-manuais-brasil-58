
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
  const { isOnline, cacheImage, loadCachedImage, autoCacheImage } = useLocalCache();

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
        return;
      }

      if (isOnline) {
        console.log('Online: loading and verifying image accessibility');
        
        // Verificar se a imagem é acessível antes de definir
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              console.log('Image verified as accessible:', coverImageUrl);
              setCoverImage(coverImageUrl);
              
              // Auto-cache em background
              autoCacheImage(coverImageUrl);
              resolve(true);
            };
            
            img.onerror = (error) => {
              console.error('Image not accessible:', coverImageUrl, error);
              setCoverImage(null);
              reject(error);
            };
            
            // Timeout para PWA mobile
            setTimeout(() => {
              if (!img.complete) {
                console.warn('Image load timeout:', coverImageUrl);
                setCoverImage(coverImageUrl); // Tentar exibir mesmo assim
                autoCacheImage(coverImageUrl);
                resolve(true);
              }
            }, 10000);
            
            img.src = coverImageUrl;
          });
        } catch (error) {
          console.error('Error verifying image:', error);
          // Fallback: tentar exibir a imagem mesmo com erro
          setCoverImage(coverImageUrl);
          autoCacheImage(coverImageUrl);
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
        autoCacheImage(coverImageUrl);
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
