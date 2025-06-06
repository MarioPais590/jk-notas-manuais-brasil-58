
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface NotesSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const NotesSearch: React.FC<NotesSearchProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar notas..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default NotesSearch;
