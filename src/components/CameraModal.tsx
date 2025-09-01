import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, X, RotateCcw, Check, AlertTriangle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, location?: { lat: number; lng: number }) => void;
  maxPhotos?: number;
  currentPhotoCount?: number;
}

export default function CameraModal({ 
  isOpen, 
  onClose, 
  onCapture, 
  maxPhotos = 5,
  currentPhotoCount = 0 
}: CameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Verificar se pode adicionar mais fotos
  const canAddMore = currentPhotoCount < maxPhotos;

  // Inicializar câmera quando modal abrir
  useEffect(() => {
    if (isOpen && canAddMore) {
      startCamera();
    } else if (!isOpen) {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, canAddMore, facingMode]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Parar stream anterior se existir
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Configurações da câmera
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      setError(getCameraErrorMessage(err));
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const getCameraErrorMessage = (error: any): string => {
    if (error.name === 'NotAllowedError') {
      return 'Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.';
    } else if (error.name === 'NotFoundError') {
      return 'Nenhuma câmera encontrada no dispositivo.';
    } else if (error.name === 'NotSupportedError') {
      return 'Câmera não suportada neste navegador.';
    } else if (error.name === 'NotReadableError') {
      return 'Câmera está sendo usada por outro aplicativo.';
    }
    return 'Erro ao acessar a câmera. Tente novamente.';
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      // Configurar canvas com as dimensões do vídeo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Desenhar frame atual do vídeo no canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Converter canvas para blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        // Criar arquivo a partir do blob
        const file = new File([blob], `camera-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        
        // Obter localização GPS se disponível
        let location: { lat: number; lng: number } | undefined;
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });
          
          location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        } catch (geoError) {
          console.warn('Não foi possível obter localização GPS:', geoError);
        }
        
        // Criar preview da imagem
        const preview = URL.createObjectURL(blob);
        setCapturedImage(preview);
        
        // Chamar callback com a foto capturada
        onCapture(file, location);
        
        setIsCapturing(false);
        onClose();
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      console.error('Erro ao capturar foto:', error);
      setError('Erro ao capturar foto. Tente novamente.');
      setIsCapturing(false);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Capturar Foto</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {currentPhotoCount > 0 && (
              <Badge variant="outline">
                {currentPhotoCount}/{maxPhotos} fotos
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!canAddMore ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Limite de fotos atingido</h3>
              <p className="text-muted-foreground">
                Você já adicionou o máximo de {maxPhotos} fotos permitidas.
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Erro na Câmera</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex space-x-2 justify-center">
                <Button variant="outline" onClick={startCamera}>
                  Tentar Novamente
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Inicializando câmera...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview da Câmera */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay de captura */}
                {isCapturing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-pulse text-white text-lg font-medium">
                      Capturando...
                    </div>
                  </div>
                )}
              </div>
              
              {/* Controles da Câmera */}
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={switchCamera}
                  disabled={isCapturing}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Trocar Câmera
                </Button>
                
                <Button
                  onClick={capturePhoto}
                  disabled={isCapturing || !stream}
                  className="px-8"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isCapturing ? 'Capturando...' : 'Capturar Foto'}
                </Button>
              </div>
              
              {/* Dicas de uso */}
              <div className="text-center text-sm text-muted-foreground">
                <p>• Posicione o dispositivo para capturar a foto</p>
                <p>• A localização GPS será capturada automaticamente</p>
                <p>• Use "Trocar Câmera" para alternar entre frontal e traseira</p>
              </div>
            </div>
          )}
        </CardContent>
        
        {/* Canvas oculto para captura */}
        <canvas ref={canvasRef} className="hidden" />
      </Card>
    </div>
  );
}
