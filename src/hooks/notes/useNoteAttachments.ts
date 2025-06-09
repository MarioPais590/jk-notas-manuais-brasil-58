
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Note, NoteAttachment } from '@/types/Note';
import { useToast } from '@/hooks/use-toast';

export function useNoteAttachments(
  user: User | null,
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>
) {
  const { toast } = useToast();

  const uploadAttachment = async (noteId: string, file: File): Promise<NoteAttachment | null> => {
    if (!user) {
      console.log('No user for uploadAttachment');
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para anexar arquivos.",
        variant: "destructive",
      });
      return null;
    }

    try {
      console.log('Starting attachment upload for note:', noteId, 'file:', file.name);
      
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${user.id}/${noteId}/${timestamp}.${fileExt}`;

      console.log('Uploading to path:', fileName);

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('note-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('note-attachments')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);

      // Save attachment metadata to database
      const { data: attachmentData, error: attachmentError } = await supabase
        .from('note_attachments')
        .insert({
          note_id: noteId,
          name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: publicUrl,
        })
        .select()
        .single();

      if (attachmentError) {
        console.error('Attachment metadata error:', attachmentError);
        
        // Clean up uploaded file if metadata save fails
        try {
          await supabase.storage
            .from('note-attachments')
            .remove([fileName]);
        } catch (cleanupError) {
          console.warn('Failed to cleanup uploaded file:', cleanupError);
        }
        
        throw attachmentError;
      }

      console.log('Attachment metadata saved:', attachmentData);

      const newAttachment: NoteAttachment = {
        id: attachmentData.id,
        note_id: attachmentData.note_id,
        name: attachmentData.name,
        file_type: attachmentData.file_type,
        file_size: attachmentData.file_size,
        file_url: attachmentData.file_url,
        uploaded_at: new Date(attachmentData.uploaded_at)
      };

      // Update local state
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, attachments: [...(note.attachments || []), newAttachment] }
          : note
      ));

      console.log('Attachment upload completed successfully');
      toast({
        title: "Arquivo anexado",
        description: `${file.name} foi anexado à nota com sucesso.`,
      });

      return newAttachment;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast({
        title: "Erro ao anexar arquivo",
        description: "Não foi possível anexar o arquivo. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const removeAttachment = async (attachmentId: string, noteId: string) => {
    if (!user) {
      console.log('No user for removeAttachment');
      return;
    }

    try {
      console.log('Removing attachment:', attachmentId);
      
      // Get attachment info first
      const { data: attachment, error: getError } = await supabase
        .from('note_attachments')
        .select('file_url, name')
        .eq('id', attachmentId)
        .single();

      if (getError) {
        console.error('Get attachment error:', getError);
        throw getError;
      }

      // Extract file path from URL
      const url = new URL(attachment.file_url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `${user.id}/${noteId}/${fileName}`;

      console.log('Deleting file from storage:', filePath);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('note-attachments')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('note_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) {
        console.error('Database deletion error:', dbError);
        throw dbError;
      }

      // Update local state
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, attachments: note.attachments?.filter(att => att.id !== attachmentId) }
          : note
      ));

      console.log('Attachment removed successfully');
      toast({
        title: "Anexo removido",
        description: `${attachment.name} foi removido com sucesso.`,
      });
    } catch (error) {
      console.error('Error removing attachment:', error);
      toast({
        title: "Erro ao remover anexo",
        description: "Não foi possível remover o anexo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    uploadAttachment,
    removeAttachment,
  };
}
