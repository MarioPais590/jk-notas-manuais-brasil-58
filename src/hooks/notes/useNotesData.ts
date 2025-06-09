
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/Note';
import { useToast } from '@/hooks/use-toast';
import { convertDatabaseNote } from './utils';

export function useNotesData() {
  const [notes, setNotes] = useState<Note[]>([]);
  const { toast } = useToast();

  const fetchNotes = async (user: User, setLoading: (loading: boolean) => void) => {
    if (!user) {
      console.log('No user for fetchNotes');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching notes for user:', user.id);
      
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select(`
          *,
          note_attachments (*)
        `)
        .eq('user_id', user.id)
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

  return { notes, setNotes, fetchNotes };
}
