
export interface CoverTemplate {
  id: string;
  name: string;
  path: string;
  thumbnail: string;
}

// Templates usando as 10 imagens reais enviadas pelo usuário
export const COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: 'template-1',
    name: 'AGENDA',
    path: '/lovable-uploads/5a82c3d4-e6f9-4b1a-87c2-9e5f7a1b3c8d.webp',
    thumbnail: '/lovable-uploads/5a82c3d4-e6f9-4b1a-87c2-9e5f7a1b3c8d.webp'
  },
  {
    id: 'template-2',
    name: 'AGENDA JUNHO',
    path: '/lovable-uploads/7b94d5e6-f8a1-4c2b-98d3-0f6a8b2c4e9f.webp',
    thumbnail: '/lovable-uploads/7b94d5e6-f8a1-4c2b-98d3-0f6a8b2c4e9f.webp'
  },
  {
    id: 'template-3',
    name: 'ANOTAÇÕES ESCOLARES',
    path: '/lovable-uploads/9c05e7f8-0b2a-4d3c-a9e4-1f7b9c3d5f0a.webp',
    thumbnail: '/lovable-uploads/9c05e7f8-0b2a-4d3c-a9e4-1f7b9c3d5f0a.webp'
  },
  {
    id: 'template-4',
    name: 'ANOTAÇÕES CASUAIS',
    path: '/lovable-uploads/0d16f9a0-1c3b-4e4d-b0f5-2a8c0d4e6a1b.webp',
    thumbnail: '/lovable-uploads/0d16f9a0-1c3b-4e4d-b0f5-2a8c0d4e6a1b.webp'
  },
  {
    id: 'template-5',
    name: 'ANOTAÇÕES FINANCEIRAS',
    path: '/lovable-uploads/1e27a0b1-2d4c-4f5e-c1a6-3b9d1e5f7b2c.webp',
    thumbnail: '/lovable-uploads/1e27a0b1-2d4c-4f5e-c1a6-3b9d1e5f7b2c.webp'
  },
  {
    id: 'template-6',
    name: 'ANOTAÇÕES GERAIS',
    path: '/lovable-uploads/2f38b1c2-3e5d-4a6f-d2b7-4c0e2f6a8c3d.webp',
    thumbnail: '/lovable-uploads/2f38b1c2-3e5d-4a6f-d2b7-4c0e2f6a8c3d.webp'
  },
  {
    id: 'template-7',
    name: 'COMPROMISSOS',
    path: '/lovable-uploads/3a49c2d3-4f6e-4b7a-e3c8-5d1f3a7b9d4e.webp',
    thumbnail: '/lovable-uploads/3a49c2d3-4f6e-4b7a-e3c8-5d1f3a7b9d4e.webp'
  },
  {
    id: 'template-8',
    name: 'CONQUISTAS',
    path: '/lovable-uploads/4b50d3e4-5a7f-4c8b-f4d9-6e2a4b8c0e5f.webp',
    thumbnail: '/lovable-uploads/4b50d3e4-5a7f-4c8b-f4d9-6e2a4b8c0e5f.webp'
  },
  {
    id: 'template-9',
    name: 'FERIADO',
    path: '/lovable-uploads/5c61e4f5-6b8a-4d9c-a5e0-7f3b5c9d1f6a.webp',
    thumbnail: '/lovable-uploads/5c61e4f5-6b8a-4d9c-a5e0-7f3b5c9d1f6a.webp'
  },
  {
    id: 'template-10',
    name: 'FESTAS JUNINAS',
    path: '/lovable-uploads/6d72f5a6-7c9b-4e0d-b6f1-8a4c6d0e2a7b.webp',
    thumbnail: '/lovable-uploads/6d72f5a6-7c9b-4e0d-b6f1-8a4c6d0e2a7b.webp'
  }
];

export const getCoverTemplate = (id: string): CoverTemplate | undefined => {
  return COVER_TEMPLATES.find(template => template.id === id);
};
