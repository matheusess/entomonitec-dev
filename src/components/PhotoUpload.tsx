import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Eye, Download, AlertCircle, CheckCircle, RefreshCw, Camera } from 'lucide-react';
import { usePhotoUpload, UploadedPhoto } from '@/hooks/usePhotoUpload';
import logger from '@/lib/logger';
import { compressImage } from '@/lib/imageCompression';
import CameraModal from './CameraModal';

interface PhotoUploadProps {
  onPhotosChange?: (photos: UploadedPhoto[]) => void;
  onUploadUrls?: (urls: string[]) => void;
  maxPhotos?: number;
  acceptedTypes?: string[];
  visitId?: string;
  autoUpload?: boolean;
  useFirebaseStorage?: boolean; // Nova prop para controlar se usa Firebase Storage ou base64
}

export default function PhotoUpload({ 
  onPhotosChange,
  onUploadUrls,
  maxPhotos = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  visitId,
  autoUpload = false,
  useFirebaseStorage = false
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  
  // Estado para o sistema original (base64)
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  
  // Hook para Firebase Storage (só usado quando useFirebaseStorage = true)
  const {
    state: firebaseState,
    addPhotos: addPhotosFirebase,
    removePhoto: removePhotoFirebase,
    uploadPhotos: uploadPhotosFirebase,
    retryUpload,
    getUploadedUrls,
    hasErrors,
    canUpload
  } = usePhotoUpload(maxPhotos);

  // Usar o sistema apropriado baseado na prop
  const currentState = useFirebaseStorage ? firebaseState : { photos, isUploading: false, uploadProgress: 0, totalPhotos: 0, uploadedPhotos: 0, errors: [] };
  const currentPhotos = useFirebaseStorage ? firebaseState.photos : photos;

  // Função para adicionar fotos (escolhe o sistema apropriado)
  const addPhotos = useFirebaseStorage ? addPhotosFirebase : (files: File[], location?: { lat: number; lng: number }) => {
    logger.log('🔍 DEBUG: addPhotos chamado com:', files.length, 'arquivos, useFirebaseStorage:', useFirebaseStorage);
    
    const newPhotos: UploadedPhoto[] = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      timestamp: new Date(),
      location,
      uploadStatus: 'pending'
    }));
    
    logger.log('📸 DEBUG: Novas fotos criadas:', newPhotos.map(p => ({ id: p.id, name: p.file.name })));
    
    setPhotos(prev => {
      const updated = [...prev, ...newPhotos].slice(0, maxPhotos);
      logger.log('📊 DEBUG: Estado atualizado, total de fotos:', updated.length);
      return updated;
    });
  };

  // Função para remover foto (escolhe o sistema apropriado)
  const removePhoto = useFirebaseStorage ? removePhotoFirebase : (photoId: string) => {
    setPhotos(prev => {
      const photoToRemove = prev.find(p => p.id === photoId);
      if (photoToRemove && photoToRemove.preview) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter(p => p.id !== photoId);
    });
  };

  // Notificar mudanças nas fotos
  useEffect(() => {
    onPhotosChange?.(currentPhotos);
  }, [currentPhotos, onPhotosChange]);

  // Notificar URLs enviadas (só para Firebase Storage)
  useEffect(() => {
    if (useFirebaseStorage) {
      const urls = getUploadedUrls();
      onUploadUrls?.(urls);
    }
  }, [currentPhotos, getUploadedUrls, onUploadUrls, useFirebaseStorage]);

  const handleUpload = async () => {
    if (!visitId) return;
    
    try {
      await uploadPhotosFirebase(visitId);
    } catch (error) {
      logger.error('Erro no upload das fotos:', error);
    }
  };

  // Upload automático quando visitId estiver disponível
  useEffect(() => {
    if (autoUpload && visitId && canUpload()) {
      handleUpload();
    }
  }, [autoUpload, visitId, canUpload, handleUpload]);

  // Verificar permissão de câmera ao montar o componente
  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      // Verificar se a API de permissões está disponível
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setCameraPermission(result.state);
          
          // Escutar mudanças na permissão
          result.onchange = () => {
            setCameraPermission(result.state);
          };
        } catch (err) {
          // Se a API não suportar 'camera', tentar verificar via getUserMedia
          logger.warn('API de permissões não suporta câmera:', err);
          await testCameraAccess();
        }
      } else {
        // Se a API de permissões não estiver disponível, tentar verificar via getUserMedia
        await testCameraAccess();
      }
    } catch (error) {
      logger.warn('Erro ao verificar permissão de câmera:', error);
      setCameraPermission('prompt');
    }
  };

  const testCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Se conseguir acessar, parar o stream imediatamente
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
    } catch (error: any) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraPermission('denied');
      } else {
        setCameraPermission('prompt');
      }
    }
  };

  const requestCameraPermission = async () => {
    try {
      setCameraPermission('checking');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Se conseguir acessar, parar o stream imediatamente
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      // Abrir modal da câmera após conceder permissão
      setIsCameraModalOpen(true);
    } catch (error: any) {
      logger.error('Erro ao solicitar permissão de câmera:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraPermission('denied');
      } else {
        setCameraPermission('prompt');
      }
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    logger.log('🔍 DEBUG: handleFileSelect chamado com:', files);
    if (!files) return;

    logger.log('📁 DEBUG: Arquivos selecionados:', Array.from(files).map(f => f.name));

    try {
      // Comprimir todas as imagens antes de adicionar
      const compressionPromises = Array.from(files).map(async (file) => {
        try {
          const compressedFile = await compressImage(file, { maxSizeMB: 1 });
          logger.log(`📦 Imagem comprimida: ${file.name} - ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
          return compressedFile;
        } catch (error) {
          logger.error(`Erro ao comprimir ${file.name}:`, error);
          return file; // Retornar arquivo original em caso de erro
        }
      });

      const compressedFiles = await Promise.all(compressionPromises);

      // Obter localização se disponível
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          logger.log('📍 DEBUG: Localização obtida:', location);
          addPhotos(compressedFiles, location);
        },
        () => {
          // Se localização não estiver disponível, adicionar sem localização
          logger.log('⚠️ DEBUG: Localização não disponível, adicionando sem localização');
          addPhotos(compressedFiles);
        }
      );
    } catch (error) {
      logger.error('Erro ao processar arquivos:', error);
      // Em caso de erro, tentar adicionar arquivos originais
      addPhotos(Array.from(files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemovePhoto = (id: string) => {
    removePhoto(id);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRetryUpload = async (photoId: string) => {
    if (!visitId) return;
    
    try {
      await retryUpload(photoId, visitId);
    } catch (error) {
      logger.error('Erro no retry do upload:', error);
    }
  };

  const canAddMore = currentState.photos.length < maxPhotos;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canAddMore && (
        <Card>
          <CardContent className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-muted rounded-full">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Adicionar Fotos</h3>
                  <p className="text-sm text-muted-foreground">
                    Arraste fotos aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Máximo {maxPhotos} fotos • JPG, PNG ou WebP • Comprimidas automaticamente para até 1MB
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivos
                  </Button>
                  
                  {/* Botão para solicitar permissão de câmera - só aparece quando NÃO tem permissão */}
                  {cameraPermission !== 'granted' && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={requestCameraPermission}
                      disabled={cameraPermission === 'checking' || cameraPermission === 'denied'}
                      className="w-full"
                    >
                      {cameraPermission === 'checking' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Verificando...
                        </>
                      ) : cameraPermission === 'denied' ? (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Permissão Negada
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Solicitar Permissão da Câmera
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {currentState.isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enviando fotos...</span>
                <span>{currentState.uploadedPhotos} de {currentState.totalPhotos}</span>
              </div>
              <Progress value={currentState.uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {hasErrors() && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Erros no upload</span>
            </div>
            <div className="mt-2 space-y-1">
              {currentState.errors.map((error, index) => (
                <p key={index} className="text-xs text-red-600">{error}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Grid */}
      {currentState.photos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentState.photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="aspect-square relative group">
                <img
                  src={photo.preview}
                  alt="Foto da visita"
                  className="w-full h-full object-cover"
                />
                
                {/* Upload Status Overlay */}
                {photo.uploadStatus === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Enviando...</p>
                      <Progress value={photo.uploadProgress || 0} className="w-20 mt-2" />
                    </div>
                  </div>
                )}

                {photo.uploadStatus === 'uploaded' && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enviada
                    </Badge>
                  </div>
                )}

                {photo.uploadStatus === 'error' && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Erro
                    </Badge>
                  </div>
                )}
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedPhoto(photo.preview)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = photo.preview;
                        link.download = `visita-${photo.timestamp.toISOString().split('T')[0]}-${photo.id}.jpg`;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {photo.uploadStatus === 'error' && visitId && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRetryUpload(photo.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemovePhoto(photo.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Location badge */}
                {photo.location && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      📍 GPS
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate">{photo.file.name}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(photo.file.size)}</span>
                    <span>{photo.timestamp.toLocaleTimeString('pt-BR')}</span>
                  </div>
                  {photo.location && (
                    <p className="text-xs text-muted-foreground">
                      {photo.location.lat.toFixed(6)}, {photo.location.lng.toFixed(6)}
                    </p>
                  )}
                  {photo.error && (
                    <p className="text-xs text-red-600 truncate">{photo.error}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Photo count and upload button */}
      {currentState.photos.length > 0 && (
        <div className="text-center space-y-2">
          <Badge variant="outline">
            {currentState.photos.length} de {maxPhotos} fotos adicionadas
          </Badge>
          
          {visitId && canUpload() && (
            <div>
              <Button 
                onClick={handleUpload}
                disabled={currentState.isUploading}
                className="w-full"
              >
                {currentState.isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Fotos
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedPhoto}
              alt="Foto ampliada"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={async (file, location) => {
          try {
            // Comprimir foto capturada antes de adicionar
            const compressedFile = await compressImage(file, { maxSizeMB: 1 });
            logger.log(`📦 Foto capturada comprimida: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            addPhotos([compressedFile], location);
          } catch (error) {
            logger.error('Erro ao comprimir foto capturada:', error);
            addPhotos([file], location);
          }
        }}
        maxPhotos={maxPhotos}
        currentPhotoCount={currentState.photos.length}
      />

    </div>
  );
}
