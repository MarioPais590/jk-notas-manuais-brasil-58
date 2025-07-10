
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
    name: 'Capa Abstrata Azul',
    path: '/lovable-uploads/2b48d652-1aa0-4a0f-b7ed-4ffb7a3c6c12.webp',
    thumbnail: '/lovable-uploads/2b48d652-1aa0-4a0f-b7ed-4ffb7a3c6c12.webp'
  },
  {
    id: 'template-2',
    name: 'Capa Gradiente Roxo',
    path: '/lovable-uploads/6b28a55c-c95c-4d88-86f6-99f5b6089eb9.webp',
    thumbnail: '/lovable-uploads/6b28a55c-c95c-4d88-86f6-99f5b6089eb9.webp'
  },
  {
    id: 'template-3',
    name: 'Capa Abstrata Verde',
    path: '/lovable-uploads/0a6f5b34-f5ad-4faf-b2b6-c2e0b6e1b8c7.webp',
    thumbnail: '/lovable-uploads/0a6f5b34-f5ad-4faf-b2b6-c2e0b6e1b8c7.webp'
  },
  {
    id: 'template-4',
    name: 'Capa Geométrica Rosa',
    path: '/lovable-uploads/e5a7c2d3-4b8f-4c9e-a1d6-f3e2b5c8d9a0.webp',
    thumbnail: '/lovable-uploads/e5a7c2d3-4b8f-4c9e-a1d6-f3e2b5c8d9a0.webp'
  },
  {
    id: 'template-5',
    name: 'Capa Ondas Azuis',
    path: '/lovable-uploads/b3f4e5d6-7c8a-4e9f-b2d5-c6a9e8f1b4d7.webp',
    thumbnail: '/lovable-uploads/b3f4e5d6-7c8a-4e9f-b2d5-c6a9e8f1b4d7.webp'
  },
  {
    id: 'template-6',
    name: 'Capa Abstrata Laranja',
    path: '/lovable-uploads/f8c1d2e3-5b6a-4f7e-c8d1-e4b7a0c3f6e9.webp',
    thumbnail: '/lovable-uploads/f8c1d2e3-5b6a-4f7e-c8d1-e4b7a0c3f6e9.webp'
  },
  {
    id: 'template-7',
    name: 'Capa Gradiente Azul',
    path: '/lovable-uploads/a9e2f3c4-6d7b-4a8c-f1e4-b7c0d3e6f9a2.webp',
    thumbnail: '/lovable-uploads/a9e2f3c4-6d7b-4a8c-f1e4-b7c0d3e6f9a2.webp'
  },
  {
    id: 'template-8',
    name: 'Capa Formas Coloridas',
    path: '/lovable-uploads/d4c7f0e1-8b9a-4c5d-e2f5-a8b1c4d7e0f3.webp',
    thumbnail: '/lovable-uploads/d4c7f0e1-8b9a-4c5d-e2f5-a8b1c4d7e0f3.webp'
  },
  {
    id: 'template-9',
    name: 'Capa Abstrata Roxa',
    path: '/lovable-uploads/c5f8a1b2-9d0c-4e6f-b3a6-d9c2e5f8a1b4.webp',
    thumbnail: '/lovable-uploads/c5f8a1b2-9d0c-4e6f-b3a6-d9c2e5f8a1b4.webp'
  },
  {
    id: 'template-10',
    name: 'Capa Gradiente Verde',
    path: '/lovable-uploads/e0b3c6d9-1a4e-4f7a-c0d3-e6f9b2c5d8e1.webp',
    thumbnail: '/lovable-uploads/e0b3c6d9-1a4e-4f7a-c0d3-e6f9b2c5d8e1.webp'
  }
];

export const getCoverTemplate = (id: string): CoverTemplate | undefined => {
  return COVER_TEMPLATES.find(template => template.id === id);
};
