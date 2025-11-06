'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Smartphone,
  Monitor,
  Shield,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import logger from '@/lib/logger';

interface GPSPermissionHelperProps {
  onPermissionGranted?: () => void;
  className?: string;
}

export default function GPSPermissionHelper({ onPermissionGranted, className }: GPSPermissionHelperProps) {
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [isChecking, setIsChecking] = useState(false);
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    setUserAgent(navigator.userAgent);
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    setIsChecking(true);
    
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setPermissionStatus(permission.state as any);
        
        permission.onchange = () => {
          setPermissionStatus(permission.state as any);
          if (permission.state === 'granted' && onPermissionGranted) {
            onPermissionGranted();
          }
        };
      } else {
        // Fallback: tentar capturar GPS para verificar permissão
        if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
          (navigator as any).geolocation.getCurrentPosition(
            () => setPermissionStatus('granted'),
            (error: any) => {
              if (error.code === error.PERMISSION_DENIED) {
                setPermissionStatus('denied');
              } else {
                setPermissionStatus('prompt');
              }
            },
            { timeout: 1000 }
          );
        } else {
          setPermissionStatus('denied');
        }
      }
    } catch (error) {
      logger.warn('Erro ao verificar permissões:', error);
      setPermissionStatus('unknown');
    }
    
    setIsChecking(false);
  };

  const requestPermission = async () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      toast({
        title: "GPS não disponível",
        description: "Geolocation não é suportado neste navegador.",
        variant: "destructive"
      });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        (navigator as any).geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });
      
      setPermissionStatus('granted');
      toast({
        title: "Permissão concedida!",
        description: "GPS funcionando corretamente.",
      });
      
      if (onPermissionGranted) {
        onPermissionGranted();
      }
    } catch (error: any) {
      if (error.code === error.PERMISSION_DENIED) {
        setPermissionStatus('denied');
        toast({
          title: "Permissão negada",
          description: "Você precisa permitir o acesso à localização para usar o GPS.",
          variant: "destructive"
        });
      }
    }
  };

  const getStatusInfo = () => {
    switch (permissionStatus) {
      case 'granted':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: 'Permissão Concedida',
          description: 'GPS está funcionando corretamente'
        };
      case 'denied':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle,
          text: 'Permissão Negada',
          description: 'Acesso à localização foi negado'
        };
      case 'prompt':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: MapPin,
          text: 'Aguardando Permissão',
          description: 'Clique para solicitar acesso à localização'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: MapPin,
          text: 'Status Desconhecido',
          description: 'Verificando permissões...'
        };
    }
  };

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isChrome = /Chrome/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="h-5 w-5" />
          Permissões de Localização
        </CardTitle>
        <CardDescription>
          Configure o acesso à localização para usar o GPS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status atual */}
        <div className="flex items-center justify-between">
          <Badge className={statusInfo.color}>
            {statusInfo.text}
          </Badge>
          <Button 
            onClick={checkPermissionStatus} 
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar
              </>
            )}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {statusInfo.description}
        </p>

        {/* Instruções específicas por dispositivo/navegador */}
        {permissionStatus === 'denied' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Permissão negada. Como resolver:</p>
                
                {isMobile ? (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Smartphone className="h-4 w-4 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">Dispositivo Móvel:</p>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          <li>Vá em <strong>Configurações do dispositivo</strong></li>
                          <li>Procure por <strong>Localização</strong> ou <strong>GPS</strong></li>
                          <li>Ative a localização e permita para este navegador</li>
                          <li>Volte ao app e tente novamente</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Monitor className="h-4 w-4 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">Desktop:</p>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          <li>Clique no <strong>ícone de localização</strong> na barra de endereços</li>
                          <li>Selecione <strong>"Permitir"</strong></li>
                          <li>Ou vá em Configurações do navegador</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Instruções específicas por navegador */}
                <div className="space-y-2">
                  {isChrome && (
                    <div className="text-sm">
                      <p className="font-medium">Chrome:</p>
                      <p>Configurações → Privacidade e segurança → Configurações do site → Localização</p>
                    </div>
                  )}
                  
                  {isSafari && (
                    <div className="text-sm">
                      <p className="font-medium">Safari:</p>
                      <p>Preferências → Sites → Localização</p>
                    </div>
                  )}
                  
                  {isFirefox && (
                    <div className="text-sm">
                      <p className="font-medium">Firefox:</p>
                      <p>Configurações → Privacidade e segurança → Permissões → Localização</p>
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {permissionStatus === 'prompt' && (
          <div className="space-y-3">
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                Clique no botão abaixo para solicitar permissão de localização.
                O navegador irá mostrar um popup pedindo autorização.
              </AlertDescription>
            </Alert>
            
            <Button onClick={requestPermission} className="w-full">
              <MapPin className="h-4 w-4 mr-2" />
              Solicitar Permissão de Localização
            </Button>
          </div>
        )}

        {permissionStatus === 'granted' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              ✅ Permissão concedida! O GPS está funcionando corretamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Informações de segurança */}
        <div className="bg-blue-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Segurança</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• Sua localização é usada apenas para registrar visitas</p>
            <p>• Os dados são armazenados de forma segura</p>
            <p>• Você pode revogar a permissão a qualquer momento</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
