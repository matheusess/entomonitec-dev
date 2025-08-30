import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Target, Layers } from 'lucide-react';

interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  type: 'trap' | 'visit' | 'selected';
  level?: 'low' | 'medium' | 'high' | 'critical';
  neighborhood?: string;
  address?: string;
}

interface InteractiveMapProps {
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  locations?: MapLocation[];
  selectedLocation?: { lat: number; lng: number };
  height?: string;
  enableLocationPicker?: boolean;
}

export default function InteractiveMap({ 
  onLocationSelect, 
  locations = [], 
  selectedLocation,
  height = "h-64",
  enableLocationPicker = false
}: InteractiveMapProps) {
  const [viewMode, setViewMode] = useState<'satellite' | 'map'>('map');
  const [selectedPoint, setSelectedPoint] = useState<MapLocation | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Mock neighborhoods with coordinates for demonstration
  const mockLocations: MapLocation[] = [
    { id: '1', lat: -23.5505, lng: -46.6333, type: 'trap', level: 'critical', neighborhood: 'Centro', address: 'Rua XV de Novembro, 123' },
    { id: '2', lat: -23.5615, lng: -46.6565, type: 'trap', level: 'high', neighborhood: 'Vila Nova', address: 'Av. Paulista, 456' },
    { id: '3', lat: -23.5435, lng: -46.6123, type: 'trap', level: 'medium', neighborhood: 'Jardim das Flores', address: 'Rua das Flores, 789' },
    { id: '4', lat: -23.5325, lng: -46.6445, type: 'trap', level: 'low', neighborhood: 'Bairro Industrial', address: 'Av. Industrial, 321' },
    { id: '5', lat: -23.5705, lng: -46.6255, type: 'trap', level: 'medium', neighborhood: 'Residencial Norte', address: 'Rua Norte, 654' },
  ];

  const allLocations = [...mockLocations, ...locations];

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableLocationPicker || !onLocationSelect) return;

    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel coordinates to lat/lng (simplified calculation)
    const lat = -23.5505 + (y / rect.height - 0.5) * 0.1;
    const lng = -46.6333 + (x / rect.width - 0.5) * 0.1;

    // Mock address for clicked location
    const address = `Rua Exemplo, ${Math.floor(Math.random() * 1000)}`;
    onLocationSelect(lat, lng, address);
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'critical': return 'bg-critical';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-info';
      case 'low': return 'bg-success';
      default: return 'bg-primary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trap': return '🪤';
      case 'visit': return '📍';
      case 'selected': return '📌';
      default: return '📍';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-medium">Mapa Interativo</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <Layers className="h-4 w-4 mr-1" />
              Mapa
            </Button>
            <Button
              variant={viewMode === 'satellite' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('satellite')}
            >
              <Target className="h-4 w-4 mr-1" />
              Satélite
            </Button>
          </div>
        </div>

        <div 
          ref={mapRef}
          className={`${height} relative border rounded-lg overflow-hidden cursor-${enableLocationPicker ? 'crosshair' : 'pointer'}`}
          style={{
            backgroundImage: viewMode === 'satellite' 
              ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='satellite' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Crect width='20' height='20' fill='%23e5e7eb'/%3E%3Ccircle cx='10' cy='10' r='8' fill='%23d1d5db'/%3E%3Ccircle cx='5' cy='5' r='3' fill='%239ca3af'/%3E%3Ccircle cx='15' cy='15' r='2' fill='%23a1a1aa'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23satellite)'/%3E%3C/svg%3E")`
              : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='grid' x='0' y='0' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='%23e5e7eb' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='%23f9fafb'/%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3C/svg%3E")`,
            backgroundSize: viewMode === 'satellite' ? '50px 50px' : '20px 20px'
          }}
          onClick={handleMapClick}
        >
          {/* Map locations */}
          {allLocations.map((location) => {
            const x = ((location.lng + 46.6333) / 0.1 + 0.5) * 100;
            const y = ((location.lat + 23.5505) / 0.1 + 0.5) * 100;
            
            return (
              <div
                key={location.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPoint(location);
                }}
              >
                <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${getLevelColor(location.level)} flex items-center justify-center text-xs`}>
                  {getTypeIcon(location.type)}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {location.neighborhood || location.address || 'Localização'}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Selected location */}
          {selectedLocation && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `${((selectedLocation.lng + 46.6333) / 0.1 + 0.5) * 100}%`, 
                top: `${((selectedLocation.lat + 23.5505) / 0.1 + 0.5) * 100}%` 
              }}
            >
              <div className="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
                <Plus className="h-4 w-4 text-white" />
              </div>
            </div>
          )}

          {enableLocationPicker && (
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Clique no mapa para selecionar a localização
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-critical rounded-full"></div>
            <span className="text-xs text-muted-foreground">Crítico</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <span className="text-xs text-muted-foreground">Alto</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-info rounded-full"></div>
            <span className="text-xs text-muted-foreground">Médio</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-xs text-muted-foreground">Baixo</span>
          </div>
        </div>

        {/* Selected point details */}
        {selectedPoint && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{selectedPoint.neighborhood}</h4>
              {selectedPoint.level && (
                <Badge className={getLevelColor(selectedPoint.level)}>
                  {selectedPoint.level === 'critical' ? 'Crítico' : 
                   selectedPoint.level === 'high' ? 'Alto' :
                   selectedPoint.level === 'medium' ? 'Médio' : 'Baixo'}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{selectedPoint.address}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Coordenadas: {selectedPoint.lat.toFixed(6)}, {selectedPoint.lng.toFixed(6)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
