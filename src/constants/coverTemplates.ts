
export interface CoverTemplate {
  id: string;
  name: string;
  path: string;
  thumbnail: string;
  category?: string;
}

// Templates usando URLs do Unsplash como fallback confiável para o PWA
export const COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: 'template-1',
    name: 'Abstrato Azul',
    path: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1700&h=700&fit=crop&auto=format&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=340&h=140&fit=crop&auto=format&q=80',
    category: 'abstract'
  },
  {
    id: 'template-2',
    name: 'Natureza Verde',
    path: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1700&h=700&fit=crop&auto=format&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=340&h=140&fit=crop&auto=format&q=80',
    category: 'nature'
  },
  {
    id: 'template-3',
    name: 'Geométrico Rosa',
    path: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1700&h=700&fit=crop&auto=format&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=340&h=140&fit=crop&auto=format&q=80',
    category: 'geometric'
  },
  {
    id: 'template-4',
    name: 'Minimalista',
    path: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1700&h=700&fit=crop&auto=format&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=340&h=140&fit=crop&auto=format&q=80',
    category: 'minimal'
  },
  {
    id: 'template-5',
    name: 'Gradiente Roxo',
    path: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1700&h=700&fit=crop&auto=format&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=340&h=140&fit=crop&auto=format&q=80',
    category: 'gradient'
  },
  {
    id: 'template-6',
    name: 'Textura Dourada',
    path: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1700&h=700&fit=crop&auto=format&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=340&h=140&fit=crop&auto=format&q=80',
    category: 'texture'
  },
  {
    id: 'template-7',
    name: 'Ondas Azuis',
    path: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1700&h=700&fit=crop&auto=format&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=340&h=140&fit=crop&auto=format&q=80',
    category: 'abstract'
  },
  {
    id: 'template-8',
    name: 'Floresta',
    path: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1700&h=700&fit=crop&auto=format&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=340&h=140&fit=crop&auto=format&q=80',
    category: 'nature'
  },
  {
    id: 'template-9',
    name: 'Cristais',
    path: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1700&h=700&fit=crop&auto=format&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=340&h=140&fit=crop&auto=format&q=80',
    category: 'geometric'
  },
  {
    id: 'template-10',
    name: 'Oceano',
    path: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1700&h=700&fit=crop&auto=format&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=340&h=140&fit=crop&auto=format&q=80',
    category: 'nature'
  }
];

export const getCoverTemplate = (id: string): CoverTemplate | undefined => {
  return COVER_TEMPLATES.find(template => template.id === id);
};

export const getCoverTemplatesByCategory = (category: string): CoverTemplate[] => {
  return COVER_TEMPLATES.filter(template => template.category === category);
};

// Não pré-carregar mais - fazer isso apenas quando necessário
export const preloadCoverTemplates = () => {
  console.log('Templates serão carregados sob demanda para otimizar performance');
};
