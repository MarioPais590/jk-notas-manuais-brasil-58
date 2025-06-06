
import React from 'react';
import { Plus, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onCreateNote: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  darkMode,
  onToggleTheme,
  onCreateNote,
}) => {
  return (
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
              onClick={onToggleTheme}
              className="h-9 w-9"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button onClick={onCreateNote} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Nota
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
