
export interface ImageProcessingResult {
  file: File;
  width: number;
  height: number;
  originalSize: number;
  processedSize: number;
}

export const COVER_IMAGE_CONFIG = {
  width: 70,
  height: 150,
  allowedFormats: ['image/png', 'image/jpeg', 'image/jpg'],
  maxFileSize: 2 * 1024 * 1024, // 2MB
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

  // Desenhar imagem redimensionada no canvas
  ctx.drawImage(
    image,
    sourceX, sourceY, sourceWidth, sourceHeight,
    0, 0, targetWidth, targetHeight
  );

  return canvas;
};

export const canvasToFile = (
  canvas: HTMLCanvasElement,
  fileName: string,
  format: string = 'image/png',
  quality: number = 0.9
): Promise<File> => {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error('Falha ao converter canvas para blob');
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
        
        // Redimensionar para o tamanho da capa
        const canvas = resizeImageToCanvas(
          img,
          COVER_IMAGE_CONFIG.width,
          COVER_IMAGE_CONFIG.height
        );

        // Converter canvas para arquivo
        const processedFile = await canvasToFile(
          canvas,
          `cover_${Date.now()}.png`,
          'image/png',
          0.9
        );

        console.log(`Imagem processada: ${COVER_IMAGE_CONFIG.width}x${COVER_IMAGE_CONFIG.height}`);
        console.log(`Tamanho original: ${file.size} bytes, processado: ${processedFile.size} bytes`);

        resolve({
          file: processedFile,
          width: COVER_IMAGE_CONFIG.width,
          height: COVER_IMAGE_CONFIG.height,
          originalSize: file.size,
          processedSize: processedFile.size,
        });
      } catch (error) {
        reject(new Error(`Erro ao processar imagem: ${error}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Erro ao carregar imagem. Verifique se o arquivo está válido.'));
    };

    // Carregar imagem
    img.src = URL.createObjectURL(file);
  });
};
