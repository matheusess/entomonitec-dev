import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  UploadTask,
  uploadBytesResumable
} from 'firebase/storage';
import { storage } from '@/lib/firebase';
import logger from '@/lib/logger';
import { compressImage } from '@/lib/imageCompression';

export interface PhotoUploadResult {
  url: string;
  fileName: string;
  size: number;
  uploadedAt: Date;
}

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

class FirebasePhotoService {
  private readonly STORAGE_PATH = 'visits';
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  /**
   * Faz upload de uma única foto para o Firebase Storage
   */
  async uploadPhoto(
    file: File, 
    visitId: string, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<PhotoUploadResult> {
    try {
      // Validar arquivo
      this.validateFile(file);

      // Comprimir imagem se necessário
      const compressedFile = await this.compressImageFile(file);

      // Gerar nome único para o arquivo
      const fileName = this.generateFileName(compressedFile, visitId);
      const storageRef = ref(storage, `${this.STORAGE_PATH}/${visitId}/photos/${fileName}`);

      // Fazer upload com progress tracking
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.({
              progress,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes
            });
          },
          (error) => {
            logger.error('❌ Erro no upload da foto:', error);
            reject(new Error(`Falha no upload: ${error.message}`));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              logger.log('✅ Foto enviada com sucesso:', fileName);
              
              resolve({
                url: downloadURL,
                fileName,
                size: compressedFile.size,
                uploadedAt: new Date()
              });
            } catch (error) {
              reject(new Error(`Falha ao obter URL: ${error}`));
            }
          }
        );
      });
    } catch (error) {
      logger.error('❌ Erro no upload da foto:', error);
      throw error;
    }
  }

  /**
   * Faz upload de múltiplas fotos
   */
  async uploadPhotos(
    files: File[], 
    visitId: string,
    onProgress?: (photoIndex: number, progress: UploadProgress) => void
  ): Promise<PhotoUploadResult[]> {
    const results: PhotoUploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadPhoto(
          files[i], 
          visitId, 
          (progress) => onProgress?.(i, progress)
        );
        results.push(result);
      } catch (error) {
        logger.error(`❌ Erro no upload da foto ${i + 1}:`, error);
        throw new Error(`Falha no upload da foto ${i + 1}: ${error}`);
      }
    }

    return results;
  }

  /**
   * Remove uma foto do Firebase Storage
   */
  async deletePhoto(photoUrl: string): Promise<void> {
    try {
      // Extrair o path do arquivo da URL
      const url = new URL(photoUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
      
      if (!pathMatch) {
        throw new Error('URL inválida para exclusão');
      }

      const filePath = decodeURIComponent(pathMatch[1]);
      const photoRef = ref(storage, filePath);
      
      await deleteObject(photoRef);
      logger.log('✅ Foto removida com sucesso:', filePath);
    } catch (error) {
      logger.error('❌ Erro ao remover foto:', error);
      throw new Error(`Falha ao remover foto: ${error}`);
    }
  }

  /**
   * Remove múltiplas fotos
   */
  async deletePhotos(photoUrls: string[]): Promise<void> {
    const deletePromises = photoUrls.map(url => this.deletePhoto(url));
    await Promise.allSettled(deletePromises);
  }

  /**
   * Valida se o arquivo é válido para upload
   */
  private validateFile(file: File): void {
    if (!this.ACCEPTED_TYPES.includes(file.type)) {
      throw new Error(`Tipo de arquivo não suportado: ${file.type}`);
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo: 5MB`);
    }
  }

  /**
   * Comprime a imagem se necessário
   * Usa a função utilitária que garante que a imagem fique abaixo de 1MB
   */
  private async compressImageFile(file: File): Promise<File> {
    // Usar a função utilitária de compressão que garante 1MB máximo
    return compressImage(file, { maxSizeMB: 1 });
  }

  /**
   * Gera nome único para o arquivo
   */
  private generateFileName(file: File, visitId: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    
    return `${timestamp}_${randomId}.${extension}`;
  }

  /**
   * Verifica conectividade com Firebase Storage
   */
  async checkConnectivity(): Promise<boolean> {
    try {
      // Tentar fazer upload de um arquivo de teste pequeno
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testRef = ref(storage, 'test/connectivity.txt');
      
      await uploadBytes(testRef, testBlob);
      await deleteObject(testRef);
      
      return true;
    } catch (error) {
      logger.warn('Firebase Storage offline:', error);
      return false;
    }
  }
}

export const firebasePhotoService = new FirebasePhotoService();
