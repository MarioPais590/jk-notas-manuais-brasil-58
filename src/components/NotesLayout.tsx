
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import AppHeader from '@/components/AppHeader';
import NotesManager from '@/components/NotesManager';
import AuthWrapper from '@/components/AuthWrapper';

const NotesLayout = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <AuthWrapper>
      <div className={`min-h-screen transition-colors ${darkMode ? 'dark' : ''}`}>
        <div className="bg-background text-foreground">
          <NotesManager 
            onCreateNote={() => console.log('Create note from manager')}
            renderHeader={(onCreateNote) => (
              <AppHeader
                darkMode={darkMode}
                onToggleTheme={toggleTheme}
                onCreateNote={onCreateNote}
              />
            )}
          />
        </div>
      </div>
    </AuthWrapper>
  );
};

export default NotesLayout;
