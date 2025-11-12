/**
 * Utilitário para compressão de imagens
 * Garante que a imagem fique abaixo de um tamanho máximo especificado
 */

import logger from '@/lib/logger';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxSizeMB: 1,
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8
};

/**
 * Comprime uma imagem para garantir que fique abaixo do tamanho máximo especificado
 * @param file Arquivo de imagem a ser comprimido
 * @param options Opções de compressão
 * @returns Promise com o arquivo comprimido
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const maxSizeBytes = opts.maxSizeMB * 1024 * 1024;

  // Se o arquivo já está abaixo do tamanho máximo, retornar sem compressão
  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Não foi possível criar contexto do canvas'));
      return;
    }

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img;
      
      // Redimensionar se exceder dimensões máximas
      if (width > opts.maxWidth || height > opts.maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = Math.min(width, opts.maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, opts.maxHeight);
          width = height * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Tentar diferentes níveis de qualidade até ficar abaixo do tamanho máximo
      let currentWidth = width;
      let currentHeight = height;
      let attempts = 0;
      const maxAttempts = 20; // Limite de tentativas para evitar loop infinito

      const tryCompress = (quality: number, currentW: number, currentH: number): void => {
        attempts++;
        
        // Limite de segurança para evitar loop infinito
        if (attempts > maxAttempts) {
          logger.warn('Limite de tentativas de compressão atingido, retornando melhor resultado');
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.1
          );
          return;
        }

        // Atualizar dimensões do canvas se necessário
        if (canvas.width !== currentW || canvas.height !== currentH) {
          canvas.width = currentW;
          canvas.height = currentH;
          ctx.drawImage(img, 0, 0, currentW, currentH);
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Se falhar, retornar arquivo original
              return;
            }

            // Se o tamanho está OK, criar arquivo e retornar
            if (blob.size <= maxSizeBytes) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg', // Sempre usar JPEG para melhor compressão
                lastModified: Date.now()
              });
              resolve(compressedFile);
              return;
            }

            // Se ainda está grande, reduzir qualidade e tentar novamente
            if (quality > 0.1) {
              tryCompress(Math.max(0.1, quality - 0.1), currentW, currentH);
            } else {
              // Se qualidade mínima ainda não resolve, reduzir dimensões
              const minDimension = 400; // Dimensão mínima
              if (currentW > minDimension && currentH > minDimension) {
                const newWidth = Math.max(minDimension, Math.floor(currentW * 0.8));
                const newHeight = Math.max(minDimension, Math.floor(currentH * 0.8));
                tryCompress(0.7, newWidth, newHeight);
              } else {
                // Último recurso: retornar o menor que conseguimos
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              }
            }
          },
          'image/jpeg',
          quality
        );
      };

      // Começar com a qualidade especificada
      tryCompress(opts.quality, currentWidth, currentHeight);
    };

    img.onerror = () => {
      reject(new Error('Erro ao carregar imagem'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Verifica se o navegador suporta compressão de imagens
 */
export function supportsImageCompression(): boolean {
  return !!(
    typeof HTMLCanvasElement !== 'undefined' &&
    HTMLCanvasElement.prototype.toBlob
  );
}

