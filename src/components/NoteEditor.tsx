
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ShareModal from '@/components/ShareModal';
import DownloadModal from '@/components/DownloadModal';
import AttachmentManager from '@/components/AttachmentManager';
import NoteEditorHeader from '@/components/NoteEditorHeader';
import NoteCoverImage from '@/components/NoteCoverImage';
import NoteEditorContent from '@/components/NoteEditorContent';
import { Note } from '@/types/Note';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { processImageForCover, COVER_IMAGE_CONFIG } from '@/utils/imageProcessor';
import { useLocalCache } from '@/hooks/useLocalCache';

interface NoteEditorProps {
  note: Note;
  isEditing: boolean;
  onSave: (noteData: Partial<Note>) => void;
  onEdit: () => void;
  onCancel: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  isEditing,
  onSave,
  onEdit,
  onCancel,
}) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [coverImage, setCoverImage] = useState(note.cover_image_url);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { isOnline, cacheImage, loadCachedImage } = useLocalCache();

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    loadCoverImage();
    setCoverPreview(null);
  }, [note]);

  const loadCoverImage = async () => {
    if (note.cover_image_url) {
      const cachedImageUrl = await loadCachedImage(note.cover_image_url);
      setCoverImage(cachedImageUrl);
    } else {
      setCoverImage(null);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "O título da nota não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    console.log('Saving note with data:', {
      title: title.trim(),
      content: content.trim(),
      cover_image_url: coverImage,
    });

    onSave({
      title: title.trim(),
      content: content.trim(),
      cover_image_url: coverImage,
    });
    onCancel();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      console.log('Processing cover image for note:', note.id);
      
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
        const fileName = `${user.id}/covers/${note.id}/${timestamp}.png`;

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

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <NoteEditorHeader
          note={note}
          isEditing={isEditing}
          title={title}
          onTitleChange={setTitle}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={handleSave}
          onImageUpload={handleImageUpload}
          onShareModalOpen={() => setShareModalOpen(true)}
          onDownloadModalOpen={() => setDownloadModalOpen(true)}
        />
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {uploadingCover && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Processando e carregando imagem de capa...
          </div>
        )}

        {isEditing && (
          <div className="text-xs text-muted-foreground border rounded-md p-2 bg-muted/50">
            💡 <strong>Capa da nota:</strong> Dimensões: {COVER_IMAGE_CONFIG.width}x{COVER_IMAGE_CONFIG.height}px • Formatos: PNG, JPG, WebP • Máximo: 10MB • Resolução: 300 DPI
            {!isOnline && <span className="block mt-1 text-amber-600">• Modo offline: imagens serão sincronizadas quando conectado</span>}
          </div>
        )}

        <NoteCoverImage
          coverImage={coverPreview || (isEditing ? coverImage : note.cover_image_url)}
          isEditing={isEditing}
          onRemoveCover={handleRemoveCover}
        />

        <AttachmentManager
          noteId={note.id}
          attachments={note.attachments || []}
          isEditing={isEditing}
        />

        <NoteEditorContent
          content={content}
          isEditing={isEditing}
          onContentChange={setContent}
        />
      </CardContent>

      <ShareModal
        note={note}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      <DownloadModal
        note={note}
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </Card>
  );
};

export default NoteEditor;
