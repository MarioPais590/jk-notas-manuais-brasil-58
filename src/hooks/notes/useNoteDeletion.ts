
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/Note';
import { useToast } from '@/hooks/use-toast';

export function useNoteDeletion(
  user: User | null,
  notes: Note[],
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>
) {
  const { toast } = useToast();

  const deleteNote = async (noteId: string) => {
    if (!user) {
      console.log('No user for deleteNote');
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para excluir notas.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting note deletion process for note:', noteId);
      
      // First, get all attachments for this note to clean up storage
      const { data: attachments, error: attachmentsError } = await supabase
        .from('note_attachments')
        .select('file_url')
        .eq('note_id', noteId);

      if (attachmentsError) {
        console.error('Error fetching attachments for deletion:', attachmentsError);
        // Continue with deletion even if we can't fetch attachments
      }

      // Delete attachment files from storage
      if (attachments && attachments.length > 0) {
        console.log('Deleting attachment files:', attachments.length);
        
        for (const attachment of attachments) {
          try {
            // Extract file path from the full URL
            const url = new URL(attachment.file_url);
            const pathParts = url.pathname.split('/');
            // Get the file path after '/storage/v1/object/public/note-attachments/'
            const bucketIndex = pathParts.findIndex(part => part === 'note-attachments');
            if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
              const filePath = pathParts.slice(bucketIndex + 1).join('/');
              
              console.log('Deleting file from storage:', filePath);
              
              const { error: storageError } = await supabase.storage
                .from('note-attachments')
                .remove([filePath]);
              
              if (storageError) {
                console.warn('Storage deletion warning:', storageError);
              }
            }
          } catch (storageErr) {
            console.warn('Error deleting attachment from storage:', storageErr);
          }
        }
      }

      // Delete cover image if exists
      const noteToDelete = notes.find(n => n.id === noteId);
      if (noteToDelete?.cover_image_url) {
        try {
          const url = new URL(noteToDelete.cover_image_url);
          const pathParts = url.pathname.split('/');
          const bucketIndex = pathParts.findIndex(part => part === 'note-attachments');
          if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            const filePath = pathParts.slice(bucketIndex + 1).join('/');
            
            console.log('Deleting cover image from storage:', filePath);
            
            const { error: coverError } = await supabase.storage
              .from('note-attachments')
              .remove([filePath]);
              
            if (coverError) {
              console.warn('Error deleting cover image:', coverError);
            }
          }
        } catch (coverErr) {
          console.warn('Error deleting cover image:', coverErr);
        }
      }

      // Delete attachment records from database
      const { error: deleteAttachmentsError } = await supabase
        .from('note_attachments')
        .delete()
        .eq('note_id', noteId);

      if (deleteAttachmentsError) {
        console.error('Error deleting attachment records:', deleteAttachmentsError);
        // Continue with note deletion even if attachment cleanup fails
      }

      // Delete the note itself - this will trigger the audit log
      console.log('Deleting note from database:', noteId);
      const { error: deleteNoteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (deleteNoteError) {
        console.error('Error deleting note:', deleteNoteError);
        throw deleteNoteError;
      }

      // Update local state only after successful deletion
      setNotes(prev => prev.filter(note => note.id !== noteId));

      console.log('Note deleted successfully:', noteId);
      toast({
        title: "Nota excluída",
        description: "A nota foi removida permanentemente.",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Erro ao excluir nota",
        description: "Não foi possível excluir a nota. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return { deleteNote };
}
