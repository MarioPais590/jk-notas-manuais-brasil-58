
import React, { useState, useEffect } from 'react';
import { Plus, Moon, Sun, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import NoteCard from '@/components/NoteCard';
import NoteEditor from '@/components/NoteEditor';
import { Note } from '@/types/Note';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { toast } = useToast();

  // Carregar notas do localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('notasJK');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Erro ao carregar notas:', error);
      }
    }

    const savedTheme = localStorage.getItem('notasJK-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Salvar notas automaticamente
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('notasJK', JSON.stringify(notes));
    }
  }, [notes]);

  // Toggle tema
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('notasJK-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('notasJK-theme', 'light');
    }
  };

  // Criar nova nota
  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Nova Nota',
      content: '',
      color: '#3B82F6',
      coverImage: null,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNote(newNote);
    setIsEditing(true);
  };

  // Salvar nota
  const saveNote = (noteData: Partial<Note>) => {
    if (!selectedNote) return;

    const updatedNote = {
      ...selectedNote,
      ...noteData,
      updatedAt: new Date(),
    };

    setNotes(prev => prev.map(note => 
      note.id === selectedNote.id ? updatedNote : note
    ));
    setSelectedNote(updatedNote);
    toast({
      title: "Nota salva!",
      description: "Suas alterações foram salvas automaticamente.",
    });
  };

  // Deletar nota
  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
    toast({
      title: "Nota excluída",
      description: "A nota foi removida permanentemente.",
      variant: "destructive",
    });
  };

  // Fixar/desfixar nota
  const togglePinNote = (noteId: string) => {
    const pinnedCount = notes.filter(note => note.isPinned).length;
    const noteToToggle = notes.find(note => note.id === noteId);
    
    if (noteToToggle && !noteToToggle.isPinned && pinnedCount >= 5) {
      toast({
        title: "Limite atingido",
        description: "Você pode fixar no máximo 5 notas.",
        variant: "destructive",
      });
      return;
    }

    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  // Filtrar e ordenar notas
  const filteredNotes = notes
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground min-h-screen">
        {/* Header */}
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary">Notas JK</h1>
                <p className="text-sm text-muted-foreground">por Mário Augusto</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-9 w-9"
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button onClick={createNewNote} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Nota
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Notas */}
            <div className="lg:col-span-1 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar notas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma nota encontrada.</p>
                    <Button 
                      variant="link" 
                      onClick={createNewNote}
                      className="mt-2"
                    >
                      Criar sua primeira nota
                    </Button>
                  </div>
                ) : (
                  filteredNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isSelected={selectedNote?.id === note.id}
                      onSelect={() => {
                        setSelectedNote(note);
                        setIsEditing(false);
                      }}
                      onEdit={() => {
                        setSelectedNote(note);
                        setIsEditing(true);
                      }}
                      onDelete={() => deleteNote(note.id)}
                      onTogglePin={() => togglePinNote(note.id)}
                      onColorChange={(color) => {
                        setNotes(prev => prev.map(n => 
                          n.id === note.id ? { ...n, color } : n
                        ));
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Editor de Notas */}
            <div className="lg:col-span-2">
              {selectedNote ? (
                <NoteEditor
                  note={selectedNote}
                  isEditing={isEditing}
                  onSave={saveNote}
                  onEdit={() => setIsEditing(true)}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <div className="flex items-center justify-center h-96 bg-card rounded-lg border-2 border-dashed border-muted">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Selecione uma nota para visualizar ou editar
                    </p>
                    <Button onClick={createNewNote}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Nova Nota
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
