
import React, { useState, useEffect } from 'react';
import { Save, Edit, X, Download, Share2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ShareModal from '@/components/ShareModal';
import DownloadModal from '@/components/DownloadModal';
import AttachmentManager from '@/components/AttachmentManager';
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
                placeholder="Título da nota"
              />
            ) : (
              <h2 className="text-lg font-semibold">{note.title}</h2>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Criado em {formatDate(note.createdAt)}
              {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                <span> • Editado em {formatDate(note.updatedAt)}</span>
              )}
            </p>
          </div>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="cover-upload"
                />
                <label htmlFor="cover-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span className="cursor-pointer">
                      <Image className="h-4 w-4" />
                    </span>
                  </Button>
                </label>
                <Button variant="outline" size="sm" onClick={onCancel}>
                  <X className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setShareModalOpen(true)}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDownloadModalOpen(true)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {(isEditing && coverImage) || (!isEditing && note.coverImage) ? (
          <div>
            <img
              src={isEditing ? coverImage! : note.coverImage!}
              alt="Capa da nota"
              className="w-full max-h-48 object-cover rounded-lg"
            />
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setCoverImage(null)}
              >
                Remover Capa
              </Button>
            )}
          </div>
        ) : null}

        <AttachmentManager
          attachments={attachments}
          onAddAttachment={handleAddAttachment}
          onRemoveAttachment={handleRemoveAttachment}
          isEditing={isEditing}
        />

        {isEditing ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva sua nota aqui..."
            className="min-h-[300px] resize-none border-none px-0 focus-visible:ring-0"
          />
        ) : (
          <div className="min-h-[300px] whitespace-pre-wrap text-sm leading-relaxed">
            {note.content || (
              <span className="text-muted-foreground italic">
                Esta nota está vazia. Clique em "Editar" para adicionar conteúdo.
              </span>
            )}
          </div>
        )}
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
