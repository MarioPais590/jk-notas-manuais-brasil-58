
export interface NoteAttachment {
  id: string;
  note_id: string;
  name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_at: Date;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: string;
  cover_image_url: string | null;
  attachments?: NoteAttachment[];
  is_pinned: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: string;
  cover_image_url: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseNoteAttachment {
  id: string;
  note_id: string;
  name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_at: string;
}
