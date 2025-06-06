
import React from 'react';
import { Paperclip, X, Download, File, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NoteAttachment } from '@/types/Note';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseNotes } from '@/hooks/useSupabaseNotes';

interface AttachmentManagerProps {
  noteId: string;
  attachments: NoteAttachment[];
  isEditing: boolean;
}

const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  noteId,
  attachments,
  isEditing,
}) => {
  const { toast } = useToast();
  const { uploadAttachment, removeAttachment } = useSupabaseNotes();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Verificar tipos de arquivo permitidos
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: "Apenas PDF, TXT, DOC, DOCX e imagens são permitidos.",
        variant: "destructive",
      });
      return;
    }

    const result = await uploadAttachment(noteId, file);
    if (result) {
      toast({
        title: "Anexo adicionado",
        description: `${file.name} foi anexado à nota.`,
      });
    }

    // Limpar o input
    event.target.value = '';
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    await removeAttachment(attachmentId, noteId);
    toast({
      title: "Anexo removido",
      description: "O anexo foi removido da nota.",
    });
  };

  const downloadAttachment = (attachment: NoteAttachment) => {
    // Abrir o URL em uma nova aba para download
    window.open(attachment.file_url, '_blank');
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <File className="h-4 w-4 text-red-500" />;
    if (type.includes('text') || type.includes('word')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (type.includes('image')) return <ImageIcon className="h-4 w-4 text-green-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      {isEditing && (
        <div>
          <input
            type="file"
            accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp"
            onChange={handleFileUpload}
            className="hidden"
            id="attachment-upload"
          />
          <label htmlFor="attachment-upload">
            <Button variant="outline" size="sm" asChild>
              <span className="cursor-pointer flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Anexar Arquivo
              </span>
            </Button>
          </label>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Anexos ({attachments.length})</h4>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <Card key={attachment.id} className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(attachment.file_type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.file_size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadAttachment(attachment)}
                      className="h-6 w-6 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentManager;
