
export interface CoverTemplate {
  id: string;
  name: string;
  path: string;
  thumbnail: string;
  category?: string;
}

export const COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: 'template-1',
    name: 'Abstrato Azul',
    path: '/lovable-uploads/template-1.webp',
    thumbnail: '/lovable-uploads/template-1.webp',
    category: 'abstract'
  },
  {
    id: 'template-2',
    name: 'Natureza Verde',
    path: '/lovable-uploads/template-2.webp',
    thumbnail: '/lovable-uploads/template-2.webp',
    category: 'nature'
  },
  {
    id: 'template-3',
    name: 'Geométrico Rosa',
    path: '/lovable-uploads/template-3.webp',
    thumbnail: '/lovable-uploads/template-3.webp',
    category: 'geometric'
  },
  {
    id: 'template-4',
    name: 'Minimalista',
    path: '/lovable-uploads/template-4.webp',
    thumbnail: '/lovable-uploads/template-4.webp',
    category: 'minimal'
  },
  {
    id: 'template-5',
    name: 'Gradiente Roxo',
    path: '/lovable-uploads/template-5.webp',
    thumbnail: '/lovable-uploads/template-5.webp',
    category: 'gradient'
  },
  {
    id: 'template-6',
    name: 'Textura Dourada',
    path: '/lovable-uploads/template-6.webp',
    thumbnail: '/lovable-uploads/template-6.webp',
    category: 'texture'
  },
  {
    id: 'template-7',
    name: 'Ondas Azuis',
    path: '/lovable-uploads/template-7.webp',
    thumbnail: '/lovable-uploads/template-7.webp',
    category: 'abstract'
  },
  {
    id: 'template-8',
    name: 'Floresta',
    path: '/lovable-uploads/template-8.webp',
    thumbnail: '/lovable-uploads/template-8.webp',
    category: 'nature'
  },
  {
    id: 'template-9',
    name: 'Cristais',
    path: '/lovable-uploads/template-9.webp',
    thumbnail: '/lovable-uploads/template-9.webp',
    category: 'geometric'
  },
  {
    id: 'template-10',
    name: 'Oceano',
    path: '/lovable-uploads/template-10.webp',
    thumbnail: '/lovable-uploads/template-10.webp',
    category: 'nature'
  }
];

export const getCoverTemplate = (id: string): CoverTemplate | undefined => {
  return COVER_TEMPLATES.find(template => template.id === id);
};

export const getCoverTemplatesByCategory = (category: string): CoverTemplate[] => {
  return COVER_TEMPLATES.filter(template => template.category === category);
};
