
import { useState, useEffect } from 'react';
import { Note } from '@/types/Note';

export function useNoteEditorState(note: Note) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [coverImage, setCoverImage] = useState(note.cover_image_url);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setCoverPreview(null);
  }, [note]);

  return {
    title,
    setTitle,
    content,
    setContent,
    coverImage,
    setCoverImage,
    shareModalOpen,
    setShareModalOpen,
    downloadModalOpen,
    setDownloadModalOpen,
    uploadingCover,
    setUploadingCover,
    coverPreview,
    setCoverPreview,
  };
}
