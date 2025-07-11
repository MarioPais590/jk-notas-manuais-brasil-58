
export interface CoverTemplate {
  id: string;
  name: string;
  path: string;
  thumbnail: string;
}

// URLs corretas das imagens no Supabase Storage
const SUPABASE_URL = "https://pedsmvjutwiwrjnqcymo.supabase.co";
const STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/templates-covers`;

// Templates usando as 10 imagens reais enviadas pelo usuário
export const COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: 'template-1',
    name: 'AGENDA',
    path: `${STORAGE_BASE_URL}/agenda.webp`,
    thumbnail: `${STORAGE_BASE_URL}/agenda.webp`
  },
  {
    id: 'template-2',
    name: 'AGENDA JUNHO',
    path: `${STORAGE_BASE_URL}/agenda-junho.webp`,
    thumbnail: `${STORAGE_BASE_URL}/agenda-junho.webp`
  },
  {
    id: 'template-3',
    name: 'ANOTAÇÕES ESCOLARES',
    path: `${STORAGE_BASE_URL}/anotacoes-escolares.webp`,
    thumbnail: `${STORAGE_BASE_URL}/anotacoes-escolares.webp`
  },
  {
    id: 'template-4',
    name: 'ANOTAÇÕES CASUAIS',
    path: `${STORAGE_BASE_URL}/anotacoes-casuais.webp`,
    thumbnail: `${STORAGE_BASE_URL}/anotacoes-casuais.webp`
  },
  {
    id: 'template-5',
    name: 'ANOTAÇÕES FINANCEIRAS',
    path: `${STORAGE_BASE_URL}/anotacoes-financeiras.webp`,
    thumbnail: `${STORAGE_BASE_URL}/anotacoes-financeiras.webp`
  },
  {
    id: 'template-6',
    name: 'ANOTAÇÕES GERAIS',
    path: `${STORAGE_BASE_URL}/anotacoes-gerais.webp`,
    thumbnail: `${STORAGE_BASE_URL}/anotacoes-gerais.webp`
  },
  {
    id: 'template-7',
    name: 'COMPROMISSOS',
    path: `${STORAGE_BASE_URL}/compromissos.webp`,
    thumbnail: `${STORAGE_BASE_URL}/compromissos.webp`
  },
  {
    id: 'template-8',
    name: 'CONQUISTAS',
    path: `${STORAGE_BASE_URL}/conquistas.webp`,
    thumbnail: `${STORAGE_BASE_URL}/conquistas.webp`
  },
  {
    id: 'template-9',
    name: 'FERIADO',
    path: `${STORAGE_BASE_URL}/feriado.webp`,
    thumbnail: `${STORAGE_BASE_URL}/feriado.webp`
  },
  {
    id: 'template-10',
    name: 'FESTAS JUNINAS',
    path: `${STORAGE_BASE_URL}/festas-juninas.webp`,
    thumbnail: `${STORAGE_BASE_URL}/festas-juninas.webp`
  }
];

export const getCoverTemplate = (id: string): CoverTemplate | undefined => {
  return COVER_TEMPLATES.find(template => template.id === id);
};
