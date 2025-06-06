
import React from 'react';
import AppHeader from '@/components/AppHeader';
import NotesManager from '@/components/NotesManager';
import { useTheme } from '@/hooks/useTheme';

const NotesLayout: React.FC = () => {
  const { darkMode, toggleTheme } = useTheme();

  const handleCreateNote = () => {
    // Esta função será substituída pela lógica interna do NotesManager
    console.log('Create note triggered from header');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground min-h-screen">
        <AppHeader
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
          onCreateNote={handleCreateNote}
        />

        <div className="container mx-auto px-4 py-6">
          <NotesManager onCreateNote={handleCreateNote} />
        </div>
      </div>
    </div>
  );
};

export default NotesLayout;
