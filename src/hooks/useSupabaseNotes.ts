import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Note, NoteAttachment, DatabaseNote, DatabaseNoteAttachment } from '@/types/Note';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

export function useSupabaseNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        console.log('Initial session:', session?.user?.email);
        setUser(session?.user ?? null);
        
        // Only fetch notes if we have a user
        if (session?.user) {
          await fetchNotes(session.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      setUser(session?.user ?? null);
      
      if (session?.user && event === 'SIGNED_IN') {
        // Defer data fetching to prevent deadlocks
        setTimeout(async () => {
          await fetchNotes(session.user);
        }, 100);
      } else {
        setNotes([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const convertDatabaseNote = (dbNote: DatabaseNote, attachments: DatabaseNoteAttachment[] = []): Note => ({
    id: dbNote.id,
    user_id: dbNote.user_id,
    title: dbNote.title,
    content: dbNote.content,
    color: dbNote.color,
    cover_image_url: dbNote.cover_image_url,
    is_pinned: dbNote.is_pinned,
    created_at: new Date(dbNote.created_at),
    updated_at: new Date(dbNote.updated_at),
    attachments: attachments.map(att => ({
      id: att.id,
      note_id: att.note_id,
      name: att.name,
      file_type: att.file_type,
      file_size: att.file_size,
      file_url: att.file_url,
      uploaded_at: new Date(att.uploaded_at)
    }))
  });

  const fetchNotes = async (currentUser?: User) => {
    const userToUse = currentUser || user;
    if (!userToUse) {
      console.log('No user for fetchNotes');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching notes for user:', userToUse.id);
      
      // Fetch notes with attachments
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select(`
          *,
          note_attachments (*)
        `)
        .eq('user_id', userToUse.id)
        .order('updated_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching notes:', notesError);
        throw notesError;
      }

      console.log('Fetched notes data:', notesData);

      const convertedNotes = notesData?.map(note => 
        convertDatabaseNote(note, note.note_attachments || [])
      ) || [];

      console.log('Converted notes:', convertedNotes);
      setNotes(convertedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Erro ao carregar notas",
        description: "Não foi possível carregar suas notas. Verifique sua conexão.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      
      // Get current attachments to maintain them
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

  const deleteNote = async (noteId: string) => {
    if (!user) return;

    try {
      console.log('Starting note deletion process for note:', noteId);
      
      // First, get all attachments for this note
      const { data: attachments, error: attachmentsError } = await supabase
        .from('note_attachments')
        .select('*')
        .eq('note_id', noteId);

      if (attachmentsError) {
        console.error('Error fetching attachments for deletion:', attachmentsError);
        // Continue with deletion even if we can't fetch attachments
      }

      // Delete attachments from storage and database
      if (attachments && attachments.length > 0) {
        console.log('Deleting attachments:', attachments.length);
        
        for (const attachment of attachments) {
          // Extract file path from URL for storage deletion
          try {
            const urlParts = attachment.file_url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const filePath = `${user.id}/${noteId}/${fileName}`;
            
            console.log('Deleting file from storage:', filePath);
            
            // Delete from storage (don't throw if this fails)
            const { error: storageError } = await supabase.storage
              .from('note-attachments')
              .remove([filePath]);
            
            if (storageError) {
              console.warn('Storage deletion warning:', storageError);
            }
          } catch (storageErr) {
            console.warn('Error deleting from storage:', storageErr);
          }
        }

        // Delete attachment records from database
        const { error: deleteAttachmentsError } = await supabase
          .from('note_attachments')
          .delete()
          .eq('note_id', noteId);

        if (deleteAttachmentsError) {
          console.error('Error deleting attachment records:', deleteAttachmentsError);
          // Continue with note deletion
        }
      }

      // Delete the note itself
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

      // Update local state
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
        description: "Não foi possível excluir a nota.",
        variant: "destructive",
      });
    }
  };

  const togglePinNote = async (noteId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return false;

      console.log('Toggling pin for note:', noteId, 'current:', note.is_pinned);
      const { data, error } = await supabase
        .from('notes')
        .update({ is_pinned: !note.is_pinned })
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling pin:', error);
        throw error;
      }

      const updatedNote = convertDatabaseNote(data);
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updatedNote } : n));

      return true;
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: "Erro ao fixar nota",
        description: "Não foi possível alterar o status da nota.",
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
    } catch (error) {
      console.error('Error updating color:', error);
      toast({
        title: "Erro ao alterar cor",
        description: "Não foi possível alterar a cor da nota.",
        variant: "destructive",
      });
    }
  };

  const uploadAttachment = async (noteId: string, file: File): Promise<NoteAttachment | null> => {
    if (!user) {
      console.log('No user for uploadAttachment');
      return null;
    }

    try {
      console.log('Starting attachment upload for note:', noteId, 'file:', file.name);
      
      // Create a simpler file path structure
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
      return newAttachment;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast({
        title: "Erro ao anexar arquivo",
        description: "Não foi possível anexar o arquivo. Verifique sua conexão.",
        variant: "destructive",
      });
      return null;
    }
  };

  const removeAttachment = async (attachmentId: string, noteId: string) => {
    if (!user) return;

    try {
      console.log('Removing attachment:', attachmentId);
      
      // Get attachment info first
      const { data: attachment, error: getError } = await supabase
        .from('note_attachments')
        .select('file_url')
        .eq('id', attachmentId)
        .single();

      if (getError) {
        console.error('Get attachment error:', getError);
        throw getError;
      }

      // Extract file path from URL
      const urlParts = attachment.file_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
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
    } catch (error) {
      console.error('Error removing attachment:', error);
      toast({
        title: "Erro ao remover anexo",
        description: "Não foi possível remover o anexo.",
        variant: "destructive",
      });
    }
  };

  const filterAndSortNotes = (searchTerm: string): Note[] => {
    return notes
      .filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        // Primeiro as fixadas
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        // Depois por data (mais recente primeiro)
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  };

  return {
    notes,
    user,
    loading,
    createNewNote,
    saveNote,
    deleteNote,
    togglePinNote,
    updateNoteColor,
    uploadAttachment,
    removeAttachment,
    filterAndSortNotes,
    refetch: () => fetchNotes(),
  };
}
