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

interface LeafletMapProps {
  currentLocation: LocationData | null;
  onLocationUpdate: (location: LocationData) => void;
  mapCenter: [number, number];
  zoom: number;
  onMapRef: (ref: any) => void;
}

// Componente para capturar eventos do mapa
function MapEvents({ onLocationUpdate }: { onLocationUpdate: (location: LocationData) => void }) {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      
      try {
        // Obter endereço para a nova posição
        const geocodingResult = await geocodingService.getAddressFromCoordinatesWithCache(lat, lng);
        
        const newLocation: LocationData = {
          latitude: lat,
          longitude: lng,
          accuracy: 10, // Precisão manual
          timestamp: new Date(),
          address: geocodingResult.fullAddress || geocodingResult.address
        };
        
        onLocationUpdate(newLocation);
      } catch (error) {
        console.warn('Erro ao obter endereço para nova posição:', error);
        
        const newLocation: LocationData = {
          latitude: lat,
          longitude: lng,
          accuracy: 10,
          timestamp: new Date(),
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        };
        
        onLocationUpdate(newLocation);
      }
    },
  });

  return null;
}

export default function LeafletMap({
  currentLocation,
  onLocationUpdate,
  mapCenter,
  zoom,
  onMapRef
}: LeafletMapProps) {
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
        
        {/* Marcador da localização atual */}
        {currentLocation && (
          <Marker 
            position={[currentLocation.latitude, currentLocation.longitude]}
            draggable={true}
            eventHandlers={{
              dragend: async (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                
                try {
                  const geocodingResult = await geocodingService.getAddressFromCoordinatesWithCache(
                    position.lat, 
                    position.lng
                  );
                  
                  const newLocation: LocationData = {
                    latitude: position.lat,
                    longitude: position.lng,
                    accuracy: 5, // Precisão manual (arrastado)
                    timestamp: new Date(),
                    address: geocodingResult.fullAddress || geocodingResult.address
                  };
                  
                  onLocationUpdate(newLocation);
                } catch (error) {
                  console.warn('Erro ao obter endereço para posição arrastada:', error);
                  
                  const newLocation: LocationData = {
                    latitude: position.lat,
                    longitude: position.lng,
                    accuracy: 5,
                    timestamp: new Date(),
                    address: `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
                  };
                  
                  onLocationUpdate(newLocation);
                }
              }
            }}
          >
            <Popup>
              <div className="text-sm">
                <p><strong>Localização Atual</strong></p>
                <p>Lat: {currentLocation.latitude.toFixed(6)}</p>
                <p>Lng: {currentLocation.longitude.toFixed(6)}</p>
                <p>Precisão: {currentLocation.accuracy}m</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Arraste para ajustar a posição
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Eventos do mapa */}
        <MapEvents onLocationUpdate={onLocationUpdate} />
      </MapContainer>
    </div>
  );
}
