
import { Note, NoteAttachment, DatabaseNote, DatabaseNoteAttachment } from '@/types/Note';

export const convertDatabaseNote = (dbNote: DatabaseNote, attachments: DatabaseNoteAttachment[] = []): Note => ({
  id: dbNote.id,
  user_id: dbNote.user_id,
  title: dbNote.title,
  content: dbNote.content,
  color: dbNote.color,
  cover_image_url: dbNote.cover_image_url,
  is_pinned: dbNote.is_pinned,
  created_at: new Date(dbNote.created_at),
  updated_at: new Date(dbNote.updated_at),
  attachments: attachments.map(att => ({
    id: att.id,
    note_id: att.note_id,
    name: att.name,
    file_type: att.file_type,
    file_size: att.file_size,
    file_url: att.file_url,
    uploaded_at: new Date(att.uploaded_at)
  }))
});

export const filterAndSortNotes = (notes: Note[], searchTerm: string): Note[] => {
  return notes
    .filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
};
