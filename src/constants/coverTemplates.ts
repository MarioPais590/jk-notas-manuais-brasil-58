
export interface CoverTemplate {
  id: string;
  name: string;
  path: string;
  thumbnail: string;
  category?: string;
}

// Templates usando caminhos relativos que funcionam melhor no PWA
export const COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: 'template-1',
    name: 'Abstrato Azul',
    path: './template-1.webp',
    thumbnail: './template-1.webp',
    category: 'abstract'
  },
  {
    id: 'template-2',
    name: 'Natureza Verde',
    path: './template-2.webp',
    thumbnail: './template-2.webp',
    category: 'nature'
  },
  {
    id: 'template-3',
    name: 'Geométrico Rosa',
    path: './template-3.webp',
    thumbnail: './template-3.webp',
    category: 'geometric'
  },
  {
    id: 'template-4',
    name: 'Minimalista',
    path: './template-4.webp',
    thumbnail: './template-4.webp',
    category: 'minimal'
  },
  {
    id: 'template-5',
    name: 'Gradiente Roxo',
    path: './template-5.webp',
    thumbnail: './template-5.webp',
    category: 'gradient'
  },
  {
    id: 'template-6',
    name: 'Textura Dourada',
    path: './template-6.webp',
    thumbnail: './template-6.webp',
    category: 'texture'
  },
  {
    id: 'template-7',
    name: 'Ondas Azuis',
    path: './template-7.webp',
    thumbnail: './template-7.webp',
    category: 'abstract'
  },
  {
    id: 'template-8',
    name: 'Floresta',
    path: './template-8.webp',
    thumbnail: './template-8.webp',
    category: 'nature'
  },
  {
    id: 'template-9',
    name: 'Cristais',
    path: './template-9.webp',
    thumbnail: './template-9.webp',
    category: 'geometric'
  },
  {
    id: 'template-10',
    name: 'Oceano',
    path: './template-10.webp',
    thumbnail: './template-10.webp',
    category: 'nature'
  }
];

export const getCoverTemplate = (id: string): CoverTemplate | undefined => {
  return COVER_TEMPLATES.find(template => template.id === id);
};

export const getCoverTemplatesByCategory = (category: string): CoverTemplate[] => {
  return COVER_TEMPLATES.filter(template => template.category === category);
};

// Função para pré-carregar templates de forma otimizada
export const preloadCoverTemplates = () => {
  if (typeof window === 'undefined') return;
  
  COVER_TEMPLATES.forEach(template => {
    const img = new Image();
    img.src = template.path;
    // Não adicionamos ao DOM, apenas pré-carregamos na memória
  });
};
