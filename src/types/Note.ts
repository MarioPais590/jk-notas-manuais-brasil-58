
export interface NoteAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 data
  uploadedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  coverImage: string | null;
  attachments: NoteAttachment[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}
