
import { useState, useEffect } from 'react';
import { Note } from '@/types/Note';
import { APP_CONFIG } from '@/constants/appConfig';
import { useToast } from '@/hooks/use-toast';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const { toast } = useToast();

  // Carregar notas do localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.NOTES);
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        const notesWithAttachments = parsedNotes.map((note: any) => ({
          ...note,
          attachments: note.attachments || [],
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        setNotes(notesWithAttachments);
      } catch (error) {
        console.error('Erro ao carregar notas:', error);
      }
    }
  }, []);

  // Salvar notas automaticamente
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
  }, [notes]);

  const createNewNote = (): Note => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Nova Nota',
      content: '',
      color: '#3B82F6',
      coverImage: null,
      attachments: [],
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  const saveNote = (noteId: string, noteData: Partial<Note>) => {
    const updatedNote = notes.find(note => note.id === noteId);
    if (!updatedNote) return null;

    const newNote = {
      ...updatedNote,
      ...noteData,
      updatedAt: new Date(),
    };

    setNotes(prev => prev.map(note => 
      note.id === noteId ? newNote : note
    ));

    toast({
      title: "Nota salva!",
      description: "Suas alterações foram salvas automaticamente.",
    });

    return newNote;
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast({
      title: "Nota excluída",
      description: "A nota foi removida permanentemente.",
      variant: "destructive",
    });
  };

  const togglePinNote = (noteId: string): boolean => {
    const pinnedCount = notes.filter(note => note.isPinned).length;
    const noteToToggle = notes.find(note => note.id === noteId);
    
    if (noteToToggle && !noteToToggle.isPinned && pinnedCount >= APP_CONFIG.LIMITS.MAX_PINNED_NOTES) {
      toast({
        title: "Limite atingido",
        description: `Você pode fixar no máximo ${APP_CONFIG.LIMITS.MAX_PINNED_NOTES} notas.`,
        variant: "destructive",
      });
      return false;
    }

    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    ));
    return true;
  };

  const updateNoteColor = (noteId: string, color: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, color } : note
    ));
  };

  const filterAndSortNotes = (searchTerm: string): Note[] => {
    return notes
      .filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        // Primeiro as fixadas
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Depois por data (mais recente primeiro)
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  };

  return {
    notes,
    createNewNote,
    saveNote,
    deleteNote,
    togglePinNote,
    updateNoteColor,
    filterAndSortNotes,
  };
}
