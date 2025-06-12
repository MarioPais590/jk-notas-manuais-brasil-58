
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import AppHeader from '@/components/AppHeader';
import NoteEditor from '@/components/NoteEditor';
import AuthWrapper from '@/components/AuthWrapper';
import { useNotes } from '@/hooks/useNotes';

const NotePage = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const { notes, saveNote } = useNotes();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  
  const note = notes.find(n => n.id === noteId);
  
  useEffect(() => {
    // Se o parâmetro edit=true estiver presente, abrir em modo de edição
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true);
      // Limpar o parâmetro da URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('edit');
      navigate(`/note/${noteId}?${newSearchParams.toString()}`, { replace: true });
    }
  }, [searchParams, navigate, noteId]);
  
  if (!note) {
    return (
      <AuthWrapper>
        <div className={`min-h-screen transition-colors ${darkMode ? 'dark' : ''}`}>
          <div className="bg-background text-foreground">
            <AppHeader
              darkMode={darkMode}
              onToggleTheme={toggleTheme}
              onCreateNote={() => navigate('/')}
            />
            <main className="container mx-auto px-4 py-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Nota não encontrada</p>
                <Button onClick={() => navigate('/')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar às notas
                </Button>
              </div>
            </main>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  const handleNoteSave = async (noteData: Partial<typeof note>) => {
    await saveNote(note.id, noteData);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <AuthWrapper>
      <div className={`min-h-screen transition-colors ${darkMode ? 'dark' : ''}`}>
        <div className="bg-background text-foreground">
          <AppHeader
            darkMode={darkMode}
            onToggleTheme={toggleTheme}
            onCreateNote={() => navigate('/')}
          />
          <main className="container mx-auto px-4 py-6">
            <div className="mb-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar às notas
              </Button>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <NoteEditor
                note={note}
                isEditing={isEditing}
                onSave={handleNoteSave}
                onEdit={handleEdit}
                onCancel={handleCancel}
              />
            </div>
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default NotePage;
