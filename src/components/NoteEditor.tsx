
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
  const { toast } = useToast();

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setCoverImage(note.cover_image_url);
  }, [note]);

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

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Apenas imagens são permitidas para capa.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingCover(true);
      console.log('Uploading cover image for note:', note.id);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }
      
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${user.id}/covers/${note.id}/${timestamp}.${fileExt}`;

      console.log('Cover image upload path:', fileName);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('note-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Cover image upload error:', error);
        throw error;
      }

      console.log('Cover image uploaded:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('note-attachments')
        .getPublicUrl(fileName);

      console.log('Cover image public URL:', publicUrl);
      setCoverImage(publicUrl);
      
      toast({
        title: "Imagem carregada",
        description: "A imagem de capa foi adicionada com sucesso.",
      });
    } catch (error) {
      console.error('Error uploading cover image:', error);
      toast({
        title: "Erro ao carregar imagem",
        description: "Não foi possível carregar a imagem de capa. Verifique sua conexão.",
        variant: "destructive",
      });
    } finally {
      setUploadingCover(false);
      // Clear the input
      event.target.value = '';
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
            Carregando imagem de capa...
          </div>
        )}

        <NoteCoverImage
          coverImage={isEditing ? coverImage : note.cover_image_url}
          isEditing={isEditing}
          onRemoveCover={() => setCoverImage(null)}
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
