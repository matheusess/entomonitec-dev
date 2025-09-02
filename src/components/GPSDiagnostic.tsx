'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  WifiOff,
  Settings,
  HelpCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface GPSDiagnosticProps {
  onLocationUpdate?: (location: GeolocationPosition) => void;
  className?: string;
}

interface GPSStatus {
  available: boolean;
  permission: 'granted' | 'denied' | 'prompt' | 'unknown';
  error?: string;
  lastPosition?: GeolocationPosition;
  isHighAccuracy: boolean;
}

export default function GPSDiagnostic({ onLocationUpdate, className }: GPSDiagnosticProps) {
  const [gpsStatus, setGpsStatus] = useState<GPSStatus>({
    available: false,
    permission: 'unknown',
    isHighAccuracy: false
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Verificar disponibilidade do GPS
  useEffect(() => {
    checkGPSAvailability();
  }, []);

  const checkGPSAvailability = async () => {
    const results: string[] = [];
    
    // Teste 1: Verificar se geolocation está disponível
    if (!navigator.geolocation) {
      results.push('❌ Geolocation API não está disponível neste navegador');
      setGpsStatus(prev => ({ ...prev, available: false, error: 'Geolocation API não disponível' }));
      setTestResults(results);
      return;
    }
    results.push('✅ Geolocation API está disponível');

    // Teste 2: Verificar permissões
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setGpsStatus(prev => ({ ...prev, permission: permission.state as any }));
        
        switch (permission.state) {
          case 'granted':
            results.push('✅ Permissão de localização concedida');
            break;
          case 'denied':
            results.push('❌ Permissão de localização negada');
            break;
          case 'prompt':
            results.push('⚠️ Permissão de localização precisa ser solicitada');
            break;
        }
      } else {
        results.push('⚠️ API de permissões não disponível');
      }
    } catch (error) {
      results.push('⚠️ Erro ao verificar permissões');
    }

    // Teste 3: Verificar se estamos em HTTPS
    if (location.protocol === 'https:') {
      results.push('✅ Conexão HTTPS (necessária para GPS)');
    } else if (location.hostname === 'localhost') {
      results.push('✅ Localhost (GPS permitido)');
    } else {
      results.push('❌ Conexão não segura - GPS pode não funcionar');
    }

    // Teste 4: Verificar se é dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      results.push('✅ Dispositivo móvel detectado (GPS mais preciso)');
    } else {
      results.push('⚠️ Dispositivo desktop (GPS menos preciso)');
    }

    setTestResults(results);
    setGpsStatus(prev => ({ ...prev, available: true }));
  };

  const testGPS = async () => {
    setIsTesting(true);
    const results: string[] = [...testResults];
    
    try {
      results.push('🔄 Testando captura de GPS...');
      setTestResults([...results]);

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      results.push(`✅ GPS capturado com sucesso!`);
      results.push(`📍 Lat: ${position.coords.latitude.toFixed(6)}`);
      results.push(`📍 Lng: ${position.coords.longitude.toFixed(6)}`);
      results.push(`🎯 Precisão: ${position.coords.accuracy.toFixed(0)}m`);
      results.push(`⏰ Timestamp: ${new Date(position.timestamp).toLocaleString('pt-BR')}`);

      setGpsStatus(prev => ({ 
        ...prev, 
        lastPosition: position,
        isHighAccuracy: position.coords.accuracy < 100
      }));

      if (onLocationUpdate) {
        onLocationUpdate(position);
      }

      toast({
        title: "GPS funcionando!",
        description: `Localização capturada com precisão de ${position.coords.accuracy.toFixed(0)}m`,
      });

    } catch (error: any) {
      let errorMessage = 'Erro desconhecido';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Permissão de localização negada pelo usuário';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Localização indisponível (GPS desligado?)';
          break;
        case error.TIMEOUT:
          errorMessage = 'Timeout - GPS demorou muito para responder';
          break;
        default:
          errorMessage = error.message || 'Erro desconhecido';
      }

      results.push(`❌ Erro no GPS: ${errorMessage}`);
      
      toast({
        title: "Erro no GPS",
        description: errorMessage,
        variant: "destructive"
      });
    }

    setTestResults(results);
    setIsTesting(false);
  };

  const getStatusColor = () => {
    if (!gpsStatus.available) return 'bg-red-100 text-red-800 border-red-200';
    if (gpsStatus.permission === 'denied') return 'bg-red-100 text-red-800 border-red-200';
    if (gpsStatus.permission === 'prompt') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (gpsStatus.lastPosition) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = () => {
    if (!gpsStatus.available) return 'GPS Indisponível';
    if (gpsStatus.permission === 'denied') return 'Permissão Negada';
    if (gpsStatus.permission === 'prompt') return 'Aguardando Permissão';
    if (gpsStatus.lastPosition) return 'GPS Ativo';
    return 'GPS Disponível';
  };

  const getStatusIcon = () => {
    if (!gpsStatus.available || gpsStatus.permission === 'denied') return AlertTriangle;
    if (gpsStatus.permission === 'prompt') return WifiOff;
    if (gpsStatus.lastPosition) return CheckCircle;
    return MapPin;
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="h-5 w-5" />
          Diagnóstico GPS
        </CardTitle>
        <CardDescription>
          Verificação completa do sistema de localização
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status atual */}
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
          <Button 
            onClick={testGPS} 
            disabled={isTesting}
            size="sm"
            variant="outline"
          >
            {isTesting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Testar GPS
              </>
            )}
          </Button>
        </div>

        {/* Resultados dos testes */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Resultados dos Testes:</h4>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-xs font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações da última posição */}
        {gpsStatus.lastPosition && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Última Posição:</h4>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Latitude:</span>
                  <span className="ml-1 font-mono">{gpsStatus.lastPosition.coords.latitude.toFixed(6)}</span>
                </div>
                <div>
                  <span className="font-medium">Longitude:</span>
                  <span className="ml-1 font-mono">{gpsStatus.lastPosition.coords.longitude.toFixed(6)}</span>
                </div>
                <div>
                  <span className="font-medium">Precisão:</span>
                  <span className="ml-1">{gpsStatus.lastPosition.coords.accuracy.toFixed(0)}m</span>
                </div>
                <div>
                  <span className="font-medium">Alta Precisão:</span>
                  <span className="ml-1">{gpsStatus.isHighAccuracy ? '✅' : '❌'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dicas de solução */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Dicas de Solução:
          </h4>
          <div className="bg-blue-50 rounded-lg p-3 space-y-1 text-xs">
            <div>• <strong>Permissão negada:</strong> Vá em Configurações do navegador e permita localização</div>
            <div>• <strong>GPS desligado:</strong> Ative o GPS no dispositivo móvel</div>
            <div>• <strong>Timeout:</strong> Aguarde mais tempo ou teste em área aberta</div>
            <div>• <strong>Baixa precisão:</strong> Use em área aberta, longe de prédios</div>
            <div>• <strong>HTTPS:</strong> Certifique-se de estar em conexão segura</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
