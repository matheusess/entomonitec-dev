'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Satellite
} from 'lucide-react';
import { LocationData } from '@/types/visits';

interface LocationStatusProps {
  currentLocation: LocationData | null;
  onRefreshLocation: () => void;
  isGettingLocation: boolean;
}

export default function LocationStatus({ 
  currentLocation, 
  onRefreshLocation, 
  isGettingLocation 
}: LocationStatusProps) {
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isOnline, setIsOnline] = useState(true);
  const [geocodingStatus, setGeocodingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Verificar permissão de localização
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((permissionStatus) => {
          setLocationPermission(permissionStatus.state as any);
          
          permissionStatus.onchange = () => {
            setLocationPermission(permissionStatus.state as any);
          };
        })
        .catch(() => {
          setLocationPermission('prompt');
        });
    }
  }, []);

  // Verificar status online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getLocationStatus = () => {
    if (isGettingLocation) {
      return {
        status: 'loading',
        icon: RefreshCw,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Capturando localização...',
        description: 'Aguardando GPS...'
      };
    }

    if (!currentLocation) {
      if (locationPermission === 'denied') {
        return {
          status: 'denied',
          icon: AlertTriangle,
          color: 'bg-red-100 text-red-800 border-red-200',
          text: 'Localização negada',
          description: 'Permissão de GPS negada pelo usuário'
        };
      }
      
      return {
        status: 'unavailable',
        icon: WifiOff,
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        text: 'Localização indisponível',
        description: 'GPS não está ativo ou não foi capturado'
      };
    }

    return {
      status: 'active',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 border-green-200',
      text: 'Localização ativa',
      description: `GPS: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
    };
  };

  const getConnectionStatus = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Offline'
      };
    }

    return {
      icon: Wifi,
      color: 'bg-green-100 text-green-800 border-green-200',
      text: 'Online'
    };
  };

  const locationStatus = getLocationStatus();
  const connectionStatus = getConnectionStatus();
  const StatusIcon = locationStatus.icon;
  const ConnectionIcon = connectionStatus.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Status GPS */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Satellite className="h-4 w-4 text-primary" />
            <span>Status GPS</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={locationStatus.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {locationStatus.text}
            </Badge>
            
            <Button
              size="sm"
              variant="outline"
              onClick={onRefreshLocation}
              disabled={isGettingLocation}
              className="h-8 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${isGettingLocation ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {locationStatus.description}
          </p>
          
          {locationPermission === 'denied' && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                <strong>Permissão negada:</strong> Permita o acesso à localização.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status de Conexão */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Wifi className="h-4 w-4 text-blue-600" />
            <span>Conectividade</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge variant="outline" className={connectionStatus.color}>
            <ConnectionIcon className="h-3 w-3 mr-1" />
            {connectionStatus.text}
          </Badge>
          
          <div className="text-xs text-muted-foreground">
            {isOnline ? 'Sistema conectado à internet' : 'Sistema offline - dados salvos localmente'}
          </div>
        </CardContent>
      </Card>

      {/* Coordenadas Atuais */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-green-600" />
            <span>Coordenadas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentLocation ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">Lat:</span>
                  <span className="ml-1 font-mono">{currentLocation.latitude.toFixed(6)}</span>
                </div>
                <div>
                  <span className="font-medium">Lng:</span>
                  <span className="ml-1 font-mono">{currentLocation.longitude.toFixed(6)}</span>
                </div>
                <div>
                  <span className="font-medium">Precisão:</span>
                  <span className="ml-1">{currentLocation.accuracy.toFixed(0)}m</span>
                </div>
                <div>
                  <span className="font-medium">Hora:</span>
                  <span className="ml-1">{currentLocation.timestamp.toLocaleTimeString('pt-BR')}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Aguardando captura de GPS...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
