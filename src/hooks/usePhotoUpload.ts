import { useState, useCallback } from 'react';
import { firebasePhotoService, PhotoUploadResult, UploadProgress } from '@/services/firebasePhotoService';

export interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
  timestamp: Date;
  location?: { lat: number; lng: number };
  uploadStatus?: 'pending' | 'uploading' | 'uploaded' | 'error';
  uploadProgress?: number;
  uploadResult?: PhotoUploadResult;
  error?: string;
}

export interface PhotoUploadState {
  photos: UploadedPhoto[];
  isUploading: boolean;
  uploadProgress: number;
  totalPhotos: number;
  uploadedPhotos: number;
  errors: string[];
}

export interface UsePhotoUploadReturn {
  // Estado
  state: PhotoUploadState;
  
  // Ações
  addPhotos: (files: File[], location?: { lat: number; lng: number }) => void;
  removePhoto: (photoId: string) => void;
  uploadPhotos: (visitId: string) => Promise<PhotoUploadResult[]>;
  clearPhotos: () => void;
  retryUpload: (photoId: string, visitId: string) => Promise<void>;
  
  // Utilitários
  getUploadedUrls: () => string[];
  hasErrors: () => boolean;
  canUpload: () => boolean;
}

export function usePhotoUpload(maxPhotos: number = 5): UsePhotoUploadReturn {
  const [state, setState] = useState<PhotoUploadState>({
    photos: [],
    isUploading: false,
    uploadProgress: 0,
    totalPhotos: 0,
    uploadedPhotos: 0,
    errors: []
  });

  /**
   * Adiciona novas fotos à lista
   */
  const addPhotos = useCallback((files: File[], location?: { lat: number; lng: number }) => {
    setState(prev => {
      const newPhotos: UploadedPhoto[] = [];
      
      Array.from(files).forEach((file) => {
        // Verificar limite de fotos
        if (prev.photos.length + newPhotos.length >= maxPhotos) return;
        
        // Verificar tipo de arquivo
        const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!acceptedTypes.includes(file.type)) {
          prev.errors.push(`Tipo de arquivo não suportado: ${file.name}`);
          return;
        }

        const id = Math.random().toString(36).substring(7);
        const preview = URL.createObjectURL(file);
        
        newPhotos.push({
          id,
          file,
          preview,
          timestamp: new Date(),
          location,
          uploadStatus: 'pending'
        });
      });

      return {
        ...prev,
        photos: [...prev.photos, ...newPhotos],
        errors: prev.errors
      };
    });
  }, [maxPhotos]);

  /**
   * Remove uma foto da lista
   */
  const removePhoto = useCallback((photoId: string) => {
    setState(prev => {
      const photoToRemove = prev.photos.find(p => p.id === photoId);
      
      // Revogar URL do preview para liberar memória
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }

      return {
        ...prev,
        photos: prev.photos.filter(p => p.id !== photoId)
      };
    });
  }, []);

  /**
   * Faz upload de todas as fotos pendentes
   */
  const uploadPhotos = useCallback(async (visitId: string): Promise<PhotoUploadResult[]> => {
    const pendingPhotos = state.photos.filter(p => p.uploadStatus === 'pending');
    
    if (pendingPhotos.length === 0) {
      return state.photos
        .filter(p => p.uploadResult)
        .map(p => p.uploadResult!);
    }

    setState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0,
      totalPhotos: pendingPhotos.length,
      uploadedPhotos: 0,
      errors: []
    }));

    const results: PhotoUploadResult[] = [];
    let uploadedCount = 0;

    try {
      for (const photo of pendingPhotos) {
        try {
          // Atualizar status para uploading
          setState(prev => ({
            ...prev,
            photos: prev.photos.map(p => 
              p.id === photo.id 
                ? { ...p, uploadStatus: 'uploading' as const, uploadProgress: 0 }
                : p
            )
          }));

          const result = await firebasePhotoService.uploadPhoto(
            photo.file,
            visitId,
            (progress) => {
              setState(prev => ({
                ...prev,
                photos: prev.photos.map(p => 
                  p.id === photo.id 
                    ? { ...p, uploadProgress: progress.progress }
                    : p
                ),
                uploadProgress: ((uploadedCount + (progress.progress / 100)) / pendingPhotos.length) * 100
              }));
            }
          );

          // Atualizar status para uploaded
          setState(prev => ({
            ...prev,
            photos: prev.photos.map(p => 
              p.id === photo.id 
                ? { 
                    ...p, 
                    uploadStatus: 'uploaded' as const, 
                    uploadProgress: 100,
                    uploadResult: result
                  }
                : p
            ),
            uploadedPhotos: uploadedCount + 1
          }));

          results.push(result);
          uploadedCount++;

        } catch (error) {
          console.error(`Erro no upload da foto ${photo.id}:`, error);
          
          setState(prev => ({
            ...prev,
            photos: prev.photos.map(p => 
              p.id === photo.id 
                ? { 
                    ...p, 
                    uploadStatus: 'error' as const,
                    error: error instanceof Error ? error.message : 'Erro desconhecido'
                  }
                : p
            ),
            errors: [...prev.errors, `Erro no upload: ${error}`]
          }));
        }
      }

      // Retornar todas as URLs (incluindo as já enviadas anteriormente)
      const allResults = state.photos
        .filter(p => p.uploadResult)
        .map(p => p.uploadResult!)
        .concat(results);

      return allResults;

    } finally {
      setState(prev => ({
        ...prev,
        isUploading: false
      }));
    }
  }, [state.photos]);

  /**
   * Tenta fazer upload novamente de uma foto que falhou
   */
  const retryUpload = useCallback(async (photoId: string, visitId: string) => {
    const photo = state.photos.find(p => p.id === photoId);
    if (!photo) return;

    try {
      setState(prev => ({
        ...prev,
        photos: prev.photos.map(p => 
          p.id === photoId 
            ? { ...p, uploadStatus: 'uploading' as const, uploadProgress: 0, error: undefined }
            : p
        )
      }));

      const result = await firebasePhotoService.uploadPhoto(
        photo.file,
        visitId,
        (progress) => {
          setState(prev => ({
            ...prev,
            photos: prev.photos.map(p => 
              p.id === photoId 
                ? { ...p, uploadProgress: progress.progress }
                : p
            )
          }));
        }
      );

      setState(prev => ({
        ...prev,
        photos: prev.photos.map(p => 
          p.id === photoId 
            ? { 
                ...p, 
                uploadStatus: 'uploaded' as const, 
                uploadProgress: 100,
                uploadResult: result,
                error: undefined
              }
            : p
        )
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        photos: prev.photos.map(p => 
          p.id === photoId 
            ? { 
                ...p, 
                uploadStatus: 'error' as const,
                error: error instanceof Error ? error.message : 'Erro desconhecido'
              }
            : p
        )
      }));
    }
  }, [state.photos]);

  /**
   * Limpa todas as fotos
   */
  const clearPhotos = useCallback(() => {
    setState(prev => {
      // Revogar todas as URLs de preview
      prev.photos.forEach(photo => {
        URL.revokeObjectURL(photo.preview);
      });

      return {
        photos: [],
        isUploading: false,
        uploadProgress: 0,
        totalPhotos: 0,
        uploadedPhotos: 0,
        errors: []
      };
    });
  }, []);

  /**
   * Retorna URLs das fotos já enviadas
   */
  const getUploadedUrls = useCallback((): string[] => {
    return state.photos
      .filter(p => p.uploadResult)
      .map(p => p.uploadResult!.url);
  }, [state.photos]);

  /**
   * Verifica se há erros
   */
  const hasErrors = useCallback((): boolean => {
    return state.errors.length > 0 || state.photos.some(p => p.uploadStatus === 'error');
  }, [state.errors, state.photos]);

  /**
   * Verifica se pode fazer upload
   */
  const canUpload = useCallback((): boolean => {
    return state.photos.length > 0 && 
           state.photos.some(p => p.uploadStatus === 'pending') && 
           !state.isUploading;
  }, [state.photos, state.isUploading]);

  return {
    state,
    addPhotos,
    removePhoto,
    uploadPhotos,
    clearPhotos,
    retryUpload,
    getUploadedUrls,
    hasErrors,
    canUpload
  };
}
