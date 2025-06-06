
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface NoteEditorContentProps {
  content: string;
  isEditing: boolean;
  onContentChange: (content: string) => void;
}

const NoteEditorContent: React.FC<NoteEditorContentProps> = ({
  content,
  isEditing,
  onContentChange,
}) => {
  return (
    <>
      {isEditing ? (
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Escreva sua nota aqui..."
          className="min-h-[300px] resize-none border-none px-0 focus-visible:ring-0"
        />
      ) : (
        <div className="min-h-[300px] whitespace-pre-wrap text-sm leading-relaxed">
          {content || (
            <span className="text-muted-foreground italic">
              Esta nota está vazia. Clique em "Editar" para adicionar conteúdo.
            </span>
          )}
        </div>
      )}
    </>
  );
};

export default NoteEditorContent;
