'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, useMapEvents, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationData } from '@/types/visits';
import { geocodingService } from '@/services/geocodingService';
import MapTileSelector, { MapTileLayer, mapTileOptions } from './MapTileSelector';

// Fix para ícones do Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  currentLocation: LocationData | null;
  onLocationUpdate: (location: LocationData) => void;
  mapCenter: [number, number];
  zoom: number;
  onMapRef: (ref: any) => void;
}

// Componente para capturar eventos do mapa (desabilitado para cliques)
function MapEvents({ onLocationUpdate }: { onLocationUpdate: (location: LocationData) => void }) {
  // Removido: não permitir cliques no mapa para alterar posição
  // A localização deve sempre vir do GPS atual
  return null;
}

export default function MapComponent({
  currentLocation,
  onLocationUpdate,
  mapCenter,
  zoom,
  onMapRef
}: MapComponentProps) {
  const mapRef = useRef<any>(null);
  const [selectedTile, setSelectedTile] = useState(mapTileOptions[0]); // CartoDB Voyager por padrão

  useEffect(() => {
    if (mapRef.current) {
      onMapRef(mapRef.current);
    }
  }, [onMapRef]);

  return (
    <div className="h-96 w-full rounded-lg border overflow-hidden relative">
      {/* Seletor de estilo do mapa */}
      <div className="absolute top-2 right-2 z-[1000]">
        <MapTileSelector
          selectedTile={selectedTile}
          onTileChange={setSelectedTile}
          className="text-xs"
        />
      </div>
      
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="z-0"
      >
        <MapTileLayer tileOption={selectedTile} />
        
        {currentLocation && (
          <Marker 
            position={[currentLocation.latitude, currentLocation.longitude]}
            draggable={false}
          >
            <Popup>
              <div className="text-sm">
                <p><strong>Localização Atual (GPS)</strong></p>
                <p>Lat: {currentLocation.latitude.toFixed(6)}</p>
                <p>Lng: {currentLocation.longitude.toFixed(6)}</p>
                <p>Precisão: {currentLocation.accuracy}m</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Posição obtida automaticamente via GPS
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        <MapEvents onLocationUpdate={onLocationUpdate} />
      </MapContainer>
    </div>
  );
}
