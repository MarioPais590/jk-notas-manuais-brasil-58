
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyNoteEditorProps {
  onCreateNote: () => void;
}

const EmptyNoteEditor: React.FC<EmptyNoteEditorProps> = ({ onCreateNote }) => {
  return (
    <div className="flex items-center justify-center h-96 bg-card rounded-lg border-2 border-dashed border-muted">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">
          Selecione uma nota para visualizar ou editar
        </p>
        <Button onClick={onCreateNote}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Nova Nota
        </Button>
      </div>
    </div>
  );
};

export default EmptyNoteEditor;
