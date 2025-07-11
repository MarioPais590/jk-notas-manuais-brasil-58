
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { processImageForCover, COVER_IMAGE_CONFIG } from '@/utils/imageProcessor';
import { useLocalCache } from '@/hooks/useLocalCache';
import { CoverTemplate } from '@/constants/coverTemplates';

export function useCoverImageHandler(
  noteId: string,
  coverImage: string | null,
  setCoverImage: (url: string | null) => void,
  coverPreview: string | null,
  setCoverPreview: (url: string | null) => void,
  setUploadingCover: (uploading: boolean) => void
) {
  const { toast } = useToast();
  const { isOnline } = useLocalCache();

  const loadCoverImage = async (coverImageUrl: string | null) => {
    if (!coverImageUrl) {
      setCoverImage(null);
      return;
    }

    try {
      console.log('Loading cover image:', coverImageUrl);
      setCoverImage(coverImageUrl);
    } catch (error) {
      console.error('Error loading cover image:', error);
      setCoverImage(coverImageUrl);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      console.log('Processing cover image for note:', noteId);
      
      const processedImage = await processImageForCover(file);
      
      console.log('Image processed successfully:', {
        originalSize: processedImage.originalSize,
        processedSize: processedImage.processedSize,
        dimensions: `${processedImage.width}x${processedImage.height}`
      });

      const previewUrl = URL.createObjectURL(processedImage.file);
      setCoverPreview(previewUrl);

      if (isOnline) {
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
        
        if (coverPreview) {
          URL.revokeObjectURL(coverPreview);
          setCoverPreview(null);
        }
      } else {
        setCoverImage(previewUrl);
        
        toast({
          title: "Modo offline",
          description: "A imagem será sincronizada quando você estiver online.",
          variant: "destructive",
        });
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

  const handleTemplateSelect = async (template: CoverTemplate) => {
    try {
      setUploadingCover(true);
      console.log('Selecting cover template:', template.id, template.name);

      // Para templates do Supabase Storage, usar URL diretamente
      const templateUrl = template.path;
      
      console.log('Using template URL directly:', templateUrl);
      setCoverImage(templateUrl);
      
      toast({
        title: "Modelo aplicado",
        description: `O template "${template.name}" foi aplicado como capa da nota.`,
      });
    } catch (error) {
      console.error('Error selecting template:', error);
      toast({
        title: "Erro ao aplicar modelo",
        description: error instanceof Error ? error.message : "Não foi possível aplicar o modelo de capa.",
        variant: "destructive",
      });
    } finally {
      setUploadingCover(false);
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
    handleTemplateSelect,
    handleRemoveCover,
  };
}
