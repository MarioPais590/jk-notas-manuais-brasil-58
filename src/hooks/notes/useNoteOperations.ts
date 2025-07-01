
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/Note';
import { useToast } from '@/hooks/use-toast';
import { convertDatabaseNote } from './utils';
import { useNoteDeletion } from './useNoteDeletion';
import { useNoteAttachments } from './useNoteAttachments';

export function useNoteOperations(
  user: User | null,
  notes: Note[],
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>
) {
  const { toast } = useToast();
  const { deleteNote } = useNoteDeletion(user, notes, setNotes);
  const { uploadAttachment, removeAttachment } = useNoteAttachments(user, setNotes);

  const createNewNote = async (): Promise<Note | null> => {
    if (!user) {
      console.log('No user for createNewNote');
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para criar uma nota.",
        variant: "destructive",
      });
      return null;
    }

    try {
      console.log('Creating new note for user:', user.id);
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: 'Nova Nota',
          content: '',
          color: '#3B82F6',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating note:', error);
        throw error;
      }

      console.log('Created note:', data);
      const newNote = convertDatabaseNote(data);
      setNotes(prev => [newNote, ...prev]);

      toast({
        title: "Nova nota criada!",
        description: "Sua nota foi criada com sucesso.",
      });

      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Erro ao criar nota",
        description: "Não foi possível criar a nota. Tente novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const saveNote = async (noteId: string, noteData: Partial<Note>): Promise<Note | null> => {
    if (!user) {
      console.log('No user for saveNote');
      return null;
    }

    try {
      console.log('Saving note:', noteId, noteData);
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: noteData.title,
          content: noteData.content,
          cover_image_url: noteData.cover_image_url,
        })
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error saving note:', error);
        throw error;
      }

      console.log('Saved note:', data);
      
      const currentNote = notes.find(n => n.id === noteId);
      const updatedNote = convertDatabaseNote(data, []);
      updatedNote.attachments = currentNote?.attachments || [];
      
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));

      toast({
        title: "Nota salva!",
        description: "Suas alterações foram salvas automaticamente.",
      });

      return updatedNote;
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Erro ao salvar nota",
        description: "Não foi possível salvar a nota. Tente novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const togglePinNote = async (noteId: string): Promise<boolean> => {
    if (!user) {
      console.error('togglePinNote: No user authenticated');
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para fixar notas.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) {
        console.error('togglePinNote: Note not found:', noteId);
        toast({
          title: "Erro",
          description: "Nota não encontrada.",
          variant: "destructive",
        });
        return false;
      }

      // Verificar se está tentando fixar e já tem 5 notas fixadas
      if (!note.is_pinned) {
        const pinnedNotesCount = notes.filter(n => n.is_pinned).length;
        console.log('Current pinned notes count:', pinnedNotesCount);
        if (pinnedNotesCount >= 5) {
          toast({
            title: "Limite atingido",
            description: "Você pode fixar no máximo 5 notas. Desafixe uma nota para fixar outra.",
            variant: "destructive",
          });
          return false;
        }
      }

      const newPinnedState = !note.is_pinned;
      console.log('togglePinNote: Attempting to change pin status', {
        noteId,
        currentState: note.is_pinned,
        newState: newPinnedState,
        userId: user.id
      });

      const { data, error } = await supabase
        .from('notes')
        .update({ is_pinned: newPinnedState })
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('togglePinNote: Database error:', error);
        toast({
          title: "Erro ao fixar nota",
          description: `Erro no banco de dados: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      if (!data) {
        console.error('togglePinNote: No data returned from update');
        toast({
          title: "Erro ao fixar nota",
          description: "Nenhum dado retornado pela operação. Verifique se a nota existe.",
          variant: "destructive",
        });
        return false;
      }

      console.log('togglePinNote: Successfully updated note:', data);
      const updatedNote = convertDatabaseNote(data);
      
      setNotes(prev => {
        const updatedNotes = prev.map(n => n.id === noteId ? { ...n, ...updatedNote } : n);
        // Reorganizar: notas fixadas primeiro, depois por data de atualização
        return updatedNotes.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return b.updated_at.getTime() - a.updated_at.getTime();
        });
      });

      toast({
        title: newPinnedState ? "Nota fixada" : "Nota desafixada",
        description: newPinnedState ? "A nota foi fixada no topo da lista." : "A nota foi desafixada.",
      });

      return true;
    } catch (error: any) {
      console.error('togglePinNote: Unexpected error:', error);
      toast({
        title: "Erro ao fixar nota",
        description: `Erro inesperado: ${error.message || 'Verifique sua conexão.'}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateNoteColor = async (noteId: string, color: string) => {
    if (!user) return;

    try {
      console.log('Updating color for note:', noteId, 'to:', color);
      const { data, error } = await supabase
        .from('notes')
        .update({ color })
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating color:', error);
        throw error;
      }

      const updatedNote = convertDatabaseNote(data);
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, ...updatedNote } : note
      ));

      toast({
        title: "Cor alterada",
        description: "A cor da nota foi alterada com sucesso.",
      });
    } catch (error) {
      console.error('Error updating color:', error);
      toast({
        title: "Erro ao alterar cor",
        description: "Não foi possível alterar a cor da nota.",
        variant: "destructive",
      });
    }
  };

  return {
    createNewNote,
    saveNote,
    deleteNote,
    togglePinNote,
    updateNoteColor,
    uploadAttachment,
    removeAttachment,
  };
}
