
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ShareModal from '@/components/ShareModal';
import DownloadModal from '@/components/DownloadModal';
import AttachmentManager from '@/components/AttachmentManager';
import NoteEditorHeader from '@/components/NoteEditorHeader';
import NoteCoverImage from '@/components/NoteCoverImage';
import NoteEditorContent from '@/components/NoteEditorContent';
import { Note } from '@/types/Note';
import { useToast } from '@/hooks/use-toast';
import { COVER_IMAGE_CONFIG } from '@/utils/imageProcessor';
import { useLocalCache } from '@/hooks/useLocalCache';
import { useNoteEditorState } from './NoteEditor/NoteEditorState';
import { useCoverImageHandler } from './NoteEditor/useCoverImageHandler';
import { CoverTemplate } from '@/constants/coverTemplates';

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
  const { toast } = useToast();
  const { isOnline } = useLocalCache();

  const {
    title,
    setTitle,
    content,
    setContent,
    coverImage,
    setCoverImage,
    shareModalOpen,
    setShareModalOpen,
    downloadModalOpen,
    setDownloadModalOpen,
    uploadingCover,
    setUploadingCover,
    coverPreview,
    setCoverPreview,
  } = useNoteEditorState(note);

  const {
    loadCoverImage,
    handleImageUpload,
    handleTemplateSelect,
    handleRemoveCover,
  } = useCoverImageHandler(
    note.id,
    coverImage,
    setCoverImage,
    coverPreview,
    setCoverPreview,
    setUploadingCover
  );

  useEffect(() => {
    loadCoverImage(note.cover_image_url);
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
          onTemplateSelect={handleTemplateSelect}
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
