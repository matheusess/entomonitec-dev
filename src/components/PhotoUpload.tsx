import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, Eye, Download } from 'lucide-react';
import CameraModal from './CameraModal';

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
  timestamp: Date;
  location?: { lat: number; lng: number };
}

interface PhotoUploadProps {
  onPhotosChange?: (photos: UploadedPhoto[]) => void;
  maxPhotos?: number;
  acceptedTypes?: string[];
}

export default function PhotoUpload({ 
  onPhotosChange, 
  maxPhotos = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newPhotos: UploadedPhoto[] = [];
    
    Array.from(files).forEach((file) => {
      if (photos.length + newPhotos.length >= maxPhotos) return;
      if (!acceptedTypes.includes(file.type)) return;

      const id = Math.random().toString(36).substring(7);
      const preview = URL.createObjectURL(file);
      
      // Get location if available
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const photoWithLocation: UploadedPhoto = {
            id,
            file,
            preview,
            timestamp: new Date(),
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          };
          
          setPhotos(prev => {
            const updated = [...prev, photoWithLocation];
            onPhotosChange?.(updated);
            return updated;
          });
        },
        () => {
          // If location is not available, add photo without location
          const photoWithoutLocation: UploadedPhoto = {
            id,
            file,
            preview,
            timestamp: new Date()
          };
          
          setPhotos(prev => {
            const updated = [...prev, photoWithoutLocation];
            onPhotosChange?.(updated);
            return updated;
          });
        }
      );
    });
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

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const updated = prev.filter(photo => photo.id !== id);
      onPhotosChange?.(updated);
      
      // Revoke object URL to prevent memory leaks
      const photoToRemove = prev.find(p => p.id === id);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      
      return updated;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCameraCapture = (file: File, location?: { lat: number; lng: number }) => {
    const id = Math.random().toString(36).substring(7);
    const preview = URL.createObjectURL(file);
    
    const newPhoto: UploadedPhoto = {
      id,
      file,
      preview,
      timestamp: new Date(),
      location
    };
    
    setPhotos(prev => {
      const updated = [...prev, newPhoto];
      onPhotosChange?.(updated);
      return updated;
    });
  };

  const canAddMore = photos.length < maxPhotos;

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
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Adicionar Fotos</h3>
                  <p className="text-sm text-muted-foreground">
                    Arraste fotos aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Máximo {maxPhotos} fotos • JPG, PNG ou WebP • Até 10MB cada
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivos
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCameraModalOpen(true)}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Usar Câmera
                  </Button>
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

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="aspect-square relative group">
                <img
                  src={photo.preview}
                  alt="Foto da visita"
                  className="w-full h-full object-cover"
                />
                
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
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removePhoto(photo.id)}
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Photo count */}
      {photos.length > 0 && (
        <div className="text-center">
          <Badge variant="outline">
            {photos.length} de {maxPhotos} fotos adicionadas
          </Badge>
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
        onCapture={handleCameraCapture}
        maxPhotos={maxPhotos}
        currentPhotoCount={photos.length}
      />
    </div>
  );
}
