
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ShareModal from '@/components/ShareModal';
import DownloadModal from '@/components/DownloadModal';
import AttachmentManager from '@/components/AttachmentManager';
import NoteEditorHeader from '@/components/NoteEditorHeader';
import NoteCoverImage from '@/components/NoteCoverImage';
import NoteEditorContent from '@/components/NoteEditorContent';
import { Note, NoteAttachment } from '@/types/Note';
import { useToast } from '@/hooks/use-toast';

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
  const [coverImage, setCoverImage] = useState(note.coverImage);
  const [attachments, setAttachments] = useState<NoteAttachment[]>(note.attachments || []);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setCoverImage(note.coverImage);
    setAttachments(note.attachments || []);
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

    onSave({
      title: title.trim(),
      content: content.trim(),
      coverImage,
      attachments,
    });
    onCancel();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCoverImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAttachment = (attachment: NoteAttachment) => {
    setAttachments(prev => [...prev, attachment]);
    toast({
      title: "Anexo adicionado",
      description: `${attachment.name} foi anexado à nota.`,
    });
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    toast({
      title: "Anexo removido",
      description: "O anexo foi removido da nota.",
    });
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
        <NoteCoverImage
          coverImage={isEditing ? coverImage : note.coverImage}
          isEditing={isEditing}
          onRemoveCover={() => setCoverImage(null)}
        />

        <AttachmentManager
          attachments={attachments}
          onAddAttachment={handleAddAttachment}
          onRemoveAttachment={handleRemoveAttachment}
          isEditing={isEditing}
        />

        <NoteEditorContent
          content={content}
          isEditing={isEditing}
          onContentChange={setContent}
        />
      </CardContent>

      <ShareModal
        note={{ ...note, attachments }}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      <DownloadModal
        note={{ ...note, attachments }}
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </Card>
  );
};

export default NoteEditor;
