
import { User } from '@supabase/supabase-js';
import { Note, NoteAttachment } from '@/types/Note';

export interface NotesHookReturn {
  notes: Note[];
  user: User | null;
  loading: boolean;
  createNewNote: () => Promise<Note | null>;
  saveNote: (noteId: string, noteData: Partial<Note>) => Promise<Note | null>;
  deleteNote: (noteId: string) => Promise<void>;
  togglePinNote: (noteId: string) => Promise<boolean>;
  updateNoteColor: (noteId: string, color: string) => Promise<void>;
  uploadAttachment: (noteId: string, file: File) => Promise<NoteAttachment | null>;
  removeAttachment: (attachmentId: string, noteId: string) => Promise<void>;
  filterAndSortNotes: (searchTerm: string) => Note[];
  refetch: () => Promise<void>;
}
