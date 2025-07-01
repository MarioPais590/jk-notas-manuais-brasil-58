
import { useNavigate } from 'react-router-dom';
import { Note } from '@/types/Note';
import { useNotes } from '@/hooks/useNotes';
import { useIsMobile } from '@/hooks/use-mobile';

export function useNotesManagerHandlers(
  selectedNote: Note | null,
  setSelectedNote: (note: Note | null) => void,
  setIsEditing: (editing: boolean) => void
) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const {
    deleteNote,
    togglePinNote,
    updateNoteColor,
    createNewNote,
    saveNote,
    user,
  } = useNotes();

  const handleCreateNote = async () => {
    console.log('Creating new note...');
    if (!user) {
      console.log('No user found, cannot create note');
      return;
    }

    try {
      const newNote = await createNewNote();
      console.log('New note created:', newNote);
      if (newNote) {
        if (isMobile) {
          navigate(`/note/${newNote.id}?edit=true`);
        } else {
          setSelectedNote(newNote);
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleNoteSelect = (note: Note) => {
    if (!isMobile) {
      setSelectedNote(note);
      setIsEditing(false);
    }
  };

  const handleNoteEdit = (note: Note) => {
    if (isMobile) {
      navigate(`/note/${note.id}`);
    } else {
      setSelectedNote(note);
      setIsEditing(true);
    }
  };

  const handleNoteDelete = (noteId: string) => {
    deleteNote(noteId);
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const handleNoteSave = async (noteData: Partial<Note>) => {
    if (selectedNote) {
      await saveNote(selectedNote.id, noteData);
      setIsEditing(false);
    }
  };

  const handleNoteCancel = () => {
    setIsEditing(false);
  };

  return {
    handleCreateNote,
    handleNoteSelect,
    handleNoteEdit,
    handleNoteDelete,
    handleNoteSave,
    handleNoteCancel,
    togglePinNote,
    updateNoteColor,
  };
}
