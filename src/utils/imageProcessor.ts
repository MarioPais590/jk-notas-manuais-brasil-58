export interface ImageProcessingResult {
  file: File;
  width: number;
  height: number;
  originalSize: number;
  processedSize: number;
}

export const COVER_IMAGE_CONFIG = {
  width: 1700,
  height: 700,
  allowedFormats: ['image/png', 'image/jpeg', 'image/jpg'],
  maxFileSize: 10 * 1024 * 1024, // 10MB limit (increased due to larger size)
};

export const validateImageFormat = (file: File): boolean => {
  return COVER_IMAGE_CONFIG.allowedFormats.includes(file.type.toLowerCase());
};

export const resizeImageToCanvas = (
  image: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Não foi possível criar contexto do canvas');
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Configurar DPI para 300 PPI
  const dpi = 300;
  const pixelRatio = dpi / 96; // 96 é o DPI padrão do navegador
  
  // Ajustar tamanho do canvas para 300 DPI
  canvas.style.width = `${targetWidth}px`;
  canvas.style.height = `${targetHeight}px`;
  canvas.width = targetWidth * pixelRatio;
  canvas.height = targetHeight * pixelRatio;
  
  // Escalar o contexto para manter as proporções corretas
  ctx.scale(pixelRatio, pixelRatio);

  // Calcular dimensões para manter proporção e fazer crop center
  const sourceRatio = image.width / image.height;
  const targetRatio = targetWidth / targetHeight;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.width;
  let sourceHeight = image.height;

  if (sourceRatio > targetRatio) {
    // Imagem muito larga, fazer crop horizontal
    sourceWidth = image.height * targetRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    // Imagem muito alta, fazer crop vertical
    sourceHeight = image.width / targetRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  // Configurações para melhor qualidade
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Usar algoritmo de redimensionamento em duas etapas para melhor qualidade
  // Primeiro redimensionar para uma resolução intermediária se a diferença for muito grande
  const scaleFactor = Math.min(sourceWidth / targetWidth, sourceHeight / targetHeight);
  
  if (scaleFactor > 2) {
    // Redimensionamento em duas etapas para melhor qualidade
    const intermediateWidth = targetWidth * 2;
    const intermediateHeight = targetHeight * 2;
    
    const intermediateCanvas = document.createElement('canvas');
    const intermediateCtx = intermediateCanvas.getContext('2d');
    
    if (intermediateCtx) {
      intermediateCanvas.width = intermediateWidth;
      intermediateCanvas.height = intermediateHeight;
      
      intermediateCtx.imageSmoothingEnabled = true;
      intermediateCtx.imageSmoothingQuality = 'high';
      
      // Primeira etapa: redimensionar para tamanho intermediário
      intermediateCtx.drawImage(
        image,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, intermediateWidth, intermediateHeight
      );
      
      // Segunda etapa: redimensionar do tamanho intermediário para o final
      ctx.drawImage(
        intermediateCanvas,
        0, 0, intermediateWidth, intermediateHeight,
        0, 0, targetWidth, targetHeight
      );
    } else {
      // Fallback para redimensionamento direto
      ctx.drawImage(
        image,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, targetWidth, targetHeight
      );
    }
  } else {
    // Redimensionamento direto quando a diferença não é muito grande
    ctx.drawImage(
      image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, targetWidth, targetHeight
    );
  }

  return canvas;
};

export const canvasToFile = (
  canvas: HTMLCanvasElement,
  fileName: string,
  format: string = 'image/png',
  quality: number = 0.95
): Promise<File> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Falha ao converter canvas para blob'));
          return;
        }
        
        const file = new File([blob], fileName, { type: format });
        resolve(file);
      },
      format,
      quality
    );
  });
};

export const processImageForCover = async (file: File): Promise<ImageProcessingResult> => {
  return new Promise((resolve, reject) => {
    // Validar formato
    if (!validateImageFormat(file)) {
      reject(new Error('Formato de arquivo não suportado. Use apenas PNG ou JPG.'));
      return;
    }

    // Validar tamanho
    if (file.size > COVER_IMAGE_CONFIG.maxFileSize) {
      reject(new Error('Arquivo muito grande. Máximo permitido: 2MB.'));
      return;
    }

    const img = new Image();
    
    img.onload = async () => {
      try {
        console.log(`Imagem original: ${img.width}x${img.height}`);
        
        // Redimensionar para o tamanho da capa com melhor qualidade
        const canvas = resizeImageToCanvas(
          img,
          COVER_IMAGE_CONFIG.width,
          COVER_IMAGE_CONFIG.height
        );

        // Converter canvas para arquivo com qualidade alta
        const processedFile = await canvasToFile(
          canvas,
          `cover_${Date.now()}.png`,
          'image/png',
          0.95
        );

        console.log(`Imagem processada: ${COVER_IMAGE_CONFIG.width}x${COVER_IMAGE_CONFIG.height}`);
        console.log(`Tamanho original: ${file.size} bytes, processado: ${processedFile.size} bytes`);

        // Limpar URL object para evitar vazamentos de memória
        URL.revokeObjectURL(img.src);

        resolve({
          file: processedFile,
          width: COVER_IMAGE_CONFIG.width,
          height: COVER_IMAGE_CONFIG.height,
          originalSize: file.size,
          processedSize: processedFile.size,
        });
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(new Error(`Erro ao processar imagem: ${error}`));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Erro ao carregar imagem. Verifique se o arquivo está válido.'));
    };

    // Carregar imagem
    img.src = URL.createObjectURL(file);
  });
};
