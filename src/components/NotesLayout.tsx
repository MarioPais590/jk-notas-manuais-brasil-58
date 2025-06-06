
import React, { useState } from 'react';
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
          <AppHeader
            darkMode={darkMode}
            onToggleTheme={toggleTheme}
            onCreateNote={() => {
              console.log('Create note triggered from header');
              // Esta função será sobrescrita pelo NotesManager
            }}
          />
          <main className="container mx-auto px-4 py-6">
            <NotesManager 
              onCreateNote={() => console.log('Default create note')}
            />
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default NotesLayout;
