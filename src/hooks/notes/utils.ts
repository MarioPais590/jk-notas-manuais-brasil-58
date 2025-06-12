
import { Note, DatabaseNote, DatabaseNoteAttachment, NoteAttachment } from '@/types/Note';

export function convertDatabaseNote(
  dbNote: DatabaseNote, 
  dbAttachments: DatabaseNoteAttachment[] = []
): Note {
  const attachments: NoteAttachment[] = dbAttachments.map(att => ({
    id: att.id,
    note_id: att.note_id,
    name: att.name,
    file_type: att.file_type,
    file_size: att.file_size,
    file_url: att.file_url,
    uploaded_at: new Date(att.uploaded_at),
  }));

  return {
    id: dbNote.id,
    user_id: dbNote.user_id,
    title: dbNote.title || 'Sem título',
    content: dbNote.content || '',
    color: dbNote.color || '#3B82F6',
    cover_image_url: dbNote.cover_image_url,
    attachments,
    is_pinned: dbNote.is_pinned || false,
    created_at: new Date(dbNote.created_at || Date.now()),
    updated_at: new Date(dbNote.updated_at || Date.now()),
  };
}

export function filterAndSortNotes(notes: Note[], searchTerm: string): Note[] {
  let filteredNotes = notes;

  // Filtrar por termo de busca se fornecido
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filteredNotes = notes.filter(note => 
      note.title.toLowerCase().includes(term) ||
      note.content.toLowerCase().includes(term)
    );
  }

  // Ordenar: notas fixadas primeiro, depois por data de atualização (mais recentes primeiro)
  return filteredNotes.sort((a, b) => {
    // Primeiro critério: notas fixadas vêm primeiro
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    
    // Segundo critério: data de atualização (mais recente primeiro)
    return b.updated_at.getTime() - a.updated_at.getTime();
  });
}
