
export interface CoverTemplate {
  id: string;
  name: string;
  path: string;
  thumbnail: string;
}

// Templates usando as imagens .webp fornecidas pelo usuário
export const COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: 'template-1',
    name: 'Capa 1',
    path: '/lovable-uploads/template-1.webp',
    thumbnail: '/lovable-uploads/template-1.webp'
  },
  {
    id: 'template-2',
    name: 'Capa 2',
    path: '/lovable-uploads/template-2.webp',
    thumbnail: '/lovable-uploads/template-2.webp'
  },
  {
    id: 'template-3',
    name: 'Capa 3',
    path: '/lovable-uploads/template-3.webp',
    thumbnail: '/lovable-uploads/template-3.webp'
  },
  {
    id: 'template-4',
    name: 'Capa 4',
    path: '/lovable-uploads/template-4.webp',
    thumbnail: '/lovable-uploads/template-4.webp'
  },
  {
    id: 'template-5',
    name: 'Capa 5',
    path: '/lovable-uploads/template-5.webp',
    thumbnail: '/lovable-uploads/template-5.webp'
  },
  {
    id: 'template-6',
    name: 'Capa 6',
    path: '/lovable-uploads/template-6.webp',
    thumbnail: '/lovable-uploads/template-6.webp'
  },
  {
    id: 'template-7',
    name: 'Capa 7',
    path: '/lovable-uploads/template-7.webp',
    thumbnail: '/lovable-uploads/template-7.webp'
  },
  {
    id: 'template-8',
    name: 'Capa 8',
    path: '/lovable-uploads/template-8.webp',
    thumbnail: '/lovable-uploads/template-8.webp'
  },
  {
    id: 'template-9',
    name: 'Capa 9',
    path: '/lovable-uploads/template-9.webp',
    thumbnail: '/lovable-uploads/template-9.webp'
  },
  {
    id: 'template-10',
    name: 'Capa 10',
    path: '/lovable-uploads/template-10.webp',
    thumbnail: '/lovable-uploads/template-10.webp'
  }
];

export const getCoverTemplate = (id: string): CoverTemplate | undefined => {
  return COVER_TEMPLATES.find(template => template.id === id);
};
