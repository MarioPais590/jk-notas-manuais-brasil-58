
import React from 'react';

// Regex para detectar URLs (http, https, www)
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;

export const processTextWithLinks = (text: string): React.ReactNode[] => {
  if (!text) return [];
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // Reset regex lastIndex
  URL_REGEX.lastIndex = 0;

  while ((match = URL_REGEX.exec(text)) !== null) {
    // Adicionar texto antes do link
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Processar o URL encontrado
    let url = match[0];
    let displayUrl = url;

    // Se o URL não começar com http/https, adicionar https://
    if (url.startsWith('www.')) {
      url = 'https://' + url;
    }

    // Criar elemento de link clicável
    parts.push(
      <a
        key={`link-${match.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
        onClick={(e) => e.stopPropagation()} // Evitar conflitos com seleção da nota
      >
        {displayUrl}
      </a>
    );

    lastIndex = URL_REGEX.lastIndex;
  }

  // Adicionar texto restante após o último link
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // Se não houve matches, retornar o texto original
  return parts.length === 0 ? [text] : parts;
};

// Função para processar texto linha por linha (preservando quebras de linha)
export const processTextWithLinksAndLineBreaks = (text: string): React.ReactNode => {
  if (!text) return null;

  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => (
    <React.Fragment key={lineIndex}>
      {processTextWithLinks(line)}
      {lineIndex < lines.length - 1 && <br />}
    </React.Fragment>
  ));
};
