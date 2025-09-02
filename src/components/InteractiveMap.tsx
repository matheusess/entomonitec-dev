'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Target, 
  RefreshCw,
  Crosshair,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { LocationData } from '@/types/visits';

import dynamic from 'next/dynamic';

// Componente de mapa dinâmico para evitar SSR
const MapComponent = dynamic(() => import('./MapComponentNew'), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full rounded-lg border bg-muted flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Carregando mapa...</p>
      </div>
    </div>
  )
});

interface InteractiveMapProps {
  currentLocation: LocationData | null;
  onLocationUpdate: (location: LocationData) => void;
  isGettingLocation: boolean;
  onRefreshLocation: () => void;
}

export default function InteractiveMap({ 
  currentLocation, 
  onLocationUpdate, 
  isGettingLocation,
  onRefreshLocation 
}: InteractiveMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([-25.442868, -49.226276]); // Curitiba
  const [zoom, setZoom] = useState(16);
  const mapRef = useRef<any>(null);

  // COMENTADO: Não centralizar automaticamente ao mover pin manualmente
  // useEffect(() => {
  //   if (currentLocation) {
  //     const newCenter: [number, number] = [currentLocation.latitude, currentLocation.longitude];
  //     setMapCenter(newCenter);
  //     
  //     if (mapRef.current) {
  //       mapRef.current.setView(newCenter, zoom);
  //     }
  //   }
  // }, [currentLocation, zoom]);

  // Centralizar no GPS atual
  const centerOnCurrentLocation = () => {
    if (currentLocation) {
      const newCenter: [number, number] = [currentLocation.latitude, currentLocation.longitude];
      setMapCenter(newCenter);
      
      if (mapRef.current) {
        mapRef.current.setView(newCenter, zoom);
      }
    }
  };

  // Zoom in/out
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 1, 18);
    setZoom(newZoom);
    if (mapRef.current) {
      mapRef.current.setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 1, 10);
    setZoom(newZoom);
    if (mapRef.current) {
      mapRef.current.setZoom(newZoom);
    }
  };

  // Centralizar no GPS do usuário
  const centerOnUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter: [number, number] = [position.coords.latitude, position.coords.longitude];
          setMapCenter(newCenter);
          
          if (mapRef.current) {
            mapRef.current.setView(newCenter, zoom);
          }
        },
        (error) => {
          console.warn('Erro ao obter localização do usuário:', error);
        }
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span>Mapa Interativo</span>
        </CardTitle>
        <CardDescription>
          Clique no mapa para ajustar a localização ou use os controles para navegar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles do mapa */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Zoom: {zoom}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {mapCenter[0].toFixed(6)}, {mapCenter[1].toFixed(6)}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomOut}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomIn}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={centerOnCurrentLocation}
              className="h-8 w-8 p-0"
              disabled={!currentLocation}
            >
              <Target className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={centerOnUserLocation}
              className="h-8 w-8 p-0"
            >
              <Crosshair className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={onRefreshLocation}
              disabled={isGettingLocation}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Mapa */}
        <div className="relative">
          <MapComponent
            currentLocation={currentLocation}
            onLocationUpdate={onLocationUpdate}
            mapCenter={mapCenter}
            zoom={zoom}
            onMapRef={(ref: any) => { mapRef.current = ref; }}
          />
          
          {/* Overlay de instruções */}
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs border">
            <p className="font-medium">💡 Dicas:</p>
            <p>• Clique no mapa para definir posição</p>
            <p>• Arraste o marcador para ajustar</p>
            <p>• Use os controles para navegar</p>
          </div>
        </div>

        {/* Informações compactas em linha */}
        {currentLocation && (
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">Precisão:</span>
              <span className="font-semibold">{currentLocation.accuracy.toFixed(0)}m</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">Rua:</span>
              <span className="font-semibold">{currentLocation.address}</span>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
