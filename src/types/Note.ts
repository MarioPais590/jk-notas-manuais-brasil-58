
export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  coverImage: string | null;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}
