'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NeighborhoodRisk } from '@/services/firebaseDashboardService';
import { 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

// Fix para ícones do Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RiskMapComponentProps {
  neighborhoodRisks: NeighborhoodRisk[];
  mapCenter: [number, number];
  zoom: number;
  onMapRef: (ref: any) => void;
}

export default function RiskMapComponent({ 
  neighborhoodRisks, 
  mapCenter, 
  zoom, 
  onMapRef 
}: RiskMapComponentProps) {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current) {
      onMapRef(mapRef.current);
    }
  }, [onMapRef]);

  // Coordenadas aproximadas dos bairros de Curitiba
  const neighborhoodCoordinates: Record<string, [number, number]> = {
    'Centro': [-25.4284, -49.2733],
    'Rebouças': [-25.4350, -49.2600],
    'Jardim Botânico': [-25.4400, -49.2400],
    'Batel': [-25.4300, -49.2800],
    'Mercês': [-25.4250, -49.2700],
    'Cajuru': [-25.4500, -49.2000],
    'Portão': [-25.4600, -49.2200],
    'Boqueirão': [-25.4700, -49.2100],
    'Fazendinha': [-25.4800, -49.1900],
    'Pinheirinho': [-25.4900, -49.1800],
    'Santa Felicidade': [-25.4200, -49.2500],
    'Água Verde': [-25.4400, -49.2700],
    'Bigorrilho': [-25.4300, -49.2900],
    'Campo Comprido': [-25.4500, -49.2500],
    'Capão Raso': [-25.4600, -49.2400],
    'Cidade Industrial': [-25.5000, -49.1700],
    'Fanny': [-25.4700, -49.2000],
    'Guaíra': [-25.4800, -49.2100],
    'Hauer': [-25.4600, -49.2300],
    'Juvevê': [-25.4200, -49.2600],
    'Lindóia': [-25.4400, -49.1900],
    'Novo Mundo': [-25.4300, -49.2000],
    'Pilarzinho': [-25.4100, -49.2500],
    'Santo Inácio': [-25.4500, -49.2800],
    'São Braz': [-25.4100, -49.2400],
    'São Francisco': [-25.4000, -49.2600],
    'São João': [-25.4000, -49.2500],
    'São Lourenço': [-25.3900, -49.2400],
    'São Miguel': [-25.3900, -49.2500],
    'Tatuquara': [-25.5200, -49.1600],
    'Uberaba': [-25.5100, -49.1500],
    'Umbará': [-25.5000, -49.1400],
    'Vila Izabel': [-25.4200, -49.2800],
    'Xaxim': [-25.4700, -49.1800]
  };

  // Função para criar ícone customizado baseado no risco
  const createCustomIcon = (risk: NeighborhoodRisk) => {
    let color = '#22c55e'; // verde
    if (risk.larvaeIndex > 4) color = '#ef4444'; // vermelho
    else if (risk.larvaeIndex > 2) color = '#f97316'; // laranja
    else if (risk.larvaeIndex > 0) color = '#eab308'; // amarelo

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="30" height="45" viewBox="0 0 30 45" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 0C6.7 0 0 6.7 0 15c0 15 15 30 15 30s15-15 15-30C30 6.7 23.3 0 15 0z" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="15" cy="15" r="8" fill="white"/>
          <text x="15" y="19" text-anchor="middle" font-size="10" fill="${color}" font-weight="bold" font-family="Arial, sans-serif">${risk.larvaeIndex.toFixed(1)}</text>
        </svg>
      `)}`,
      iconSize: [30, 45],
      iconAnchor: [15, 45],
      popupAnchor: [0, -45]
    });
  };

  // Função para obter ícone baseado no risco
  const getRiskIcon = (risk: NeighborhoodRisk) => {
    if (risk.larvaeIndex > 4) return XCircle;
    if (risk.larvaeIndex > 2) return AlertTriangle;
    if (risk.larvaeIndex > 0) return Info;
    return CheckCircle;
  };

  // Função para obter texto do risco
  const getRiskText = (risk: NeighborhoodRisk) => {
    if (risk.larvaeIndex > 4) return 'Crítico';
    if (risk.larvaeIndex > 2) return 'Alto';
    if (risk.larvaeIndex > 0) return 'Médio';
    return 'Baixo';
  };

  // Função para obter cor do badge
  const getRiskBadgeColor = (risk: NeighborhoodRisk) => {
    if (risk.larvaeIndex > 4) return 'bg-red-500 hover:bg-red-600';
    if (risk.larvaeIndex > 2) return 'bg-orange-500 hover:bg-orange-600';
    if (risk.larvaeIndex > 0) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  return (
    <div className="h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marcadores dos bairros com risco */}
        {neighborhoodRisks.map((risk) => {
          const coordinates = neighborhoodCoordinates[risk.name];
          if (!coordinates) return null;

          const RiskIcon = getRiskIcon(risk);
          
          return (
            <Marker
              key={risk.name}
              position={coordinates}
              icon={createCustomIcon(risk)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center space-x-2 mb-2">
                    <RiskIcon className="h-4 w-4" />
                    <h3 className="font-semibold text-sm">{risk.name}</h3>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Índice Larvário:</span>
                      <span className="font-medium">{risk.larvaeIndex.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nível de Risco:</span>
                      <span className={`px-2 py-1 rounded text-white text-xs ${getRiskBadgeColor(risk)}`}>
                        {getRiskText(risk)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Propriedades:</span>
                      <span className="font-medium">{risk.visitedProperties}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cobertura:</span>
                      <span className="font-medium">{risk.coverage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
